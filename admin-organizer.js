/**
 * admin-organizer.js
 * 사이트 전체 통합 비주얼 마우스 드래그 앤 드롭 폴더 분류기
 * 한국 청교도 연구소 (KPI)
 */

let allOrganizerPosts = [];
let currentOrganizerCategory = '전도, 부흥, 선교'; // 현재 선택된 대분류 모드
let currentOrganizerFolder = 'all';               // 현재 선택된 하위 폴더 필터
let draggedPostId = null;
let selectedPostIds = new Set();                  // 일괄 이동용 다중 선택 ID 목록

// 대분류별 하위 폴더 및 아이콘/색상 정의
const ORGANIZER_CATEGORY_CONFIG = {
    '전도, 부흥, 선교': {
        name: '전도, 부흥, 선교',
        icon: 'fa-globe-americas',
        color: '#2b6cb0',
        folders: [
            { id: '전도', name: '1. 전도', icon: 'fa-folder-open', color: '#3182ce', desc: '전도 설교, 복음전도, 소책자' },
            { id: '부흥', name: '2. 부흥', icon: 'fa-fire', color: '#dd6b20', desc: '부흥, 대각성, 영적 각성' },
            { id: '선교', name: '3. 선교', icon: 'fa-globe-asia', color: '#38a169', desc: '세계선교, 선교사, 타문화권' }
        ]
    },
    '청교도 신학': {
        name: '청교도 신학',
        icon: 'fa-book-open',
        color: '#1a342a',
        folders: [
            { id: '신론', name: '1. 신론', icon: 'fa-sun', color: '#4a5568', desc: '하나님의 속성, 삼위일체, 언약' },
            { id: '인간론', name: '2. 인간론', icon: 'fa-user', color: '#4a5568', desc: '원죄, 전적 타락, 양심' },
            { id: '기독론', name: '3. 기독론', icon: 'fa-cross', color: '#4a5568', desc: '그리스도의 인성과 신성, 속죄' },
            { id: '구원론(성령론)', name: '4. 구원론(성령론)', icon: 'fa-dove', color: '#4a5568', desc: '중생, 회개, 칭의, 성화' },
            { id: '율법과 복음', name: '5. 율법과 복음', icon: 'fa-balance-scale', color: '#4a5568', desc: '십계명, 율법과 복음의 조화' },
            { id: '그리스도인의 생활론', name: '6. 생활론', icon: 'fa-walking', color: '#4a5568', desc: '경건, 기도, 자기부정, 제자도' },
            { id: '그리스도인의 가정', name: '7. 가정론', icon: 'fa-home', color: '#4a5568', desc: '가정 예배, 결혼, 기독교 교육' },
            { id: '교회론', name: '8. 교회론', icon: 'fa-church', color: '#4a5568', desc: '성례, 예배, 직무, 성도의 교제' },
            { id: '설교론', name: '9. 설교론', icon: 'fa-microphone-alt', color: '#4a5568', desc: '청교도 설교관, 설교자' },
            { id: '영적전쟁', name: '10. 영적전쟁', icon: 'fa-shield-alt', color: '#4a5568', desc: '사탄의 계략, 영적 무장' },
            { id: '종말론', name: '11. 종말론', icon: 'fa-hourglass-end', color: '#4a5568', desc: '부활, 재림, 최후 심판, 천국' },
            { id: '역사 신학', name: '12. 역사 신학', icon: 'fa-landmark', color: '#4a5568', desc: '교회사, 신조, 신앙고백' },
            { id: '잘못된 신학', name: '13. 잘못된 신학', icon: 'fa-exclamation-triangle', color: '#e53e3e', desc: '알미니안주의, 펠라기우스 등' }
        ]
    },
    '강해설교': {
        name: '강해설교',
        icon: 'fa-scroll',
        color: '#8c6d46',
        folders: [] // DB에서 실시간 시리즈 목록 동적 수집
    },
    '세미나, 강의': {
        name: '세미나, 강의',
        icon: 'fa-chalkboard-teacher',
        color: '#805ad5',
        folders: [] // DB에서 실시간 시리즈 목록 동적 수집
    },
    '카테고리_대이동': {
        name: '대분류 간 이동 모드',
        icon: 'fa-exchange-alt',
        color: '#319795',
        folders: [
            { id: '청교도 신학', name: '청교도 신학', icon: 'fa-book-open', color: '#1a342a', desc: '13대 청교도 신학 대주제' },
            { id: '전도, 부흥, 선교', name: '전도, 부흥, 선교', icon: 'fa-globe-americas', color: '#2b6cb0', desc: '전도, 부흥, 선교 자료' },
            { id: '강해설교', name: '강해설교', icon: 'fa-scroll', color: '#8c6d46', desc: '성경 각 권 강해설교' },
            { id: '세미나, 강의', name: '세미나, 강의', icon: 'fa-chalkboard-teacher', color: '#805ad5', desc: '세미나 및 특별 강의' },
            { id: '전도만화', name: '전도만화', icon: 'fa-palette', color: '#d69e2e', desc: '복음 전도만화' },
            { id: '신학강론', name: '신학강론', icon: 'fa-video', color: '#e53e3e', desc: '5분 신학강론 및 영상' }
        ]
    }
};

