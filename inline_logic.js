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

// loadMainCarousels handled by main.js
if (typeof window.loadMainCarousels === 'function') {
    setTimeout(window.loadMainCarousels, 100);
}
