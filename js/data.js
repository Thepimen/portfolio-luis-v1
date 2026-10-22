/* ==========================================================================
   data.js — single source of truth for portfolio content.
   Language byte counts come from api.github.com/repos/Thepimen/<repo>/languages
   (snapshot Oct 2026). Stars / commits / push dates are refreshed live at runtime.
   ========================================================================== */
window.LLP = window.LLP || {};

LLP.profile = {
  name: 'Luis Lázaro Pimentel',
  handle: 'Thepimen',
  role: 'Software Engineer',
  focus: ['Desarrollo Multiplataforma (DAM)', 'Backend', 'Ciberseguridad'],
  base: ['Programación de bajo nivel', 'Lógica computacional', 'Matemática discreta', 'Diseño de algoritmos'],
  location: 'Madrid, ES',
  email: 'luislazaropimentel@gmail.com',
  phone: '+34 626 01 57 23',
  github: 'https://github.com/Thepimen',
  linkedin: 'https://www.linkedin.com/in/luis-l%C3%A1zaro-pimentel/',
  cv: 'assets/cv_es.pdf',
  cv_es: 'assets/cv_es.pdf',
  cv_en: 'assets/cv_en.pdf',
  languages: ['ES (nativo)', 'EN (B2 acreditado · Aptis Advanced)'],
  available: true
};

LLP.langColors = {
  JavaScript: '#f1e05a', TypeScript: '#3178c6', Python: '#3572A5', Java: '#b07219',
  Go: '#00ADD8', C: '#8b8b8b', 'C++': '#f34b7d', HTML: '#e34c26', CSS: '#563d7c',
  SCSS: '#c6538c', Shell: '#89e051', Makefile: '#427819', Dockerfile: '#384d54',
  Batchfile: '#C1F12E', PowerShell: '#3d7ac2', YAML: '#cb171e', Config: '#6b7280', SQL: '#e38c00'
};

LLP.categories = {
  backend: 'Backend & Low-Level',
  frontend: 'Frontend & UI',
  security: 'Cybersecurity'
};

