#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
한국청교도연구소 (KPI) 유튜브(@kpuritan) 자동 동기화 스크립트
새로운 롱폼 및 쇼츠 영상을 감지하여 '청교도 신학' 카테고리 내 알맞은 하위 주제로
자동 분석·분류한 후 Firestore 'posts' 컬렉션에 등록합니다.
"""

import sys
import os
import re
import json
import urllib.request
import urllib.error
import xml.etree.ElementTree as ET
from datetime import datetime, timezone

CHANNEL_ID = "UCBu6GircXxgzKST6dNB3HRQ"
RSS_URL = f"https://www.youtube.com/feeds/videos.xml?channel_id={CHANNEL_ID}"
FIREBASE_API_KEY = "AIzaSyCJbOaiElCypwgtPgbwdnudn3VC737fMrs"
PROJECT_ID = "kpuritan-home"
SYNCED_CACHE_FILE = os.path.join(os.path.dirname(__file__), "synced_youtube_ids.json")

# -----------------------------------------------------------------------------
# 1. 청교도 신학 주제별 분류 키워드 및 휴리스틱 정의
# -----------------------------------------------------------------------------
THEOLOGY_CATEGORIES = {
    "신론": [
        "하나님", "삼위일체", "성부", "속성", "섭리", "작정", "주권", "창조",
        "거룩", "공의", "전능", "예정", "고통", "허락", "뜻", "침묵", "역사하시는 하나님"
    ],
    "인간론": [
        "인간", "타락", "원죄", "전적 부패", "죄성", "양심", "자유의지", "비참",
        "옛 사람", "육신", "영혼", "사망"
    ],
    "기독론": [
        "예수", "그리스도", "성육신", "십자가", "보혈", "대속", "부활", "승천",
        "중보자", "제사장", "선지자", "왕", "그리스도의 의", "순종"
    ],
    "구원론": [
        "구원", "거듭남", "중생", "회개", "회심", "믿음", "칭의", "성화", "견인",
        "양자", "은혜", "복음", "부르심", "소명", "확신", "점검", "위선", "거짓 확신",
        "영적전쟁", "율법과 복음", "성령", "성령의 역사"
    ],
    "교회론": [
        "교회", "목사", "사역자", "설교", "설교자", "교사", "직분", "예배", "성례",
        "세례", "성찬", "권징", "가정", "결혼", "가정예배", "그리스도인의 삶", "생활",
        "경건", "기도", "순종", "교제", "공동체"
    ],
    "종말론": [
        "종말", "재림", "심판", "마지막 때", "천국", "지옥", "영생", "영벌",
        "백보좌", "부활의 몸"
    ],
    "역사신학": [
        "청교도", "종교개혁", "칼빈", "루터", "웨스트민스터", "교회사", "대각성",
        "조나단 에드워즈", "존 오웬", "리차드 백스터", "스펄전", "역사"
    ],
    "잘못된 신학": [
        "잘못된", "거짓", "이단", "알미니안", "번영신학", "자유주의", "신사도",
        "기복주의", "혼합주의", "로마 가톨릭", "도덕률폐기론", "유튜버", "경계", "조심"
    ],
    "전도, 부흥, 선교": [
        "전도", "선교", "부흥", "복음 전파", "대위임령", "영혼 구원", "열방",
        "증인", "보내심"
    ]
}

def is_short_video(video_id):
    """HEAD 요청을 통해 영상이 쇼츠(Shorts)인지 롱폼인지 판별합니다."""
    url = f"https://www.youtube.com/shorts/{video_id}"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"}, method="HEAD")
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            final_url = resp.geturl()
            return "/shorts/" in final_url
    except Exception:
        return False

def classify_content(title, description=""):
    """
    영상 제목 및 설명을 분석하여 청교도 신학 9대 범주 중 가장 적합한 카테고리를 도출합니다.
    """
    text = (title + " " + description).lower()
    
    # 특수 우선순위 규칙
    if any(k in text for k in ["성경 교사", "사역자", "목사", "설교", "설교자", "신학교"]):
        if any(k in text for k in ["거짓", "조심", "경계", "탐욕", "유튜버"]):
            return "잘못된 신학"
        return "교회론"

    if any(k in text for k in ["부르심", "거듭남", "구원", "확신", "회개", "믿음", "회심"]):
        return "구원론"

    if any(k in text for k in ["고통", "섭리", "작정", "하나님의 뜻", "사랑의 하나님"]):
        return "신론"

    # 일반 키워드 점수 계산
    scores = {cat: 0 for cat in THEOLOGY_CATEGORIES}
    for cat, keywords in THEOLOGY_CATEGORIES.items():
        for kw in keywords:
            if kw.lower() in text:
                weight = 3 if kw.lower() in title.lower() else 1
                scores[cat] += weight

    best_cat = max(scores, key=scores.get)
    if scores[best_cat] > 0:
        return best_cat
    
    return "구원론"

# -----------------------------------------------------------------------------
# 2. Firebase Auth & Firestore REST 통신
# -----------------------------------------------------------------------------
def get_firebase_id_token():
    """익명 로그인을 수행하여 Firestore REST API 호출용 ID 토큰을 발급받습니다."""
    url = f"https://identitytoolkit.googleapis.com/v1/accounts:signUp?key={FIREBASE_API_KEY}"
    data = json.dumps({"returnSecureToken": True}).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=10) as resp:
        res = json.loads(resp.read().decode())
        return res["idToken"]

def get_existing_video_ids(id_token):
    """Firestore 및 로컬 캐시에서 이미 등록된 YouTube ID 목록을 수집합니다."""
    existing_ids = set()

    # 1. 로컬 동기화 기록 파일 확인
    if os.path.exists(SYNCED_CACHE_FILE):
        try:
            with open(SYNCED_CACHE_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
                existing_ids.update(data)
        except Exception:
            pass

    # 2. Firestore 최신 생성순 300건 쿼리 (runQuery)
    try:
        url = f"https://firestore.googleapis.com/v1/projects/{PROJECT_ID}/databases/(default)/documents:runQuery"
        query = {
            "structuredQuery": {
                "from": [{"collectionId": "posts"}],
                "orderBy": [{"field": {"fieldPath": "createdAt"}, "direction": "DESCENDING"}],
                "limit": 300
            }
        }
        req = urllib.request.Request(
            url,
            data=json.dumps(query).encode("utf-8"),
            headers={"Content-Type": "application/json", "Authorization": f"Bearer {id_token}"}
        )
        with urllib.request.urlopen(req, timeout=10) as resp:
            res = json.loads(resp.read().decode())
            for item in res:
                doc = item.get("document")
                if not doc:
                    continue
                fields = doc.get("fields", {})
                content = fields.get("content", {}).get("stringValue", "")
                title = fields.get("title", {}).get("stringValue", "")
                matches = re.findall(r"(?:v=|youtu\.be/|/shorts/)([a-zA-Z0-9_-]{11})", content + " " + title)
                for m in matches:
                    existing_ids.add(m)
    except Exception as e:
        print(f"[WARN] Error running Firestore query: {e}")

    # 3. 로컬 all_posts_dump.json도 보조 검사
    dump_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "all_posts_dump.json")
    if os.path.exists(dump_path):
        try:
            with open(dump_path, "r", encoding="utf-8") as f:
                dump = json.load(f)
                for p in dump:
                    c = str(p.get("content", ""))
                    matches = re.findall(r"(?:v=|youtu\.be/|/shorts/)([a-zA-Z0-9_-]{11})", c)
                    for m in matches:
                        existing_ids.add(m)
        except Exception:
            pass

    return existing_ids

def save_synced_video_ids(ids):
    """로컬 동기화 기록 파일을 갱신합니다."""
    try:
        with open(SYNCED_CACHE_FILE, "w", encoding="utf-8") as f:
            json.dump(sorted(list(ids)), f, ensure_ascii=False, indent=2)
    except Exception as e:
        print(f"[WARN] Failed to save synced cache: {e}")

def create_firestore_post(id_token, post_data):
    """새로운 게시물을 Firestore 'posts' 컬렉션에 추가합니다."""
    url = f"https://firestore.googleapis.com/v1/projects/{PROJECT_ID}/databases/(default)/documents/posts"
    
    fields = {
        "title": {"stringValue": post_data["title"]},
        "content": {"stringValue": post_data["content"]},
        "coverUrl": {"stringValue": post_data["coverUrl"]},
        "topic": {"stringValue": post_data["topic"]},
        "tags": {
            "arrayValue": {
                "values": [{"stringValue": t} for t in post_data["tags"]]
            }
        },
        "subTopics": {
            "arrayValue": {
                "values": [{"stringValue": s} for s in post_data["subTopics"]]
            }
        },
        "series": {"stringValue": post_data["series"]},
        "author": {"stringValue": post_data["author"]},
        "order": {"integerValue": str(post_data.get("order", 0))},
        "recent_order": {"integerValue": "0"},
        "views": {"integerValue": "0"},
        "price": {"stringValue": ""},
        "fileUrl": {"stringValue": ""},
        "otherCategory": {"stringValue": ""},
        "createdAt": {"timestampValue": datetime.now(timezone.utc).isoformat()}
    }

    req = urllib.request.Request(
        url,
        data=json.dumps({"fields": fields}).encode("utf-8"),
        headers={"Content-Type": "application/json", "Authorization": f"Bearer {id_token}"},
        method="POST"
    )

    with urllib.request.urlopen(req, timeout=10) as resp:
        res = json.loads(resp.read().decode())
        doc_id = res["name"].split("/")[-1]
        return doc_id

# -----------------------------------------------------------------------------
# 3. 메인 동기화 실행 함수
# -----------------------------------------------------------------------------
def sync_channel():
    print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] 🚀 한국청교도연구소 유튜브(@kpuritan) 동기화 시작")

    # 1. RSS 피드 파싱
    req = urllib.request.Request(RSS_URL, headers={"User-Agent": "Mozilla/5.0"})
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            xml_data = resp.read()
    except Exception as e:
        print(f"[ERROR] RSS 피드를 불러오지 못했습니다: {e}")
        return []

    root = ET.fromstring(xml_data)
    ns = {
        "atom": "http://www.w3.org/2005/Atom",
        "yt": "http://www.youtube.com/xml/schemas/2015",
        "media": "http://search.yahoo.com/mrss/"
    }

    entries = root.findall("atom:entry", ns)
    print(f"📢 유튜브 채널 RSS 피드에서 {len(entries)}개 영상 감지 완료.")

    # 2. Firebase 토큰 발급 및 기존 게시물 검사
    id_token = get_firebase_id_token()
    existing_ids = get_existing_video_ids(id_token)
    print(f"🔍 기존 등록된 유튜브 영상 ID 수: {len(existing_ids)}개")

    new_posts = []

    # 3. 새 영상 판별 및 등록 (오래된 순부터 등록하여 최신순 유지)
    for entry in reversed(entries):
        vid = entry.find("yt:videoId", ns).text
        title = entry.find("atom:title", ns).text.strip()
        published = entry.find("atom:published", ns).text
        media_desc = entry.find("media:group/media:description", ns)
        desc = media_desc.text.strip() if media_desc is not None and media_desc.text else ""

        if vid in existing_ids:
            continue

        print(f"\n✨ 신규 영상 감지! [{vid}] {title}")
        is_short = is_short_video(vid)
        video_type_str = "쇼츠" if is_short else "롱폼"
        print(f"   타입: {video_type_str}")

        matched_topic = classify_content(title, desc)
        print(f"   신학 분류 결과: '{matched_topic}' (카테고리: 청교도 신학 > {matched_topic})")

        video_link = f"https://youtu.be/{vid}" if not is_short else f"https://www.youtube.com/shorts/{vid}"
        content_text = f"{video_link}\n\n{desc}" if desc else video_link

        post_data = {
            "title": title,
            "content": content_text,
            "coverUrl": f"https://img.youtube.com/vi/{vid}/hqdefault.jpg",
            "topic": matched_topic,
            "subTopics": [matched_topic],
            "tags": [matched_topic, "청교도 신학", "유튜브", video_type_str],
            "series": f"유튜브 {video_type_str}",
            "author": "김홍만",
            "order": 0
        }

        try:
            doc_id = create_firestore_post(id_token, post_data)
            print(f"   ✅ Firestore 등록 완료! (문서 ID: {doc_id})")
            existing_ids.add(vid)
            new_posts.append({
                "id": doc_id,
                "vid": vid,
                "title": title,
                "topic": matched_topic,
                "type": video_type_str,
                "link": video_link
            })
        except Exception as e:
            print(f"   ❌ Firestore 등록 실패: {e}")

    # 동기화 캐시 갱신
    save_synced_video_ids(existing_ids)

    print(f"\n========================================================")
    print(f"🎉 동기화 완료: 총 {len(new_posts)}개의 신규 영상이 홈페이지에 등록되었습니다.")
    print(f"========================================================\n")
    return new_posts

if __name__ == "__main__":
    sync_channel()
