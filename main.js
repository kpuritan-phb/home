import works from './works.js';

document.addEventListener('DOMContentLoaded', () => {

    // --- EmailJS Initialization ---
    if (typeof emailjs !== 'undefined') {
        emailjs.init('BQxwlbcswbEqw2enT');
    }


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

    // --- Navigation to Project Detail ---
    function navigateToProject(id) {
        if (id) {
            window.location.href = `project.html?id=${id}`;
        }
    }

    // --- Featured Works Binding ---
    const featuredItems = document.querySelectorAll('.featured-item');
    featuredItems.forEach(item => {
        item.addEventListener('click', () => {
            const id = item.dataset.id;
            navigateToProject(id);
        });
    });

    // --- Works Page Logic ---
    const landscapeGrid = document.getElementById('landscape-grid');
    const portraitGrid = document.getElementById('portrait-grid');

    if (landscapeGrid || portraitGrid) {
        const tabBtns = document.querySelectorAll('.works-tab-btn');
        const categoryBtns = document.querySelectorAll('.category-btn');
        const PAGE_SIZE = 12;

        const state = {
            landscape: { page: 0, loading: false, done: false },
            portrait: { page: 0, loading: false, done: false },
        };

        const urlParams = new URLSearchParams(window.location.search);
        let activeView = urlParams.get('view') === 'portrait' ? 'portrait' : 'landscape';
        let activeCategory = 'ALL';

        function getFilteredData(orientation, category) {
            let filtered = works.filter(w => w.orientation === orientation);
            if (category !== 'ALL') {
                filtered = filtered.filter(w => {
                    const c = w.category;
                    return Array.isArray(c) ? c.includes(category) : c === category;
                });
            }
            return filtered;
        }

        function deduceThumbnail(work) {
            if (work.thumbnail && (work.thumbnail.startsWith('thumbnails/') || work.thumbnail.startsWith('images/'))) return work.thumbnail;
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
            el.addEventListener('click', () => navigateToProject(work.id));
            return el;
        }

        function loadPage(orientation, reset = false) {
            const s = state[orientation];
            if (reset) {
                s.page = 0;
                s.done = false;
                s.loading = false;
                const grid = document.getElementById(`${orientation}-grid`);
                if (grid) grid.innerHTML = '';
                const endEl = document.getElementById(`${orientation}-end`);
                if (endEl) endEl.style.display = 'none';
            }

            if (s.loading || s.done) return;
            s.loading = true;

            const grid = document.getElementById(`${orientation}-grid`);
            const data = getFilteredData(orientation, activeCategory);
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
                if (activeView === view) return;
                switchTab(view);
                if (state[view].page === 0) loadPage(view);
            });
        });

        categoryBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const category = btn.dataset.category;
                if (activeCategory === category) return;

                activeCategory = category;
                categoryBtns.forEach(b => b.classList.toggle('active', b.dataset.category === category));

                // Clear all grids and state
                ['landscape', 'portrait'].forEach(o => {
                    loadPage(o, true);
                });

                // Load current visible page
                loadPage(activeView);
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
    const chatInput = document.getElementById('chat-footer-input');
    const chatSendBtn = document.getElementById('chat-send-btn');
    const chatFooter = document.getElementById('chat-footer-form'); // [ID 수정] chat-footer -> chat-footer-form
    const chatLeadContainer = document.getElementById('chat-lead-container');

    // localStorage에서 제출 여부 확인
    let isLeadSubmitted = localStorage.getItem('wewon_chat_submitted') === 'true';

    // 이미 제출했다면 폼 숨기고 채팅 모드(Footer 보임)로 시작
    if (isLeadSubmitted && chatLeadContainer && chatFooter) {
        chatLeadContainer.style.display = 'none';
        chatFooter.style.display = 'flex';
        // 초기 안내 메시지 하나 더 추가 (선택사항)
        setTimeout(() => {
            addBubble('문의가 접수된 상태입니다. 추가로 궁금하신 점을 남겨주시면 확인 후 연락드리겠습니다.', 'bot');
        }, 1000);
    }

    if (chatTrigger && chatWidget) {
        chatTrigger.addEventListener('click', () => {
            chatWidget.classList.toggle('active');
            if (chatWidget.classList.contains('active')) {
                // 알림 점 제거
                chatTrigger.style.setProperty('--unread', 'none');

                // 아직 제출 전이라면 자동응답 질문들 보여주기
                if (!isLeadSubmitted && chatBody && chatBody.children.length <= 1) {
                    setTimeout(() => {
                        const quickWrap = document.createElement('div');
                        quickWrap.className = 'chat-quick-wrap';
                        const questions = [
                            '제작 기간이 궁금해요',
                            '견적 상담받고 싶어요',
                            '포트폴리오 더 볼 수 있나요?'
                        ];

                        questions.forEach(q => {
                            const btn = document.createElement('button');
                            btn.className = 'quick-btn';
                            btn.textContent = q;
                            btn.onclick = () => {
                                const msgArea = document.getElementById('chat-message');
                                if (msgArea) {
                                    msgArea.value = q;
                                    msgArea.focus();
                                }
                            };
                            quickWrap.appendChild(btn);
                        });
                        chatBody.appendChild(quickWrap);
                        chatBody.scrollTop = chatBody.scrollHeight;
                    }, 800);
                }
            }
        });
    }

    if (chatClose && chatWidget) {
        chatClose.addEventListener('click', (e) => {
            e.stopPropagation();
            chatWidget.classList.remove('active');
        });
    }

    // Function to add chat bubble
    const addBubble = (text, type) => {
        if (!chatBody) return;
        const bubble = document.createElement('div');
        bubble.className = `chat-msg-bubble ${type}`;
        // Preserve newlines
        bubble.innerHTML = `<p>${text.replace(/\n/g, '<br>')}</p>`;
        chatBody.appendChild(bubble);
        chatBody.scrollTop = chatBody.scrollHeight;
    };

    if (chatForm) {
        chatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = chatForm.querySelector('.chat-submit-btn');

            const name = document.getElementById('chat-name').value;
            const email = document.getElementById('chat-email').value;
            const phone = document.getElementById('chat-phone').value;
            const message = document.getElementById('chat-message').value;

            btn.textContent = '전송 중...';
            btn.disabled = true;

            const params = {
                name: name,      // 템플릿의 {{name}}과 일치
                email: email,    // 템플릿의 {{email}}과 일치
                phone: phone,
                message: message, // 템플릿의 {{message}}와 일치
            };

            emailjs.send('service_kexvgmp', 'template_pkc36ws', params)
                .then(function (response) {
                    console.log('SUCCESS!', response.status, response.text);

                    // UI 상태 전환
                    if (chatLeadContainer) chatLeadContainer.style.display = 'none';
                    if (chatFooter) chatFooter.style.display = 'flex';

                    isLeadSubmitted = true;
                    localStorage.setItem('wewon_chat_submitted', 'true');

                    // 대화 내용 업데이트
                    addBubble(message, 'user');
                    setTimeout(() => {
                        addBubble(`문의 확인했습니다. 24시간 이내에 남겨주신 연락처로 연락드릴게요! 감사합니다 🙏`, 'bot');
                    }, 500);
                })
                .catch(function (error) {
                    console.log('FAILED...', error);
                    if (btn) {
                        btn.textContent = '제출';
                        btn.disabled = false;
                    }
                    alert('전송 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
                });
        });
    }

    // Footer input handling
    const handleSendMsg = () => {
        if (!chatInput) return;
        const text = chatInput.value.trim();
        if (!text) return;

        if (!isLeadSubmitted) {
            // 폼 입력 전이면 폼의 메세지 칸으로 유도
            const msgArea = document.getElementById('chat-message');
            if (msgArea) {
                msgArea.value = (msgArea.value + (msgArea.value ? "\n" : "") + text).trim();
                msgArea.focus();
            }
            chatInput.value = '';
            return;
        }

        // 추가 채팅 모드: 전송 시에도 EmailJS로 발송 (유사한 데이터셋으로)
        addBubble(text, 'user');
        chatInput.value = '';

        // 추가 메시지 발송 (이전에 저장된 정보 활용 가능하면 좋음)
        const params = {
            name: '추가 문의 (기제출자)',
            message: text,
        };

        emailjs.send('service_kexvgmp', 'template_pkc36ws', params);

        setTimeout(() => {
            addBubble('내용이 추가 접수되었습니다. 곧 안내해 드리겠습니다.', 'bot');
        }, 1000);
    };

    const chatFooterForm = document.getElementById('chat-footer-form');
    if (chatFooterForm && chatInput) {
        chatFooterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            handleSendMsg();
        });
    }

    // --- Project Request Form Logic ---
    const projectForm = document.getElementById('project-form');
    const formSteps = document.querySelectorAll('.form-step');
    const stepIndicators = document.querySelectorAll('.step-indicator');
    const nextBtn = document.querySelector('.next-step-btn');
    const prevBtn = document.querySelector('.prev-step-btn');
    const statusMsg = document.getElementById('status-msg');
    const fileInput = document.getElementById('file-upload');
    const fileNameDisplay = document.getElementById('file-name');

    // Step Navigation (Mobile Only)
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            // Simple validation before going to next step
            const currentStepFields = document.getElementById('step-1').querySelectorAll('[required]');
            let valid = true;
            currentStepFields.forEach(field => {
                if (!field.value) {
                    valid = false;
                    field.style.borderColor = '#ff3e3e';
                } else {
                    field.style.borderColor = '';
                }
            });

            if (valid) {
                formSteps[0].classList.remove('active');
                formSteps[1].classList.add('active');
                stepIndicators[0].classList.remove('active');
                stepIndicators[1].classList.add('active');
                window.scrollTo({
                    top: document.getElementById('project-request').offsetTop - 100,
                    behavior: 'smooth'
                });
            }
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            formSteps[1].classList.remove('active');
            formSteps[0].classList.add('active');
            stepIndicators[1].classList.remove('active');
            stepIndicators[0].classList.add('active');
            window.scrollTo({
                top: document.getElementById('project-request').offsetTop - 100,
                behavior: 'smooth'
            });
        });
    }

    // File Name Display
    if (fileInput && fileNameDisplay) {
        fileInput.addEventListener('change', (e) => {
            const fileName = e.target.files[0]?.name || '없음';
            fileNameDisplay.textContent = `선택된 파일: ${fileName}`;
            fileNameDisplay.style.display = 'block';
        });
    }

    // Form Submission
    if (projectForm) {
        projectForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const submitBtn = projectForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;

            submitBtn.textContent = '전송 중...';
            submitBtn.disabled = true;
            statusMsg.className = 'status-message';
            statusMsg.style.display = 'none';

            // 데이터 수집
            const formData = new FormData(projectForm);
            const params = {};
            formData.forEach((value, key) => {
                // 체크박스 다중 선택 처리
                if (params[key]) {
                    if (!Array.isArray(params[key])) params[key] = [params[key]];
                    params[key].push(value);
                } else {
                    params[key] = value;
                }
            });

            // 다중 선택된 값은 콤마로 연결
            Object.keys(params).forEach(key => {
                if (Array.isArray(params[key])) params[key] = params[key].join(', ');
            });

            // [핵심 수정] 템플릿과 일치하도록 데이터를 재구성합니다.
            // 모든 상세 정보를 'message' 필드 하나로 합칩니다.
            const emailParams = {
                name: params.name || '알 수 없음',
                email: params.email || '알 수 없음',
                phone: params.phone || '알 수 없음',
                message: `
[프로젝트 상세 문의]
--------------------------------
회사명: ${params.company || '기재 안 함'}
프로젝트 종류: ${params.project_type || '선택 안 함'}
제작 목적: ${params.goal || '기재 안 함'}
영상 길이: ${params.duration || '선택 안 함'}
마감 기한: ${params.deadline || '기재 안 함'}
플랫폼: ${params.platform || '선택 안 함'}
예산 범위: ${params.budget || '선택 안 함'}
주요 요소: ${params.elements || '선택 안 함'}
참고 URL: ${params.reference || '기재 안 함'}

--------------------------------
상세 내용:
${params.detail || '기재 안 함'}
                `.trim()
            };

            try {
                // 통합된 emailParams를 전송합니다.
                await emailjs.send('service_kexvgmp', 'template_pkc36ws', emailParams);

                statusMsg.textContent = '문의가 정상적으로 접수되었습니다. 담당자가 내용을 확인한 뒤 24시간 내에 연락드리겠습니다. 급한 문의는 0507-1480-1707로 연락 부탁드립니다.';
                statusMsg.classList.add('success');
                projectForm.reset();
                if (fileNameDisplay) fileNameDisplay.style.display = 'none';

                if (window.innerWidth <= 768) {
                    formSteps[1].classList.remove('active');
                    formSteps[0].classList.add('active');
                    stepIndicators[1].classList.remove('active');
                    stepIndicators[0].classList.add('active');
                }
            } catch (error) {
                statusMsg.textContent = '전송에 실패했습니다. EmailJS 설정을 확인해주시거나 0507-1480-1707로 연락주세요.';
                statusMsg.classList.add('error');
                console.error('EmailJS Error:', error);
            } finally {
                submitBtn.textContent = originalBtnText;
                submitBtn.disabled = false;
                statusMsg.style.display = 'block';
                statusMsg.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    }

    // Smooth scroll for all hash links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                window.scrollTo({
                    top: target.offsetTop - 80, // Offset for header
                    behavior: 'smooth'
                });
            }
        });
    });

});