/* diagram.cols → columns of nodes, rendered left→right with animated flows. */
LLP.projects = [
  {
    id: 'vulnfollowup', name: 'VulnFollowUp', repo: 'Thepimen/VulnFollowUp', featured: true,
    cats: ['backend', 'security', 'frontend'], year: 2026,
    tagline: 'Plataforma DevSecOps de gestión de vulnerabilidades alineada con EU DORA (2022/2554).',
    badges: ['Monorepo · 4 módulos', 'Java 17 REST', 'Android Room', 'CVSS 3.1/4.0', 'RBAC · JWT', 'WCAG 2.1 AA'],
    langs: { JavaScript: 252619, Python: 94019, HTML: 50993, Shell: 21847, CSS: 6017, TypeScript: 5054 },
    stars: 0, commits: null,
    diagram: {
      cols: [
        [{ t: 'Web / Desktop SPA', s: 'WCAG 2.1 AA' }, { t: 'Android App', s: 'Room · offline' }],
        [{ t: 'Java REST API', s: 'JWT · RBAC · PSP' }],
        [{ t: 'CVSS Engine', s: 'v3.1 · v4.0' }, { t: 'DORA Ch. V', s: 'ICT providers' }],
        [{ t: 'Relational DB', s: 'Assets ⇄ Vulns N:M' }]
      ]
    },
    highlights: [
      'Ciclo de vida como máquina de estados: ABIERTA → PENDIENTE DE REMEDIACIÓN → RESUELTA → CERRADA (con regresión).',
      'Validación de vectores CVSS v3.1 / v4.0 con reglas de coherencia score ↔ severidad.',
      'Mapeo de activos críticos a proveedores TIC externos (DORA, Capítulo V).',
      'RBAC con roles ADMIN · ANALYST · VIEWER y contraseñas con BCrypt / Argon2.',
      'Cliente Android offline-first con caché Room y sincronización contra la API REST.'
    ],
    endpoints: ['POST /api/auth/login', 'GET /api/assets', 'GET /api/vulnerabilities?page=&severity=', 'GET /api/vulnerabilities/{id}']
  },
  {
    id: 'kshield', name: 'kshield', repo: 'Thepimen/kshield',
    cats: ['backend', 'security'], year: 2026,
    tagline: 'Agente de observabilidad e IDS en espacio de kernel con eBPF CO-RE y Go.',
    badges: ['eBPF CO-RE', 'BPF Ring Buffer', 'MITRE ATT&CK', '<1.5% CPU'],
    langs: { Go: 48704, C: 14759, Shell: 6433, Makefile: 3344 },
    stars: 1, commits: null,
    diagram: { cols: [[{ t: 'Tracepoints', s: 'execve · connect · openat' }], [{ t: 'eBPF (C)', s: 'CO-RE · BTF' }], [{ t: 'Ring Buffer', s: 'zero-copy' }], [{ t: 'Go daemon', s: 'cgroups · MITRE' }]] },
    highlights: ['Sondas CO-RE sin módulos de kernel inestables.', 'Transporte zero-copy de eventos binarios hacia userspace.', 'Resolución de árbol de procesos, namespaces y cgroups con reglas MITRE ATT&CK.']
  },
  {
    id: 'shadowaudit', name: 'ShadowAudit', repo: 'Thepimen/ShadowAudit',
    cats: ['security', 'frontend'], year: 2026,
    tagline: 'Escáner de vulnerabilidades distribuido: gateway, colas Redis y workers aislados.',
    badges: ['Microservicios', 'Redis queues', 'Raw sockets', 'Nmap', 'Docker'],
    langs: { TypeScript: 28013, Python: 12752, CSS: 1726, Dockerfile: 1093, JavaScript: 559 },
    stars: 1, commits: null,
    diagram: { cols: [[{ t: 'Next.js panel', s: 'dashboard' }], [{ t: 'Express gateway', s: 'TypeScript' }], [{ t: 'Redis', s: 'job queues' }], [{ t: 'Python workers', s: 'SYN · Nmap' }]] },
    highlights: ['Plano de control web desacoplado del motor de escaneo.', 'Workers en contenedores con inspección por raw sockets + Nmap.', 'Colas con prioridad para escaneos concurrentes sin bloqueo.']
  },
  {
    id: 'nanokv', name: 'NanoKV', repo: 'Thepimen/NanoKV',
    cats: ['backend'], year: 2025,
    tagline: 'Base de datos clave-valor distribuida en Go con hashing consistente y WAL.',
    badges: ['Consistent hashing', 'FNV-1a', 'Write-Ahead Log', 'TCP'],
    langs: { Go: 8447 },
    stars: 1, commits: null,
    diagram: { cols: [[{ t: 'Client', s: 'TCP' }], [{ t: 'Router', s: 'FNV-1a ring' }], [{ t: 'Shard 0..n', s: 'vnodes' }, { t: 'WAL', s: 'append-only' }]] },
    highlights: ['Anillo de hash consistente con nodos virtuales para minimizar migración de claves.', 'Persistencia append-only con reconstrucción determinista tras caída.']
  },
  {
    id: 'omnilens', name: 'OmniLens', repo: 'Thepimen/OmniLens',
    cats: ['frontend', 'backend'], year: 2026,
    tagline: 'Telemetría y diagnóstico de excepciones de red en tiempo real vía WebSockets.',
    badges: ['WebSockets', 'React + TS', 'LLM playbooks', 'Docker'],
    langs: { TypeScript: 59386, Python: 29818, JavaScript: 6929, Dockerfile: 2028, Shell: 1990, CSS: 1957, Batchfile: 1939, PowerShell: 800 },
    stars: 1, commits: null,
    diagram: { cols: [[{ t: 'Agents', s: 'traces' }], [{ t: 'WS server', s: 'bidirectional' }], [{ t: 'Analyzer', s: 'LLM · root cause' }], [{ t: 'React UI', s: 'live dashboard' }]] },
    highlights: ['Canal bidireccional persistente de baja latencia.', 'Síntesis automática de causas raíz y playbooks de remediación.']
  },
  {
    id: 'pidiadownloader', name: 'πDiaDownloader', repo: 'Thepimen/PiDiaDownloader',
    cats: ['frontend'], year: 2026,
    tagline: 'App de escritorio nativa para extracción y multiplexado DASH/HLS.',
    badges: ['CustomTkinter', 'yt-dlp', 'FFmpeg', 'PyInstaller'],
    langs: { Python: 81844 },
    stars: 1, commits: null,
    diagram: { cols: [[{ t: 'Desktop UI', s: 'CustomTkinter' }], [{ t: 'Worker threads', s: 'async' }], [{ t: 'yt-dlp', s: 'streams' }, { t: 'FFmpeg', s: 'mux' }]] },
    highlights: ['Interfaz asíncrona sin bloqueos con hilos de trabajo.', 'Binario autónomo empaquetado con PyInstaller.']
  },
  {
    id: 'pysniff', name: 'PySniff', repo: 'Thepimen/PySniff',
    cats: ['security', 'backend'], year: 2025,
    tagline: 'Sniffer L2–L7 que desencapsula Ethernet, IPv4, TCP/UDP/ICMP sin librerías.',
    badges: ['Raw sockets', 'Protocol parsing', 'CLI'],
    langs: { Python: 8250 },
    stars: 1, commits: null,
    diagram: { cols: [[{ t: 'NIC', s: 'AF_PACKET' }], [{ t: 'Ethernet', s: 'L2' }], [{ t: 'IPv4', s: 'L3' }], [{ t: 'TCP/UDP', s: 'L4 · payload' }]] },
    highlights: ['Parsing manual de cabeceras con struct.unpack.', 'Detección de flujos sin cifrar en tiempo real.']
  },
  {
    id: 'memoryallocator', name: 'MemoryAllocator', repo: 'Thepimen/MemoryAllocator',
    cats: ['backend'], year: 2025,
    tagline: 'malloc / realloc / free desde cero en C con coalescencia y canarios.',
    badges: ['Heap', 'Punteros', 'Coalescing', 'Canaries'],
    langs: { C: 4277 },
    stars: 1, commits: null,
    diagram: { cols: [[{ t: 'malloc()', s: 'first-fit' }], [{ t: 'Block header', s: 'size · free' }], [{ t: 'Free list', s: 'coalesce' }], [{ t: 'sbrk()', s: 'heap grow' }]] },
    highlights: ['Metadatos de bloque y lista libre enlazada.', 'Canarios de frontera para detectar desbordamientos.']
  },
  {
    id: 'sistema-operativo', name: 'Sistema-operativo', repo: 'Thepimen/Sistema-operativo',
    cats: ['backend'], year: 2024,
    tagline: 'Simulación de subsistemas de SO en C: planificación, procesos y concurrencia.',
    badges: ['Scheduling', 'POSIX', 'Concurrencia'],
    langs: { C: 16397 },
    stars: 1, commits: null,
    diagram: { cols: [[{ t: 'Processes', s: 'PCB' }], [{ t: 'Scheduler', s: 'RR · prio' }], [{ t: 'CPU / IO', s: 'queues' }]] },
    highlights: ['Planificadores con colas de prioridad y quantum.', 'Sincronización con primitivas POSIX.']
  },
  {
    id: 'infraestructura-h-brida', name: 'Infraestructura-h-brida', repo: 'Thepimen/Infraestructura-h-brida',
    cats: ['security'], year: 2026,
    tagline: 'SOC híbrido con Wazuh sobre Docker y VMs frente a ataques reales.',
    badges: ['Wazuh XDR/SIEM', 'FIM', 'DVWA', 'BlackArch'],
    langs: { Config: 1 },
    stars: 0, commits: null,
    diagram: { cols: [[{ t: 'BlackArch', s: 'attacker' }], [{ t: 'Win 11 · DVWA', s: 'targets' }], [{ t: 'Wazuh agents', s: 'FIM · logs' }], [{ t: 'Wazuh manager', s: 'alerts' }]] },
    highlights: ['Monitorización de integridad de ficheros y logs.', 'Detección de vectores ofensivos en entorno controlado.']
  }
];

