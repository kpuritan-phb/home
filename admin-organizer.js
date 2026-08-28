/**
 * admin-organizer.js
 * 마우스 드래그 앤 드롭(Drag & Drop) 폴더 분류기
 * 한국 청교도 연구소 관리자 시스템
 */

let allOrganizerPosts = [];
let currentOrganizerFolder = 'all';
let draggedPostId = null;

// 자료 목록 로드 및 카운트 집계
async function loadFolderOrganizerPosts() {
    const listContainer = document.getElementById('organizer-posts-list');
    if (!listContainer) return;

    listContainer.innerHTML = '<div style="text-align:center; padding: 40px; color: #718096;"><i class="fas fa-spinner fa-spin fa-2x"></i><p style="margin-top:10px;">자료 목록을 불러오는 중...</p></div>';

    try {
        if (!db) {
            listContainer.innerHTML = '<p style="text-align:center; color:#e53e3e; padding:30px;">데이터베이스에 연결되지 않았습니다.</p>';
            return;
        }

        // 청교도 신학 13대 주제 및 기타 카테고리 목록 (절대 침범 불가)
        const excludeKeywords = [
            "신론", "인간론", "기독론", "구원론", "성령론", "구원론(성령론)",
            "율법과 복음", "그리스도인의 생활론", "그리스도인의 가정", "교회론",
            "설교론", "영적전쟁", "종말론", "역사 신학", "잘못된 신학", "청교도 신학",
            "강해설교", "도서 목록", "전도만화", "신학강론", "성경주석", "5분 신학강론"
        ];

        // 순수 전도, 부흥, 선교 태그만 정밀 쿼리 (전도 소책자 전체 쿼리 절대 배제)
        const snapshot = await db.collection("posts")
            .where("tags", "array-contains-any", ["전도, 부흥, 선교", "전도, 선교", "전도", "부흥", "선교", "부흥신학"])
            .get();

        const posts = [];
        const seenIds = new Set();

        snapshot.forEach(doc => {
            if (!seenIds.has(doc.id)) {
                const data = doc.data();
                const topic = data.topic || '';
                const other = data.otherCategory || '';
                const tags = Array.isArray(data.tags) ? data.tags : [];
                const series = data.series || '';

                // 청교도 신학 또는 기타 카테고리에 속한 글은 100% 철저히 배제
                const isOtherCategory = excludeKeywords.includes(topic) ||
                    excludeKeywords.includes(other) ||
                    tags.some(t => excludeKeywords.includes(t));

                if (!isOtherCategory) {
                    posts.push({ id: doc.id, ...data });
                    seenIds.add(doc.id);
                }
            }
        });

        // 최신순 정렬
        posts.sort((a, b) => {
            const timeA = a.createdAt?.seconds || 0;
            const timeB = b.createdAt?.seconds || 0;
            return timeB - timeA;
        });

        allOrganizerPosts = posts;

        // 폴더별 건수 뱃지 업데이트
        updateOrganizerFolderCounts();

        // 목록 렌더링
        renderOrganizerPostsList();

        // 드롭존 이벤트 등록
        setupOrganizerDropzones();

    } catch (e) {
        console.error("loadFolderOrganizerPosts error:", e);
        listContainer.innerHTML = `<p style="text-align:center; color:#e53e3e; padding:30px;"><i class="fas fa-exclamation-triangle"></i> 자료를 불러오지 못했습니다: ${e.message}</p>`;
    }
}

// 각 폴더에 속한 자료의 소속 판별
function getPostBelongingFolder(post) {
    const topic = post.topic || '';
    const series = post.series || '';
    const subTopic = post.subTopic || '';
    const tags = Array.isArray(post.tags) ? post.tags : [];
    const title = (post.title || '').toLowerCase();
    const content = (post.content || '').toLowerCase();

    // 1. 명시적 소속 우선
    if (series === '부흥' || subTopic === '부흥' || topic === '부흥' || tags.includes('부흥') || title.includes('부흥') || title.includes('대각성')) {
        return '부흥';
    }
    if (series === '선교' || subTopic === '선교' || topic === '선교' || tags.includes('선교') || title.includes('선교')) {
        return '선교';
    }
    if (series === '전도' || subTopic === '전도' || topic === '전도' || tags.includes('전도') || tags.includes('전도 소책자') || title.includes('전도')) {
        return '전도';
    }
    return '전도'; // 기본값
}

