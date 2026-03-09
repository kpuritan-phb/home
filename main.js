import works from './works.js';

document.addEventListener('DOMContentLoaded', () => {

    // --- Active Page Highlighting ---
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-item');
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href !== '/' && currentPath.includes(href.replace('.html', ''))) {
            link.closest('.nav-item-container').classList.add('active-page');
        }
    });

    // --- Loading Animation ---
    gsap.from("header", {
        y: -50,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        delay: 0.5
    });

    // --- Scroll Animations (Reveal Text) ---
    const revealElements = document.querySelectorAll('.reveal-text');
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const sectionObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                gsap.to(entry.target, {
                    y: 0,
                    opacity: 1,
                    duration: 1,
                    ease: "power2.out"
                });
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    revealElements.forEach(el => {
        sectionObserver.observe(el);
    });

    // --- Index Page: Hero & Global Background ---
    const globalBg = document.querySelector('.global-bg-layer');
    if (globalBg) {
        setTimeout(() => globalBg.classList.add('active'), 100);
    }

    // --- Index Page: Menu Summaries Hover Background ---
    const summaryItems = document.querySelectorAll('.summary-item');
    if (summaryItems.length > 0) {
        let summaryBg = document.querySelector('.summary-bg-layer');
        if (!summaryBg && document.querySelector('.menu-summaries')) {
            summaryBg = document.createElement('div');
            summaryBg.className = 'summary-bg-layer';
            summaryBg.innerHTML = '<img src="" alt="Summary Background">';
            document.querySelector('.menu-summaries').appendChild(summaryBg);
        }
        if (summaryBg) {
            const bgImg = summaryBg.querySelector('img');
            summaryItems.forEach(item => {
                item.addEventListener('mouseenter', () => {
                    const bgUrl = item.dataset.bg;
                    if (bgUrl) {
                        bgImg.src = bgUrl;
                        summaryBg.style.opacity = '1';
                    }
                });
                item.addEventListener('mouseleave', () => {
                    summaryBg.style.opacity = '0';
                });
            });
        }
    }

    // --- Shared Modal Logic ---
    const modal = document.getElementById('video-modal');
    const modalIframe = document.getElementById('modal-iframe');
    const modalTitle = document.getElementById('modal-title');
    const modalClient = document.getElementById('modal-client');
    const modalDesc = document.getElementById('modal-desc');
    const closeModal = document.querySelector('.close-modal');

    function openModal(work) {
        if (!modal) return;
        modalTitle.textContent = work.title;
        modalClient.textContent = work.client;
        modalDesc.textContent = work.description;

        let url = work.videoUrl;
        if (url && (url.includes('youtube.com') || url.includes('youtu.be'))) {
            url += (url.includes('?') ? '&' : '?') + 'autoplay=1&rel=0';
        }
        modalIframe.src = url;

        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';

        if (window.history && window.history.pushState) {
            window.history.pushState({ modalOpen: true }, '', window.location.href);
        }
    }

    function closeVideoModal() {
        if (!modal) return;
        modal.style.display = 'none';
        modalIframe.src = '';
        document.body.style.overflow = 'auto';
    }

    if (closeModal) {
        closeModal.addEventListener('click', () => {
            if (window.history.state && window.history.state.modalOpen) {
                window.history.back();
            } else {
                closeVideoModal();
            }
        });
    }

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            if (window.history.state && window.history.state.modalOpen) {
                window.history.back();
            } else {
                closeVideoModal();
            }
        }
    });

    window.addEventListener('popstate', (e) => {
        if (modal && modal.style.display === 'flex') {
            closeVideoModal();
        }
    });

    // --- Featured Works Modal Binding ---
    const featuredItems = document.querySelectorAll('.featured-item');
    featuredItems.forEach(item => {
        item.addEventListener('click', () => {
            const id = parseInt(item.dataset.id);
            const work = works.find(w => w.id === id);
            if (work) openModal(work);
        });
    });

    // --- Works Page Logic ---
    const landscapeGrid = document.getElementById('landscape-grid');
    const portraitGrid = document.getElementById('portrait-grid');

    if (landscapeGrid || portraitGrid) {
        const tabBtns = document.querySelectorAll('.works-tab-btn');
        const PAGE_SIZE = 12;

        const state = {
            landscape: { page: 0, loading: false, done: false },
            portrait: { page: 0, loading: false, done: false },
        };

        const dataMap = {
            landscape: works.filter(w => w.orientation === 'landscape'),
            portrait: works.filter(w => w.orientation === 'portrait'),
        };

        const urlParams = new URLSearchParams(window.location.search);
        let activeView = urlParams.get('view') === 'portrait' ? 'portrait' : 'landscape';

        function deduceThumbnail(work) {
            if (work.thumbnail && work.thumbnail.startsWith('thumbnails/')) return work.thumbnail;
            const url = work.videoUrl || '';
            if (url.includes('youtube.com') || url.includes('youtu.be')) {
                let videoId = '';
                if (url.includes('embed/')) videoId = url.split('embed/')[1].split('?')[0];
                else if (url.includes('v=')) videoId = url.split('v=')[1].split('&')[0];
                else videoId = url.split('/').pop().split('?')[0];
                if (videoId) return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
            }
            if (url.includes('instagram.com') || url.includes('threads.net')) {
                let postId = '';
                if (url.includes('/reel/')) postId = url.split('/reel/')[1].split('/')[0];
                else if (url.includes('/reels/')) postId = url.split('/reels/')[1].split('/')[0];
                else if (url.includes('/p/')) postId = url.split('/p/')[1].split('/')[0];
                else if (url.includes('/post/')) postId = url.split('/post/')[1].split('/')[0];
                if (postId) return `https://www.instagram.com/p/${postId}/media/?size=l`;
            }
            return work.thumbnail || 'https://images.unsplash.com/photo-1492691523567-61125645e34b?auto=format&fit=crop&q=80&w=800';
        }

        function showFallbackPlaceholder(imgEl, work) {
            const parent = imgEl.parentElement;
            if (parent.querySelector('.thumb-fallback')) {
                imgEl.remove();
                return;
            }
            imgEl.remove();
            const fallback = document.createElement('div');
            fallback.className = 'thumb-fallback';
            const gradients = [
                'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
                'linear-gradient(135deg, #2d1b3d 0%, #1e1233 50%, #0d0d2b 100%)',
                'linear-gradient(135deg, #1b2838 0%, #0d1b2a 50%, #1c3144 100%)',
                'linear-gradient(135deg, #2c1810 0%, #1a1a2e 50%, #16213e 100%)',
                'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)',
                'linear-gradient(135deg, #0d1117 0%, #161b22 50%, #21262d 100%)',
            ];
            fallback.style.background = gradients[work.id % gradients.length];
            fallback.innerHTML = `<div class="fallback-title">${work.title !== 'Shorts' && work.title !== 'Vertical video content.' ? work.title : (work.client || 'Video')}</div>`;
            parent.appendChild(fallback);
        }

        function createWorkCard(work) {
            const el = document.createElement('div');
            el.className = 'work-item reveal-text';
            const thumbUrl = deduceThumbnail(work);
            const img = document.createElement('img');
            img.src = thumbUrl;
            img.alt = work.title;
            img.loading = 'lazy';
            img.onerror = function () {
                if (thumbUrl.includes('maxresdefault.jpg')) {
                    const hqUrl = thumbUrl.replace('maxresdefault.jpg', 'hqdefault.jpg');
                    this.onerror = function () { showFallbackPlaceholder(this, work); };
                    this.src = hqUrl;
                } else {
                    showFallbackPlaceholder(this, work);
                }
            };
            el.appendChild(img);
            el.addEventListener('click', () => openModal(work));
            return el;
        }

        function loadPage(orientation) {
            const s = state[orientation];
            if (s.loading || s.done) return;
            s.loading = true;
            const grid = document.getElementById(`${orientation}-grid`);
            const data = dataMap[orientation];
            const slice = data.slice(s.page * PAGE_SIZE, (s.page + 1) * PAGE_SIZE);
            slice.forEach(work => {
                const card = createWorkCard(work);
                grid.appendChild(card);
                sectionObserver.observe(card);
            });
            s.page += 1;
            s.loading = false;
            if (s.page * PAGE_SIZE >= data.length) {
                s.done = true;
                const endEl = document.getElementById(`${orientation}-end`);
                if (endEl) endEl.style.display = 'block';
            }
        }

        const infiniteObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const orientation = entry.target.id.replace('-sentinel', '');
                    loadPage(orientation);
                }
            });
        }, { rootMargin: '200px' });

        function switchTab(view) {
            activeView = view;
            const url = new URL(window.location);
            url.searchParams.set('view', view);
            window.history.replaceState({}, '', url);
            tabBtns.forEach(btn => btn.classList.toggle('active', btn.dataset.view === view));
            ['landscape', 'portrait'].forEach(p => {
                const panel = document.getElementById(`panel-${p}`);
                if (panel) panel.style.display = p === view ? 'block' : 'none';
            });
        }

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const view = btn.dataset.view;
                switchTab(view);
                if (state[view].page === 0) loadPage(view);
            });
        });

        switchTab(activeView);
        ['landscape', 'portrait'].forEach(o => {
            const sentinel = document.getElementById(`${o}-sentinel`);
            if (sentinel) infiniteObserver.observe(sentinel);
        });
        loadPage(activeView);
    }

    // --- Footer & Nav logic ---
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        item.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            faqItems.forEach(i => i.classList.remove('active'));
            if (!isActive) item.classList.add('active');
        });
    });

    const navContainers = document.querySelectorAll('.nav-item-container');
    navContainers.forEach(container => {
        const link = container.querySelector('.nav-item');
        if (!link) return;
        link.addEventListener('click', (e) => {
            if (window.innerWidth <= 768 && !container.classList.contains('active')) {
                e.preventDefault();
                navContainers.forEach(c => c.classList.remove('active'));
                container.classList.add('active');
            }
        });
    });

    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 && !e.target.closest('.brand-nav')) {
            navContainers.forEach(c => c.classList.remove('active'));
        }
    });

});
