document.addEventListener('DOMContentLoaded', () => {
    
    // 1. INICIALIZAR FONDO 3D (Vanta.js Net Effect)
    // Esto crea la red neuronal de fondo que se mueve con el mouse
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
                color: 0x64ffda,       // Tu verde neón
                backgroundColor: 0x0a192f, // Tu azul oscuro
                points: 13.00,         // Densidad de puntos
                maxDistance: 22.00,    // Distancia de las líneas
                spacing: 16.00
            })
        }
    } catch (e) {
        console.log("Error loading Vanta:", e);
    }

    // 2. CURSOR PERSONALIZADO (Círculo y Punto)
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');

    // Solo activamos si no es móvil
    if (window.matchMedia("(min-width: 768px)").matches) {
        window.addEventListener('mousemove', (e) => {
            const posX = e.clientX;
            const posY = e.clientY;

            // El punto central se mueve instantáneo
            cursorDot.style.left = `${posX}px`;
            cursorDot.style.top = `${posY}px`;

            // El círculo externo tiene retraso (efecto fluido)
            cursorOutline.animate({
                left: `${posX}px`,
                top: `${posY}px`
            }, { duration: 500, fill: "forwards" });
        });
    }

    // 3. EFECTO DE ESCRITURA EN HERO (Typewriter)
    const textToType = "I build secure systems & data solutions.";
    const typewriterElement = document.getElementById('typewriter');
    let i = 0;

    function typeWriterHero() {
        if (i < textToType.length) {
            typewriterElement.innerHTML += textToType.charAt(i);
            i++;
            setTimeout(typeWriterHero, 50); // Velocidad escritura
        }
    }
    // Empieza a escribir tras 1 segundo
    setTimeout(typeWriterHero, 1000);

    // 4. TERMINAL INTERACTIVA (Sección About)
    // Contenido estilo Linux
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

    // 5. DETECTOR DE SCROLL (Intersection Observer)
    // Hace aparecer las secciones y activa la terminal cuando la ves
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show-section');
                
                // Si llegamos al About y no hemos escrito la terminal...
                if (entry.target.id === 'about' && !terminalStarted) {
                    terminalStarted = true;
                    terminalBody.innerHTML = ""; // Limpiar
                    // Simular pequeño retraso de "boot"
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