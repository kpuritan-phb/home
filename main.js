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

        const PAGE_SIZE = 12; // 한 번에 로드할 개수 증가 (딜레이 단축)

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

        // 썸네일 URL을 지능적으로 결정하는 헬퍼 함수 (플레이 버튼 제거 최적화)
        function deduceThumbnail(work) {
            // 0. 로컬 썸네일이 있으면 최우선 사용
            if (work.thumbnail && work.thumbnail.startsWith('thumbnails/')) {
                return work.thumbnail;
            }
            const url = work.videoUrl || '';

            // 1. 유튜브 썸네일 (maxresdefault 사용으로 버튼 제거)
            if (url.includes('youtube.com') || url.includes('youtu.be')) {
                let videoId = '';
                if (url.includes('embed/')) {
                    videoId = url.split('embed/')[1].split('?')[0];
                } else if (url.includes('v=')) {
                    videoId = url.split('v=')[1].split('&')[0];
                } else {
                    videoId = url.split('/').pop().split('?')[0];
                }
                if (videoId) return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
            }

            // 2. 인스타그램 & 쓰레드 (공식 media API로 버튼 없는 이미지 추출)
            if (url.includes('instagram.com') || url.includes('threads.net')) {
                let postId = '';
                if (url.includes('/reel/')) postId = url.split('/reel/')[1].split('/')[0];
                else if (url.includes('/reels/')) postId = url.split('/reels/')[1].split('/')[0];
                else if (url.includes('/p/')) postId = url.split('/p/')[1].split('/')[0];
                else if (url.includes('/post/')) postId = url.split('/post/')[1].split('/')[0];

                if (postId) {
                    // /media/?size=l 주소는 플레이 버튼이 없는 원본 이미지를 반환함
                    return `https://www.instagram.com/p/${postId}/media/?size=l`;
                }
            }

            // 3. 이미 정의된 수동 썸네일 (로컬 포함) 처리
            if (work.thumbnail && (work.thumbnail.includes('images/') || !work.thumbnail.includes('unsplash'))) {
                return work.thumbnail;
            }

            // 4. 기본 이미지
            return work.thumbnail || 'https://images.unsplash.com/photo-1492691523567-61125645e34b?auto=format&fit=crop&q=80&w=800';
        }

        // 폴백 플레이스홀더 생성 (썸네일 로드 실패 시)
        function showFallbackPlaceholder(imgEl, work) {
            const parent = imgEl.parentElement;

            // 이미 폴백이 있으면 중복 생성 방지
            if (parent.querySelector('.thumb-fallback')) {
                imgEl.remove();
                return;
            }

            imgEl.remove();

            const fallback = document.createElement('div');
            fallback.className = 'thumb-fallback';

            // 랜덤 그라데이션 색상 (세련된 다크톤)
            const gradients = [
                'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
                'linear-gradient(135deg, #2d1b3d 0%, #1e1233 50%, #0d0d2b 100%)',
                'linear-gradient(135deg, #1b2838 0%, #0d1b2a 50%, #1c3144 100%)',
                'linear-gradient(135deg, #2c1810 0%, #1a1a2e 50%, #16213e 100%)',
                'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 50%, #1a1a1a 100%)',
                'linear-gradient(135deg, #0d1117 0%, #161b22 50%, #21262d 100%)',
            ];
            const gradient = gradients[work.id % gradients.length];
            fallback.style.background = gradient;

            fallback.innerHTML = `
                <div class="fallback-title">${work.title !== 'Shorts' && work.title !== 'Vertical video content.' ? work.title : (work.client || 'Video')}</div>
            `;
            parent.appendChild(fallback);
        }

        // 카드 DOM 생성
        function createWorkCard(work) {
            const el = document.createElement('div');
            el.className = 'work-item reveal-text';

            const thumbUrl = deduceThumbnail(work);

            const img = document.createElement('img');
            img.src = thumbUrl;
            img.alt = work.title;
            img.loading = 'lazy';

            // 다단계 폴백 처리
            img.onerror = function () {
                if (thumbUrl.includes('maxresdefault.jpg')) {
                    // 1차 폴백: hqdefault 시도
                    const hqUrl = thumbUrl.replace('maxresdefault.jpg', 'hqdefault.jpg');
                    this.onerror = function () {
                        // 2차 폴백: 플레이스홀더 카드
                        showFallbackPlaceholder(this, work);
                    };
                    this.src = hqUrl;
                } else {
                    // 바로 폴백 플레이스홀더
                    showFallbackPlaceholder(this, work);
                }
            };

            el.appendChild(img);

            el.addEventListener('click', () => {
                if (modal) {
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

            // 딜레이 없이 즉시 로드
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
        function closeVideoModal() {
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
            if (modal.style.display === 'flex') {
                closeVideoModal();
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
