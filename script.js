document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. VANTA 3D BACKGROUND ---
    try {
        if (window.VANTA) {
            VANTA.NET({
                el: "#vanta-bg",
                mouseControls: true, touchControls: true, gyroControls: false,
                minHeight: 200.00, minWidth: 200.00, scale: 1.00, scaleMobile: 1.00,
                color: 0x64ffda, backgroundColor: 0x0a192f, points: 12.00, maxDistance: 21.00, spacing: 17.00
            })
        }
    } catch (e) { console.log("Error loading Vanta:", e); }

    // --- 2. CUSTOM CURSOR ---
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');
    let mouseX = 0, mouseY = 0, outlineX = 0, outlineY = 0;

    if (window.matchMedia("(min-width: 768px)").matches) {
        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX; mouseY = e.clientY;
            cursorDot.style.left = `${mouseX}px`; cursorDot.style.top = `${mouseY}px`;
        });
        const animateCursor = () => {
            outlineX += (mouseX - outlineX) * 0.15; outlineY += (mouseY - outlineY) * 0.15;
            cursorOutline.style.left = `${outlineX}px`; cursorOutline.style.top = `${outlineY}px`;
            requestAnimationFrame(animateCursor);
        };
        animateCursor();
    }

    // --- 3. LANGUAGE SWITCH LOGIC ---
    const langToggle = document.getElementById('language-toggle');
    let currentLang = 'en'; // Default English

    const textData = {
        en: {
            typewriter: "I build secure systems & data solutions.",
            terminal: `
<span class="green-text">root@madrid:~$</span> ./load_profile.sh<br>
> Name: Luis Lázaro Pimentel<br>
> Age: 21 years old<br>
> Role: Cybersecurity & Dev<br>
> Status: <span class="green-text">Open to Work</span><br><br>
<span class="green-text">root@madrid:~$</span> cat description.txt<br>
I am obsessed with system integrity. While I build modern web interfaces, my core skills lie in <strong>Low-level Programming (C)</strong> and <strong>Data Science</strong>.
            `
        },
        es: {
            typewriter: "Construyo sistemas seguros y datos.",
            terminal: `
<span class="green-text">root@madrid:~$</span> ./cargar_perfil.sh<br>
> Nombre: Luis Lázaro Pimentel<br>
> Edad: 21 años<br>
> Rol: Ciberseguridad y Desarrollo<br>
> Estado: <span class="green-text">Disponible</span><br><br>
<span class="green-text">root@madrid:~$</span> cat descripcion.txt<br>
Me obsesiona la integridad del sistema. Aunque creo interfaces modernas, mis habilidades principales son <strong>Programación de Bajo Nivel (C)</strong> y <strong>Ciencia de Datos</strong>.
            `
        }
    };

    function updateLanguage(lang) {
        currentLang = lang;
        // Update static text
        document.querySelectorAll('.lang').forEach(el => {
            const newText = el.getAttribute(`data-${lang}`);
            if (newText) el.innerHTML = newText;
        });
        // Reset Typewriter
        const typeEl = document.getElementById('typewriter');
        if (typeEl) {
            typeEl.innerHTML = ""; i = 0; typeWriterHero();
        }
        // Update Terminal
        const termEl = document.getElementById('terminal-text');
        if (termEl) termEl.innerHTML = textData[lang].terminal;
    }

    if(langToggle) {
        langToggle.addEventListener('change', () => {
            updateLanguage(langToggle.checked ? 'es' : 'en');
        });
    }

    // --- 4. TYPEWRITER EFFECT ---
    let i = 0;
    function typeWriterHero() {
        const text = textData[currentLang].typewriter;
        const target = document.getElementById('typewriter');
        if (target && i < text.length) {
            target.innerHTML += text.charAt(i); i++;
            setTimeout(typeWriterHero, 50); 
        }
    }
    setTimeout(typeWriterHero, 1000);

    // --- 5. SCROLL ANIMATION ---
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show-section');
                if (entry.target.id === 'about') {
                    // Load terminal text when visible
                    const termEl = document.getElementById('terminal-text');
                    if (termEl && termEl.innerHTML === "") {
                        termEl.innerHTML = textData[currentLang].terminal;
                    }
                }
            }
        });
    }, { threshold: 0.15 });
    document.querySelectorAll('.hidden-section').forEach((el) => observer.observe(el));


    // --- 6. COMMAND PALETTE (ULTRA PRO FEATURE) ---
    const palette = document.getElementById('cmd-palette');
    const cmdInput = document.getElementById('cmd-input');
    const mobileBtn = document.getElementById('mobile-cmd-btn');

    function togglePalette() {
        if (!palette) return;
        const isHidden = palette.classList.contains('hidden');
        if (isHidden) {
            palette.classList.remove('hidden');
            setTimeout(() => cmdInput.focus(), 100);
        } else {
            palette.classList.add('hidden');
        }
    }

    // Atajos de teclado (CTRL+K)
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            togglePalette();
        }
        if (e.key === 'Escape' && palette && !palette.classList.contains('hidden')) {
            togglePalette();
        }
    });

    if (mobileBtn) mobileBtn.addEventListener('click', togglePalette);
    if (palette) palette.addEventListener('click', (e) => {
        if (e.target === palette) togglePalette();
    });

    // Execute Commands
    document.querySelectorAll('.cmd-item').forEach(item => {
        item.addEventListener('click', () => {
            const action = item.getAttribute('data-action');
            executeCommand(action);
            togglePalette();
        });
    });

    function executeCommand(action) {
        if (action === 'cv') {
            const cvLink = document.getElementById('download-cv-btn');
            if (cvLink) { cvLink.click(); showToast("Downloading CV..."); }
        } else if (action === 'email') {
            navigator.clipboard.writeText("luislazaropimentel@gmail.com");
            showToast("Email copied to clipboard!");
        } else if (action === 'projects') {
            document.querySelector('#projects').scrollIntoView({ behavior: 'smooth' });
        } else if (action === 'contact') {
            document.querySelector('#contact').scrollIntoView({ behavior: 'smooth' });
        }
    }

    // --- 7. TOAST NOTIFICATION ---
    function showToast(msg) {
        const toast = document.getElementById('toast-notification');
        const msgEl = document.getElementById('toast-message');
        if (toast && msgEl) {
            msgEl.innerText = msg;
            toast.classList.remove('hidden');
            setTimeout(() => toast.classList.add('hidden'), 3000);
        }
    }

    // --- 8. 3D TILT EFFECT ---
    document.querySelectorAll('.skill-card, .project-item').forEach(card => {
        card.classList.add('tilt-card');
        
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const xPct = (x / rect.width) - 0.5;
            const yPct = (y / rect.height) - 0.5;
            
            const xRot = yPct * 10; 
            const yRot = xPct * -10;
            
            card.style.transform = `perspective(1000px) rotateX(${xRot}deg) rotateY(${yRot}deg) scale(1.02)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
        });
    });

    // --- 9. QR CODE MODAL LOGIC ---
    const qrBtn = document.getElementById('qr-trigger');
    const qrModal = document.getElementById('qr-modal');
    const closeQr = document.getElementById('close-qr');

    if (qrBtn && qrModal) {
        qrBtn.addEventListener('click', () => {
            qrModal.classList.remove('hidden');
        });

        if (closeQr) {
            closeQr.addEventListener('click', () => {
                qrModal.classList.add('hidden');
            });
        }

        qrModal.addEventListener('click', (e) => {
            if (e.target === qrModal) qrModal.classList.add('hidden');
        });
    }

}); // <-- CIERRE CORRECTO