// 폴더별 건수 뱃지 업데이트
function updateOrganizerFolderCounts() {
    let countEvangelism = 0;
    let countRevival = 0;
    let countMissions = 0;

    allOrganizerPosts.forEach(p => {
        const folder = getPostBelongingFolder(p);
        if (folder === '전도') countEvangelism++;
        else if (folder === '부흥') countRevival++;
        else if (folder === '선교') countMissions++;
    });

    const badgeEv = document.getElementById('count-folder-전도');
    const badgeRe = document.getElementById('count-folder-부흥');
    const badgeMi = document.getElementById('count-folder-선교');
    const badgeAll = document.getElementById('count-folder-all');

    if (badgeEv) badgeEv.textContent = `${countEvangelism}건`;
    if (badgeRe) badgeRe.textContent = `${countRevival}건`;
    if (badgeMi) badgeMi.textContent = `${countMissions}건`;
    if (badgeAll) badgeAll.textContent = `${allOrganizerPosts.length}건`;
}

// 목록 렌더링
function renderOrganizerPostsList() {
    const listContainer = document.getElementById('organizer-posts-list');
    if (!listContainer) return;

    const searchKeyword = (document.getElementById('organizer-search-input')?.value || '').trim().toLowerCase();

    let filtered = allOrganizerPosts.filter(p => {
        const folder = getPostBelongingFolder(p);
        // 폴더 필터
        if (currentOrganizerFolder !== 'all' && folder !== currentOrganizerFolder) {
            return false;
        }
        // 검색어 필터
        if (searchKeyword) {
            const title = (p.title || '').toLowerCase();
            const author = (p.author || '').toLowerCase();
            return title.includes(searchKeyword) || author.includes(searchKeyword);
        }
        return true;
    });

    if (filtered.length === 0) {
        listContainer.innerHTML = '<div style="text-align:center; color:#a0aec0; padding: 40px;"><i class="far fa-folder-open fa-2x"></i><p style="margin-top:8px;">해당 폴더에 속한 자료가 없습니다.</p></div>';
        return;
    }

    let html = '';
    filtered.forEach(post => {
        const folder = getPostBelongingFolder(post);
        let folderBadgeStyle = 'background: #ebf8ff; color: #2b6cb0; border: 1px solid #bee3f8;';
        let folderIcon = 'fa-folder';
        if (folder === '부흥') {
            folderBadgeStyle = 'background: #fffaf0; color: #c05621; border: 1px solid #feebc8;';
            folderIcon = 'fa-fire';
        } else if (folder === '선교') {
            folderBadgeStyle = 'background: #f0fff4; color: #276749; border: 1px solid #c6f6d5;';
            folderIcon = 'fa-globe-asia';
        }

        html += `
            <div class="organizer-post-card" id="organizer-card-${post.id}" draggable="true"
                ondragstart="handleOrganizerDragStart(event, '${post.id}')"
                ondragend="handleOrganizerDragEnd(event)"
                style="display: flex; align-items: center; justify-content: space-between; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; cursor: grab; transition: all 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
                
                <div style="display: flex; align-items: center; gap: 14px; flex: 1; min-width: 0;">
                    <div class="drag-handle" style="color: #a0aec0; font-size: 1.1rem; cursor: grab;" title="마우스로 잡고 위 폴더로 드래그하세요">
                        <i class="fas fa-grip-vertical"></i>
                    </div>
                    <div style="flex: 1; min-width: 0;">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
                            <span style="font-size: 0.75rem; font-weight: 700; padding: 2px 8px; border-radius: 4px; ${folderBadgeStyle}">
                                <i class="fas ${folderIcon}"></i> ${folder} 폴더
                            </span>
                            <span style="font-size: 0.8rem; color: #718096;"><i class="far fa-user"></i> ${post.author || '저자 미상'}</span>
                        </div>
                        <h4 style="margin: 0; font-size: 0.98rem; color: #2d3748; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${post.title || ''}">
                            ${post.title || '제목 없음'}
                        </h4>
                    </div>
                </div>

                <!-- 빠른 이동 버튼 그룹 (클릭으로도 이동 가능) -->
                <div style="display: flex; gap: 6px; align-items: center; margin-left: 15px;">
                    <span style="font-size: 0.75rem; color: #a0aec0; margin-right: 2px;">이동:</span>
                    <button type="button" onclick="movePostToFolder('${post.id}', '전도')" 
                        style="padding: 4px 8px; font-size: 0.75rem; background: ${folder === '전도' ? '#3182ce' : '#edf2f7'}; color: ${folder === '전도' ? '#fff' : '#4a5568'}; border: none; border-radius: 4px; cursor: pointer; font-weight: 600;">
                        전도
                    </button>
                    <button type="button" onclick="movePostToFolder('${post.id}', '부흥')" 
                        style="padding: 4px 8px; font-size: 0.75rem; background: ${folder === '부흥' ? '#dd6b20' : '#edf2f7'}; color: ${folder === '부흥' ? '#fff' : '#4a5568'}; border: none; border-radius: 4px; cursor: pointer; font-weight: 600;">
                        부흥
                    </button>
                    <button type="button" onclick="movePostToFolder('${post.id}', '선교')" 
                        style="padding: 4px 8px; font-size: 0.75rem; background: ${folder === '선교' ? '#38a169' : '#edf2f7'}; color: ${folder === '선교' ? '#fff' : '#4a5568'}; border: none; border-radius: 4px; cursor: pointer; font-weight: 600;">
                        선교
                    </button>
                </div>
            </div>
        `;
    });

    listContainer.innerHTML = html;
}

