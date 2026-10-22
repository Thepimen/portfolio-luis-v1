import os
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle


def generate_pdf():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    pdf_path = os.path.join(base_dir, "assets", "cv.pdf")
    photo_path = os.path.join(base_dir, "assets", "profile.png")

    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=A4,
        leftMargin=34,
        rightMargin=34,
        topMargin=22,
        bottomMargin=22
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        'NameHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=20,
        leading=23,
        textColor=colors.HexColor('#06525c'),
        spaceAfter=3
    )

    role_style = ParagraphStyle(
        'RoleHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=13,
        textColor=colors.HexColor('#1e293b'),
        spaceAfter=4
    )

    subtitle_style = ParagraphStyle(
        'Subtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.8,
        leading=12,
        textColor=colors.HexColor('#475569'),
        spaceAfter=2
    )

    section_heading = ParagraphStyle(
        'SectionHeading',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10.5,
        leading=13,
        textColor=colors.HexColor('#06525c'),
        spaceBefore=7,
        spaceAfter=2
    )

    body_style = ParagraphStyle(
        'BodyTextCustom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=12.2,
        textColor=colors.HexColor('#1e293b'),
        spaceAfter=3
    )

    bullet_style = ParagraphStyle(
        'BulletText',
        parent=body_style,
        leftIndent=12,
        spaceAfter=1.8
    )

    meta_style = ParagraphStyle(
        'MetaText',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=8.2,
        leading=10.5,
        textColor=colors.HexColor('#475569'),
        alignment=2
    )

    story = []

    header_left = [
        Paragraph("Luis Lázaro Pimentel", title_style),
        Paragraph("Ingeniería de Software · Backend de Alto Rendimiento, Sistemas Distribuidos y Ciberseguridad", role_style),
        Paragraph(
            "Madrid, España  |  luislazaropimentel@gmail.com  |  +34 626 01 57 23<br/>"
            "luislazaro-dev.netlify.app  |  github.com/Thepimen  |  linkedin.com/in/luis-lázaro-pimentel",
            subtitle_style
        )
    ]

    if os.path.exists(photo_path):
        header_image = Image(photo_path, width=78, height=78)
        header_table = Table([[header_left, header_image]], colWidths=[435, 92])
    else:
        header_table = Table([[header_left]], colWidths=[527])

    header_table.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('ALIGN', (-1, 0), (-1, 0), 'RIGHT'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
        ('TOPPADDING', (0, 0), (-1, -1), 0),
    ]))

    story.append(header_table)
    story.append(Spacer(1, 3))

    def add_section_divider(title):
        story.append(Paragraph(title, section_heading))
        story.append(HRFlowable(
            width="100%",
            thickness=0.8,
            color=colors.HexColor('#06525c'),
            spaceBefore=1,
            spaceAfter=4
        ))

    # 1. Perfil Profesional
    add_section_divider("Perfil Técnico y Proyección")
    profile_text = (
        "Desarrollador de software orientado a Ingeniería de Software, Desarrollo de Aplicaciones Multiplataforma (DAM), "
        "Backend de alto rendimiento y Ciberseguridad. Mi paso previo por la etapa universitaria en Ingeniería me proporcionó "
        "una base sólida en programación de bajo nivel, lógica computacional, matemática discreta y diseño de algoritmos, "
        "la cual combino actualmente con el desarrollo práctico multiplataforma (CFGS DAM en el Instituto Nebrija) y proyectos "
        "DevSecOps. Experiencia laboral continuada desde 2023 en Cambridge Assessment English bajo protocolos internacionales "
        "de seguridad y operación en inglés (nivel B2–C1)."
    )
    story.append(Paragraph(profile_text, body_style))

    # 2. Proyectos Técnicos Destacados
    add_section_divider("Proyectos Técnicos Destacados")

    def add_project(name, url, tech, desc_bullets):
        proj_header = f"<b>{name}</b> ({url}) — <i>{tech}</i>"
        story.append(Paragraph(proj_header, body_style))
        for bullet in desc_bullets:
            story.append(Paragraph(f"• {bullet}", bullet_style))
        story.append(Spacer(1, 2))

    add_project(
        "VulnFollowUp · Enterprise DevSecOps & DORA Platform",
        "github.com/Thepimen/VulnFollowUp",
        "Java 17 REST, Android (Room Offline-First), TypeScript/JS SPA (WCAG 2.1 AA), SQL, CVSS v3.1/v4.0",
        [
            "Plataforma multicapa de gestión de vulnerabilidades y resiliencia operativa alineada con el reglamento europeo DORA (EU 2022/2554).",
            "Motor de validación CVSS v3.1/v4.0, control de acceso RBAC (BCrypt/Argon2), API REST concurrente y app Android offline-first."
        ]
    )

    add_project(
        "kshield · Linux Kernel eBPF Sentinel",
        "github.com/Thepimen/kshield",
        "C, eBPF (CO-RE / BTF), Go (cilium/ebpf), Linux Internals, Clang/LLVM, Docker",
        [
            "Agente de observabilidad y detección de intrusiones en espacio de kernel con sobrecarga medida inferior al 1.5% de CPU.",
            "Sondas eBPF en sys_enter_execve, sys_enter_connect y sys_enter_openat con transporte zero-copy mediante BPF Ring Buffers.",
            "Demonio en Go con resolución de procesos/cgroups y motor de firmas alineado con tácticas MITRE ATT&CK."
        ]
    )

    add_project(
        "ShadowAudit · Vulnerability Scanner Monorepo",
        "github.com/Thepimen/ShadowAudit",
        "TypeScript, Next.js, Express, Python, Redis, Docker, Nmap, Raw Sockets",
        [
            "Monorepo de auditoría de seguridad con microservicios desacoplados: API Gateway en Express y colas en Redis hacia workers en Python.",
            "Motor híbrido de inspección con escáner Nmap multietapa y fallback directo sobre Raw Sockets."
        ]
    )

    add_project(
        "NanoKV · Distributed Key-Value Store",
        "github.com/Thepimen/NanoKV",
        "Go (Golang), Distributed Systems, Consistent Hashing, Sharding, Write-Ahead Log (WAL)",
        [
            "Base de datos distribuida clave-valor ligera en Go con particionamiento consistente (Consistent Hashing / Sharding).",
            "Motor de persistencia con Write-Ahead Log (WAL) para garantizar durabilidad y recuperación ante fallos de nodo."
        ]
    )

    add_project(
        "πDiaDownloader · Desktop Media Automation",
        "github.com/Thepimen/PiDiaDownloader",
        "Python 3.11+, CustomTkinter, yt-dlp, FFmpeg, PyInstaller",
        [
            "Aplicación nativa de escritorio para extracción local y multiplexado de flujos DASH/HLS multicanal sin marcas de agua ni telemetría externa."
        ]
    )

    add_project(
        "OmniLens · Real-Time Telemetry SaaS",
        "github.com/Thepimen/OmniLens",
        "TypeScript, React, Node.js, WebSockets, OpenAI API",
        [
            "Plataforma de telemetría y diagnóstico de excepciones de red en tiempo real mediante canales WebSockets bidireccionales de baja latencia.",
            "Integración de LLMs para análisis de trazas de error y generación instantánea de playbooks de remediación."
        ]
    )

    # 3. Formación Académica
    add_section_divider("Formación Académica")

    edu_rows = [
        [
            Paragraph("<b>CFGS en Desarrollo de Aplicaciones Multiplataforma (DAM) — 2º Curso</b><br/>Instituto Nebrija de Formación Profesional", body_style),
            Paragraph("2025 – Actualidad<br/>Madrid, España", meta_style)
        ]
    ]
    t_edu1 = Table(edu_rows, colWidths=[400, 127])
    t_edu1.setStyle(TableStyle([('VALIGN', (0, 0), (-1, -1), 'TOP'), ('LEFTPADDING', (0, 0), (-1, -1), 0), ('RIGHTPADDING', (0, 0), (-1, -1), 0), ('BOTTOMPADDING', (0, 0), (-1, -1), 1), ('TOPPADDING', (0, 0), (-1, -1), 0)]))
    story.append(t_edu1)
    story.append(Paragraph("• Módulos clave: Acceso a Datos, Sistemas de Gestión Empresarial (ERP/Odoo), Desarrollo de Interfaces, Programación Multimedia y Dispositivos Móviles, IPE II y Digitalización.", bullet_style))
    story.append(Spacer(1, 2))

    edu_rows2 = [
        [
            Paragraph("<b>Etapa Universitaria en Ingeniería de Software</b><br/>Formación Universitaria en Ingeniería", body_style),
            Paragraph("2023 – 2025<br/>Madrid, España", meta_style)
        ]
    ]
    t_edu2 = Table(edu_rows2, colWidths=[400, 127])
    t_edu2.setStyle(TableStyle([('VALIGN', (0, 0), (-1, -1), 'TOP'), ('LEFTPADDING', (0, 0), (-1, -1), 0), ('RIGHTPADDING', (0, 0), (-1, -1), 0), ('BOTTOMPADDING', (0, 0), (-1, -1), 1), ('TOPPADDING', (0, 0), (-1, -1), 0)]))
    story.append(t_edu2)
    story.append(Paragraph("• Base sólida en programación de bajo nivel (C y gestión manual de memoria), lógica computacional, matemática discreta, diseño de algoritmos, sistemas operativos y redes.", bullet_style))

    # 4. Experiencia Laboral
    add_section_divider("Experiencia Laboral")
    exp_rows = [
        [
            Paragraph("<b>Supervisor y Logística de Exámenes Oficiales</b><br/>Cambridge Assessment English", body_style),
            Paragraph("2023 – Actualidad<br/>Madrid, España", meta_style)
        ]
    ]
    t_exp = Table(exp_rows, colWidths=[400, 127])
    t_exp.setStyle(TableStyle([('VALIGN', (0, 0), (-1, -1), 'TOP'), ('LEFTPADDING', (0, 0), (-1, -1), 0), ('RIGHTPADDING', (0, 0), (-1, -1), 0), ('BOTTOMPADDING', (0, 0), (-1, -1), 1), ('TOPPADDING', (0, 0), (-1, -1), 0)]))
    story.append(t_exp)
    story.append(Paragraph("• Custodia y transporte de material de examen confidencial bajo protocolos de seguridad internacionales.", bullet_style))
    story.append(Paragraph("• Coordinación de personal de sala y resolución de incidentes técnicos en plataformas digitales de evaluación.", bullet_style))

    # 5. Habilidades y Entorno Técnico
    add_section_divider("Habilidades y Stack Técnico")
    skills_data = [
        [Paragraph("<b>Lenguajes y Sistemas:</b>", body_style), Paragraph("Go, C, C++, Python, Java (Spring Boot), Bash, Linux Kernel / eBPF, SQL, TypeScript, JavaScript.", body_style)],
        [Paragraph("<b>Tecnologías y Datos:</b>", body_style), Paragraph("Node.js, Express, Next.js, React, CustomTkinter, WebSockets, Redis, PostgreSQL, MariaDB, MySQL.", body_style)],
        [Paragraph("<b>Infraestructura y Redes:</b>", body_style), Paragraph("Linux (Debian/Ubuntu sobre WSL 2), Docker, Docker Compose, Git, Make, Wireshark, Nmap, UFW, Raw Sockets.", body_style)],
        [Paragraph("<b>Idiomas:</b>", body_style), Paragraph("Español (Nativo) · Inglés (Competencia operativa y técnica fluida en entorno anglosajón, Aptis General / B2–C1).", body_style)]
    ]
    t_skills = Table(skills_data, colWidths=[125, 402])
    t_skills.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 1.5),
        ('TOPPADDING', (0, 0), (-1, -1), 0),
    ]))
    story.append(t_skills)

    doc.build(story)
    print(f"[+] PDF Generated successfully at {pdf_path}")


if __name__ == "__main__":
    generate_pdf()