// 카테고리 전환 함수
function switchOrganizerCategory(catName) {
    currentOrganizerCategory = catName;
    currentOrganizerFolder = 'all';
    selectedPostIds.clear();

    // 카테고리 탭 UI 활성화
    document.querySelectorAll('.organizer-cat-btn').forEach(btn => {
        if (btn.dataset.category === catName) {
            btn.classList.add('active');
            btn.style.background = '#1a342a';
            btn.style.color = '#ffffff';
        } else {
            btn.classList.remove('active');
            btn.style.background = '#edf2f7';
            btn.style.color = '#4a5568';
        }
    });

    loadFolderOrganizerPosts();
}

// 전체 자료 로드 및 폴더 렌더링
async function loadFolderOrganizerPosts() {
    const listContainer = document.getElementById('organizer-posts-list');
    const foldersContainer = document.getElementById('organizer-folders-grid');
    if (!listContainer || !foldersContainer) return;

    listContainer.innerHTML = '<div style="text-align:center; padding: 50px; color: #718096;"><i class="fas fa-spinner fa-spin fa-2x"></i><p style="margin-top:12px; font-weight:600;">데이터를 불러오는 중...</p></div>';

    try {
        if (!db) {
            listContainer.innerHTML = '<p style="text-align:center; color:#e53e3e; padding:30px;">데이터베이스에 연결되지 않았습니다.</p>';
            return;
        }

        let snapshot;
        if (currentOrganizerCategory === '전도, 부흥, 선교') {
            snapshot = await db.collection("posts")
                .where("tags", "array-contains-any", ["전도, 부흥, 선교", "전도", "부흥", "선교", "부흥신학"])
                .get();
        } else if (currentOrganizerCategory === '청교도 신학') {
            snapshot = await db.collection("posts")
                .where("tags", "array-contains", "청교도 신학")
                .get();
        } else if (currentOrganizerCategory === '강해설교') {
            snapshot = await db.collection("posts")
                .where("tags", "array-contains", "강해설교")
                .get();
        } else if (currentOrganizerCategory === '세미나, 강의') {
            snapshot = await db.collection("posts")
                .where("tags", "array-contains-any", ["세미나, 강의", "세미나", "강의"])
                .get();
        } else {
            // 카테고리 대이동 모드 (최근 자료 전체)
            snapshot = await db.collection("posts").limit(300).get();
        }

        const posts = [];
        const seenIds = new Set();

        snapshot.forEach(doc => {
            if (!seenIds.has(doc.id)) {
                posts.push({ id: doc.id, ...doc.data() });
                seenIds.add(doc.id);
            }
        });

        // 최신순 정렬
        posts.sort((a, b) => {
            const timeA = a.createdAt?.seconds || 0;
            const timeB = b.createdAt?.seconds || 0;
            return timeB - timeA;
        });

        allOrganizerPosts = posts;

        // 강해설교 및 세미나 동적 시리즈 폴더 수집
        if (currentOrganizerCategory === '강해설교' || currentOrganizerCategory === '세미나, 강의') {
            const seriesSet = new Set();
            posts.forEach(p => {
                const s = (p.series || '').trim();
                if (s) seriesSet.add(s);
            });
            const dynamicFolders = Array.from(seriesSet).sort().map(s => ({
                id: s,
                name: s,
                icon: 'fa-folder',
                color: currentOrganizerCategory === '강해설교' ? '#8c6d46' : '#805ad5',
                desc: `${s} 시리즈`
            }));
            ORGANIZER_CATEGORY_CONFIG[currentOrganizerCategory].folders = dynamicFolders;
        }

        // 상단 폴더 드롭존 렌더링
        renderOrganizerFolderDropzones();

        // 하단 글 목록 렌더링
        renderOrganizerPostsList();

        // 일괄 이동 드롭다운 옵션 갱신
        updateBulkMoveSelectOptions();

    } catch (e) {
        console.error("loadFolderOrganizerPosts error:", e);
        listContainer.innerHTML = `<p style="text-align:center; color:#e53e3e; padding:30px;"><i class="fas fa-exclamation-triangle"></i> 자료를 불러오지 못했습니다: ${e.message}</p>`;
    }
}