// 드래그 시작
function handleOrganizerDragStart(e, postId) {
    draggedPostId = postId;
    e.dataTransfer.setData('text/plain', postId);
    e.dataTransfer.effectAllowed = 'move';

    const card = document.getElementById(`organizer-card-${postId}`);
    if (card) {
        card.style.opacity = '0.4';
        card.style.transform = 'scale(0.98)';
    }

    // 폴더 드롭존 하이라이트 활성화
    document.querySelectorAll('.folder-dropzone').forEach(zone => {
        zone.classList.add('drop-target-active');
        zone.style.transform = 'translateY(-2px)';
    });
}

// 드래그 종료
function handleOrganizerDragEnd(e) {
    if (draggedPostId) {
        const card = document.getElementById(`organizer-card-${draggedPostId}`);
        if (card) {
            card.style.opacity = '1';
            card.style.transform = 'none';
        }
    }
    draggedPostId = null;

    // 하이라이트 제거
    document.querySelectorAll('.folder-dropzone').forEach(zone => {
        zone.classList.remove('drop-target-active', 'drag-over');
        zone.style.transform = 'none';
    });
}

// 드롭존 이벤트 바인딩
function setupOrganizerDropzones() {
    const dropzones = document.querySelectorAll('.folder-dropzone');
    dropzones.forEach(zone => {
        zone.ondragover = (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            zone.classList.add('drag-over');
            zone.style.boxShadow = '0 8px 25px rgba(0,0,0,0.12)';
        };

        zone.ondragleave = () => {
            zone.classList.remove('drag-over');
            zone.style.boxShadow = 'none';
        };

        zone.ondrop = async (e) => {
            e.preventDefault();
            zone.classList.remove('drag-over');
            zone.style.boxShadow = 'none';

            const postId = e.dataTransfer.getData('text/plain') || draggedPostId;
            const targetFolder = zone.dataset.folder;

            if (postId && targetFolder && targetFolder !== 'all') {
                await movePostToFolder(postId, targetFolder);
            }
        };
    });
}

