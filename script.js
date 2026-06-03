document.addEventListener('DOMContentLoaded', () => {

    // 0. MOBILE & PERFORMANCE DETECTION
    const isMobile = window.matchMedia("(max-width: 900px)").matches || 
                     ('ontouchstart' in window) || 
                     (navigator.maxTouchPoints > 0);

    if (isMobile) {
        document.body.classList.add('is-mobile');
    }

    // Immediately show site content (no false preloader delays)
    document.body.classList.add('loaded');

    // 1. VANTA FOG BACKGROUND (DESKTOP ONLY FOR BATTERY & PERFORMANCE)
    let vantaEffect = null;
    if (!isMobile) {
        try {
            if (window.VANTA) {
                vantaEffect = VANTA.FOG({
                    el: "#vanta-bg",
                    mouseControls: true,
                    touchControls: false,
                    gyroControls: false,
                    minHeight: 200.00,
                    minWidth: 200.00,
                    highlightColor: 0x00f3ff,
                    midtoneColor: 0x0a0515, // Violet tone midtone
                    lowlightColor: 0x000000,
                    baseColor: 0x050505,
                    blurFactor: 0.5,
                    speed: 1.2,
                    zoom: 0.95
                });
            }
        } catch (e) { 
            console.warn("Vanta.js failed to initialize:", e); 
        }
    }

    // 2. ROUTER & NAVEGACIÓN
    const pages = ['home', 'work', 'about', 'contact'];
    
    window.router = {
        navigate: function(pageId) {
            const targetView = document.getElementById(`view-${pageId}`);
            if (targetView) targetView.scrollTop = 0;
            
            document.querySelectorAll('.nav-item').forEach(el => {
                el.classList.remove('active');
                if (el.dataset.target === pageId) el.classList.add('active');
            });

            pages.forEach(p => {
                const el = document.getElementById(`view-${p}`);
                if (p === pageId) {
                    el.classList.remove('hidden-view');
                    // Small delay to trigger transition opacity
                    setTimeout(() => el.classList.add('active-view'), 20);
                } else {
                    el.classList.remove('active-view');
                    setTimeout(() => el.classList.add('hidden-view'), 600);
                }
            });
        }
    };

    window.ui = {
        toggleLang: function() {
            const wrapper = document.querySelector('.lang-toggle-wrapper');
            const enSpan = document.querySelector('.lang-option.en');
            const esSpan = document.querySelector('.lang-option.es');
            
            if (wrapper.classList.contains('es-active')) {
                wrapper.classList.remove('es-active');
                enSpan.classList.add('active');
                esSpan.classList.remove('active');
                updateText('en');
            } else {
                wrapper.classList.add('es-active');
                enSpan.classList.remove('active');
                esSpan.classList.add('active');
                updateText('es');
            }
        },

        // --- VISOR TÁCTICO (LIGHTBOX) ---
        openLightbox: function(src) {
            const lightbox = document.getElementById('cyber-lightbox');
            const img = document.getElementById('lightbox-img');
            img.src = src;
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden'; // Lock background scroll
        },

        closeLightbox: function() {
            const lightbox = document.getElementById('cyber-lightbox');
            lightbox.classList.remove('active');
            document.body.style.overflow = ''; // Release scroll
            setTimeout(() => {
                document.getElementById('lightbox-img').src = "";
            }, 300);
        },

        // --- MENÚ MÓVIL (HAMBURGER ANIMADO) ---
        toggleMobileMenu: function() {
            const menu = document.getElementById('mobile-menu');
            const btn = document.querySelector('.mobile-menu-btn');
            if (menu) {
                menu.classList.toggle('active');
                btn.classList.toggle('active');
            }
        }
    };

    function updateText(lang) {
        document.querySelectorAll('.lang').forEach(item => {
            const txt = item.getAttribute(`data-${lang}`);
            if (txt) item.innerHTML = txt;
        });
        
        document.querySelectorAll('input, textarea').forEach(input => {
            if (lang === 'es') {
                if (input.name === 'name') input.placeholder = 'IDENTIFICADOR (NOMBRE)';
                if (input.name === 'email') input.placeholder = 'DIRECCIÓN DE CORREO (EMAIL)';
                if (input.name === 'message') input.placeholder = 'CARGA DE DATOS (MENSAJE)';
            } else {
                if (input.name === 'name') input.placeholder = 'IDENTIFIER (NAME)';
                if (input.name === 'email') input.placeholder = 'RETURN ADDRESS (EMAIL)';
                if (input.name === 'message') input.placeholder = 'DATA PAYLOAD (MESSAGE)';
            }
        });

        // Update document lang attribute
        document.documentElement.lang = lang;
    }

    // 3. CURSOR PERSONALIZADO & EFECTOS HOVER (DESKTOP ONLY)
    const dot = document.querySelector('.cursor-dot');
    const out = document.querySelector('.cursor-outline');

    if (!isMobile && dot && out) {
        window.addEventListener('mousemove', (e) => {
            const x = e.clientX;
            const y = e.clientY;
            dot.style.left = `${x}px`; 
            dot.style.top = `${y}px`;
            out.animate({ left: `${x}px`, top: `${y}px` }, { duration: 350, fill: "forwards" });
        });

        document.querySelectorAll('a, button, .nav-item, input, textarea, .lang-toggle-wrapper, .logo-container, .work-img').forEach(el => {
            el.addEventListener('mouseenter', () => {
                out.style.transform = 'translate(-50%, -50%) scale(1.5)';
                out.style.background = 'rgba(0, 243, 255, 0.08)';
                out.style.borderColor = 'var(--accent-cyan)';
            });
            el.addEventListener('mouseleave', () => {
                out.style.transform = 'translate(-50%, -50%) scale(1)';
                out.style.background = 'transparent';
                out.style.borderColor = 'var(--accent-cyan)';
            });
        });
    }

    // 4. ACCESSIBILITY - KEYBOARD SHORTCUTS
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            // Close lightbox
            const lightbox = document.getElementById('cyber-lightbox');
            if (lightbox && lightbox.classList.contains('active')) {
                ui.closeLightbox();
            }
            // Close mobile menu
            const menu = document.getElementById('mobile-menu');
            if (menu && menu.classList.contains('active')) {
                ui.toggleMobileMenu();
            }
        }
    });

    // 5. TOAST NOTIFICATION UTILITY
    window.showToast = function(msg) {
        const toast = document.getElementById('toast');
        const toastMsg = document.getElementById('toast-msg');
        if (toast && toastMsg) {
            toastMsg.innerText = msg;
            toast.classList.remove('hidden');
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.classList.add('hidden'), 500);
            }, 3000);
        }
    };

    // Clean memory if window unloaded
    window.addEventListener('unload', () => {
        if (vantaEffect) vantaEffect.destroy();
    });

});