// 각 글이 현재 대분류 모드에서 어느 하위 폴더에 속해있는지 판별
function getPostFolderInCurrentCategory(post) {
    const topic = post.topic || '';
    const series = post.series || '';
    const subTopic = post.subTopic || '';
    const tags = Array.isArray(post.tags) ? post.tags : [];

    if (currentOrganizerCategory === '전도, 부흥, 선교') {
        if (series === '부흥' || subTopic === '부흥' || topic === '부흥' || tags.includes('부흥') || tags.includes('부흥신학')) return '부흥';
        if (series === '선교' || subTopic === '선교' || topic === '선교' || tags.includes('선교')) return '선교';
        if (series === '전도' || subTopic === '전도' || topic === '전도' || tags.includes('전도')) return '전도';
        return '전도'; // 기본값
    }

    if (currentOrganizerCategory === '청교도 신학') {
        if (topic && topic !== '청교도 신학') return topic;
        if (series) return series;
        if (subTopic) return subTopic;
        for (let f of ORGANIZER_CATEGORY_CONFIG['청교도 신학'].folders) {
            if (tags.includes(f.id)) return f.id;
        }
        return '미분류';
    }

    if (currentOrganizerCategory === '강해설교' || currentOrganizerCategory === '세미나, 강의') {
        return series || '미분류';
    }

    if (currentOrganizerCategory === '카테고리_대이동') {
        if (tags.includes('전도, 부흥, 선교') || topic === '전도, 부흥, 선교') return '전도, 부흥, 선교';
        if (tags.includes('청교도 신학') || topic === '청교도 신학') return '청교도 신학';
        if (tags.includes('강해설교') || topic === '강해설교') return '강해설교';
        if (tags.includes('세미나, 강의') || topic === '세미나, 강의') return '세미나, 강의';
        if (tags.includes('전도만화') || topic === '전도만화') return '전도만화';
        if (tags.includes('신학강론') || topic === '신학강론') return '신학강론';
        return '기타';
    }

    return series || topic || '기타';
}

