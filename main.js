import works from './works.js';

document.addEventListener('DOMContentLoaded', () => {

    // --- Active Page Highlighting ---
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-item');
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href !== '/' && currentPath.includes(href.replace('.html', ''))) {
            link.closest('.nav-item-container').classList.add('active-page');
        } else if (href === '/' && (currentPath === '/' || currentPath.endsWith('index.html'))) {
            // Home is handled by default often, but can be explicit
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

    // --- Sticky Scroll Logic (Only for index.html) ---
    const scrollItems = document.querySelectorAll('.scroll-item');
    const dynamicVisual = document.getElementById('dynamic-visual');
    const dynamicVideo = document.getElementById('dynamic-video');

    if (scrollItems.length > 0 && dynamicVisual) {
        const stickyObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    scrollItems.forEach(item => item.classList.remove('active'));
                    entry.target.classList.add('active');

                    const newImgSrc = entry.target.dataset.img;
                    const newVideoSrc = entry.target.dataset.video;

                    if (newVideoSrc && dynamicVideo) {
                        dynamicVisual.style.opacity = 0;
                        dynamicVideo.style.display = 'block';
                        dynamicVideo.style.opacity = 1;
                        if (dynamicVideo.src !== newVideoSrc) {
                            dynamicVideo.src = newVideoSrc;
                            dynamicVideo.play().catch(e => console.log('Autoplay blocked', e));
                        }
                    } else if (newImgSrc) {
                        if (dynamicVideo) {
                            dynamicVideo.style.opacity = 0;
                            setTimeout(() => { dynamicVideo.style.display = 'none'; }, 500);
                        }
                        const tempImg = new Image();
                        tempImg.src = newImgSrc;
                        tempImg.onload = () => {
                            dynamicVisual.style.opacity = 0;
                            setTimeout(() => {
                                dynamicVisual.src = newImgSrc;
                                dynamicVisual.style.opacity = 1;
                            }, 300);
                        };
                    }
                }
            });
        }, { root: null, rootMargin: '-40% 0px -40% 0px', threshold: 0 });

        scrollItems.forEach(item => stickyObserver.observe(item));
    }

    // --- Works Page: Orientation Tab + Infinite Scroll ---
    const worksGrid = document.getElementById('works-grid'); // 구 구조 체크 (없어질 예정)
    const landscapeGrid = document.getElementById('landscape-grid');
    const portraitGrid = document.getElementById('portrait-grid');

    if (landscapeGrid || portraitGrid) {
        const modal = document.getElementById('video-modal');
        const modalIframe = document.getElementById('modal-iframe');
        const modalTitle = document.getElementById('modal-title');
        const modalClient = document.getElementById('modal-client');
        const modalDesc = document.getElementById('modal-desc');
        const closeModal = document.querySelector('.close-modal');
        const tabBtns = document.querySelectorAll('.works-tab-btn');

        const PAGE_SIZE = 4; // 한 번에 로드할 개수

        // orientation별 상태 관리
        const state = {
            landscape: { page: 0, loading: false, done: false },
            portrait: { page: 0, loading: false, done: false },
        };

        // orientation별 데이터 필터
        const dataMap = {
            landscape: works.filter(w => w.orientation === 'landscape'),
            portrait: works.filter(w => w.orientation === 'portrait'),
        };

        // 현재 활성 탭 (URL 쿼리 우선)
        const urlParams = new URLSearchParams(window.location.search);
        let activeView = urlParams.get('view') === 'portrait' ? 'portrait' : 'landscape';

        // 카드 DOM 생성
        function createWorkCard(work) {
            const el = document.createElement('div');
            el.className = 'work-item reveal-text';
            el.innerHTML = `
                <img src="${work.thumbnail}" alt="${work.title}" loading="lazy">
                <div class="work-overlay">
                    <h3 class="work-title-inner">${work.title}</h3>
                    <p class="work-client-inner">${work.client}</p>
                </div>
            `;
            el.addEventListener('click', () => {
                if (modal) {
                    modalTitle.textContent = work.title;
                    modalClient.textContent = work.client;
                    modalDesc.textContent = work.description;
                    modalIframe.src = work.videoUrl;
                    modal.style.display = 'flex';
                    document.body.style.overflow = 'hidden';
                }
            });
            return el;
        }

        // 특정 orientation 페이지 로드
        function loadPage(orientation) {
            const s = state[orientation];
            if (s.loading || s.done) return;

            s.loading = true;
            const loadingEl = document.getElementById(`${orientation}-loading`);
            const endEl = document.getElementById(`${orientation}-end`);
            const grid = document.getElementById(`${orientation}-grid`);

            if (loadingEl) loadingEl.style.display = 'flex';

            const data = dataMap[orientation];
            const start = s.page * PAGE_SIZE;
            const slice = data.slice(start, start + PAGE_SIZE);

            // 약간의 딜레이로 로딩 느낌 자연스럽게
            setTimeout(() => {
                slice.forEach(work => {
                    const card = createWorkCard(work);
                    grid.appendChild(card);
                    // reveal animation
                    sectionObserver.observe(card);
                });

                s.page += 1;
                s.loading = false;

                if (loadingEl) loadingEl.style.display = 'none';

                const nextStart = s.page * PAGE_SIZE;
                if (nextStart >= data.length) {
                    s.done = true;
                    if (endEl) endEl.style.display = 'block';
                    // sentinel 감시 해제
                    const sentinel = document.getElementById(`${orientation}-sentinel`);
                    if (sentinel) infiniteObserver.unobserve(sentinel);
                }
            }, 400);
        }

        // IntersectionObserver: sentinel 감지 → 다음 페이지
        const infiniteObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const orientation = entry.target.id.replace('-sentinel', '');
                    loadPage(orientation);
                }
            });
        }, { rootMargin: '200px' });

        // 탭 전환 UI
        function switchTab(view) {
            activeView = view;

            // URL 동기화
            const url = new URL(window.location);
            url.searchParams.set('view', view);
            window.history.replaceState({}, '', url);

            // 탭 버튼 active 상태
            tabBtns.forEach(btn => {
                btn.classList.toggle('active', btn.dataset.view === view);
            });

            // 패널 visible 처리
            const panels = ['landscape', 'portrait'];
            panels.forEach(p => {
                const panel = document.getElementById(`panel-${p}`);
                if (panel) panel.style.display = p === view ? 'block' : 'none';
            });
        }

        // 탭 버튼 이벤트
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const view = btn.dataset.view;
                switchTab(view);
                // 해당 탭이 아직 한 번도 로드 안 됐으면 첫 페이지 로드
                if (state[view].page === 0) {
                    loadPage(view);
                }
            });
        });

        // 모달 닫기
        if (closeModal) {
            closeModal.addEventListener('click', () => {
                modal.style.display = 'none';
                modalIframe.src = '';
                document.body.style.overflow = 'auto';
            });
        }
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
                modalIframe.src = '';
                document.body.style.overflow = 'auto';
            }
        });

        // 초기화: URL 상태 기반 탭 적용 + 첫 페이지 로드
        switchTab(activeView);
        // 두 sentinel 모두 등록 (탭 전환 때 바로 로딩 가능하게)
        ['landscape', 'portrait'].forEach(o => {
            const sentinel = document.getElementById(`${o}-sentinel`);
            if (sentinel) infiniteObserver.observe(sentinel);
        });
        // 초기 활성 탭 첫 페이지 로드
        loadPage(activeView);
    }

    // --- FAQ Logic (Only for workflow.html) ---
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        item.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            faqItems.forEach(i => i.classList.remove('active'));
            if (!isActive) item.classList.add('active');
        });
    });

    // --- Navigation Logic for Mobile ---
    const navContainers = document.querySelectorAll('.nav-item-container');
    navContainers.forEach(container => {
        const link = container.querySelector('.nav-item');
        if (!link) return;

        link.addEventListener('click', (e) => {
            if (window.innerWidth <= 768) {
                if (!container.classList.contains('active')) {
                    e.preventDefault();
                    navContainers.forEach(c => c.classList.remove('active'));
                    container.classList.add('active');
                }
            }
        });
    });

    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
            if (!e.target.closest('.brand-nav')) {
                navContainers.forEach(c => c.classList.remove('active'));
            }
        }
    });

});
