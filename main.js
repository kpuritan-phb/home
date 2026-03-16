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
    if (typeof gsap !== 'undefined') {
        gsap.from("header", {
            y: -50,
            opacity: 0,
            duration: 1,
            ease: "power3.out",
            delay: 0.5
        });
    }

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
                if (typeof gsap !== 'undefined') {
                    gsap.to(entry.target, {
                        y: 0,
                        opacity: 1,
                        duration: 1,
                        ease: "power2.out"
                    });
                }
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    revealElements.forEach(el => {
        sectionObserver.observe(el);
    });

    // --- Index Page: Latest Shorts Logic ---
    const latestShortsEl = document.getElementById('index-latest-shorts');
    if (latestShortsEl) {
        const latestShortsData = works.find(w => w.orientation === 'portrait');
        if (latestShortsData) {
            latestShortsEl.setAttribute('data-id', latestShortsData.id);
            const img = latestShortsEl.querySelector('img');
            if (img) {
                let thumb = latestShortsData.thumbnail;
                if (!thumb || !thumb.startsWith('thumbnails/')) {
                    if (latestShortsData.videoUrl && latestShortsData.videoUrl.includes('youtube')) {
                        const vid = latestShortsData.videoUrl.split('embed/')[1]?.split('?')[0];
                        if (vid) thumb = `https://img.youtube.com/vi/${vid}/maxresdefault.jpg`;
                    }
                }
                if (thumb) img.src = thumb;
            }
        }
    }

    // --- Index Page: Hero & Global Background ---
    const globalBg = document.querySelector('.global-bg-layer');
    if (globalBg) {
        setTimeout(() => globalBg.classList.add('active'), 100);
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
            window.history.pushState({ modalOpen: true }, '');
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

    // --- Navigation Logic for Mobile ---
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

    // --- Chat Widget Logic ---
    const chatWidget = document.getElementById('chat-widget');
    const chatTrigger = document.getElementById('chat-trigger');
    const chatClose = document.getElementById('chat-close');
    const chatForm = document.getElementById('chat-form');
    const chatBody = document.getElementById('chat-body');
    const chatLeadContainer = document.getElementById('chat-lead-container');
    const chatInput = document.getElementById('chat-footer-input');
    const chatSendBtn = document.getElementById('chat-send-btn');

    let isLeadSubmitted = false;

    if (chatTrigger && chatWidget) {
        chatTrigger.addEventListener('click', () => {
            chatWidget.classList.toggle('active');
        });
    }

    if (chatClose && chatWidget) {
        chatClose.addEventListener('click', (e) => {
            e.stopPropagation();
            chatWidget.classList.remove('active');
        });
    }

    const addBubble = (text, type) => {
        if (!chatBody) return;
        const bubble = document.createElement('div');
        bubble.className = `chat-msg-bubble ${type}`;
        bubble.innerHTML = `<p>${text.replace(/\n/g, '<br>')}</p>`;
        chatBody.appendChild(bubble);
        chatBody.scrollTop = chatBody.scrollHeight;
    };

    /**
     * 성공 처리를 위한 공통 함수
     */
    const handleSuccess = (name, message) => {
        if (chatLeadContainer) chatLeadContainer.style.display = 'none';
        isLeadSubmitted = true;

        // 사용자 메시지 표시
        addBubble(message, 'user');

        // 봇의 응답 표시
        setTimeout(() => {
            const successMsg = `${name}님, 문의가 성공적으로 접수되었습니다. 최대한 신속하게 답변 드리겠습니다!\n(※ 제출하신 내용은 안전하게 전송되었습니다.)`;
            addBubble(successMsg, 'bot');
        }, 500);
    };

    if (chatForm) {
        chatForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = chatForm.querySelector('.chat-submit-btn');

            const name = document.getElementById('chat-name').value;
            const email = document.getElementById('chat-email').value;
            const phone = document.getElementById('chat-phone').value;
            const message = document.getElementById('chat-message').value;

            // 1. 로컬 백업 세이브 (실패 시 대비)
            try {
                const inquiries = JSON.parse(localStorage.getItem('wewon_inquiries') || '[]');
                inquiries.push({ name, email, phone, message, timestamp: new Date().toLocaleString() });
                localStorage.setItem('wewon_inquiries', JSON.stringify(inquiries));
            } catch (err) { }

            btn.textContent = '전송 중...';
            btn.disabled = true;

            // 2. EmailJS 전송 실행
            const config = window._EMAILJS_CONFIG;
            const isConfigured = config && config.PUBLIC_KEY !== 'YOUR_PUBLIC_KEY';

            if (isConfigured) {
                try {
                    // EmailJS Template 변수와 매칭되어야 합니다.
                    const templateParams = {
                        from_name: name,
                        from_email: email,
                        phone: phone,
                        message: message
                    };

                    await emailjs.send(config.SERVICE_ID, config.TEMPLATE_ID, templateParams);
                    handleSuccess(name, message);
                } catch (error) {
                    console.error('Email 전송 실패:', error);
                    alert('메일 전송 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
                    btn.textContent = '문의 보내기';
                    btn.disabled = false;
                }
            } else {
                // 테스트 모드 (EmailJS 설정 전)
                console.warn('EmailJS가 설정되지 않았습니다. 테스트 모드로 동작합니다.');
                setTimeout(() => {
                    handleSuccess(name, message);
                }, 1000);
            }
        });
    }

    const handleSendMsg = () => {
        if (!chatInput) return;
        const text = chatInput.value.trim();
        if (!text) return;

        if (!isLeadSubmitted) {
            const msgArea = document.getElementById('chat-message');
            if (msgArea) {
                msgArea.value = (msgArea.value + (msgArea.value ? "\n" : "") + text).trim();
                msgArea.focus();
            }
            chatInput.value = '';
            return;
        }

        addBubble(text, 'user');
        chatInput.value = '';

        setTimeout(() => {
            addBubble('문의가 접수된 상태입니다. 남겨주신 연락처로 곧 안내해 드리겠습니다.', 'bot');
        }, 800);
    };

    if (chatSendBtn && chatInput) {
        chatSendBtn.addEventListener('click', handleSendMsg);
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSendMsg();
        });
    }

});
