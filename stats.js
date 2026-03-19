/**
 * kpuritan 통합 통계 시스템 (Tracker)
 */

const Stats = (() => {
    const SESSION_TIMEOUT = 30 * 60 * 1000; // 30분
    const VIEW_COOLDOWN = 30 * 60 * 1000; // 동일 콘텐츠 조회 기록 간격

    // 세션 식별자 생성/유지
    function getSessionId() {
        let sid = sessionStorage.getItem('kpi_sid');
        if (!sid) {
            sid = 's_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
            sessionStorage.setItem('kpi_sid', sid);
        }
        return sid;
    }

    // 뷰 중복 방지 체크 (로컬스토리지 활용)
    function isDuplicateView(contentId) {
        const lastViewMap = JSON.parse(localStorage.getItem('kpi_last_views') || '{}');
        const now = Date.now();
        if (lastViewMap[contentId] && (now - lastViewMap[contentId] < VIEW_COOLDOWN)) {
            return true;
        }
        lastViewMap[contentId] = now;
        localStorage.setItem('kpi_last_views', JSON.stringify(lastViewMap));
        return false;
    }

    /**
     * 이벤트 트래킹 메인 함수
     * @param {string} type - view | click | download
     * @param {object} info - { id, type, title, category, lang, url }
     */
    async function track(type, info) {
        if (!window.db) return;

        // View인 경우 중복 체크
        if (type === 'view' && isDuplicateView(info.id)) {
            return;
        }

        const eventData = {
            event_type: type,
            content_id: info.id || 'unknown',
            content_type: info.type || 'page',
            title: info.title || '',
            category: info.category || '',
            lang: info.lang || 'ko',
            url: info.url || window.location.pathname,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            sid: getSessionId(),
            ua: navigator.userAgent,
            ref: document.referrer || ''
        };

        try {
            // 1. 원시 이벤트 로그 저장 (상세 분석용)
            await db.collection("analytics_events").add(eventData);

            // 2. 실시간 카운터 업데이트 (빠른 조회를 위해 별도 컬렉션 관리)
            const statsRef = db.collection("analytics_counters").doc(info.id);
            const increment = firebase.firestore.FieldValue.increment(1);

            const updateObj = {
                title: info.title,
                content_type: info.type,
                category: info.category,
                lang: info.lang,
                last_event: firebase.firestore.FieldValue.serverTimestamp()
            };

            if (type === 'view') updateObj.views = increment;
            if (type === 'click') updateObj.clicks = increment;
            if (type === 'download') updateObj.downloads = increment;

            await statsRef.set(updateObj, { merge: true });

            // 3. 글로벌 전체 요약 (일자별 집계)
            const today = new Date().toISOString().split('T')[0];
            const globalRef = db.collection("analytics_summary").doc(today);
            const summaryUpdate = {
                date: today
            };
            if (type === 'view') summaryUpdate.total_views = increment;
            if (type === 'click') summaryUpdate.total_clicks = increment;
            if (type === 'download') summaryUpdate.total_downloads = increment;

            // 세션 최초 방문인 경우 오늘 방문자 수 증가 (세션 스토리지는 탭 닫으면 초기화됨)
            if (!sessionStorage.getItem('kpi_session_counted_' + today)) {
                summaryUpdate.total_visitors = increment;
                sessionStorage.setItem('kpi_session_counted_' + today, 'true');
            }

            await globalRef.set(summaryUpdate, { merge: true });

        } catch (e) {
            console.warn("Stats track error:", e);
        }
    }

    // 페이지 뷰 자동 트래킹
    function trackPageView() {
        const path = window.location.pathname;
        let pageId = 'page_index';
        let pageTitle = '메인 페이지';

        if (path.includes('books.html')) {
            pageId = 'page_books';
            pageTitle = '도서 목록';
        } else if (path.includes('booklets.html')) {
            pageId = 'page_booklets';
            pageTitle = '전도 소책자';
        } else if (path.includes('resources.html')) {
            const urlParams = new URLSearchParams(window.location.search);
            const type = urlParams.get('type') === 'author' ? '저자별' : '주제별';
            const cat = urlParams.get('cat') || '목록';
            pageId = `page_resources_${urlParams.get('type') || 'topic'}`;
            pageTitle = `${type} 자료 (${cat})`;
        }

        track('view', {
            id: pageId,
            type: 'page',
            title: pageTitle
        });
    }

    // 모듈 초기화
    document.addEventListener('DOMContentLoaded', () => {
        // 3교대 초기화 대기 (Firebase 로드 확인)
        const checkFB = setInterval(() => {
            if (window.db) {
                clearInterval(checkFB);
                trackPageView();
                setupAutoClickTracking();
            }
        }, 500);
    });

    // 외부 링크 클릭 자동 감지
    function setupAutoClickTracking() {
        document.addEventListener('click', (e) => {
            const a = e.target.closest('a');
            if (!a || !a.href) return;

            // 이미 명시적으로 트래킹하는 경우(onclick) 제외하기 위해 태그 확인 가능
            if (a.dataset.trackIgnore) return;

            const isExternal = a.hostname !== window.location.hostname;
            if (isExternal) {
                track('click', {
                    id: 'ext_' + btoa(a.href).substring(0, 16),
                    type: 'external_link',
                    title: a.innerText.trim() || a.title || '외부 링크',
                    url: a.href
                });
            }
        });
    }

    return { track };
})();

window.Stats = Stats;
