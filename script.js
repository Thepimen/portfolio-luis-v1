document.addEventListener('DOMContentLoaded', () => {
    
    // 1. INICIALIZAR FONDO 3D
    try {
        if (window.VANTA) {
            VANTA.NET({
                el: "#vanta-bg",
                mouseControls: true,
                touchControls: true,
                gyroControls: false,
                minHeight: 200.00,
                minWidth: 200.00,
                scale: 1.00,
                scaleMobile: 1.00,
                color: 0x64ffda,       
                backgroundColor: 0x0a192f, 
                points: 13.00,         
                maxDistance: 22.00,    
                spacing: 16.00
            })
        }
    } catch (e) {
        console.log("Error loading Vanta:", e);
    }

    // 2. CURSOR PERSONALIZADO
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');

    if (window.matchMedia("(min-width: 768px)").matches) {
        window.addEventListener('mousemove', (e) => {
            const posX = e.clientX;
            const posY = e.clientY;

            cursorDot.style.left = `${posX}px`;
            cursorDot.style.top = `${posY}px`;

            cursorOutline.animate({
                left: `${posX}px`,
                top: `${posY}px`
            }, { duration: 500, fill: "forwards" });
        });
    }

    // 3. ESCRITURA AUTOMÁTICA (HERO)
    const textToType = "I build secure systems & data solutions.";
    const typewriterElement = document.getElementById('typewriter');
    let i = 0;

    function typeWriterHero() {
        if (i < textToType.length) {
            typewriterElement.innerHTML += textToType.charAt(i);
            i++;
            setTimeout(typeWriterHero, 50); 
        }
    }
    setTimeout(typeWriterHero, 1000);

    // 4. TERMINAL INTERACTIVA (ABOUT)
    const terminalContent = `
<span class="green-text">user@madrid:~$</span> ./whoami --verbose<br>
> Loading profile...<br>
> Name: Luis Lázaro Pimentel<br>
> Role: Cybersecurity & Dev<br>
> Stack: C, Python, Java, Pandas<br><br>
<span class="green-text">user@madrid:~$</span> cat description.txt<br>
I am obsessed with system integrity. While I build modern web interfaces, my core skills lie in <strong>Low-level Programming</strong> and <strong>Data Science</strong>. <br><br>
Currently expanding my arsenal in <strong>Penetration Testing</strong> and Secure Coding standards.
    `;
    
    const terminalBody = document.getElementById('terminal-text');
    let terminalStarted = false;

    // 5. ANIMACIÓN DE APARICIÓN AL BAJAR
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show-section');
                
                if (entry.target.id === 'about' && !terminalStarted) {
                    terminalStarted = true;
                    terminalBody.innerHTML = ""; 
                    setTimeout(() => {
                        terminalBody.innerHTML = terminalContent;
                    }, 500);
                }
            }
        });
    }, { threshold: 0.2 });

    const hiddenSections = document.querySelectorAll('.hidden-section');
    hiddenSections.forEach((el) => observer.observe(el));
});