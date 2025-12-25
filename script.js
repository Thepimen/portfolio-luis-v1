document.addEventListener('DOMContentLoaded', () => {

    // 0. LOADER FALSO
    const loaderText = document.querySelector('.loader-per');
    let load = 0;
    const interval = setInterval(() => {
        load += Math.floor(Math.random() * 20);
        if(load > 100) load = 100;
        loaderText.innerText = load + '%';
        if(load === 100) {
            clearInterval(interval);
            setTimeout(() => {
                document.body.classList.add('loaded');
            }, 500);
        }
    }, 100);

    // 1. VANTA FOG BACKGROUND
    try {
        if (window.VANTA) {
            VANTA.FOG({
                el: "#vanta-bg",
                mouseControls: true, touchControls: true, gyroControls: false,
                minHeight: 200.00, minWidth: 200.00,
                highlightColor: 0x00f3ff,
                midtoneColor: 0x050505,
                lowlightColor: 0x000000,
                baseColor: 0x000000,
                blurFactor: 0.6,
                speed: 1.5,
                zoom: 0.8
            })
        }
    } catch (e) { console.log(e) }

    // 2. ROUTER & LÓGICA DE NAVEGACIÓN
    const pages = ['home', 'work', 'about', 'contact'];
    
    window.router = {
        navigate: function(pageId) {
            const targetView = document.getElementById(`view-${pageId}`);
            if(targetView) targetView.scrollTop = 0;
            
            document.querySelectorAll('.nav-item').forEach(el => {
                el.classList.remove('active');
                if(el.dataset.target === pageId) el.classList.add('active');
            });

            pages.forEach(p => {
                const el = document.getElementById(`view-${p}`);
                if(p === pageId) {
                    el.classList.remove('hidden-view');
                    setTimeout(() => el.classList.add('active-view'), 10);
                } else {
                    el.classList.remove('active-view');
                    setTimeout(() => el.classList.add('hidden-view'), 800);
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

        // --- LÓGICA DEL VISOR TÁCTICO (LIGHTBOX) ---
        openLightbox: function(src) {
            const lightbox = document.getElementById('cyber-lightbox');
            const img = document.getElementById('lightbox-img');
            
            img.src = src;
            lightbox.classList.add('active');
        },

        closeLightbox: function() {
            const lightbox = document.getElementById('cyber-lightbox');
            lightbox.classList.remove('active');
            
            setTimeout(() => {
                document.getElementById('lightbox-img').src = "";
            }, 300);
        }
    };

    function updateText(lang) {
        document.querySelectorAll('.lang').forEach(item => {
            const txt = item.getAttribute(`data-${lang}`);
            if(txt) item.innerHTML = txt;
        });
        
        document.querySelectorAll('input, textarea').forEach(input => {
            if(lang === 'es' && input.name === 'name') input.placeholder = 'IDENTIFICADOR (NOMBRE)';
            if(lang === 'en' && input.name === 'name') input.placeholder = 'IDENTIFIER (NAME)';
            if(lang === 'es' && input.name === 'email') input.placeholder = 'DIRECCIÓN DE RETORNO (EMAIL)';
            if(lang === 'en' && input.name === 'email') input.placeholder = 'RETURN ADDRESS (EMAIL)';
            if(lang === 'es' && input.name === 'message') input.placeholder = 'CARGA DE DATOS (MENSAJE)';
            if(lang === 'en' && input.name === 'message') input.placeholder = 'DATA PAYLOAD (MESSAGE)';
        });
    }

    // 3. CURSOR PERSONALIZADO & EFECTOS HOVER
    const dot = document.querySelector('.cursor-dot');
    const out = document.querySelector('.cursor-outline');

    if (window.matchMedia("(min-width: 992px)").matches) {
        window.addEventListener('mousemove', (e) => {
            const x = e.clientX;
            const y = e.clientY;
            dot.style.left = `${x}px`; dot.style.top = `${y}px`;
            out.animate({ left: `${x}px`, top: `${y}px` }, { duration: 500, fill: "forwards" });
        });

        document.querySelectorAll('a, button, .nav-item, input, .lang-toggle-wrapper, .logo-container').forEach(el => {
            el.addEventListener('mouseenter', () => {
                out.style.transform = 'translate(-50%, -50%) scale(1.5)';
                out.style.background = 'rgba(0,243,255,0.1)';
            });
            el.addEventListener('mouseleave', () => {
                out.style.transform = 'translate(-50%, -50%) scale(1)';
                out.style.background = 'transparent';
            });
        });
    }

});