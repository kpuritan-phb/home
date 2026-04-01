// Data is loaded from data.js globally
// alert("DEBUG: 0. Main JS 파일 로드됨");

// --- Firebase Configuration REMOVED (Moved to HTML) ---
// const firebaseConfig = { ... };

// Initialize Firebase Variables (Connected in HTML)
// let useMock = false;
// let db, storage;
// let isAdmin = false; 

// HTML에서 초기화된 전역 변수들이 사용됩니다.
console.log("Main JS using global DB connection");

// Check persistence
if (localStorage.getItem('isAdmin') === 'true') {
    window.isAdmin = true;
}

// --- Global Admin Functions (TOP LEVEL to ensure availability for onclick) ---
window.openEditModal = (id) => {
    const width = 1000;
    const height = 900;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    window.open(`admin_edit.html?id=${id}`, `EditPost_${id}`, `width=${width},height=${height},top=${top},left=${left},scrollbars=yes,resizable=yes`);
};

window.deletePost = async (id) => {
    if (!confirm("정말 이 자료를 삭제하시겠습니까?")) return;
    try {
        if (!db) {
            alert("DB 연결이 되지 않았습니다.");
            return;
        }
        await db.collection("posts").doc(id).delete();
        alert("삭제되었습니다.");
        // Refresh lists globally
        if (typeof window.loadAdminPosts === 'function') window.loadAdminPosts();
        if (typeof window.loadRecentPostsGrid === 'function') window.loadRecentPostsGrid();
        if (typeof window.init === 'function') window.init(); // For resources.html
    } catch (error) {
        console.error("Delete error:", error);
        alert("삭제 실패: " + error.message);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    // --- Global Variable Declarations (DOM References) ---
    const resourceModal = document.getElementById('resource-modal');
    const resourceListContainer = document.getElementById('resource-list-container');
    const resourceModalTitle = document.getElementById('resource-modal-title');
    const aboutModal = document.getElementById('about-modal');
    const loginModal = document.getElementById('login-modal');
    const editModal = document.getElementById('edit-modal');
    const recentGrid = document.getElementById('recent-posts-grid');

    // Sort Categories Alphabetically as requested
    // Bible books kept in canonical order.
    /* 
    if (typeof topics !== 'undefined' && Array.isArray(topics)) {
        topics.sort((a, b) => a.localeCompare(b, 'ko'));
    }
    */
    if (typeof authors !== 'undefined' && Array.isArray(authors)) {
        authors.sort((a, b) => a.localeCompare(b, 'ko'));
    }

    // Helper for Korean Initial Consonants
    const getInitialConsonant = (str) => {
        if (!str) return '';
        const charCode = str.charCodeAt(0);
        if (charCode < 44032 || charCode > 55203) return str.charAt(0).toUpperCase();
        const initialIndex = Math.floor((charCode - 44032) / 588);
        const initialConsonants = [
            'ㄱ', 'ㄱ', 'ㄴ', 'ㄷ', 'ㄷ', 'ㄹ', 'ㅁ', 'ㅂ', 'ㅂ', 'ㅅ', 'ㅅ', 'ㅇ', 'ㅈ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'
        ];
        return initialConsonants[initialIndex];
    };

    // Display Firebase Connection Status
    const statusEl = document.getElementById('firebase-status');
    if (statusEl) {
        if (useMock) {
            statusEl.innerHTML = '⚠️ <span style="color: orange;">테스트 모드</span> - Firebase 연결 안됨 (로컬 저장만 가능)';
        } else {
            statusEl.innerHTML = '✅ <span style="color: green;">Firebase 연결됨</span> - 정상 작동';
        }
    }

    const topicDropdown = document.getElementById('topic-dropdown');
    const authorDropdownGrid = document.getElementById('author-dropdown-grid');


    // --- Modal Management with Browser Back Button Support ---
    // --- Modal Management with Browser Back Button Support ---
    window.openModal = (modal) => {
        if (!modal) return;
        if (modal.classList.contains('show')) return;

        modal.classList.add('show');
        // Push a state to history so back button closes the modal
        // Using window.location.href to keep the same URL
        history.pushState({ modalOpen: true, modalId: modal.id }, "", window.location.href);
    };

    window.closeAllModals = (shouldGoBack = true) => {
        let anyModalWasOpen = false;
        document.querySelectorAll('.modal').forEach(m => {
            if (m.classList.contains('show')) {
                m.classList.remove('show');
                anyModalWasOpen = true;
                window.selectionTargetSlot = null; // Selection mode reset
            }
        });

        // Only call history.back() if a modal was actually open and we are in a modal state
        // This prevents going back "too far" and exiting the site
        if (shouldGoBack && anyModalWasOpen && history.state && history.state.modalOpen) {
            history.back();
        }
    };

    window.addEventListener('popstate', (e) => {
        // Close modals when user presses the browser back button
        document.querySelectorAll('.modal').forEach(m => m.classList.remove('show'));
    });







    // --- Mobile Menu Toggle ---
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const nav = document.querySelector('nav');
    const navOverlay = document.querySelector('.nav-overlay');

    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (window.innerWidth <= 1024) {
                window.location.href = 'menu.html';
                return;
            }
            // Fallback or Desktop behavior if toggle exists but screen is large
            if (nav) nav.classList.toggle('active');
            if (navOverlay) navOverlay.classList.toggle('active');
        });

        // Close menu when clicking outside or overlay
        const closeMenu = () => {
            nav.classList.remove('active');
            navOverlay.classList.remove('active');
            mobileMenuToggle.querySelector('i').classList.replace('fa-times', 'fa-bars');
        };

        navOverlay.addEventListener('click', closeMenu);
        document.addEventListener('click', (e) => {
            if (!nav.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
                closeMenu();
            }
        });

        // Fetch and populate sermon series dropdown
        const populateSermonChoices = async () => {
            const desktopDropdown = document.querySelector('#sermon-dropdown .dropdown-list');
            const mobileDropdown = document.getElementById('mobile-sermon-series');
            if (!desktopDropdown && !mobileDropdown) return;

            try {
                const snapshot = await db.collection("posts")
                    .where("tags", "array-contains", "강해설교")
                    .get();

                const seriesSet = new Set();
                snapshot.forEach(doc => {
                    const data = doc.data();
                    if (data.series && data.series.trim()) seriesSet.add(data.series.trim());
                });

                const sortedSeries = Array.from(seriesSet).sort((a, b) => a.localeCompare(b, 'ko'));

                if (desktopDropdown) {
                    desktopDropdown.innerHTML = `<li><a href="resources.html?cat=강해설교">강해설교 전체</a></li>`;
                    sortedSeries.forEach(s => {
                        const li = document.createElement('li');
                        li.innerHTML = `<a href="resources.html?cat=강해설교&s=${encodeURIComponent(s)}">${s}</a>`;
                        desktopDropdown.appendChild(li);
                    });
                }

                if (mobileDropdown) {
                    mobileDropdown.innerHTML = `<li><a href="resources.html?cat=강해설교" class="menu-sub-link">강해설교 전체</a></li>`;
                    sortedSeries.forEach(s => {
                        const li = document.createElement('li');
                        li.innerHTML = `<a href="resources.html?cat=강해설교&s=${encodeURIComponent(s)}" class="menu-sub-link">${s}</a>`;
                        mobileDropdown.appendChild(li);
                    });
                }
            } catch (e) { console.error("populateSermonChoices error:", e); }
        };

        const populateSeminarChoices = async () => {
            const desktopDropdown = document.querySelector('#seminar-dropdown .dropdown-list');
            const mobileDropdown = document.getElementById('mobile-seminar-series');
            if (!desktopDropdown && !mobileDropdown) return;

            try {
                const snapshot = await db.collection("posts")
                    .where("tags", "array-contains", "세미나, 강의")
                    .get();

                const seriesSet = new Set();
                snapshot.forEach(doc => {
                    const data = doc.data();
                    if (data.series && data.series.trim()) seriesSet.add(data.series.trim());
                });

                const sortedSeries = Array.from(seriesSet).sort((a, b) => a.localeCompare(b, 'ko'));

                if (desktopDropdown) {
                    desktopDropdown.innerHTML = `<li><a href="resources.html?cat=세미나, 강의">세미나, 강의 전체</a></li>`;
                    sortedSeries.forEach(s => {
                        const li = document.createElement('li');
                        li.innerHTML = `<a href="resources.html?cat=세미나, 강의&s=${encodeURIComponent(s)}">${s}</a>`;
                        desktopDropdown.appendChild(li);
                    });
                }

                if (mobileDropdown) {
                    mobileDropdown.innerHTML = `<li><a href="resources.html?cat=세미나, 강의" class="menu-sub-link">세미나, 강의 전체</a></li>`;
                    sortedSeries.forEach(s => {
                        const li = document.createElement('li');
                        li.innerHTML = `<a href="resources.html?cat=세미나, 강의&s=${encodeURIComponent(s)}" class="menu-sub-link">${s}</a>`;
                        mobileDropdown.appendChild(li);
                    });
                }
            } catch (e) { console.error("populateSeminarChoices error:", e); }
        };

        if (typeof db !== 'undefined') {
            populateSermonChoices();
            populateSeminarChoices();
        }
    }

    // --- Header Scroll Effect ---
    window.addEventListener('scroll', () => {
        const header = document.querySelector('header');
        if (header) {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
    });

    // --- Main Grid Rendering ---
    const renderMainGridItems = (items, containerId, iconClass) => {
        const container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = '';
        items.forEach(item => {
            const div = document.createElement('div');
            div.className = 'main-grid-item';
            div.innerHTML = `
                <i class="${iconClass}"></i>
                <span>${item}</span>
            `;
            div.addEventListener('click', () => {
                openResourceModal(item);
            });
            container.appendChild(div);
        });
    };

    // Populate main grids
    // renderMainGridItems(topics, 'topic-grid-main', 'fas fa-tags');
    // renderMainGridItems(authors, 'author-grid-main', 'fas fa-user-edit');

    // Show sections that were hidden
    const sectionsToShow = ['recent-updates'];
    sectionsToShow.forEach(id => {
        const sec = document.getElementById(id);
        if (sec) sec.classList.remove('section-hidden');
    });



    // Smooth scroll for all anchor links (Navigation & Hero buttons)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;

            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    // Recent Updates Link Logic
    const recentLink = document.querySelector('a[href="#recent-updates"]');
    const recentSection = document.getElementById('recent-updates');
    if (recentLink && recentSection) {
        recentLink.addEventListener('click', (e) => {
            e.preventDefault();
            recentSection.classList.remove('section-hidden');
            // Allow small delay for display change
            setTimeout(() => {
                recentSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 10);
        });
    }



    // Fade in effect on scroll
    const sections = document.querySelectorAll('section');
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'all 0.8s ease-out';
        observer.observe(section);
    });

    // Login Modal Logic
    const loginOpenBtn = document.getElementById('admin-access-btn');
    const loginCloseBtn = document.getElementById('login-close-btn');
    const loginForm = document.getElementById('login-form');

    // Global Logout Function
    window.logoutAdmin = () => {
        if (confirm('현재 관리자 모드입니다. 로그아웃 하시겠습니까?')) {
            window.isAdmin = false;
            localStorage.removeItem('isAdmin');

            // Update UI components
            const dashboard = document.getElementById('admin-dashboard');
            const loginOpenBtn = document.getElementById('admin-access-btn');
            const navLogout = document.getElementById('nav-logout-item');

            if (dashboard) dashboard.classList.add('section-hidden');
            if (loginOpenBtn) loginOpenBtn.innerHTML = '<i class="fas fa-user-lock"></i> <span>관리자</span>';
            if (navLogout) navLogout.remove();

            alert('로그아웃 되었습니다.');
            // Go to home if on admin-heavy page
            if (location.pathname.includes('seminary.html')) {
                // Stay or go home
            }
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Initial check
    if (window.isAdmin) {
        if (loginOpenBtn) loginOpenBtn.innerHTML = '<i class="fas fa-user-check"></i> 관리자(로그인됨)';
        const dashboard = document.getElementById('admin-dashboard');
        if (dashboard) dashboard.classList.remove('section-hidden');
    }

    if (loginOpenBtn) {
        loginOpenBtn.addEventListener('click', () => {
            if (window.isAdmin) {
                // If already admin, clicking the button triggers logout
                window.logoutAdmin();
            } else {
                if (loginModal) window.openModal(loginModal);
                else location.href = 'index.html'; // Modal only on index
            }
        });
    }

    if (loginCloseBtn && loginModal) {
        loginCloseBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            window.closeAllModals();
        });
    }

    const editCloseBtn = document.getElementById('edit-close-btn');
    if (editCloseBtn && editModal) {
        editCloseBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            window.closeAllModals();
        });
    }

    // About Modal Logic
    const aboutCloseBtn = document.getElementById('about-close-btn');
    const aboutLinks = document.querySelectorAll('a[href="#about"]');

    aboutLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation(); // Stop smooth scroll
            window.openModal(aboutModal);
        });
    });

    if (aboutCloseBtn && aboutModal) {
        aboutCloseBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            window.closeAllModals();
        });
    }

    // Close modal when clicking outside content (Unified logic)
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            window.closeAllModals();
        }
    });

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('admin-id').value;
            const pw = document.getElementById('admin-pw').value;

            // Simple mock login check
            if (id === 'admin' && pw === '1234') {
                const proceedLogin = () => {
                    isAdmin = true;
                    window.isAdmin = true;
                    localStorage.setItem('isAdmin', 'true');
                    window.closeAllModals();
                    if (loginOpenBtn) loginOpenBtn.innerHTML = '<i class="fas fa-user-check"></i> 관리자(로그인됨)';

                    // Show Admin Dashboard
                    const dashboard = document.getElementById('admin-dashboard');
                    if (dashboard) {
                        dashboard.classList.remove('section-hidden');
                        dashboard.scrollIntoView({ behavior: 'smooth' });
                    }
                };

                // Try Firebase Auth (Anonymous or other method needed for Firestore Rules)
                if (window.auth) {
                    try {
                        await window.auth.signInAnonymously();
                        console.log("✅ Firebase Anonymous Auth Success");
                        alert('관리자로 로그인되었습니다. (Firebase 인증 성공)');
                        proceedLogin();
                    } catch (error) {
                        console.error("Auth Error:", error);
                        if (error.code === 'auth/operation-not-allowed') {
                            alert('주의: Firebase 익명 인증이 비활성화되어 있습니다. Console에서 활성화가 필요합니다.\n일단 로컬 관리자 모드로 진입합니다.');
                            proceedLogin(); // Proceed anyway, let Firestore decide
                        } else {
                            alert('Firebase 인증 실패: ' + error.message);
                            // Proceed anyway? Maybe better to stop. But let's be permissive for now.
                            proceedLogin();
                        }
                    }
                } else {
                    alert('관리자로 로그인되었습니다. (Auth 모듈 미로드)');
                    proceedLogin();
                }
            } else {
                alert('아이디 또는 비밀번호가 올바르지 않습니다.');
            }
        });
    }




    // Admin Dashboard Logic: Populate Category Selects
    const populateSelect = (selectId, items) => {
        const select = document.getElementById(selectId);
        if (!select) return;
        items.forEach(item => {
            const opt = document.createElement('option');
            opt.value = item;
            opt.textContent = item;
            select.appendChild(opt);
        });
    };

    if (typeof topics !== 'undefined') {
        populateSelect('post-topic', topics);
        populateSelect('edit-topic', topics);
        populateSelect('modal-post-topic', topics);
        populateSelect('modal-filter-topic', topics);
    }
    if (typeof authors !== 'undefined') {
        populateSelect('post-author', authors);
        populateSelect('edit-author', authors);
        populateSelect('modal-post-author', authors);
        populateSelect('modal-filter-author', authors);
    }


    // [추가] 업로드 폼에서 기타 분류 변경 시 소책자 분류 노출 제어
    const postOtherCat = document.getElementById('post-other-category');
    if (postOtherCat) {
        postOtherCat.addEventListener('change', (e) => {
            const bookletTopicGroup = document.getElementById('post-booklet-topic-group');
            if (bookletTopicGroup) {
                bookletTopicGroup.style.display = (e.target.value === '전도 소책자') ? 'block' : 'none';
            }
        });
    }

    // Real Database Upload Logic
    const uploadForm = document.getElementById('post-upload-form');
    const recentPostsList = document.getElementById('admin-recent-posts');
    window.switchAdminTab = (tabName) => {
        const portalCards = document.querySelectorAll('.admin-portal-card');
        portalCards.forEach(card => {
            card.classList.remove('active');
            card.style.border = '2px solid #eee';
            card.style.boxShadow = 'none';
        });

        // 탭 상태 업데이트
        const targetTabId = `tab-${tabName}`;
        const activeCard = document.getElementById(targetTabId);
        if (activeCard) {
            activeCard.classList.add('active');
            let themeColor = 'var(--primary-color)';
            if (tabName === 'bible-study') themeColor = 'var(--secondary-color)';
            if (tabName === 'booklet') themeColor = '#e67e22';
            if (tabName === 'stats') themeColor = '#9b59b6';

            activeCard.style.border = `2px solid ${themeColor}`;
            activeCard.style.boxShadow = '0 10px 20px rgba(0,0,0,0.05)';
        }

        // 섹션 표시 전환
        document.querySelectorAll('.admin-tab-content').forEach(section => {
            section.style.display = 'none';
        });

        const targetSection = document.getElementById(`admin-${tabName}-section`);
        if (targetSection) {
            targetSection.style.display = (tabName === 'general') ? 'grid' : 'block';
        }

        // 탭 별 데이터 로드 로직
        if (tabName === 'bible-study') {
            loadAdminSeries('강해설교');
        }
        if (tabName === 'stats' && window.AdminStats) {
            AdminStats.load('all');
        }
        if (tabName === 'order') {
            // 초기 셀렉트박스 설정 등 필요시 호출
        }
    };

    let adminSeriesUnsubscribe = null;

    // 관리자용 시리즈 목록 로드 (실시간 동기화로 변경)
    window.loadAdminSeries = (category) => {
        const container = document.getElementById('admin-series-list-container');
        if (!container) return;

        // 기존 리스너가 있으면 해제하여 중복 방지
        if (adminSeriesUnsubscribe) {
            adminSeriesUnsubscribe();
            adminSeriesUnsubscribe = null;
        }

        container.innerHTML = '<div class="loading-msg">시리즈 목록을 불러오는 중...</div>';

        try {
            // onSnapshot을 사용하여 실시간으로 데이터 변화 감지
            adminSeriesUnsubscribe = db.collection("posts")
                .where("tags", "array-contains", category)
                .onSnapshot((snapshot) => {
                    const seriesDataMap = {};
                    snapshot.forEach(doc => {
                        const data = doc.data();
                        let sName = (data.series && data.series.trim() !== "") ? data.series.trim() : null;

                        // 강해설교인데 시리즈가 없으면 '기타 단편 설교'로 취급하여 폴더 노출
                        if (category === '강해설교' && !sName) {
                            sName = '기타 단편 설교';
                        }

                        if (sName) {
                            const order = data.order || 0;
                            if (!seriesDataMap[sName]) {
                                seriesDataMap[sName] = { minOrder: order };
                            } else {
                                seriesDataMap[sName].minOrder = Math.min(seriesDataMap[sName].minOrder, order);
                            }
                        }
                    });

                    if (Object.keys(seriesDataMap).length === 0) {
                        container.innerHTML = '<div style="grid-column: 1/-1; text-align:center; padding: 40px; color:#999;">아직 생성된 필더(시리즈)가 없습니다.<br>오른쪽 상단 버튼으로 폴더를 먼저 만들어보세요.</div>';
                        return;
                    }

                    container.innerHTML = '';
                    // 정렬 순서 우선, 그 다음 가나다순 정렬
                    const sortedSeries = Object.keys(seriesDataMap).sort((a, b) => {
                        if (seriesDataMap[a].minOrder !== seriesDataMap[b].minOrder) {
                            return seriesDataMap[a].minOrder - seriesDataMap[b].minOrder;
                        }
                        return a.trim().localeCompare(b.trim(), 'ko', { numeric: true, sensitivity: 'base' });
                    });

                    sortedSeries.forEach(seriesName => {
                        const card = document.createElement('div');
                        card.className = 'admin-series-card';
                        card.style.cssText = 'background:#f9f9f9; padding:20px; border-radius:12px; border:1px solid #ddd; cursor:pointer; transition:all 0.3s;';
                        card.innerHTML = `
                            <div style="display:flex; align-items:center; gap:15px;">
                                <i class="fas fa-folder" style="font-size:2rem; color:var(--secondary-color);"></i>
                                <div style="flex:1;" onclick="openResourceModalWithSeries('${category}', '${seriesName}')">
                                    <h4 style="margin:0; font-size:1.1rem;">${seriesName}</h4>
                                    <p style="font-size:0.8rem; color:#888; margin-top:3px;">클릭하여 자료 추가/관리</p>
                                </div>
                                <div class="series-actions" style="display:flex; gap:10px;">
                                    <button onclick="renameSeriesPrompt('${category}', '${seriesName}')" style="background:none; border:none; color:#666; cursor:pointer; padding:5px;"><i class="fas fa-edit"></i></button>
                                    <button onclick="deleteSeriesPrompt('${category}', '${seriesName}')" style="background:none; border:none; color:#e74c3c; cursor:pointer; padding:5px;"><i class="fas fa-trash"></i></button>
                                </div>
                            </div>
                        `;
                        // Remove top-level card.onclick to avoid conflicts with buttons
                        card.onmouseover = () => { card.style.background = '#fff'; card.style.borderColor = 'var(--secondary-color)'; card.style.transform = 'translateY(-3px)'; };
                        card.onmouseout = () => { card.style.background = '#f9f9f9'; card.style.borderColor = '#ddd'; card.style.transform = 'none'; };
                        container.appendChild(card);
                    });
                }, (err) => {
                    console.error("실시간 시리즈 로드 에러:", err);
                    container.innerHTML = '<div style="color:red; text-align:center; padding:20px;">목록 로딩 중 오류가 발생했습니다.</div>';
                });
        } catch (err) {
            console.error(err);
            container.innerHTML = '목록 로딩 실패';
        }
    };

    window.createNewSeriesPrompt = (category) => {
        const name = prompt("새롭게 만드실 시리즈(폴더) 이름을 입력하세요.\n예: 사도행전 강해 시리즈");
        if (name && name.trim()) {
            const url = new URL('admin_add.html', window.location.href);
            const otherCats = ['기타', '도서 목록', '전도 소책자', '강해설교'];
            if (otherCats.includes(category)) url.searchParams.set('category', category);
            url.searchParams.set('series', name.trim());
            window.open(url.href, '_blank', 'width=1000,height=800');
        }
    };

    // 특정 시리즈가 선택된 상태로 모달 열기
    window.openResourceModalWithSeries = (category, seriesName) => {
        // Pass seriesName to openResourceModal for direct navigation
        window.openResourceModal(category, seriesName);
        // 모달이 열린 후 인풋 세팅을 위해 약간의 지연
        setTimeout(() => {
            const seriesInput = document.getElementById('modal-post-series');
            if (seriesInput) {
                seriesInput.value = seriesName;
                seriesInput.readOnly = true; // 폴더 내 업로드 시 이름 고정
            }
        }, 300);
    };

    window.renameSeriesPrompt = async (category, oldName) => {
        const newName = prompt(`'${oldName}' 폴더의 이름을 무엇으로 변경할까요?`, oldName);
        if (!newName || newName.trim() === "" || newName === oldName) return;

        if (!confirm(`'${oldName}'에 포함된 모든 자료의 폴더명이 '${newName}'으로 변경됩니다. 진행할까요?`)) return;

        try {
            let query = db.collection("posts").where("tags", "array-contains", category);

            // '기타 단편 설교'인 경우 시리즈가 비어있는 모든 게시물 포함
            if (oldName === '기타 단편 설교' || oldName === '기타 강해설교') {
                const snapshot1 = await query.where("series", "==", "").get();
                const snapshot2 = await query.where("series", "==", "기타 단편 설교").get();
                const snapshot3 = await query.where("series", "==", "기타 강해설교").get();

                const batch = db.batch();
                snapshot1.forEach(doc => batch.update(doc.ref, { series: newName.trim() }));
                snapshot2.forEach(doc => batch.update(doc.ref, { series: newName.trim() }));
                snapshot3.forEach(doc => batch.update(doc.ref, { series: newName.trim() }));
                await batch.commit();
            } else {
                const snapshot = await query.where("series", "==", oldName).get();
                const batch = db.batch();
                snapshot.forEach(doc => batch.update(doc.ref, { series: newName.trim() }));
                await batch.commit();
            }
            alert("폴더 이름이 성공적으로 변경되었습니다.");
        } catch (err) {
            alert("변경 실패: " + err.message);
        }
    };

    window.deleteSeriesPrompt = async (category, seriesName) => {
        if (!confirm(`'${seriesName}' 폴더 내의 모든 자료가 삭제됩니다. 정말 삭제하시겠습니까?`)) return;

        try {
            let query = db.collection("posts").where("tags", "array-contains", category);

            if (seriesName === '기타 단편 설교' || seriesName === '기타 강해설교') {
                const snapshot1 = await query.where("series", "==", "").get();
                const snapshot2 = await query.where("series", "==", "기타 단편 설교").get();
                const snapshot3 = await query.where("series", "==", "기타 강해설교").get();

                const batch = db.batch();
                snapshot1.forEach(doc => batch.delete(doc.ref));
                snapshot2.forEach(doc => batch.delete(doc.ref));
                snapshot3.forEach(doc => batch.delete(doc.ref));
                await batch.commit();
            } else {
                const snapshot = await query.where("series", "==", seriesName).get();
                const batch = db.batch();
                snapshot.forEach(doc => batch.delete(doc.ref));
                await batch.commit();
            }
            alert("폴더와 내부 자료가 모두 삭제되었습니다.");
        } catch (err) {
            alert("삭제 실패: " + err.message);
        }
    };

    let currentUploadTarget = null;

    window.prepareUploadForCategory = (categoryName) => {
        // Open admin_add.html instead of inline form
        const url = new URL('admin_add.html', window.location.href);
        if (topics.includes(categoryName)) url.searchParams.set('topic', categoryName);
        if (authors.includes(categoryName)) url.searchParams.set('author', categoryName);
        if (['전도 소책자', '도서 목록', '강해설교', '세미나, 강의', '기타'].includes(categoryName)) url.searchParams.set('category', categoryName);

        window.open(url.href, '_blank', 'width=1000,height=800');
    };

    window.clearUploadTarget = () => {
        // 기존 알림바 제거
        const targetInfo = document.getElementById('admin-upload-target-info');
        if (targetInfo) targetInfo.style.display = 'none';
    };

    if (uploadForm && recentPostsList) {
        uploadForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const topic = document.getElementById('post-topic').value;
            const author = document.getElementById('post-author').value;
            const other = document.getElementById('post-other-category').value;
            const subBookletTopic = document.getElementById('post-booklet-topic').value;

            let tags = [topic, author, other].filter(t => t !== "");

            // --- [추가] 주제별 자동 태깅 및 시리즈 매칭 ---
            const puritanTopics = ["신론", "인간론", "기독론", "구원론(성령론)", "그리스도인의 생활론", "교회론", "종말론", "역사 신학"];
            let finalSeries = document.getElementById('post-series').value.trim() || '';

            if (puritanTopics.includes(topic)) {
                if (!tags.includes("청교도 신학")) tags.push("청교도 신학");
                if (!finalSeries) finalSeries = topic; // 주제를 시리즈(폴더)로 자동 지정
            }
            if (topic === "전도" || topic === "선교" || topic === "전도, 선교") {
                if (!tags.includes("전도, 선교")) tags.push("전도, 선교");
            }

            if (currentUploadTarget) {
                if (!tags.includes(currentUploadTarget)) tags.push(currentUploadTarget);
            }
            const title = document.getElementById('post-title').value.trim() || '제목 없음';
            const series = finalSeries;
            const order = parseInt(document.getElementById('post-order').value) || 0;
            const price = document.getElementById('post-price').value.trim() || '';
            const content = document.getElementById('post-content').value;
            const fileInput = document.getElementById('post-file');
            const coverInput = document.getElementById('post-cover');
            const file = fileInput.files[0];
            const coverFile = coverInput ? coverInput.files[0] : null;

            if (tags.length === 0) {
                alert("최소 하나 이상의 분류를 선택해 주세요.");
                return;
            }

            console.log('📤 업로드 시작:', { tags, title });

            if (useMock) {
                // Mock Upload
                alert(`[테스트 모드] 자료가 업로드되었습니다.`);

                const li = document.createElement('li');
                li.className = 'post-item';
                const date = new Date().toLocaleString();
                li.innerHTML = `
                    <strong>[${tags.join(', ')}]</strong> ${title} 
                    <span style="color:red; font-size:0.8em;">(테스트 저장)</span>
                    <br> <small>${date}</small>
                `;
                if (recentPostsList.querySelector('.empty-msg')) recentPostsList.innerHTML = '';
                recentPostsList.prepend(li); // Add to top

                uploadForm.reset();
                return;
            }

            const submitBtn = uploadForm.querySelector('button[type="submit"]');
            const progressContainer = document.getElementById('upload-progress-container');
            const progressBar = document.getElementById('upload-progress-bar');
            const percText = document.getElementById('upload-perc-text');
            const statusText = document.getElementById('upload-status-text');
            const originalBtnText = submitBtn.innerHTML;

            // --- 1. UI 초기화 및 상태 표시 ---
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 업로드 준비 중...';

            if (progressContainer) {
                progressContainer.style.display = 'block';
                if (progressBar) progressBar.style.width = '0%';
                if (percText) percText.textContent = '0%';
                if (statusText) statusText.textContent = '서버 연결 중...';
            }

            try {
                // Firebase 상태 체크
                if (!useMock && (!db || !storage)) {
                    throw new Error("Firebase가 아직 초기화되지 않았거나 연결에 실패했습니다. 잠시 후 다시 시도해주세요.");
                }

                let fileUrl = "";
                let coverUrl = "";

                // --- 2. 파일 업로드 ---
                if (file) {
                    if (statusText) statusText.textContent = '상세 파일 업로드 중...';
                    const storageRef = storage.ref(`files/${Date.now()}_${file.name}`);
                    // RFC 5987 호환성을 위해 filename*=UTF-8''... 형식 사용 권장
                    const metadata = {
                        contentDisposition: "inline; filename*=UTF-8''" + encodeURIComponent(file.name)
                    };
                    await storageRef.put(file, metadata);
                    fileUrl = await storageRef.getDownloadURL();
                }

                if (coverFile) {
                    if (statusText) statusText.textContent = '표지 이미지 업로드 중...';
                    const coverRef = storage.ref(`covers/${Date.now()}_${coverFile.name}`);
                    await coverRef.put(coverFile);
                    coverUrl = await coverRef.getDownloadURL();
                }
                // --- 3. Firestore 데이터 저장 ---
                if (statusText) statusText.textContent = '자료 정보 저장 중...';
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 정보 저장 중...';

                const postData = {
                    topic,
                    author,
                    otherCategory: other,
                    tags,
                    title,
                    series,
                    order,
                    recent_order: 0,
                    price,
                    content,
                    subBookletTopic: (other === "전도 소책자") ? subBookletTopic : null,
                    fileUrl,
                    coverUrl,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp()
                };

                console.log('📝 Firestore 저장 데이터:', postData);
                await db.collection("posts").add(postData);

                // --- 4. 성공 처리 ---
                if (statusText) statusText.textContent = '업로드 완료!';
                alert(`✅ 자료가 성공적으로 업로드되었습니다!`);

                uploadForm.reset();
                clearUploadTarget(); // This helper should exist in your codebase to clear file selection UI
                if (window.loadRecentPostsGrid) window.loadRecentPostsGrid();

            } catch (error) {
                console.error("❌ Upload Workflow Error:", error);
                alert("업로드 중 오류가 발생했습니다:\n" + error.message);
            } finally {
                // UI 복구
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
                // 진행바는 성공 시 1~2초 후 사라지게 하거나 즉시 숨김
                setTimeout(() => {
                    if (progressContainer) progressContainer.style.display = 'none';
                    if (progressBar) progressBar.style.width = '0%';
                }, 2000);
            }

        });

        // 실시간 목록 불러오기 (Only if not mocking initially)
        let lastVisiblePost = null;
        let isLoadingMore = false;
        const POSTS_PER_PAGE = 50;

        async function loadAdminPosts(loadMore = false) {
            if (isLoadingMore) return;
            isLoadingMore = true;

            try {
                // 전체 목록은 최신 업로드 순(createdAt)으로 유지해야 모든 자료가 보입니다.
                let query = db.collection("posts").orderBy("createdAt", "desc");

                if (loadMore && lastVisiblePost) {
                    query = query.startAfter(lastVisiblePost);
                }

                query = query.limit(POSTS_PER_PAGE);

                const querySnapshot = await query.get();

                if (!loadMore) {
                    recentPostsList.innerHTML = '';
                }

                if (querySnapshot.empty && !loadMore) {
                    recentPostsList.innerHTML = '<li class="empty-msg">아직 업로드된 자료가 없습니다.</li>';
                    isLoadingMore = false;
                    return;
                }

                querySnapshot.forEach((doc) => {
                    const post = doc.data();
                    const id = doc.id;
                    const li = document.createElement('li');
                    li.className = 'post-item admin-post-item';
                    li.setAttribute('data-id', id); // ID 속성 추가
                    const date = post.createdAt ? post.createdAt.toDate().toLocaleString() : '방금 전';
                    const displayTags = post.tags ? post.tags.join(', ') : '분류 없음';
                    const hasFile = post.fileUrl ? true : false;
                    const hasCover = post.coverUrl ? true : false;

                    // Thumbnail determination
                    let adminThumb = post.coverUrl;
                    if (!adminThumb && post.fileUrl) {
                        adminThumb = post.fileUrl;
                    }

                    li.innerHTML = `
                        <div class="post-info" style="display:flex; align-items:flex-start; gap:12px;">
                            <div style="width:50px; height:70px; flex-shrink:0; background:#fafafa; border-radius:4px; overflow:hidden; border:1px solid #eee; display:flex; align-items:center; justify-content:center;">
                                ${adminThumb
                            ? `<img src="${adminThumb}" style="width:100%; height:100%; object-fit:cover;" onerror="this.style.display='none'">`
                            : `<i class="fas ${hasFile ? 'fa-file-alt' : 'fa-image'}" style="color:#ddd; font-size:1.5rem;"></i>`
                        }
                            </div>
                            <div>
                                <strong>[${displayTags}]</strong> ${post.title} 
                                <div style="display:inline-flex; gap:8px; margin-left:10px;">
                                    ${hasFile ? (/(?:\.|%2E)pdf($|\?|#)/i.test(post.fileUrl)
                            ? `<a href="${post.fileUrl}" target="_blank" style="color:var(--secondary-color);" title="PDF 보기"><i class="fas fa-eye"></i></a>`
                            : `<a href="${post.fileUrl}" target="_blank" style="color:var(--secondary-color);" title="첨부파일"><i class="fas fa-file-download"></i></a>`) : ''}
                                    ${hasCover ? `<a href="${post.coverUrl}" target="_blank" style="color:#f39c12;" title="표지이미지"><i class="fas fa-image"></i></a>` : ''}
                                </div>
                                <br> <small>${date}</small>
                            </div>
                        </div>
                        <div class="post-actions">
                            <button class="action-btn edit" onclick="openEditModal('${id}')"><i class="fas fa-edit"></i></button>
                            <button class="action-btn delete" onclick="deletePost('${id}')"><i class="fas fa-trash"></i></button>
                        </div>
                    `;
                    recentPostsList.appendChild(li);
                });

                // 더 불러올 항목이 있는지 확인
                if (!querySnapshot.empty) {
                    lastVisiblePost = querySnapshot.docs[querySnapshot.docs.length - 1];

                    // "더 보기" 버튼 추가 또는 업데이트
                    let loadMoreBtn = document.getElementById('load-more-admin');
                    if (!loadMoreBtn && querySnapshot.docs.length === POSTS_PER_PAGE) {
                        loadMoreBtn = document.createElement('button');
                        loadMoreBtn.id = 'load-more-admin';
                        loadMoreBtn.className = 'premium-btn';
                        loadMoreBtn.style.cssText = 'width: 100%; margin-top: 20px; padding: 12px;';
                        loadMoreBtn.innerHTML = '<i class="fas fa-chevron-down"></i> 더 보기';
                        loadMoreBtn.onclick = () => loadAdminPosts(true);
                        recentPostsList.parentElement.appendChild(loadMoreBtn);
                    } else if (loadMoreBtn && querySnapshot.docs.length < POSTS_PER_PAGE) {
                        loadMoreBtn.remove();
                    }
                }

            } catch (error) {
                console.log("Load posts failed:", error);
            } finally {
                isLoadingMore = false;
            }
        }

        if (!useMock && db) {
            loadAdminPosts();
        }
    }



    const editForm = document.getElementById('edit-form');
    // [추가] 기타 분류 변경 시 언어 선택창 노출 제어
    const editOtherCat = document.getElementById('edit-other-category');
    if (editOtherCat) {
        editOtherCat.addEventListener('change', (e) => {
            const langGroup = document.getElementById('edit-lang-group');
            if (langGroup) {
                langGroup.style.display = (e.target.value === '전도 소책자') ? 'block' : 'none';
            }
            const bookletTopicGroup = document.getElementById('edit-booklet-topic-group');
            if (bookletTopicGroup) {
                bookletTopicGroup.style.display = (e.target.value === '전도 소책자') ? 'block' : 'none';
            }
        });
    }
    if (editForm) {
        editForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = document.getElementById('edit-post-id').value;

            const topic = document.getElementById('edit-topic').value;
            const author = document.getElementById('edit-author').value;
            const other = document.getElementById('edit-other-category').value;
            const subBookletTopic = document.getElementById('edit-booklet-topic').value;
            const tags = [topic, author, other].filter(t => t !== "");

            // [추가] 소책자 언어 태그 추가
            if (other === '전도 소책자') {
                const lang = document.getElementById('edit-lang').value;
                if (lang) tags.push(lang);
            }

            const title = document.getElementById('edit-title').value.trim();
            const series = document.getElementById('edit-series').value.trim() || "";
            const order = parseInt(document.getElementById('edit-order').value) || 0;
            const price = document.getElementById('edit-price').value.trim() || '';
            const content = document.getElementById('edit-content').value;
            const fileInput = document.getElementById('edit-file');
            const coverInput = document.getElementById('edit-cover');
            const file = fileInput.files[0];
            const coverFile = coverInput ? coverInput.files[0] : null;

            if (tags.length === 0) {
                alert("최소 하나 이상의 분류를 선택해 주세요.");
                return;
            }

            const submitBtn = editForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 수정 중...';

            try {
                let updateData = {
                    topic,
                    author,
                    otherCategory: other,
                    tags,
                    title,
                    series,
                    order,
                    price,
                    content,
                    isRecommended: document.getElementById('edit-is-recommended').checked,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                };

                if (other === "전도 소책자" && subBookletTopic) {
                    updateData.subBookletTopic = subBookletTopic;
                }

                if (file) {
                    const storageRef = storage.ref(`files/${Date.now()}_${file.name}`);
                    await storageRef.put(file);
                    updateData.fileUrl = await storageRef.getDownloadURL();
                }

                if (coverFile) {
                    const coverRef = storage.ref(`covers/${Date.now()}_${coverFile.name}`);
                    await coverRef.put(coverFile);
                    updateData.coverUrl = await coverRef.getDownloadURL();
                }
                await db.collection("posts").doc(id).update(updateData);
                alert("수정되었습니다.");
                window.closeAllModals();
                if (window.loadRecentPostsGrid) window.loadRecentPostsGrid();
                const currentCat = resourceModalTitle.textContent.replace(' 자료 목록', '').trim();
                if (currentCat) openResourceModal(currentCat);
            } catch (error) {
                console.error("Update error:", error);
                alert("수정 실패: " + error.message);
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
            }
        });
    }

    // Inquiry Form Logic
    const inquiryForm = document.querySelector('.inquiry-form');
    if (inquiryForm) {
        inquiryForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('문의 및 세미나 소식 신청이 접수되었습니다. 곧 안내해 드리겠습니다.');
            inquiryForm.reset();
        });
    }
    // Resource Modal Logic
    const resourceCloseBtn = document.getElementById('resource-close-btn');

    if (resourceCloseBtn) {
        resourceCloseBtn.addEventListener('click', () => window.closeAllModals());
    }

    window.openResourceModal = async (categoryName, targetSeries = null, targetPostId = null) => {
        // DOM 요소 안전 조회
        const modal = document.getElementById('resource-modal');
        const listContainer = document.getElementById('resource-list-container');
        const titleElem = document.getElementById('resource-modal-title');

        if (!modal || !listContainer) {
            console.error("Critical: Resource modal elements not found.");
            return;
        }

        // 모달 열기 (기존 함수 활용 또는 직접 제어)
        if (window.openModal) {
            window.openModal(modal);
        } else {
            modal.classList.add('show');
        }

        // 카테고리 이름 정문화 (기존 태그와의 호환성 유지)
        let queryTag = categoryName;
        let displayTitle = categoryName;
        if (categoryName === '전도 소책자' || categoryName === '전도 소책자 PDF') {
            queryTag = '전도 소책자';
            displayTitle = '전도 소책자 PDF';
        }

        // 초기화
        listContainer.classList.remove('compact-view');
        if (titleElem) titleElem.textContent = `${displayTitle} 자료 목록`;
        listContainer.innerHTML = '<li class="no-resource-msg">자료를 불러오는 중입니다...</li>';

        const sortAlphaBtn = document.getElementById('sort-alpha-btn');
        if (sortAlphaBtn) sortAlphaBtn.style.display = 'none';

        // Clean up previous Sortable
        if (window.currentSortable) {
            window.currentSortable.destroy();
            window.currentSortable = null;
        }

        // DB 미연결 또는 Mock 모드 체크
        const isOffline = (typeof db === 'undefined' || !db);
        const useMockMode = (typeof useMock !== 'undefined' && useMock) || isOffline;

        if (useMockMode) {
            setTimeout(() => {
                listContainer.innerHTML = '';
                // 사용자가 클릭한 "청교도 신학의 정수" 같은 제목이 목록에 보이도록 Mock 데이터를 구성
                const mockItems = [
                    { title: `[샘플] ${categoryName}의 정수`, date: "2026.01.15", content: "이것은 예시 자료입니다. 데이터베이스가 연결되지 않았습니다." },
                    { title: `[샘플] ${categoryName} 개요 및 해설`, date: "2026.01.12", content: "관련 강의 영상 및 자료가 포함됩니다." },
                    { title: `[샘플] ${categoryName} 심화 연구`, date: "2026.01.10", content: "심도 있는 연구 자료를 제공합니다." },
                    { title: `[샘플] ${categoryName} 적용점`, date: "2026.01.05", content: "실생활 적용을 위한 가이드입니다." }
                ];

                mockItems.forEach((item, idx) => {
                    // renderSingleResource가 있으면 사용, 없으면 직접 HTML 생성 (안전장치)
                    if (typeof renderSingleResource === 'function') {
                        renderSingleResource({
                            title: item.title,
                            createdAt: { toDate: () => new Date() },
                            content: item.content,
                            tags: [categoryName]
                        }, listContainer);
                    } else {
                        const li = document.createElement('li');
                        li.className = 'resource-item';
                        li.innerHTML = `<h4>${item.title}</h4><p>${item.content}</p>`;
                        listContainer.appendChild(li);
                    }
                });
            }, 300);
            return; // Mock 모드 종료
        }

        // Admin Header Logic (DB가 연결된 경우에만 실행)
        const adminHeader = document.getElementById('resource-modal-admin-header');
        if (adminHeader) {
            const toggleBtn = document.getElementById('toggle-modal-upload');
            const modalUploadForm = document.getElementById('modal-upload-form');

            if (typeof isAdmin !== 'undefined' && isAdmin) {
                adminHeader.style.display = 'block';
                if (modalUploadForm) modalUploadForm.style.display = 'none';

                // 언어 선택창 및 주제/저자/기타 분류 필드 표시 및 초기화
                const langSelect = document.getElementById('modal-post-lang');
                const priceInput = document.getElementById('modal-post-price');
                const categoryFields = document.getElementById('modal-post-category-fields');
                const modalTopic = document.getElementById('modal-post-topic');
                const modalAuthor = document.getElementById('modal-post-author');
                const modalOther = document.getElementById('modal-post-other-category');
                const modalSeries = document.getElementById('modal-post-series');

                if (langSelect) {
                    langSelect.style.display = (queryTag === '전도 소책자') ? 'block' : 'none';
                    if (queryTag === '전도 소책자') langSelect.value = "한국어";
                }
                if (priceInput) {
                    priceInput.style.display = (queryTag === '도서 목록') ? 'block' : 'none';
                    priceInput.value = "";
                }
                if (categoryFields) {
                    categoryFields.style.display = 'grid'; // 교차 분류를 위해 항상 유지
                }

                // --- 초기값 자동 매칭 및 세팅 ---
                if (modalTopic) modalTopic.value = topics.includes(queryTag) ? queryTag : "";
                if (modalAuthor) modalAuthor.value = authors.includes(queryTag) ? queryTag : "";
                if (modalOther) {
                    const otherCats = ['기타', '도서 목록', '전도 소책자', '강해설교'];
                    modalOther.value = otherCats.includes(queryTag) ? queryTag : "";
                }
                if (modalSeries) modalSeries.value = targetSeries || "";

                if (toggleBtn) {
                    toggleBtn.textContent = '새 자료 추가 (새 창)';
                    toggleBtn.onclick = (e) => {
                        e.preventDefault();
                        const url = new URL('admin_add.html', window.location.href);

                        // Set presets based on current modal view
                        if (topics.includes(queryTag)) url.searchParams.set('topic', queryTag);
                        if (authors.includes(queryTag)) url.searchParams.set('author', queryTag);
                        const otherCats = ['기타', '도서 목록', '전도 소책자', '강해설교'];
                        if (otherCats.includes(queryTag)) url.searchParams.set('category', queryTag);
                        if (targetSeries) url.searchParams.set('series', targetSeries);

                        window.open(url.href, '_blank', 'width=1000,height=800');
                    };
                }

                // "이 폴더에 새 자료 추가" 텍스트 클릭 시에도 새 창 열기
                const addText = adminHeader.querySelector('span');
                if (addText) {
                    addText.style.cursor = 'pointer';
                    addText.onclick = () => {
                        toggleBtn.click();
                    };
                }

                if (modalUploadForm) {
                    modalUploadForm.onsubmit = async (e) => {
                        e.preventDefault();
                        const title = document.getElementById('modal-post-title').value.trim();
                        const series = document.getElementById('modal-post-series').value.trim();
                        const order = parseInt(document.getElementById('modal-post-order').value) || 0;
                        const price = document.getElementById('modal-post-price').value.trim() || "";
                        const content = document.getElementById('modal-post-content').value;
                        const fileEl = document.getElementById('modal-post-file');
                        const coverEl = document.getElementById('modal-post-cover');
                        const file = fileEl ? fileEl.files[0] : null;
                        const coverFile = coverEl ? coverEl.files[0] : null;

                        const topic = document.getElementById('modal-post-topic').value;
                        const author = document.getElementById('modal-post-author').value;
                        const otherCategory = document.getElementById('modal-post-other-category').value;

                        // 언어 및 분류 태그 처리
                        let finalTags = [queryTag];
                        if (topic && !finalTags.includes(topic)) finalTags.push(topic);
                        if (author && !finalTags.includes(author)) finalTags.push(author);
                        if (otherCategory && !finalTags.includes(otherCategory)) finalTags.push(otherCategory);

                        if (queryTag === '전도 소책자' || otherCategory === '전도 소책자') {
                            const langValue = document.getElementById('modal-post-lang').value;
                            if (langValue && !finalTags.includes(langValue)) finalTags.push(langValue);
                        }

                        if (!title) {
                            alert("제목을 입력해 주세요.");
                            return;
                        }

                        const submitBtn = modalUploadForm.querySelector('button[type="submit"]');
                        const originalBtnText = submitBtn.innerHTML;
                        const progressBar = document.getElementById('modal-upload-bar');
                        const progressContainer = document.getElementById('modal-upload-progress');

                        try {
                            submitBtn.disabled = true;
                            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 업로드 중...';
                            if (progressContainer) progressContainer.style.display = 'block';
                            if (progressBar) progressBar.style.width = '0%';

                            let fileUrl = "";
                            if (file) {
                                const storageRef = storage.ref(`files/${Date.now()}_${file.name}`);
                                const uploadTask = storageRef.put(file);

                                await new Promise((resolve, reject) => {
                                    uploadTask.on('state_changed',
                                        (snap) => {
                                            const perc = (snap.bytesTransferred / snap.totalBytes) * 100;
                                            if (progressBar) progressBar.style.width = perc + '%';
                                        },
                                        reject,
                                        resolve
                                    );
                                });
                                fileUrl = await storageRef.getDownloadURL();
                            }

                            let coverUrl = "";
                            if (coverFile) {
                                const coverRef = storage.ref(`covers/${Date.now()}_${coverFile.name}`);
                                await coverRef.put(coverFile);
                                coverUrl = await coverRef.getDownloadURL();
                            }

                            await db.collection("posts").add({
                                topic,
                                author,
                                otherCategory,
                                title,
                                series,
                                order,
                                price,
                                content,
                                fileUrl,
                                coverUrl,
                                tags: finalTags,
                                createdAt: firebase.firestore.FieldValue.serverTimestamp()
                            });

                            alert("자료가 등록되었습니다.");
                            modalUploadForm.reset();
                            modalUploadForm.style.display = 'none';
                            if (toggleBtn) toggleBtn.textContent = '업로드 창 열기';

                            // 다시 해당 카테고리 로드
                            window.openResourceModal(displayTitle, series || null);
                        } catch (err) {
                            console.error("Upload Error:", err);
                            alert("업로드 실패: " + err.message);
                        } finally {
                            submitBtn.disabled = false;
                            submitBtn.innerHTML = "게시하기";
                            if (progressContainer) progressContainer.style.display = 'none';
                        }
                    };
                }
            } else {
                adminHeader.style.display = 'none';
            }
        }

        try {
            // Updated Query Logic: Use "tags" array-contains (or array-contains-any for booklets)
            let q = db.collection("posts");
            if (queryTag === '전도 소책자') {
                q = q.where("tags", "array-contains-any", ["전도 소책자", "전도 소책자 PDF"]);
            } else if (queryTag === '모든 자료') {
                // No tag filter, just get all (limit for safety)
                q = q.orderBy("createdAt", "desc").limit(500);
            } else {
                q = q.where("tags", "array-contains", queryTag);
            }
            const snapshot = await q.get();

            if (snapshot.empty) {
                listContainer.innerHTML = '<li class="no-resource-msg">아직 등록된 자료가 없습니다.</li>';
                return;
            }

            let posts = [];
            snapshot.forEach(doc => {
                posts.push({ id: doc.id, ...doc.data() });
            });

            // Sort by manual order first, then date desc
            posts.sort((a, b) => {
                const orderDiff = (a.order || 0) - (b.order || 0);
                if (orderDiff !== 0) return orderDiff;
                return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
            });

            // 필터링 컨트롤 노출 및 초기화
            const filterTopic = document.getElementById('modal-filter-topic');
            const filterAuthor = document.getElementById('modal-filter-author');
            const filterSection = document.getElementById('modal-filter-section');

            if (filterSection) {
                // 전도 소책자나 강해설교 등 자료가 많을 수 있는 곳에서 노출
                // 추천 자료 선택 모드일 때도 강제로 노출
                const needsFilter = ['전도 소책자', '강해설교', '도서 목록', '모든 자료'].includes(queryTag) || window.selectionTargetSlot !== null;
                filterSection.style.display = needsFilter ? 'flex' : 'none';
            }
            if (filterTopic) filterTopic.value = "";
            if (filterAuthor) filterAuthor.value = "";

            const searchInput = document.getElementById('modal-search-input');
            if (searchInput) searchInput.value = "";

            // Render View
            const renderListView = (currentGroupedData) => {
                const sortAlphaBtn = document.getElementById('sort-alpha-btn');
                if (sortAlphaBtn) sortAlphaBtn.style.display = 'none';

                resourceListContainer.innerHTML = '';
                // Sort Folders by the minimum order of their items, then by name
                const keys = Object.keys(currentGroupedData).sort((a, b) => {
                    const minOrderA = Math.min(...currentGroupedData[a].map(p => p.order || 0));
                    const minOrderB = Math.min(...currentGroupedData[b].map(p => p.order || 0));
                    if (minOrderA !== minOrderB) return minOrderA - minOrderB;
                    return a.trim().localeCompare(b.trim(), 'ko', { numeric: true, sensitivity: 'base' });
                });

                // If there are only standalone posts (none) and no folders, show them directly
                if (keys.length === 1 && keys[0] === '_none') {
                    currentGroupedData['_none'].forEach(post => renderSingleResource(post, resourceListContainer));
                    return;
                }

                // Otherwise, show Folders
                const grid = document.createElement('div');
                grid.className = 'main-grid-container';
                grid.style.padding = '0';
                resourceListContainer.appendChild(grid);

                keys.forEach(sName => {
                    if (sName === '_none') return;

                    const seriesPosts = currentGroupedData[sName];
                    // Sort items inside folder: order asc, then date desc
                    seriesPosts.sort((a, b) => {
                        const orderDiff = (a.order || 0) - (b.order || 0);
                        if (orderDiff !== 0) return orderDiff;
                        return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
                    });

                    let thumbId = '';
                    seriesPosts.forEach(post => {
                        if (thumbId) return;
                        const contentText = post.content || '';
                        const urls = contentText.match(/(https?:\/\/[^\s]+)/g) || [];
                        urls.forEach(url => {
                            if (thumbId) return;
                            // More robust regex for YouTube ID extraction
                            const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
                            const match = url.match(regExp);
                            if (match && match[2].length === 11) {
                                thumbId = match[2];
                            }
                        });
                    });

                    const thumbUrl = thumbId ? `https://img.youtube.com/vi/${thumbId}/mqdefault.jpg`
                        : 'https://images.unsplash.com/photo-1585829365234-78905bc76269?auto=format&fit=crop&q=80&w=400';

                    const folderCard = document.createElement('div');
                    folderCard.className = 'main-grid-item';
                    folderCard.style.textAlign = 'center';
                    folderCard.style.padding = '1rem';
                    folderCard.innerHTML = `
                        <div style="width:100%; height:100px; border-radius:8px; overflow:hidden; margin-bottom:10px; position:relative; background:#f0f0f0;">
                            <img src="${thumbUrl}" 
                                 onerror="this.src='https://images.unsplash.com/photo-1585829365234-78905bc76269?auto=format&fit=crop&q=80&w=400'; this.onerror=null;"
                                 style="width:100%; height:100%; object-fit:cover;">
                            <div style="position:absolute; right:10px; bottom:10px; background:rgba(0,0,0,0.7); color:white; padding:2px 8px; border-radius:4px; font-size:0.75rem;">
                                <i class="fas fa-play"></i> ${seriesPosts.length}
                            </div>
                        </div>
                        <h4 style="margin:0; font-size:0.95rem; color:var(--primary-color); line-height:1.2;">${sName}</h4>
                        <p style="font-size:0.7rem; color:#888; margin-top:5px;">상세 보기 <i class="fas fa-chevron-right"></i></p>
                    `;
                    folderCard.onclick = () => {
                        if (window.Stats) {
                            window.Stats.track('view', {
                                id: 'series_' + Date.now().toString(36), // Replace btoa with safe random ID
                                type: 'series_folder',
                                title: sName,
                                category: categoryName
                            });
                        }
                        renderDetailView(sName, seriesPosts);
                    };
                    grid.appendChild(folderCard);
                });

                // Render standalone posts if any (and not '강해설교' which are already grouped)
                if (currentGroupedData['_none'] && categoryName !== '강해설교') {
                    const standaloneTitle = document.createElement('h3');
                    standaloneTitle.textContent = "개별 자료";
                    standaloneTitle.style.margin = "2.5rem 0 1rem 0";
                    standaloneTitle.style.fontSize = "1.1rem";
                    standaloneTitle.style.borderBottom = "1px solid #eee";
                    standaloneTitle.style.paddingBottom = "0.5rem";
                    resourceListContainer.appendChild(standaloneTitle);
                    currentGroupedData['_none'].forEach(post => renderSingleResource(post, resourceListContainer));
                }
            };

            const renderDetailView = (seriesName, posts) => {
                const sortAlphaBtn = document.getElementById('sort-alpha-btn');
                if (sortAlphaBtn) {
                    sortAlphaBtn.style.display = 'inline-block';
                    sortAlphaBtn.onclick = async () => {
                        if (!confirm(`'${seriesName}' 폴더 내의 자료들을 가나다순으로 자동 정렬하시겠습니까?`)) return;

                        const sorted = [...posts].sort((a, b) => a.title.trim().localeCompare(b.title.trim(), 'ko', { numeric: true, sensitivity: 'base' }));
                        const batch = db.batch();
                        sorted.forEach((p, idx) => {
                            batch.update(db.collection("posts").doc(p.id), { order: idx });
                        });

                        try {
                            const originalBtnText = sortAlphaBtn.innerHTML;
                            sortAlphaBtn.disabled = true;
                            sortAlphaBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 정렬 중...';

                            await batch.commit();
                            alert("가나다순 정렬이 완료되었습니다.");

                            // 로컬 데이터도 정렬 상태 반영 후 다시 렌더링
                            posts.length = 0;
                            posts.push(...sorted);
                            renderDetailView(seriesName, posts);
                        } catch (err) {
                            alert("정렬 오류: " + err.message);
                        } finally {
                            sortAlphaBtn.disabled = false;
                            sortAlphaBtn.innerHTML = '<i class="fas fa-sort-alpha-down"></i> 가나다순 정렬';
                        }
                    };
                }

                resourceListContainer.innerHTML = '';
                resourceListContainer.classList.add('compact-view'); // 5개씩 보기 위해 콤팩트 모드 적용

                // Back Button
                const backBtn = document.createElement('button');
                backBtn.className = 'view-all-btn';
                backBtn.style.marginBottom = '20px';
                backBtn.style.gridColumn = '1 / -1'; // 그리드 전체 너비 차지
                backBtn.innerHTML = `<i class="fas fa-arrow-left"></i> 목록으로 돌아가기 (${categoryName})`;
                backBtn.onclick = () => {
                    resourceListContainer.classList.remove('compact-view');
                    renderListView(groupedPosts);
                };
                resourceListContainer.appendChild(backBtn);

                const seriesTitle = document.createElement('h2');
                seriesTitle.textContent = seriesName;
                seriesTitle.style.marginBottom = '20px';
                seriesTitle.style.fontSize = '1.5rem';
                seriesTitle.style.textAlign = 'center';
                seriesTitle.style.fontFamily = "'Playfair Display', serif";
                seriesTitle.style.gridColumn = '1 / -1'; // 그리드 전체 너비 차지
                resourceListContainer.appendChild(seriesTitle);

                // Posts in series
                posts.forEach(post => renderSingleResource(post, resourceListContainer));

                // Scroll to top of modal content
                resourceListContainer.parentElement.scrollTop = 0;

                // --- Drag and Drop Logic (Admin Only) ---
                if (isAdmin && typeof Sortable !== 'undefined') {
                    window.currentSortable = new Sortable(resourceListContainer, {
                        animation: 150,
                        ghostClass: 'sortable-ghost',
                        draggable: '.resource-item-wrapper',
                        onEnd: async () => {
                            const items = resourceListContainer.querySelectorAll('.resource-item-wrapper');
                            const batch = db.batch();

                            items.forEach((item, index) => {
                                const postId = item.getAttribute('data-id');
                                if (postId) {
                                    const ref = db.collection("posts").doc(postId);
                                    batch.update(ref, { order: index });
                                }
                            });

                            try {
                                await batch.commit();
                                console.log("Order updated successfully.");
                            } catch (err) {
                                console.error("Error updating order:", err);
                                alert("순서 변경 저장 실패: " + err.message);
                            }
                        }
                    });
                }
            };

            // Group items by series (필터 적용 함수 내부에서 처리하기 위해 변수로 분리)
            let groupedPosts = {};

            const groupAndRender = (postsToProcess) => {
                groupedPosts = {};
                postsToProcess.forEach(post => {
                    let sName = (post.series && post.series.trim()) ? post.series.trim() : '_none';
                    if (queryTag === '강해설교' && sName === '_none') {
                        sName = '기타 단편 설교';
                    }
                    if (!groupedPosts[sName]) groupedPosts[sName] = [];
                    groupedPosts[sName].push(post);
                });
                renderListView(groupedPosts);
            };

            const applyModalFilters = () => {
                const selectedTopic = filterTopic ? filterTopic.value : "";
                const selectedAuthor = filterAuthor ? filterAuthor.value : "";
                const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : "";

                let filtered = posts;
                if (selectedTopic) {
                    filtered = filtered.filter(p => p.tags && p.tags.includes(selectedTopic));
                }
                if (selectedAuthor) {
                    filtered = filtered.filter(p => p.tags && p.tags.includes(selectedAuthor));
                }
                if (searchTerm) {
                    filtered = filtered.filter(p =>
                        (p.title && p.title.toLowerCase().includes(searchTerm)) ||
                        (p.content && p.content.toLowerCase().includes(searchTerm)) ||
                        (p.series && p.series.toLowerCase().includes(searchTerm))
                    );
                }
                groupAndRender(filtered);
            };

            if (filterTopic) filterTopic.onchange = applyModalFilters;
            if (filterAuthor) filterAuthor.onchange = applyModalFilters;
            if (searchInput) {
                searchInput.oninput = applyModalFilters;
            }

            // 초기 렌더링
            groupAndRender(posts);

            // If targetSeries is provided, go straight to detail view
            if (targetSeries && groupedPosts[targetSeries]) {
                renderDetailView(targetSeries, groupedPosts[targetSeries]);
            } else {
                // 이미 groupAndRender(posts)에서 초기 렌더링됨
            }

            // 만약 특정 게시물 ID가 있다면 해당 위치로 스크롤
            if (targetPostId) {
                setTimeout(() => {
                    const targetEl = resourceListContainer.querySelector(`[data-id="${targetPostId}"]`);
                    if (targetEl) {
                        targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        const card = targetEl.querySelector('.resource-card-modern');
                        if (card) {
                            card.style.transition = 'all 0.5s ease';
                            card.style.border = '2px solid var(--secondary-color)';
                            card.style.boxShadow = '0 0 20px rgba(10, 124, 104, 0.3)';
                            setTimeout(() => {
                                card.style.border = '';
                                card.style.boxShadow = '';
                            }, 3000);
                        }
                    }
                }, 500);
            }

        } catch (error) {
            console.error("Error fetching documents: ", error);
            resourceListContainer.innerHTML = `<li class="no-resource-msg">자료를 불러오는 중 오류가 발생했습니다.<br>(${error.message})</li>`;
        }
    };

    function renderSingleResource(post, container) {
        const li = document.createElement('li');
        li.className = 'resource-item-wrapper';
        li.setAttribute('data-id', post.id);
        if (isAdmin) li.style.cursor = 'grab';

        const date = post.createdAt ? post.createdAt.toDate().toLocaleDateString() : '날짜 없음';
        let youtubeEmbedHtml = '';
        let contentText = post.content || '';
        const urlRegex = /(https?:\/\/[^\s]+)/g;
        const urlsInContent = contentText.match(urlRegex) || [];
        let primaryLink = post.fileUrl || (urlsInContent.length > 0 ? urlsInContent[0] : '#');
        let isPdf = primaryLink.toLowerCase().includes('.pdf');

        if (contentText.toLowerCase().includes('youtube.com') || contentText.toLowerCase().includes('youtu.be')) {
            urlsInContent.forEach(url => {
                let embedUrl = '';
                const lowerUrl = url.toLowerCase();
                if (lowerUrl.includes('list=')) { embedUrl = `https://www.youtube.com/embed/videoseries?list=${url.split('list=')[1].split('&')[0]}`; }
                else if (lowerUrl.includes('v=')) { embedUrl = `https://www.youtube.com/embed/${url.split('v=')[1].split('&')[0]}`; }
                else if (lowerUrl.includes('youtu.be/')) { embedUrl = `https://www.youtube.com/embed/${url.split('youtu.be/')[1].split('?')[0]}`; }
                if (embedUrl) { youtubeEmbedHtml += `<div class="youtube-embed-container" style="border-bottom: 1px solid #eee;"><iframe src="${embedUrl}" frameborder="0" allowfullscreen></iframe></div>`; }
            });
        }

        const linkedContent = contentText.replace(urlRegex, '<a href="$1" target="_blank" class="text-link">$1</a>');
        let fileLinkHtml = '';
        if (post.fileUrl) {
            const icon = isPdf ? 'fa-file-pdf' : 'fa-file-download';
            const label = isPdf ? 'PDF 파일 보기' : '첨부파일 다운로드';
            const color = isPdf ? '#e74c3c' : 'var(--secondary-color)';
            const finalHref = post.fileUrl;

            fileLinkHtml = `<a href="${finalHref}" target="_blank" class="resource-link premium-btn" style="border-color:${color}; color:${color}; margin-top:10px;" 
                onclick="if(window.Stats) window.Stats.track('${isPdf ? 'view' : 'click'}', { id: '${post.id}', type: '${isPdf ? 'view_pdf' : 'resource_file'}', title: '${post.title.replace(/'/g, "\\'")}', category: '${(post.tags || []).join(",")}' })">
                <i class="fas ${isPdf ? 'fa-eye' : 'fa-file-download'}"></i> ${isPdf ? 'PDF 직접 열기' : label}</a>`;
        }
        let adminButtons = '';
        if (isAdmin) {
            let selectBtn = '';
            if (window.selectionTargetSlot !== null) {
                selectBtn = `<button onclick="window.assignPostToSlot('${post.id}', '${post.title.replace(/'/g, "\\'")}')" class="cta-btn primary" style="padding: 10px; font-size: 0.8rem; margin-top: 10px; border-radius: 6px; width: 100%; background: #f1c40f; color: #000; font-weight: bold;">
                    <i class="fas fa-check-circle"></i> 추천 자료 슬롯 ${window.selectionTargetSlot + 1}번에 등록
                </button>`;
            }

            adminButtons = `
                <div class="resource-admin-actions" style="display: flex; flex-direction: column; gap: 5px;">
                    <div style="display: flex; gap: 5px;">
                        <button onclick="window.openEditModal('${post.id}')" class="action-btn edit-small" title="수정"><i class="fas fa-edit"></i></button>
                        <button onclick="window.deletePost('${post.id}')" class="action-btn delete-small" title="삭제"><i class="fas fa-trash"></i></button>
                    </div>
                    ${selectBtn}
                </div>
            `;
        }

        const bookTags = ['도서 목록'];
        const isBookstore = post.tags && post.tags.some(tag => bookTags.includes(tag));
        let priceHtml = '';
        let buyButtonHtml = '';

        let authorHtml = '';
        if (isBookstore) {
            const title = post.title || '';
            if (title.includes(':')) {
                const parts = title.split(':');
                if (parts.length > 1) {
                    const author = parts[0].trim();
                    authorHtml = `<div class="resource-author-modern" style="font-size: 0.85rem; color: #666; margin-top: 5px;">${author} 저</div>`;
                }
            }

            const priceStr = post.price || (contentText.match(/(\d{1,3}(,\d{3})*원)/) ? contentText.match(/(\d{1,3}(,\d{3})*원)/)[0] : '가격 문의');
            const priceNum = parseInt(priceStr.replace(/[^0-9]/g, '')) || 0;

            priceHtml = `<div class="book-price" style="font-size: 1.2rem; font-weight: 700; color: var(--secondary-color); margin-top: 10px;">
                ${priceStr} <span style="font-size: 0.8rem; font-weight: 400; color: #888; margin-left: 5px;">(배송비 별도)</span>
            </div>`;

            if (priceNum > 0) {
                buyButtonHtml = `
                    <button class="premium-btn" style="background: var(--secondary-color); color: white; border: none; width: 100%; margin-top: 15px; padding: 12px;" 
                        onclick="if(window.Stats) window.Stats.track('click', { id: 'book_${post.id}', type: 'book_purchase_intent', title: '${post.title.replace(/'/g, "\\'")}' }); window.requestPay('${post.title.replace(/'/g, "\\'")}', ${priceNum})">
                        <i class="fas fa-shopping-cart"></i> 바로 구매하기
                    </button>
                `;
            } else {
                buyButtonHtml = `
                    <button class="premium-btn" style="background: var(--text-light); color: white; border: none; width: 100%; margin-top: 15px; padding: 12px;" onclick="window.open('mailto:kpuritan.phb@gmail.com?subject=구매 문의: ${post.title.replace(/'/g, "\\'")}', '_blank')">
                        <i class="fas fa-envelope"></i> 구매 문의하기
                    </button>
                `;
            }
        }

        // PortOne Payment Function
        window.requestPay = (title, amount) => {
            if (!window.IMP) return alert("결제 모듈을 불러오는 중입니다. 잠시 후 타시 시도해주세요.");
            const IMP = window.IMP;
            IMP.init("imp67545025"); // 사용자 실가맹점 식별코드 업데이트

            if (!confirm(`'${title}'을(를) ${amount.toLocaleString()}원에 구매하시겠습니까?`)) return;

            IMP.request_pay({
                pg: "html5_inicis",
                pay_method: "card",
                merchant_uid: `mid_${new Date().getTime()}`,
                name: title,
                amount: amount,
                buyer_email: "customer@example.com",
                buyer_name: "구매자",
                buyer_tel: "010-0000-0000",
            }, function (rsp) {
                if (rsp.success) {
                    alert('결제가 성공적으로 완료되었습니다! 감사합니다.');
                    // 실제 환경에서는 여기서 서버(Firebase)에 결제 정보를 저장합니다.
                } else {
                    alert('결제에 실패하였습니다. 사유: ' + rsp.error_msg);
                }
            });
        };

        const titleHtml = primaryLink !== '#'
            ? `<a href="${primaryLink}" target="_blank" class="title-clickable">
                ${isPdf ? '<i class="fas fa-file-pdf" style="color:#e74c3c; margin-right:5px;"></i>' : ''}
                ${post.title}
                <i class="fas ${isPdf ? 'fa-eye' : 'fa-external-link-alt'}" style="font-size:0.7em; margin-left:8px; opacity:0.3;"></i>
               </a>`
            : `${post.title}`;

        let coverImgHtml = '';
        let actualPreviewUrl = post.coverUrl;

        // 커버 이미지가 없지만 첨부파일이 이미지인 경우 프리뷰로 사용
        if (!actualPreviewUrl && post.fileUrl && post.fileUrl.match(/\.(jpeg|jpg|gif|png|webp|svg)/i)) {
            actualPreviewUrl = post.fileUrl;
        }

        if (actualPreviewUrl) {
            coverImgHtml = `
                <div class="resource-cover-modern" style="width: 100%; margin-bottom: 15px; border-radius: 8px; overflow: hidden; background: #f9f9f9; display: flex; justify-content: center; align-items: center; min-height: 200px;">
                    <img src="${actualPreviewUrl}" alt="${post.title}" style="max-width: 100%; max-height: 400px; object-fit: contain; box-shadow: 0 5px 15px rgba(0,0,0,0.1);">
                </div>
            `;
        }

        const showInfoCircle = !actualPreviewUrl && post.fileUrl;

        li.innerHTML = `
            <div class="resource-card-modern ${isBookstore ? 'book-card' : ''}" style="margin-bottom: 20px;">
                ${coverImgHtml}
                ${youtubeEmbedHtml}
                <div class="resource-content-padding">
                    <div class="resource-header-modern">
                        <div class="resource-tag-row">
                            <div style="display: flex; gap: 5px; flex-wrap: wrap;">
                                ${post.tags ? post.tags.map(tag => `<span class="resource-type-badge">${tag}</span>`).join('') : '<span class="resource-type-badge">자료</span>'}
                            </div>
                            <span class="resource-date-modern" style="margin-left: auto;">${date}</span>
                        </div>
                        <h4 class="resource-title-modern">
                            ${titleHtml}
                        </h4>
                        ${authorHtml}
                        ${adminButtons}
                    </div>
                    ${linkedContent.trim() || post.fileUrl ? `<div class="resource-body-modern">${linkedContent.trim() || (showInfoCircle ? '<span style="color:var(--secondary-color); font-size:0.9rem;"><i class="fas fa-info-circle"></i> 아래 첨부파일을 확인해주세요.</span>' : '')}</div>` : ''}
                    ${priceHtml}
                    ${isBookstore ? buyButtonHtml : fileLinkHtml}
                </div>
            </div>`;
        container.appendChild(li);
    }

    if (resourceCloseBtn && resourceModal) {
        resourceCloseBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            window.closeAllModals();
        });
    }

    // Load Public Recent Posts (Visitor View) with Infinite Scroll
    const recentLoadMoreTrigger = document.getElementById('recent-load-more');
    let lastRecentDoc = null;
    let isRecentLoading = false;
    let hasMoreRecent = true;

    // --- Mock Data Rendering Helper ---
    window.renderMockRecentPosts = () => {
        const grid = document.getElementById('recent-posts-grid');
        if (!grid) return;

        console.log("Rendering Mock Data...");
        grid.innerHTML = '';
        const mockData = [
            { title: "청교도 신학의 정수: 존 오웬의 성령론", cat: "청교도 신학", date: "2026.01.15" },
            { title: "현대 교회를 위한 웨스트민스터 신앙고백 해설", cat: "신앙고백", date: "2026.01.12" },
            { title: "고난 속의 위로: 리처드 십스의 상한 갈대", cat: "경건 서적", date: "2026.01.10" },
            { title: "설교란 무엇인가? 마틴 로이드 존스의 설교학", cat: "설교학", date: "2026.01.08" },
            { title: "가정 예배의 회복과 실제적인 지침", cat: "신자의 삶", date: "2026.01.05" },
            { title: "요한계시록 강해 시리즈 (1): 승리하신 그리스도", cat: "강해설교", date: "2026.01.01" }
        ];
        mockData.forEach(item => {
            const div = document.createElement('div');
            div.className = 'recent-card-premium';
            div.innerHTML = `
                <div class="recent-card-inner">
                    <div class="recent-card-top">
                        <span class="recent-status-pill">SAMPLE</span>
                        <span class="recent-category-tag">${item.cat}</span>
                    </div>
                    <h3 class="recent-title-premium">${item.title}</h3>
                    <div class="recent-card-footer">
                        <span class="recent-date-premium"><i class="far fa-calendar-alt"></i> ${item.date}</span>
                        <button class="recent-link-btn">
                            상세보기 <i class="fas fa-chevron-right"></i>
                        </button>
                    </div>
                </div>
            `;
            div.querySelector('.recent-card-inner').addEventListener('click', () => {
                if (window.openResourceModal) window.openResourceModal(item.cat);
            });
            grid.appendChild(div);
        });

        // 로딩바 숨김
        const trigger = document.getElementById('recent-load-more');
        if (trigger) trigger.style.display = 'none';
    };

    // --- Carousel Logic Start ---
    window.scrollCarousel = (id, offset) => {
        const carousel = document.getElementById(id);
        if (carousel) {
            carousel.scrollBy({ left: offset, behavior: 'smooth' });
        }
    };

    window.createCarouselCard = (post, docId) => {
        const date = post.createdAt ? (typeof post.createdAt.toDate === 'function' ? post.createdAt.toDate().toLocaleDateString() : '최근') : '최근';
        const displayCategory = post.tags ? post.tags[0] : '자료';
        let thumbUrl = post.coverUrl || 'images/puritan-study.png';

        const card = document.createElement('div');
        // Always add 'has-thumb' since we now have a default
        card.className = 'carousel-card has-thumb';
        card.style.backgroundImage = `url("${thumbUrl}")`;
        card.style.backgroundSize = 'cover';
        card.style.backgroundPosition = 'center';

        // PDF thumbnail logic (async override)
        // Only try to generate PDF thumb if no explicit coverUrl was provided
        if (!post.coverUrl && post.fileUrl && /(?:\.|%2E)pdf($|\?|#)/i.test(post.fileUrl)) {
            if (window.pdfjsLib) {
                const loadingTask = window.pdfjsLib.getDocument(post.fileUrl);
                loadingTask.promise.then(pdf => {
                    pdf.getPage(1).then(page => {
                        const scale = 0.5;
                        const viewport = page.getViewport({ scale });
                        const canvas = document.createElement('canvas');
                        const context = canvas.getContext('2d');
                        canvas.height = viewport.height;
                        canvas.width = viewport.width;

                        page.render({
                            canvasContext: context,
                            viewport: viewport
                        }).promise.then(() => {
                            const thumbnailUrl = canvas.toDataURL();
                            card.style.backgroundImage = `url("${thumbnailUrl}")`;
                        });
                    });
                }).catch(err => {
                    console.warn('PDF thumbnail failed, keeping default:', err);
                    // Default image is already set, so no action needed, 
                    // but we can ensure opacity/style if needed.
                });
            }
        }

        const wrapper = document.createElement('div');
        wrapper.className = 'carousel-item-wrapper';

        const contentDiv = document.createElement('div');
        contentDiv.className = 'carousel-bottom-content';
        contentDiv.innerHTML = `
            <div class="carousel-bottom-title">${post.title}</div>
            <div class="carousel-bottom-meta">${date}</div>
        `;

        wrapper.appendChild(card);
        wrapper.appendChild(contentDiv);

        wrapper.addEventListener('click', () => {
            if (window.openResourceModal) {
                window.openResourceModal(displayCategory, post.series || '', docId);
            }
        });
        return wrapper;
    };

    // PDF 썸네일을 카드 배경으로 렌더링하는 함수
    async function renderPdfThumbnailToCard(url, cardElement) {
        try {
            if (!cardElement) return;

            const loadingTask = pdfjsLib.getDocument(url);
            const pdf = await loadingTask.promise;
            const page = await pdf.getPage(1);

            const viewport = page.getViewport({ scale: 1.5 });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({ canvasContext: context, viewport: viewport }).promise;

            const imageUrl = canvas.toDataURL('image/png');
            cardElement.style.backgroundImage = `url("${imageUrl}")`;
            cardElement.style.backgroundSize = 'cover';
            cardElement.style.backgroundPosition = 'center';
            cardElement.style.color = 'white';
            cardElement.classList.add('has-thumb');

            // 태그와 버튼 스타일도 업데이트
            const tag = cardElement.querySelector('.carousel-card-tag');
            if (tag) tag.style.cssText = ''; // Rely on CSS class instead

            const meta = cardElement.querySelector('.carousel-card-meta span');
            if (meta) meta.style.color = 'rgba(255,255,255,0.8)';

            const btn = cardElement.querySelector('.carousel-icon-btn');
            if (btn) btn.style.cssText = 'background: white; color: var(--primary-color);';

            console.log('✅ PDF 카드 썸네일 렌더링 성공:', url);
        } catch (e) {
            console.warn("⚠️ PDF 카드 썸네일 렌더링 실패 (CORS 가능성):", e.message);
            // Fallback: Use a default placeholder if PDF rendering fails
            cardElement.style.backgroundImage = `url("images/puritan-study.png")`;
            cardElement.style.backgroundSize = 'cover';
            cardElement.style.backgroundPosition = 'center';
            cardElement.style.opacity = '0.8'; // Subtle look for placeholder
        }
    }

    // --- Mock Data Rendering for Carousel ---
    window.renderMockCarousels = () => {
        // 데이터를 2배로 늘려서 화면 꽉 차게 (8개 이상)
        const baseData = [
            { title: "청교도 신학의 정수: 존 오웬의 성령론", cat: "청교도 신학", date: "2026.01.15", series: "" },
            { title: "현대 교회를 위한 웨스트민스터 신앙고백 해설", cat: "신앙고백", date: "2026.01.12", series: "" },
            { title: "고난 속의 위로: 리처드 십스의 상한 갈대", cat: "경건 서적", date: "2026.01.10", series: "" },
            { title: "설교란 무엇인가? 마틴 로이드 존스의 설교학", cat: "설교학", date: "2026.01.08", series: "" },
            { title: "가정 예배의 회복과 실제적인 지침", cat: "신자의 삶", date: "2026.01.05", series: "" },
            { title: "은혜의 수단으로서의 기도", cat: "청교도 신학", date: "2026.01.03", series: "" },
            { title: "참된 회심의 성경적 표지", cat: "회심", date: "2026.01.01", series: "" },
            { title: "그리스도의 위격과 사역", cat: "기독론", date: "2025.12.28", series: "" }
        ];

        const mockData = baseData.map((item, index) => ({ ...item, id: `mock_new_${index}` }));

        const mockSermons = [
            { id: 'mock_s1', title: "요한계시록 강해 (1): 승리하신 그리스도", cat: "강해설교", date: "2026.01.01", series: "요한계시록 강해" },
            { id: 'mock_s2', title: "로마서 강해 (12): 이신칭의의 교리", cat: "강해설교", date: "2025.12.25", series: "로마서 강해" },
            { id: 'mock_s3', title: "산상수훈 강해 (5): 팔복의 의미", cat: "강해설교", date: "2025.12.20", series: "산상수훈 강해" },
            { id: 'mock_s4', title: "에베소서 강해 (3): 교회란 무엇인가", cat: "강해설교", date: "2025.12.15", series: "에베소서 강해" },
            { id: 'mock_s5', title: "시편 강해 (23): 목자되신 여호와", cat: "강해설교", date: "2025.12.10", series: "시편 강해" }
        ];
        // 설교도 좀 더 늘리고 랜덤으로 섞음
        const extendedSermons = [...mockSermons, ...mockSermons.map(s => ({ ...s, id: s.id + '_dup' }))].sort(() => 0.5 - Math.random());

        const populateTrack = (trackId, data) => {
            const track = document.getElementById(trackId);
            if (!track) return;
            track.innerHTML = '';
            data.forEach(item => {
                track.appendChild(createCarouselCard({
                    title: item.title,
                    tags: [item.cat],
                    createdAt: { toDate: () => new Date() }, // Mock date object
                    series: item.series,
                    content: 'Mock content'
                }, item.id));
            });
        };

        populateTrack('carousel-new', mockData);
        // "주제별 추천 자료"는 랜덤으로 섞어서 노출
        const shuffledMock = [...mockData].sort(() => 0.5 - Math.random());
        populateTrack('carousel-topic', shuffledMock);
        populateTrack('carousel-sermon', extendedSermons);
    };

    window.loadMainCarousels = async () => {
        // DB Check & Fallback
        if (!window.db) {
            window.renderMockCarousels();
            return;
        }

        try {
            // 전체 자료에서 충분히 랜덤하게 뽑기 위해 최대 2000개를 가져옴
            const snapshot = await window.db.collection("posts").orderBy("createdAt", "desc").limit(2000).get();
            if (snapshot.empty) {
                console.log("No posts found");
                return;
            }

            window.isDataLoaded = true;
            const allPosts = [];
            snapshot.forEach(doc => allPosts.push({ id: doc.id, data: doc.data() }));

            // 1. New Arrivals (무조건 최근 12개, 단 요청에 의해 특정 카테고리 제외)
            const newTrack = document.getElementById('carousel-new');
            const latestIds = new Set();
            if (newTrack) {
                newTrack.innerHTML = '';

                // [요청] 구속사적 성경주석, 세미나, 강의 제외
                const filteredLatest = allPosts.filter(item => {
                    const tags = item.data.tags || [];
                    const excluded = ['구속사적 성경주석', '세미나, 강의', '세미나', '강의'];
                    return !tags.some(tag => excluded.includes(tag));
                });

                filteredLatest.slice(0, 12).forEach(item => {
                    latestIds.add(item.id);
                    newTrack.appendChild(createCarouselCard(item.data, item.id));
                });
            }

            // 2. Featured Topics (강해설교가 아닌 것들 우선, 청교도 관련 주제 위주)
            const topicTrack = document.getElementById('carousel-topic');
            if (topicTrack) {
                topicTrack.innerHTML = '';
                const topicItems = allPosts.filter(item => {
                    const tags = item.data.tags || [];
                    // 강해가 아닌 일반 주제들 필터링 + 최신 자료와 중복 제거
                    return !tags.includes('강해') && !tags.includes('강해설교') && !tags.includes('설교') && !latestIds.has(item.id);
                });

                // 만약 일반 주제가 부족하면 전체에서 가져옴 (중복 제외)
                let displayTopics = topicItems.length >= 6 ? topicItems : allPosts.filter(item => {
                    const tags = item.data.tags || [];
                    return !tags.includes('강해') && !tags.includes('강해설교') && !latestIds.has(item.id);
                });

                // [추가] 추천 자료 줄은 랜덤으로 섞어서 노출
                displayTopics = [...displayTopics].sort(() => 0.5 - Math.random());

                displayTopics.slice(0, 12).forEach(item => {
                    topicTrack.appendChild(createCarouselCard(item.data, item.id));
                });
            }

            // 3. Recommended Materials (랜덤 추천 자료)
            const sermonTrack = document.getElementById('carousel-sermon');
            if (sermonTrack) {
                sermonTrack.innerHTML = '';
                // 무작위 추천을 위해 상위 30개는 무조건 배제하고, PDF 자료들을 필터링
                let recommendedItems = allPosts.slice(30).filter(item => {
                    const url = item.data.fileUrl || "";
                    return /(?:\.|%2E)pdf($|\?|#)/i.test(url);
                });

                if (recommendedItems.length < 10) {
                    // 상위 30개를 제외하니 너무 적으면, 상위 12개만 제외하고 다시 시도
                    recommendedItems = allPosts.slice(12).filter(item => {
                        const url = item.data.fileUrl || "";
                        return /(?:\.|%2E)pdf($|\?|#)/i.test(url);
                    });
                }

                if (recommendedItems.length < 5) {
                    // PDF 자료가 너무 적으면 중복(최근 자료)를 허용해서라도 PDF만 가져옴
                    recommendedItems = allPosts.filter(item => {
                        const url = item.data.fileUrl || "";
                        return /(?:\.|%2E)pdf($|\?|#)/i.test(url);
                    });
                }

                // 무작위 섞기
                const shuffledRecs = [...recommendedItems].sort(() => 0.5 - Math.random());

                shuffledRecs.slice(0, 20).forEach(item => {
                    sermonTrack.appendChild(createCarouselCard(item.data, item.id));
                });
            }

        } catch (e) {
            console.error("Load Carousels Error:", e);
            window.renderMockCarousels();
        }
    };

    // Set up Infinite Scroll Observer removed to keep main page clean (limit 4)

    // Initial Load
    // Initial Load
    console.log("Initializing carousels directly...");
    setTimeout(loadMainCarousels, 150);

    // Real Search Logic
    const searchInput = document.querySelector('.search-bar input');

    const performSearch = async (query) => {
        if (!query) return;
        if (!resourceModal) return;

        window.openModal(resourceModal);
        resourceModalTitle.textContent = `'${query}' 검색 결과`;
        resourceListContainer.innerHTML = '<li class="no-resource-msg">검색 중입니다...</li>';

        try {
            const snapshot = await db.collection("posts")
                .where('title', '>=', query)
                .where('title', '<=', query + '\uf8ff')
                .get();

            if (snapshot.empty) {
                resourceListContainer.innerHTML = '<li class="no-resource-msg">검색 결과가 없습니다.</li>';
                return;
            }

            resourceListContainer.innerHTML = '';
            snapshot.forEach(doc => {
                const post = { id: doc.id, ...doc.data() };
                renderSingleResource(post, resourceListContainer);
            });

        } catch (error) {
            console.error("Search Error: ", error);
            resourceListContainer.innerHTML = `<li class="no-resource-msg">검색 중 오류가 발생했습니다.<br>(${error.message})</li>`;
        }
    };

    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch(searchInput.value.trim());
            }
        });
        const searchIcon = document.querySelector('.search-icon');
        if (searchIcon) {
            searchIcon.addEventListener('click', () => performSearch(searchInput.value.trim()));
        }
    }

    // --- Global View Functions (Moved here for scope) ---
    window.openAllRecentModal = async () => {
        if (!resourceModal) return;
        window.openModal(resourceModal);
        resourceModalTitle.textContent = `최신 업데이트 전체 목록`;
        resourceListContainer.innerHTML = '<li class="no-resource-msg">최신 자료를 불러오는 중입니다...</li>';
        resourceListContainer.classList.add('compact-view'); // 숲을 볼 수 있게 콤팩트하게 표시

        try {
            const snapshot = await db.collection("posts")
                .orderBy("createdAt", "desc")
                .limit(200)
                .get();

            if (snapshot.empty) {
                resourceListContainer.innerHTML = '<li class="no-resource-msg">최신 자료가 없습니다.</li>';
                return;
            }

            resourceListContainer.innerHTML = '';

            // 전체보기 모달에서도 관리자 기능을 위해 UI 설정 로직 추가
            const adminHeader = document.getElementById('resource-modal-admin-header');
            const modalUploadForm = document.getElementById('modal-upload-form');
            if (adminHeader) {
                if (typeof isAdmin !== 'undefined' && isAdmin) {
                    adminHeader.style.display = 'block';
                    modalUploadForm.style.display = 'none';
                } else {
                    adminHeader.style.display = 'none';
                }
            }
            snapshot.forEach(doc => {
                const data = doc.data();
                const tags = data.tags || [];
                const excluded = ['구속사적 성경주석', '세미나, 강의', '세미나', '강의'];
                if (tags.some(tag => excluded.includes(tag))) {
                    return;
                }
                const post = { id: doc.id, ...data };
                renderSingleResource(post, resourceListContainer);
            });

            // 스크롤을 맨 위로
            resourceListContainer.parentElement.scrollTop = 0;
        } catch (e) {
            console.error(e);
            resourceListContainer.innerHTML = '<li class="no-resource-msg">자료를 불러오는 중에 오류가 발생했습니다.</li>';
        }
    };


    window.openAllTopicsModal = () => {
        if (!resourceModal) return;
        window.openModal(resourceModal);
        resourceListContainer.classList.remove('compact-view');
        resourceModalTitle.textContent = `전체 주제 목록`;

        // 검색/카테고리 선택 모달에서는 업로드 헤더 숨김
        const adminHeader = document.getElementById('resource-modal-admin-header');
        if (adminHeader) adminHeader.style.display = 'none';

        // 정렬
        const sortedTopics = [...topics].sort((a, b) => a.localeCompare(b, 'ko'));

        // 그룹화
        const groups = {};
        sortedTopics.forEach(item => {
            const initial = getInitialConsonant(item);
            if (!groups[initial]) groups[initial] = [];
            groups[initial].push(item);
        });

        const consonants = Object.keys(groups).sort();

        // UI 생성
        resourceListContainer.innerHTML = `
            <div class="modal-nav-container">
                <div class="modal-content-scroll" id="modal-topic-scroll">
                    <div class="main-grid-container" id="modal-topic-grid"></div>
                </div>
                <div class="modal-index-nav" id="modal-topic-index"></div>
            </div>
        `;

        const grid = document.getElementById('modal-topic-grid');
        const indexNav = document.getElementById('modal-topic-index');
        const scrollContainer = document.getElementById('modal-topic-scroll');

        consonants.forEach(consonant => {
            // 인덱스 바 추가
            const span = document.createElement('span');
            span.textContent = consonant;
            span.addEventListener('click', () => {
                const header = document.getElementById(`header-topic-${consonant}`);
                if (header) {
                    scrollContainer.scrollTo({
                        top: header.offsetTop - 10,
                        behavior: 'smooth'
                    });
                }
            });
            indexNav.appendChild(span);

            // 섹션 헤더 추가
            const header = document.createElement('div');
            header.className = 'modal-section-header';
            header.id = `header-topic-${consonant}`;
            header.textContent = consonant;
            grid.appendChild(header);

            // 항목 추가
            groups[consonant].forEach(item => {
                const div = document.createElement('div');
                div.className = 'main-grid-item';
                div.innerHTML = `
                    <i class="fas fa-tags"></i>
                    <span>${item}</span>
                `;
                div.addEventListener('click', () => {
                    openResourceModal(item);
                });
                grid.appendChild(div);
            });
        });
    };

    window.openAllAuthorsModal = () => {
        alert("이 기능은 더 이상 사용되지 않습니다.");
    };



    // --- Order Management Support Logic ---

    window.updateOrderSubSelect = async () => {
        const type = document.getElementById('order-type-select').value;
        const valueSelect = document.getElementById('order-value-select');
        if (!valueSelect) return;

        valueSelect.innerHTML = '<option value="">-- 로딩 중... --</option>';

        if (!type) {
            valueSelect.innerHTML = '<option value="">-- 먼저 대분류를 선택하세요 --</option>';
            return;
        }

        try {
            let items = [];
            if (type === 'topic') items = topics;
            else if (type === 'author') items = authors;
            else if (type === 'category') items = ['기타', '도서 목록', '전도 소책자', '강해설교'];
            else if (type === 'series') {
                // Fetch unique series names from Firestore
                const snapshot = await db.collection("posts").get();
                const seriesSet = new Set();
                snapshot.forEach(doc => {
                    const data = doc.data();
                    const s = data.series;
                    if (s && s.trim()) seriesSet.add(s.trim());
                    else if (data.tags && data.tags.includes('강해설교')) seriesSet.add('기타 단편 설교');
                });
                items = Array.from(seriesSet).sort((a, b) => a.trim().localeCompare(b.trim(), 'ko', { numeric: true, sensitivity: 'base' }));
            } else if (type === 'recent') {
                items = ['메인 홈 최근 업데이트 (전체)'];
            }

            valueSelect.innerHTML = '<option value="">-- 상세 항목 선택 --</option>';
            items.forEach(item => {
                const opt = document.createElement('option');
                opt.value = item;
                opt.textContent = item;
                valueSelect.appendChild(opt);
            });
        } catch (err) {
            console.error(err);
            valueSelect.innerHTML = '<option value="">-- 로딩 실패 --</option>';
        }
    };

    /**
     * [Refactored API] 공통 순서 변경 함수
     * @param {string} collectionName - Firestore 컬렉션 이름 (tableName 대응)
     * @param {string} orderField - 변경할 순서 필드명
     * @param {Array} orderedIds - 순서대로 정렬된 ID 배열
     */
    window.reorderByIds = async (collectionName, orderField, orderedIds) => {
        if (!orderedIds || orderedIds.length === 0) return;
        const batch = db.batch();
        orderedIds.forEach((id, index) => {
            const ref = db.collection(collectionName).doc(id);
            batch.update(ref, { [orderField]: index });
        });
        return await batch.commit();
    };

    window.loadOrderItems = async () => {
        const type = document.getElementById('order-type-select').value;
        const value = document.getElementById('order-value-select').value;
        const container = document.getElementById('order-items-container');
        const saveBtn = document.getElementById('save-order-btn');

        if (!type || !value) {
            alert("분류와 상세 항목을 모두 선택해주세요.");
            return;
        }

        container.innerHTML = '<p class="loading-msg" style="text-align:center; padding: 50px;">자료를 불러오는 중입니다...</p>';
        if (saveBtn) saveBtn.style.display = 'none';

        try {
            let query = db.collection("posts");
            let posts = [];

            if (type === 'topic' || type === 'author' || type === 'category') {
                const snapshot = await query.where("tags", "array-contains", value).get();
                snapshot.forEach(doc => posts.push({ id: doc.id, ...doc.data() }));
            } else if (type === 'series') {
                if (value === '기타 단편 설교') {
                    // Fetch all sermon posts and filter by empty series
                    const snapshot = await query.where("tags", "array-contains", "강해설교").get();
                    snapshot.forEach(doc => {
                        const d = doc.data();
                        if (!d.series || d.series.trim() === "" || d.series === "기타 단편 설교") {
                            posts.push({ id: doc.id, ...d });
                        }
                    });
                } else {
                    const snapshot = await query.where("series", "==", value).get();
                    snapshot.forEach(doc => posts.push({ id: doc.id, ...doc.data() }));
                }
            } else if (type === 'recent') {
                // Fetch recent 50 posts to allow reordering
                const snapshot = await query.orderBy("createdAt", "desc").limit(50).get();
                snapshot.forEach(doc => posts.push({ id: doc.id, ...doc.data() }));
            }

            if (posts.length === 0) {
                container.innerHTML = '<p style="text-align:center; color:#999; padding:50px;">해당하는 자료가 없습니다.</p>';
                return;
            }

            // Sort by manual order first, then date desc
            posts.sort((a, b) => {
                const orderA = type === 'recent' ? (a.recent_order ?? 999999) : (a.order || 0);
                const orderB = type === 'recent' ? (b.recent_order ?? 999999) : (b.order || 0);

                if (orderA !== orderB) return orderA - orderB;
                return (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
            });

            container.innerHTML = '';
            const list = document.createElement('ul');
            list.id = 'draggable-order-list';
            list.style.cssText = 'list-style: none; padding: 0; margin: 0;';

            posts.forEach(post => {
                const li = document.createElement('li');
                li.className = 'order-item';
                li.setAttribute('data-id', post.id);
                li.style.cssText = 'background: white; border: 1px solid #eee; margin-bottom: 10px; padding: 15px; border-radius: 10px; display: flex; align-items: center; gap: 15px; cursor: move; transition: all 0.2s; box-shadow: 0 2px 5px rgba(0,0,0,0.02);';

                // Hover effect logic
                li.onmouseover = () => { li.style.borderColor = '#1abc9c'; li.style.background = '#f0fdfa'; };
                li.onmouseout = () => { li.style.borderColor = '#eee'; li.style.background = 'white'; };

                const date = post.createdAt ? post.createdAt.toDate().toLocaleDateString() : '날짜 없음';
                li.innerHTML = `
                    <div style="color: #cbd5e0;"><i class="fas fa-grip-vertical" style="font-size: 1.2rem;"></i></div>
                    <div style="flex: 1;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <strong style="font-size: 1rem; color: #2d3748;">${post.title}</strong>
                            <span style="background: #edf2f7; color: #4a5568; padding: 2px 8px; border-radius: 12px; font-size: 0.75rem; font-weight: 600;">
                                # ${type === 'recent' ? (post.recent_order ?? 'N/A') : (post.order || 0)}
                            </span>
                        </div>
                        <div style="font-size: 0.8rem; color: #a0aec0; margin-top: 5px;">
                            <span><i class="far fa-calendar-alt"></i> ${date}</span>
                            ${post.series ? `<span style="margin-left: 10px;"><i class="far fa-folder"></i> ${post.series}</span>` : ''}
                        </div>
                    </div>
                `;
                list.appendChild(li);
            });

            container.appendChild(list);
            if (saveBtn) saveBtn.style.display = 'block';

            // Initialize Sortable
            if (typeof Sortable !== 'undefined') {
                new Sortable(list, {
                    animation: 150,
                    ghostClass: 'sortable-ghost',
                    onStart: () => {
                        if (saveBtn) saveBtn.style.opacity = '0.5';
                    },
                    onEnd: () => {
                        if (saveBtn) saveBtn.style.opacity = '1';
                    }
                });
            }
        } catch (err) {
            console.error(err);
            container.innerHTML = '<p style="color:red; text-align:center; padding:50px;">자료 로딩 중 오류가 발생했습니다.<br>' + err.message + '</p>';
        }
    };

    window.saveCurrentOrder = async () => {
        const listItems = document.querySelectorAll('#draggable-order-list li');
        if (listItems.length === 0) return;

        if (!confirm(`${listItems.length}개 자료의 순서를 현재 드래그하신 순서대로 저장하시겠습니까?`)) return;

        const saveBtn = document.getElementById('save-order-btn');
        const originalHtml = saveBtn.innerHTML;
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 저장 중...';

        try {
            const type = document.getElementById('order-type-select').value;
            const orderField = type === 'recent' ? 'recent_order' : 'order';

            const ids = Array.from(listItems).map(item => item.getAttribute('data-id'));
            await window.reorderByIds("posts", orderField, ids);
            alert("✅ 순서가 성공적으로 저장되었습니다!");
            window.loadOrderItems(); // Refresh view

            // Other lists refresh
            if (window.loadAdminPosts) window.loadAdminPosts();
            if (window.loadRecentPostsGrid) window.loadRecentPostsGrid();
        } catch (err) {
            console.error(err);
            alert("❌ 저장 실패: " + err.message);
        } finally {
            saveBtn.disabled = false;
            saveBtn.innerHTML = originalHtml;
        }
    };

    /**
     * 최근 업로드 정렬 모드 토글
     */
    let recentSortableInstance = null;
    window.toggleRecentOrderMode = () => {
        const list = document.getElementById('admin-recent-posts');
        const toggleBtn = document.getElementById('btn-toggle-recent-order');
        const saveBtn = document.getElementById('btn-save-recent-order');

        const isEditing = list.classList.toggle('reorder-mode');

        if (isEditing) {
            toggleBtn.innerHTML = '<i class="fas fa-times"></i> 순서 변경 취소';
            toggleBtn.style.background = '#e74c3c';
            saveBtn.style.display = 'block';
            list.style.cursor = 'move';

            // Highlight items that can be dragged
            list.querySelectorAll('.post-item').forEach(li => {
                li.style.border = '2px dashed #0a7c68';
                li.style.background = '#f0fdfa';
            });

            if (typeof Sortable !== 'undefined') {
                recentSortableInstance = new Sortable(list, {
                    animation: 150,
                    ghostClass: 'sortable-ghost',
                    draggable: '.post-item'
                });
            }
        } else {
            toggleBtn.innerHTML = '<i class="fas fa-sort"></i> 순서 변경 시작';
            toggleBtn.style.background = '#666';
            saveBtn.style.display = 'none';
            list.style.cursor = 'default';

            list.querySelectorAll('.post-item').forEach(li => {
                li.style.border = 'none';
                li.style.background = '';
            });

            if (recentSortableInstance) {
                recentSortableInstance.destroy();
                recentSortableInstance = null;
            }
            // Reset list via refresh
            if (window.loadAdminPosts) window.loadAdminPosts();
        }
    };

    /**
     * 최근 업로드 정렬 순서 저장 [API 대용]
     */
    window.saveRecentOrder = async () => {
        const list = document.getElementById('admin-recent-posts');
        const listItems = list.querySelectorAll('.post-item');
        if (listItems.length === 0) return;

        if (!confirm('최근 업로드 순서를 현재 순서대로 저장하시겠습니까?')) return;

        const saveBtn = document.getElementById('btn-save-recent-order');
        const originalHtml = saveBtn.innerHTML;
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 저장...';

        try {
            const ids = Array.from(listItems).map(li => {
                // li 내부의 버튼 onclick에서 ID 추출하거나 data-id 속성 필요
                // loadAdminPosts 수정 필요 (data-id 추가)
                return li.getAttribute('data-id');
            });

            await window.reorderByIds("posts", "recent_order", ids);
            alert("✅ 최근 업로드 순서가 저장되었습니다.");

            // 토글 해제 및 새로고침
            window.toggleRecentOrderMode();
            if (window.loadRecentPostsGrid) window.loadRecentPostsGrid(); // 메인 홈 그리드도 영향 받을 수 있음
        } catch (err) {
            console.error(err);
            alert("❌ 저장 실패");
        } finally {
            saveBtn.disabled = false;
            saveBtn.innerHTML = originalHtml;
        }
    };

});

// End of main.js (BGM logic moved to bgm.js)