// 상단 폴더 드롭존 렌더링
function renderOrganizerFolderDropzones() {
    const container = document.getElementById('organizer-folders-grid');
    if (!container) return;

    const config = ORGANIZER_CATEGORY_CONFIG[currentOrganizerCategory];
    const folders = config ? config.folders : [];

    // 각 폴더별 건수 집계
    const counts = {};
    folders.forEach(f => counts[f.id] = 0);
    counts['all'] = allOrganizerPosts.length;
    counts['미분류'] = 0;

    allOrganizerPosts.forEach(p => {
        const folderId = getPostFolderInCurrentCategory(p);
        if (counts[folderId] !== undefined) {
            counts[folderId]++;
        } else {
            counts['미분류'] = (counts['미분류'] || 0) + 1;
        }
    });

    let html = '';

    // 1. "전체 보기" 폴더
    const isAllActive = currentOrganizerFolder === 'all';
    html += `
        <div class="folder-dropzone ${isAllActive ? 'active-view' : ''}" data-folder="all" onclick="filterOrganizerByFolder('all')"
            style="border: 2px solid ${isAllActive ? '#1a342a' : '#cbd5e0'}; background: ${isAllActive ? '#edf2f7' : '#ffffff'}; border-radius: 12px; padding: 14px 10px; text-align: center; cursor: pointer; transition: all 0.2s; position: relative;">
            <div style="font-size: 1.8rem; color: #4a5568; margin-bottom: 6px;">
                <i class="fas fa-layer-group"></i>
            </div>
            <h4 style="margin: 0 0 4px 0; font-size: 0.95rem; color: #2d3748; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">전체 보기</h4>
            <span class="folder-badge" style="display: inline-block; background: #4a5568; color: white; padding: 2px 8px; border-radius: 20px; font-size: 0.75rem; font-weight: 700;">${counts['all']}건</span>
        </div>
    `;

    // 2. 각 하위 폴더 드롭존들
    folders.forEach(folder => {
        const isActive = currentOrganizerFolder === folder.id;
        const count = counts[folder.id] || 0;
        html += `
            <div class="folder-dropzone ${isActive ? 'active-view' : ''}" data-folder="${folder.id}" onclick="filterOrganizerByFolder('${folder.id}')"
                style="border: 2px dashed ${folder.color}; background: ${isActive ? '#f7fafc' : '#ffffff'}; border-radius: 12px; padding: 14px 10px; text-align: center; cursor: pointer; transition: all 0.2s; position: relative; box-shadow: ${isActive ? '0 4px 15px rgba(0,0,0,0.08)' : 'none'};">
                <div style="font-size: 1.8rem; color: ${folder.color}; margin-bottom: 6px;">
                    <i class="fas ${folder.icon}"></i>
                </div>
                <h4 style="margin: 0 0 4px 0; font-size: 0.95rem; color: ${folder.color}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${folder.name}">
                    ${folder.name}
                </h4>
                <span class="folder-badge" style="display: inline-block; background: ${folder.color}; color: white; padding: 2px 8px; border-radius: 20px; font-size: 0.75rem; font-weight: 700;">${count}건</span>
                ${folder.desc ? `<p style="margin: 4px 0 0 0; font-size: 0.7rem; color: #718096; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${folder.desc}">${folder.desc}</p>` : ''}
            </div>
        `;
    });

    container.innerHTML = html;

    // 드롭존 드래그 이벤트 바인딩
    setupOrganizerDropzones();
}

