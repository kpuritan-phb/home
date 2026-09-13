// --- Core Logic Inlined (Emergency Fix) ---
window.isDataLoaded = false;

// Simplified Page Router (No Modal)
window.openResourceModal = (category, series, docId) => {
    if (docId) {
        window.location.href = `viewer.html?id=${encodeURIComponent(docId)}`;
        return;
    }
    let targetUrl = 'resources.html';
    const params = new URLSearchParams();
    if (category) params.set('cat', category);
    if (series) params.set('series', series);
    const queryString = params.toString();
    if (queryString) targetUrl += `?${queryString}`;
    window.location.href = targetUrl;
};

window.createCarouselCard = (post, docId) => {
    const date = post.createdAt ? post.createdAt.toDate().toLocaleDateString() : '최근';
    const displayCategory = post.tags ? post.tags[0] : '자료';
    const thumbUrl = post.coverUrl || '';

    const div = document.createElement('div');
    div.className = 'carousel-card' + (thumbUrl ? ' has-thumb' : '');

    if (thumbUrl) {
        div.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.7)), url("${thumbUrl}")`;
        div.style.backgroundSize = 'cover';
        div.style.backgroundPosition = 'center';
        div.style.color = 'white';
    }

    div.innerHTML = `
                <div class="carousel-card-content">
                    <div class="carousel-card-tag" style="${thumbUrl ? 'background: var(--secondary-color); color: white;' : ''}">${displayCategory}</div>
                    <div class="carousel-card-title">${post.title}</div>
                    <div class="carousel-card-meta">
                        <span style="${thumbUrl ? 'color: rgba(255,255,255,0.8);' : ''}">${date}</span>
                        <div class="carousel-icon-btn" style="${thumbUrl ? 'background: white; color: var(--primary-color);' : ''}"><i class="fas fa-arrow-right"></i></div>
                    </div>
                </div>
            `;
    div.addEventListener('click', () => {
        if (window.openResourceModal) {
            window.openResourceModal(displayCategory, post.series || '', docId);
        } else {
            alert("상세 보기 기능 준비 중...");
        }
    });
    return div;
};

window.loadMainCarousels = async () => {
    if (!window.db) {
        return;
    }

    try {
        // 최신순으로 100개를 가져온 뒤, 메모리에서 recent_order 순으로 정렬합니다.
        const snapshot = await window.db.collection("posts").orderBy("createdAt", "desc").limit(100).get();
        if (snapshot.empty) return;

        window.isDataLoaded = true;
        const allPosts = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            allPosts.push({ id: doc.id, data: data });
        });

        // recent_order가 있는 경우 해당 순서로, 없는 경우 뒤로 보냅니다.
        allPosts.sort((a, b) => {
            const orderA = a.data.recent_order !== undefined ? a.data.recent_order : 999999;
            const orderB = b.data.recent_order !== undefined ? b.data.recent_order : 999999;
            if (orderA !== orderB) return orderA - orderB;
            // 순서가 같으면 최신순
            return (b.data.createdAt?.seconds || 0) - (a.data.createdAt?.seconds || 0);
        });

        // 1. New Arrivals (무조건 최근 12개)
        const newTrack = document.getElementById('carousel-new');
        const latestIds = new Set();
        if (newTrack) {
            newTrack.innerHTML = '';
            allPosts.slice(0, 12).forEach(item => {
                latestIds.add(item.id);
                newTrack.appendChild(window.createCarouselCard(item.data, item.id));
            });
        }

        // 2. Featured Topics (강해가 아닌 것들 우선, 청교도 관련 주제 위주)
        const topicTrack = document.getElementById('carousel-topic');
        if (topicTrack) {
            topicTrack.innerHTML = '';
            const topicItems = allPosts.filter(item => {
                const tags = item.data.tags || [];
                return !tags.includes('강해') && !tags.includes('강해설교') && !tags.includes('설교') && !latestIds.has(item.id);
            });

            let displayTopics = topicItems.length >= 6 ? topicItems : allPosts.filter(item => {
                const tags = item.data.tags || [];
                return !tags.includes('강해') && !tags.includes('강해설교') && !latestIds.has(item.id);
            });
            displayTopics = [...displayTopics].sort(() => 0.5 - Math.random());

            displayTopics.slice(0, 12).forEach(item => {
                topicTrack.appendChild(window.createCarouselCard(item.data, item.id));
            });
        }

        // 3. Expository Sermons (강해 태그가 있는 것들)
        const sermonTrack = document.getElementById('carousel-sermon');
        if (sermonTrack) {
            sermonTrack.innerHTML = '';
            const sermonItems = allPosts.filter(item => {
                const tags = item.data.tags || [];
                return tags.includes('강해') || tags.includes('강해설교') || tags.includes('설교');
            });

            const displaySermons = sermonItems.length >= 4 ? sermonItems : allPosts;

            displaySermons.slice(0, 12).forEach(item => {
                sermonTrack.appendChild(window.createCarouselCard(item.data, item.id));
            });
        }

    } catch (e) {
        console.error("Load Carousels Error:", e);
    }
};

// Auto-run if DB connected
if (window.db) {
    setTimeout(window.loadMainCarousels, 100);
}