LLP.skills = [
  { name: 'Low-level & Algorithms', level: 88, note: 'C · memoria · grafos · complejidad' },
  { name: 'Java', level: 84, note: 'Spring · REST · concurrencia (PSP)' },
  { name: 'JS / TS', level: 85, note: 'DOM · Node · React · Angular' },
  { name: 'SQL', level: 78, note: 'modelado · MySQL · PostgreSQL' },
  { name: 'Android', level: 72, note: 'Java/Kotlin · Room · offline-first' },
  { name: 'Cybersecurity', level: 80, note: 'eBPF · SIEM · DevSecOps · DORA' }
];

/* Devicon slugs → https://cdn.jsdelivr.net/gh/devicons/devicon@v2.16.0/icons/<slug>/<slug>-<variant>.svg */
LLP.stack = [
  { n: 'C (Bajo nivel)', i: 'c', home: true }, { n: 'Java', i: 'java', home: true },
  { n: 'TypeScript', i: 'typescript', home: true }, { n: 'JavaScript', i: 'javascript' },
  { n: 'Python', i: 'python', home: true }, { n: 'Android', i: 'android', home: true },
  { n: 'SQL', i: 'mysql', home: true }, { n: 'Go (básico)', i: 'go', home: false },
  { n: 'Kotlin', i: 'kotlin' }, { n: 'Spring', i: 'spring' }, { n: 'Node.js', i: 'nodejs' },
  { n: 'React', i: 'react' }, { n: 'Angular', i: 'angular' }, { n: 'Ionic', i: 'ionic' },
  { n: 'MySQL', i: 'mysql' }, { n: 'PostgreSQL', i: 'postgresql' }, { n: 'Redis', i: 'redis' },
  { n: 'Docker', i: 'docker', home: true }, { n: 'Linux', i: 'linux', home: true },
  { n: 'Bash', i: 'bash' }, { n: 'Git', i: 'git' }
];