// 하단 글 목록 렌더링
function renderOrganizerPostsList() {
    const listContainer = document.getElementById('organizer-posts-list');
    if (!listContainer) return;

    const searchKeyword = (document.getElementById('organizer-search-input')?.value || '').trim().toLowerCase();

    let filtered = allOrganizerPosts.filter(p => {
        const folder = getPostFolderInCurrentCategory(p);
        if (currentOrganizerFolder !== 'all' && folder !== currentOrganizerFolder) {
            return false;
        }
        if (searchKeyword) {
            const title = (p.title || '').toLowerCase();
            const author = (p.author || '').toLowerCase();
            const series = (p.series || '').toLowerCase();
            return title.includes(searchKeyword) || author.includes(searchKeyword) || series.includes(searchKeyword);
        }
        return true;
    });

    // 선택된 개수 뱃지 업데이트
    updateSelectedCountUI();

    if (filtered.length === 0) {
        listContainer.innerHTML = '<div style="text-align:center; color:#a0aec0; padding: 50px;"><i class="far fa-folder-open fa-2x"></i><p style="margin-top:10px; font-size: 0.95rem;">해당 폴더에 속한 자료가 없습니다.</p></div>';
        return;
    }

    const config = ORGANIZER_CATEGORY_CONFIG[currentOrganizerCategory];
    const availableFolders = config ? config.folders : [];

    let html = '';
    filtered.forEach(post => {
        const folderId = getPostFolderInCurrentCategory(post);
        const isChecked = selectedPostIds.has(post.id);

        html += `
            <div class="organizer-post-card ${isChecked ? 'selected-card' : ''}" id="organizer-card-${post.id}" draggable="true"
                ondragstart="handleOrganizerDragStart(event, '${post.id}')"
                ondragend="handleOrganizerDragEnd(event)"
                style="display: flex; align-items: center; justify-content: space-between; background: ${isChecked ? '#f0fff4' : '#ffffff'}; border: 1px solid ${isChecked ? '#38a169' : '#e2e8f0'}; border-radius: 8px; padding: 12px 16px; cursor: grab; transition: all 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
                
                <div style="display: flex; align-items: center; gap: 12px; flex: 1; min-width: 0;">
                    <!-- 다중 선택 체크박스 -->
                    <input type="checkbox" onchange="togglePostSelection('${post.id}', this.checked)" ${isChecked ? 'checked' : ''}
                        style="width: 18px; height: 18px; cursor: pointer; accent-color: #1a342a;">
                    
                    <!-- 마우스 드래그 핸들 -->
                    <div class="drag-handle" style="color: #a0aec0; font-size: 1.15rem; cursor: grab; padding: 0 4px;" title="마우스로 잡고 위 폴더로 끌어다 놓으세요">
                        <i class="fas fa-grip-vertical"></i>
                    </div>

                    <!-- 글 정보 -->
                    <div style="flex: 1; min-width: 0;">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px; flex-wrap: wrap;">
                            <span style="font-size: 0.75rem; font-weight: 700; padding: 2px 8px; border-radius: 4px; background: #edf2f7; color: #2d3748; border: 1px solid #cbd5e0;">
                                <i class="fas fa-folder"></i> ${folderId}
                            </span>
                            <span style="font-size: 0.8rem; color: #718096;"><i class="far fa-user"></i> ${post.author || '저자 미상'}</span>
                            ${post.series ? `<span style="font-size: 0.75rem; color: #a0aec0;">[시리즈: ${post.series}]</span>` : ''}
                        </div>
                        <h4 style="margin: 0; font-size: 1rem; color: #2d3748; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${post.title || ''}">
                            ${post.title || '제목 없음'}
                        </h4>
                    </div>
                </div>

                <!-- 빠른 이동 원클릭 드롭다운 -->
                <div style="display: flex; gap: 8px; align-items: center; margin-left: 15px;">
                    <span style="font-size: 0.75rem; color: #a0aec0;">이동:</span>
                    <select onchange="if(this.value) { movePostToFolder('${post.id}', this.value); this.value=''; }"
                        style="padding: 5px 8px; font-size: 0.8rem; border: 1px solid #cbd5e0; border-radius: 6px; background: #f7fafc; color: #4a5568; cursor: pointer; font-weight: 600;">
                        <option value="">-- 폴더 선택 --</option>
                        ${availableFolders.map(f => `<option value="${f.id}">${f.name}</option>`).join('')}
                    </select>
                </div>
            </div>
        `;
    });

    listContainer.innerHTML = html;
}