// 실제 Firestore DB에 폴더 변경 적용
async function movePostToFolder(postId, targetFolder) {
    if (!postId || !targetFolder) return;

    try {
        const post = allOrganizerPosts.find(p => p.id === postId);
        if (!post) return;

        const currentFolder = getPostBelongingFolder(post);
        if (currentFolder === targetFolder) {
            return; // 이미 같은 폴더
        }

        // 태그 정리
        let tags = Array.isArray(post.tags) ? [...post.tags] : [];
        // 구 태그 및 다른 서브 폴더 태그 제거
        tags = tags.filter(t => t !== '전도, 선교' && t !== '전도' && t !== '부흥' && t !== '선교');
        if (!tags.includes('전도, 부흥, 선교')) tags.push('전도, 부흥, 선교');
        if (!tags.includes(targetFolder)) tags.push(targetFolder);

        // 로컬 데이터 즉시 갱신 (부드러운 UI)
        post.topic = '전도, 부흥, 선교';
        post.series = targetFolder;
        post.subTopic = targetFolder;
        post.tags = tags;

        updateOrganizerFolderCounts();
        renderOrganizerPostsList();

        // Firestore DB 업데이트
        await db.collection('posts').doc(postId).update({
            topic: '전도, 부흥, 선교',
            series: targetFolder,
            subTopic: targetFolder,
            tags: tags,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        console.log(`Post ${postId} moved to ${targetFolder}`);
        showOrganizerToast(`'${post.title || '자료'}'이(가) [${targetFolder}] 폴더로 이동되었습니다!`);

        if (window.loadAdminPosts) window.loadAdminPosts();

    } catch (e) {
        console.error("movePostToFolder error:", e);
        alert(`폴더 이동 중 오류가 발생했습니다: ${e.message}`);
        loadFolderOrganizerPosts(); // 롤백 새로고침
    }
}

// 상단 폴더 탭 클릭 시 필터링
function filterOrganizerByFolder(folderName) {
    currentOrganizerFolder = folderName;

    // UI 활성화 상태 갱신
    document.querySelectorAll('.folder-dropzone').forEach(zone => {
        if (zone.dataset.folder === folderName) {
            zone.style.borderColor = '#2b6cb0';
            zone.style.boxShadow = '0 4px 15px rgba(43, 108, 176, 0.15)';
        } else {
            zone.style.borderColor = '';
            zone.style.boxShadow = 'none';
        }
    });

    const filterLabel = document.getElementById('organizer-current-filter-label');
    if (filterLabel) {
        let nameKor = '전체 자료';
        if (folderName === '전도') nameKor = '전도 폴더';
        else if (folderName === '부흥') nameKor = '부흥 폴더';
        else if (folderName === '선교') nameKor = '선교 폴더';
        filterLabel.innerHTML = `현재 표시: <span style="color: #2b6cb0;">${nameKor}</span>`;
    }

    renderOrganizerPostsList();
}

// 검색어 입력 시 필터링
function filterOrganizerPostsList() {
    renderOrganizerPostsList();
}

// 이동 완료 알림 토스트
function showOrganizerToast(msg) {
    let toast = document.getElementById('organizer-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'organizer-toast';
        toast.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            background: #2d3748;
            color: #ffffff;
            padding: 14px 22px;
            border-radius: 8px;
            font-size: 0.92rem;
            font-weight: 600;
            box-shadow: 0 10px 30px rgba(0,0,0,0.25);
            z-index: 99999;
            display: flex;
            align-items: center;
            gap: 10px;
            opacity: 0;
            transform: translateY(20px);
            transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
        `;
        document.body.appendChild(toast);
    }

    toast.innerHTML = `<i class="fas fa-check-circle" style="color: #48bb78; font-size: 1.1rem;"></i> ${msg}`;
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';

    clearTimeout(window._organizerToastTimeout);
    window._organizerToastTimeout = setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
    }, 2500);
}
