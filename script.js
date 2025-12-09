document.addEventListener('DOMContentLoaded', () => {
    
    // 1. INICIALIZAR FONDO 3D (Vanta.js)
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
                points: 12.00,         
                maxDistance: 21.00,    
                spacing: 17.00
            })
        }
    } catch (e) {
        console.log("Error loading Vanta:", e);
    }

    // 2. CURSOR PERSONALIZADO (OPTIMIZADO SIN LAG)
    const cursorDot = document.querySelector('.cursor-dot');
    const cursorOutline = document.querySelector('.cursor-outline');
    
    // Variables para posición
    let mouseX = 0;
    let mouseY = 0;
    let outlineX = 0;
    let outlineY = 0;

    if (window.matchMedia("(min-width: 768px)").matches) {
        
        // Solo actualizamos coordenadas al mover el ratón (muy ligero)
        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            // El punto central se mueve instantáneo
            cursorDot.style.left = `${mouseX}px`;
            cursorDot.style.top = `${mouseY}px`;
        });

        // Loop de animación para el círculo grande (Interpolación suave)
        const animateCursor = () => {
            // Mueve el outline hacia el ratón un 15% de la distancia cada frame
            outlineX += (mouseX - outlineX) * 0.15; 
            outlineY += (mouseY - outlineY) * 0.15;

            cursorOutline.style.left = `${outlineX}px`;
            cursorOutline.style.top = `${outlineY}px`;

            requestAnimationFrame(animateCursor);
        };
        animateCursor();
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
    // Actualizado con edad y detalles
    const terminalContent = `
<span class="green-text">root@madrid:~$</span> ./load_profile.sh<br>
> Name: Luis Lázaro Pimentel<br>
> Age: 21 years old<br>
> Role: Cybersecurity & Dev<br>
> Status: <span class="green-text">Open to Work</span><br><br>
<span class="green-text">root@madrid:~$</span> cat description.txt<br>
I am obsessed with system integrity. While I build modern web interfaces, my core skills lie in <strong>Low-level Programming (C)</strong> and <strong>Data Science</strong>. <br><br>
Currently expanding my arsenal in <strong>Penetration Testing</strong> and Secure Coding standards.
    `;
    
    const terminalBody = document.getElementById('terminal-text');
    let terminalStarted = false;

    // 5. ANIMACIÓN DE APARICIÓN AL SCROLL (Intersection Observer)
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('show-section');
                
                // Iniciar terminal solo cuando llegamos a la sección About
                if (entry.target.id === 'about' && !terminalStarted) {
                    terminalStarted = true;
                    terminalBody.innerHTML = ""; 
                    setTimeout(() => {
                        // Simulación de tipeo rápido en bloque
                        terminalBody.innerHTML = terminalContent;
                    }, 500);
                }
            }
        });
    }, { threshold: 0.15 });

    const hiddenSections = document.querySelectorAll('.hidden-section');
    hiddenSections.forEach((el) => observer.observe(el));
});