LLP.timeline = [
  {
    track: 'edu', period: '2023 — 2025', title: 'Etapa universitaria en Ingeniería',
    org: 'Ingeniería de Software · Fundamentos Computacionales',
    summary: 'Base sólida en programación de bajo nivel, lógica computacional, matemática discreta y diseño de algoritmos, combinada hoy con el desarrollo práctico de aplicaciones multiplataforma (DAM) y ciberseguridad.',
    bullets: ['Programación de bajo nivel en C y gestión manual de memoria', 'Lógica computacional, teoría de grafos y matemática discreta', 'Diseño de algoritmos, estructuras de datos y complejidad', 'Sistemas operativos, redes y arquitectura de computadores'],
    tags: ['Bajo nivel (C)', 'Lógica', 'Matemática discreta', 'Algoritmos'], repos: ['MemoryAllocator', 'Sistema-operativo']
  },
  {
    track: 'work', period: '2023 — hoy', title: 'Supervisor de exámenes oficiales',
    org: 'Cambridge Assessment English',
    summary: 'Operación bajo protocolos internacionales de seguridad y auditoría.',
    bullets: ['Custodia de material confidencial', 'Coordinación de equipos de sala', 'Soporte técnico en evaluaciones digitales en vivo'],
    tags: ['Seguridad operativa', 'Inglés', 'Presión real'], repos: []
  },
  {
    track: 'edu', period: '2025 — hoy', title: 'CFGS Desarrollo de Aplicaciones Multiplataforma',
    org: 'Instituto Nebrija FP · 2.º curso',
    summary: 'La base teórica, aplicada a producto: apps móviles, escritorio, datos y concurrencia.',
    bullets: ['PMDM: Android nativo y offline-first', 'Acceso a Datos: JDBC, ORM y modelado relacional', 'PSP: hilos, procesos y sockets', 'Desarrollo de Interfaces y SGE (Odoo)'],
    tags: ['Java', 'Android', 'SQL', 'TypeScript'], repos: ['CorporateApp', 'BioDam']
  },
  {
    track: 'eng', period: '2025 — hoy', title: 'Sistemas & Ciberseguridad',
    org: 'Proyectos propios',
    summary: 'Del kernel al SOC: instrumentación eBPF, escaneo distribuido y detección.',
    bullets: ['kshield: IDS en kernel con eBPF CO-RE + Go', 'ShadowAudit: escáner con colas Redis', 'SOC híbrido con Wazuh XDR/SIEM'],
    tags: ['eBPF', 'Go', 'Redis', 'Wazuh'], repos: ['kshield', 'ShadowAudit', 'Infraestructura-h-brida']
  },
  {
    track: 'eng', period: '2026', title: 'VulnFollowUp · DevSecOps / DORA',
    org: 'Proyecto intermodular',
    summary: 'Arquitectura multicapa completa: API Java, SPA accesible, Android offline y BD relacional.',
    bullets: ['Motor CVSS v3.1 / v4.0', 'Mapeo DORA de proveedores TIC', 'RBAC y JWT'],
    tags: ['Java', 'Android', 'SQL', 'DevSecOps'], repos: ['VulnFollowUp']
  },
  {
    track: 'edu', period: 'Próximo', title: 'BSc (Hons) Software Engineering · Top-Up',
    org: 'Objetivo tras DAM',
    summary: 'Cerrar el círculo con una titulación internacional de grado.',
    bullets: ['Reino Unido / Irlanda', 'Programa de 1 año'],
    tags: ['Next'], repos: [], next: true
  }
];