// 드래그 시작 이벤트
function handleOrganizerDragStart(e, postId) {
    draggedPostId = postId;
    e.dataTransfer.setData('text/plain', postId);
    e.dataTransfer.effectAllowed = 'move';

    const card = document.getElementById(`organizer-card-${postId}`);
    if (card) {
        card.style.opacity = '0.35';
        card.style.transform = 'scale(0.98)';
    }

    // 폴더 드롭존 하이라이트 활성화
    document.querySelectorAll('.folder-dropzone').forEach(zone => {
        zone.classList.add('drop-target-active');
        zone.style.transform = 'translateY(-2px)';
    });
}

// 드래그 종료 이벤트
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
            zone.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
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

// 개별 글을 특정 폴더로 이동 (Firestore DB 업데이트)
async function movePostToFolder(postId, targetFolder) {
    if (!postId || !targetFolder) return;

    try {
        const post = allOrganizerPosts.find(p => p.id === postId);
        if (!post) return;

        let tags = Array.isArray(post.tags) ? [...post.tags] : [];
        let updateData = {
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        if (currentOrganizerCategory === '전도, 부흥, 선교') {
            tags = tags.filter(t => t !== '전도, 선교' && t !== '전도' && t !== '부흥' && t !== '선교');
            if (!tags.includes('전도, 부흥, 선교')) tags.push('전도, 부흥, 선교');
            if (!tags.includes(targetFolder)) tags.push(targetFolder);

            updateData.topic = '전도, 부흥, 선교';
            updateData.series = targetFolder;
            updateData.subTopic = targetFolder;
            updateData.tags = tags;
        } else if (currentOrganizerCategory === '청교도 신학') {
            if (!tags.includes('청교도 신학')) tags.push('청교도 신학');
            // 기존 13대 신학 태그 정리
            const puritanTopics = ORGANIZER_CATEGORY_CONFIG['청교도 신학'].folders.map(f => f.id);
            tags = tags.filter(t => !puritanTopics.includes(t));
            if (!tags.includes(targetFolder)) tags.push(targetFolder);

            updateData.topic = targetFolder;
            updateData.series = targetFolder;
            updateData.subTopic = targetFolder;
            updateData.tags = tags;
        } else if (currentOrganizerCategory === '강해설교') {
            if (!tags.includes('강해설교')) tags.push('강해설교');
            updateData.topic = '강해설교';
            updateData.series = targetFolder;
            updateData.tags = tags;
        } else if (currentOrganizerCategory === '세미나, 강의') {
            if (!tags.includes('세미나, 강의')) tags.push('세미나, 강의');
            updateData.topic = '세미나, 강의';
            updateData.series = targetFolder;
            updateData.tags = tags;
        } else if (currentOrganizerCategory === '카테고리_대이동') {
            const allCats = ['청교도 신학', '전도, 부흥, 선교', '강해설교', '세미나, 강의', '전도만화', '신학강론'];
            tags = tags.filter(t => !allCats.includes(t) && t !== '전도, 선교');
            tags.push(targetFolder);

            updateData.topic = targetFolder;
            updateData.tags = tags;
        }

        // 로컬 데이터 즉시 갱신
        Object.assign(post, updateData);
        renderOrganizerFolderDropzones();
        renderOrganizerPostsList();

        // Firestore DB 업데이트
        await db.collection('posts').doc(postId).update(updateData);

        showOrganizerToast(`'${post.title || '자료'}'이(가) [${targetFolder}] 폴더로 이동되었습니다!`);
        if (window.loadAdminPosts) window.loadAdminPosts();

    } catch (e) {
        console.error("movePostToFolder error:", e);
        alert(`폴더 이동 중 오류가 발생했습니다: ${e.message}`);
        loadFolderOrganizerPosts();
    }
}

// 다중 선택(체크박스) 토글
function togglePostSelection(postId, isChecked) {
    if (isChecked) {
        selectedPostIds.add(postId);
    } else {
        selectedPostIds.delete(postId);
    }
    updateSelectedCountUI();
    const card = document.getElementById(`organizer-card-${postId}`);
    if (card) {
        if (isChecked) {
            card.classList.add('selected-card');
            card.style.background = '#f0fff4';
            card.style.borderColor = '#38a169';
        } else {
            card.classList.remove('selected-card');
            card.style.background = '#ffffff';
            card.style.borderColor = '#e2e8f0';
        }
    }
}

// 전체 선택 / 해제
function toggleSelectAllPosts(isChecked) {
    const searchKeyword = (document.getElementById('organizer-search-input')?.value || '').trim().toLowerCase();
    const visiblePosts = allOrganizerPosts.filter(p => {
        const folder = getPostFolderInCurrentCategory(p);
        if (currentOrganizerFolder !== 'all' && folder !== currentOrganizerFolder) return false;
        if (searchKeyword) {
            const title = (p.title || '').toLowerCase();
            return title.includes(searchKeyword);
        }
        return true;
    });

    if (isChecked) {
        visiblePosts.forEach(p => selectedPostIds.add(p.id));
    } else {
        selectedPostIds.clear();
    }

    renderOrganizerPostsList();
}

// 선택된 개수 및 일괄 이동 UI 표시 업데이트
function updateSelectedCountUI() {
    const badge = document.getElementById('organizer-selected-count-badge');
    const bulkBar = document.getElementById('organizer-bulk-action-bar');
    if (badge) badge.textContent = `${selectedPostIds.size}개 선택됨`;
    if (bulkBar) {
        bulkBar.style.display = selectedPostIds.size > 0 ? 'flex' : 'none';
    }
}

// 선택한 여러 자료 일괄 이동 실행
async function executeBulkMove() {
    const targetSelect = document.getElementById('organizer-bulk-target-select');
    const targetFolder = targetSelect ? targetSelect.value : '';

    if (selectedPostIds.size === 0) {
        alert("이동할 자료를 먼저 선택해주세요.");
        return;
    }
    if (!targetFolder) {
        alert("이동할 목적지 폴더를 선택해주세요.");
        return;
    }

    if (!confirm(`선택한 ${selectedPostIds.size}개의 자료를 [${targetFolder}] 폴더로 일괄 이동하시겠습니까?`)) {
        return;
    }

    try {
        const batch = db.batch();
        let count = 0;

        for (let postId of selectedPostIds) {
            const post = allOrganizerPosts.find(p => p.id === postId);
            if (!post) continue;

            let tags = Array.isArray(post.tags) ? [...post.tags] : [];
            let updateData = {
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            };

            if (currentOrganizerCategory === '전도, 부흥, 선교') {
                tags = tags.filter(t => t !== '전도, 선교' && t !== '전도' && t !== '부흥' && t !== '선교');
                if (!tags.includes('전도, 부흥, 선교')) tags.push('전도, 부흥, 선교');
                if (!tags.includes(targetFolder)) tags.push(targetFolder);
                updateData.topic = '전도, 부흥, 선교';
                updateData.series = targetFolder;
                updateData.subTopic = targetFolder;
                updateData.tags = tags;
            } else if (currentOrganizerCategory === '청교도 신학') {
                if (!tags.includes('청교도 신학')) tags.push('청교도 신학');
                const puritanTopics = ORGANIZER_CATEGORY_CONFIG['청교도 신학'].folders.map(f => f.id);
                tags = tags.filter(t => !puritanTopics.includes(t));
                if (!tags.includes(targetFolder)) tags.push(targetFolder);
                updateData.topic = targetFolder;
                updateData.series = targetFolder;
                updateData.subTopic = targetFolder;
                updateData.tags = tags;
            } else if (currentOrganizerCategory === '강해설교' || currentOrganizerCategory === '세미나, 강의') {
                updateData.series = targetFolder;
            } else if (currentOrganizerCategory === '카테고리_대이동') {
                const allCats = ['청교도 신학', '전도, 부흥, 선교', '강해설교', '세미나, 강의', '전도만화', '신학강론'];
                tags = tags.filter(t => !allCats.includes(t) && t !== '전도, 선교');
                tags.push(targetFolder);
                updateData.topic = targetFolder;
                updateData.tags = tags;
            }

            const docRef = db.collection('posts').doc(postId);
            batch.update(docRef, updateData);
            count++;
        }

        await batch.commit();
        alert(`성공: 총 ${count}개의 자료가 [${targetFolder}] 폴더로 안전하게 이동되었습니다!`);
        selectedPostIds.clear();
        loadFolderOrganizerPosts();

    } catch (e) {
        console.error("Bulk move error:", e);
        alert(`일괄 이동 실패: ${e.message}`);
    }
}

// 일괄 이동 셀렉트박스 옵션 갱신
function updateBulkMoveSelectOptions() {
    const select = document.getElementById('organizer-bulk-target-select');
    if (!select) return;

    const config = ORGANIZER_CATEGORY_CONFIG[currentOrganizerCategory];
    const folders = config ? config.folders : [];

    select.innerHTML = '<option value="">-- 이동할 목적지 폴더 선택 --</option>' +
        folders.map(f => `<option value="${f.id}">${f.name}</option>`).join('');
}

// 상단 폴더 클릭 시 필터링
function filterOrganizerByFolder(folderId) {
    currentOrganizerFolder = folderId;
    renderOrganizerFolderDropzones();
    renderOrganizerPostsList();

    const label = document.getElementById('organizer-current-filter-label');
    if (label) {
        label.innerHTML = `현재 표시: <span style="color: #2b6cb0; font-weight:700;">${folderId === 'all' ? '전체 자료' : folderId + ' 폴더'}</span>`;
    }
}

// 검색어 입력 시 필터링
function filterOrganizerPostsList() {
    renderOrganizerPostsList();
}

// 새 폴더(시리즈) 생성 함수 (강해설교/세미나 등)
function promptCreateNewFolder() {
    const newFolderName = prompt(`'${currentOrganizerCategory}'에 새로 추가할 폴더(시리즈) 이름을 입력하세요:\n(예: 로마서 강해, 요한복음 강해 등)`);
    if (!newFolderName || !newFolderName.trim()) return;

    const trimmed = newFolderName.trim();
    const config = ORGANIZER_CATEGORY_CONFIG[currentOrganizerCategory];
    if (config) {
        if (!config.folders.some(f => f.id === trimmed)) {
            config.folders.push({
                id: trimmed,
                name: trimmed,
                icon: 'fa-folder-plus',
                color: '#2b6cb0',
                desc: '새로 추가된 폴더'
            });
            renderOrganizerFolderDropzones();
            updateBulkMoveSelectOptions();
            showOrganizerToast(`'${trimmed}' 폴더가 생성되었습니다. 이제 자료를 드래그해서 넣어보세요!`);
        }
    }
}

// 알림 토스트 표시
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
            padding: 14px 24px;
            border-radius: 10px;
            font-size: 0.95rem;
            font-weight: 600;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            z-index: 99999;
            display: flex;
            align-items: center;
            gap: 12px;
            opacity: 0;
            transform: translateY(20px);
            transition: all 0.3s cubic-bezier(0.165, 0.84, 0.44, 1);
        `;
        document.body.appendChild(toast);
    }

    toast.innerHTML = `<i class="fas fa-check-circle" style="color: #48bb78; font-size: 1.2rem;"></i> ${msg}`;
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';

    clearTimeout(window._organizerToastTimeout);
    window._organizerToastTimeout = setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
    }, 2800);
}
