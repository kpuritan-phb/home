import works from './works.js';

document.addEventListener('DOMContentLoaded', () => {

    // --- Loading Animation (Simple Fade In) ---
    gsap.from("header", {
        y: -50,
        opacity: 0,
        duration: 1,
        ease: "power3.out",
        delay: 0.5
    });

    // --- Scroll Animations (Reveal Text) ---
    const heroTexts = document.querySelectorAll('.hero .reveal-text');
    gsap.fromTo(heroTexts,
        { y: 100, opacity: 0 },
        {
            y: 0,
            opacity: 1,
            duration: 1.2,
            stagger: 0.2,
            ease: "power3.out",
            delay: 0.2
        }
    );

    const revealElements = document.querySelectorAll('.reveal-text:not(.hero .reveal-text)');

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

    // --- Works Logic ---
    const worksGrid = document.getElementById('works-grid');
    const filterItems = document.querySelectorAll('.filter-item');
    const modal = document.getElementById('video-modal');
    const modalIframe = document.getElementById('modal-iframe');
    const modalTitle = document.getElementById('modal-title');
    const modalClient = document.getElementById('modal-client');
    const modalDesc = document.getElementById('modal-desc');
    const closeModal = document.querySelector('.close-modal');

    function renderWorks(filter = 'ALL') {
        worksGrid.innerHTML = '';

        const filteredWorks = filter === 'ALL'
            ? works
            : works.filter(work => work.category === filter);

        filteredWorks.forEach(work => {
            const workItem = document.createElement('div');
            workItem.className = 'work-item reveal-text';
            workItem.innerHTML = `
                <img src="${work.thumbnail}" alt="${work.title}">
                <div class="work-overlay">
                    <h3 class="work-title-inner">${work.title}</h3>
                    <p class="work-client-inner">${work.client}</p>
                </div>
            `;

            workItem.addEventListener('click', () => openModal(work));
            worksGrid.appendChild(workItem);

            // Re-observe for animation
            sectionObserver.observe(workItem);
        });
    }

    function openModal(work) {
        modalTitle.textContent = work.title;
        modalClient.textContent = work.client;
        modalDesc.textContent = work.description;
        modalIframe.src = work.videoUrl;
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden'; // Prevent scroll
    }

    function hideModal() {
        modal.style.display = 'none';
        modalIframe.src = '';
        document.body.style.overflow = 'auto';
    }

    closeModal.addEventListener('click', hideModal);
    window.addEventListener('click', (e) => {
        if (e.target === modal) hideModal();
    });

    filterItems.forEach(item => {
        item.addEventListener('click', () => {
            filterItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            renderWorks(item.dataset.filter);
        });
    });

    // Initial Render
    renderWorks();

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
