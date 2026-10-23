import os
import shutil
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle


def build_cv(lang="es", output_path=None):
    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        leftMargin=32,
        rightMargin=32,
        topMargin=20,
        bottomMargin=20
    )

    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        'NameHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=21,
        textColor=colors.HexColor('#0f172a'),
        spaceAfter=2
    )

    role_style = ParagraphStyle(
        'RoleHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=13,
        textColor=colors.HexColor('#0284c7'),
        spaceAfter=3
    )

    contact_style = ParagraphStyle(
        'ContactText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.2,
        leading=11.5,
        textColor=colors.HexColor('#475569'),
        spaceAfter=3
    )

    section_heading = ParagraphStyle(
        'SectionHeading',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9.5,
        leading=12,
        textColor=colors.HexColor('#0f172a'),
        spaceBefore=5,
        spaceAfter=1
    )

    body_style = ParagraphStyle(
        'BodyTextCustom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.2,
        leading=11.2,
        textColor=colors.HexColor('#1e293b'),
        spaceAfter=1.5
    )

    bullet_style = ParagraphStyle(
        'BulletText',
        parent=body_style,
        leftIndent=10,
        spaceAfter=1
    )

    meta_style = ParagraphStyle(
        'MetaText',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=7.8,
        leading=10,
        textColor=colors.HexColor('#475569'),
        alignment=2
    )

    story = []

    def add_section_divider(title):
        story.append(Paragraph(title.upper(), section_heading))
        story.append(HRFlowable(
            width="100%",
            thickness=0.7,
            color=colors.HexColor('#0284c7'),
            spaceBefore=1,
            spaceAfter=3
        ))

    if lang == "es":
        # Header (100% Single Column, ATS Friendly, No photo)
        story.append(Paragraph("Luis Lázaro Pimentel", title_style))
        story.append(Paragraph("Ingeniería de Software · Desarrollo Multiplataforma (DAM), Backend & Ciberseguridad", role_style))
        story.append(Paragraph(
            "Madrid, España &nbsp;|&nbsp; luislazaropimentel@gmail.com &nbsp;|&nbsp; +34 626 01 57 23 &nbsp;|&nbsp; "
            "<a href='https://luislazaro-dev.netlify.app' color='#0284c7'>luislazaro-dev.netlify.app</a> &nbsp;|&nbsp; "
            "<a href='https://github.com/Thepimen' color='#0284c7'>github.com/Thepimen</a> &nbsp;|&nbsp; "
            "<a href='https://www.linkedin.com/in/luis-l%C3%A1zaro-pimentel/' color='#0284c7'>linkedin.com/in/luis-lázaro-pimentel</a>",
            contact_style
        ))

        # 1. Perfil Profesional
        add_section_divider("Perfil Profesional")
        profile_text = (
            "Desarrollador de software orientado a Ingeniería de Software, Desarrollo de Aplicaciones Multiplataforma (DAM), "
            "Backend y Ciberseguridad. Mi paso previo por la etapa universitaria en Ingeniería me proporcionó una base sólida "
            "en programación de bajo nivel (C y gestión manual de memoria), lógica computacional, matemática discreta y diseño de algoritmos, "
            "la cual combino actualmente con el desarrollo práctico de aplicaciones empresariales en el 2.º curso del CFGS DAM (Instituto Nebrija). "
            "Experiencia laboral continuada desde 2023 en Cambridge Assessment English coordinando logística y seguridad bajo protocolos internacionales. "
            "Nivel B2 de inglés acreditado mediante APTIS ADVANCED (British Council) con fluidez técnica y operativa."
        )
        story.append(Paragraph(profile_text, body_style))
        story.append(Spacer(1, 2))

        # 2. Proyectos Técnicos Destacados
        add_section_divider("Proyectos Técnicos Destacados")

        def add_project(name, url, tech, desc_bullets):
            proj_header = f"<b>{name}</b> (<a href='https://{url}' color='#0284c7'>{url}</a>) — <i>{tech}</i>"
            story.append(Paragraph(proj_header, body_style))
            for bullet in desc_bullets:
                story.append(Paragraph(f"• {bullet}", bullet_style))
            story.append(Spacer(1, 2))

        add_project(
            "VulnFollowUp · Plataforma DevSecOps & DORA",
            "github.com/Thepimen/VulnFollowUp",
            "Java 17 REST, Android (Room Offline-First), TypeScript/JS SPA (WCAG 2.1 AA), SQL, CVSS v3.1/v4.0",
            [
                "Plataforma integral de gestión de vulnerabilidades y resiliencia operativa conforme al reglamento europeo DORA (EU 2022/2554).",
                "Motor de validación CVSS v3.1/v4.0, autenticación y RBAC con BCrypt/Argon2, concurrencia en servidor y app Android con sincronización offline."
            ]
        )

        add_project(
            "kshield · Agente eBPF en Kernel de Linux",
            "github.com/Thepimen/kshield",
            "C, eBPF CO-RE (BTF), Go (demonio en userspace), Linux Internals, Clang/LLVM, Docker",
            [
                "Agente de observabilidad y detección de intrusiones con sobrecarga de CPU inferior al 1.5% mediante instrumentación eBPF CO-RE en C.",
                "Sondas en <i>sys_enter_execve</i>, <i>sys_enter_connect</i> y <i>sys_enter_openat</i> con transporte zero-copy por BPF Ring Buffers a demonio en Go."
            ]
        )

        add_project(
            "ShadowAudit · Escáner de Red y Vulnerabilidades",
            "github.com/Thepimen/ShadowAudit",
            "TypeScript, Next.js, Express, Python, Redis, Docker, Nmap, Raw Sockets",
            [
                "Arquitectura desacoplada en microservicios: API Gateway en Express orquestando colas de tareas Redis hacia workers en Python.",
                "Inspección de puertos y servicios combinando Raw Sockets de bajo nivel con barridos estructurados de Nmap."
            ]
        )

        add_project(
            "NanoKV · Prototipo Distribuido Clave-Valor",
            "github.com/Thepimen/NanoKV",
            "Go, Consistent Hashing (FNV-1a), Sharding con VNodes, Write-Ahead Log (WAL)",
            [
                "Almacén distribuido ligero en Go implementado para explorar particionamiento consistente con nodos virtuales y persistencia WAL append-only."
            ]
        )

        add_project(
            "πDiaDownloader · Automatización Multimedia Desktop",
            "github.com/Thepimen/PiDiaDownloader",
            "Python 3.11+, CustomTkinter, yt-dlp, FFmpeg, PyInstaller",
            [
                "Aplicación de escritorio nativa para extracción y multiplexado local de flujos DASH/HLS multicanal sin marcas de agua ni telemetría."
            ]
        )

        # 3. Formación Académica
        add_section_divider("Formación Académica")

        edu_rows = [
            [
                Paragraph("<b>CFGS en Desarrollo de Aplicaciones Multiplataforma (DAM) — 2.º Curso</b><br/>Instituto Nebrija de Formación Profesional", body_style),
                Paragraph("2025 – Actualidad<br/>Madrid, España", meta_style)
            ]
        ]
        t_edu1 = Table(edu_rows, colWidths=[395, 129])
        t_edu1.setStyle(TableStyle([('VALIGN', (0, 0), (-1, -1), 'TOP'), ('LEFTPADDING', (0, 0), (-1, -1), 0), ('RIGHTPADDING', (0, 0), (-1, -1), 0), ('BOTTOMPADDING', (0, 0), (-1, -1), 1), ('TOPPADDING', (0, 0), (-1, -1), 0)]))
        story.append(t_edu1)
        story.append(Paragraph("• Especialización: Acceso a Datos (SQL/JDBC), Programación de Servicios y Procesos (concurrencia y sockets), PMDM (Android), Desarrollo de Interfaces y Sistemas de Gestión (ERP/Odoo).", bullet_style))
        story.append(Spacer(1, 2))

        edu_rows2 = [
            [
                Paragraph("<b>Etapa Universitaria en Ingeniería de Software</b><br/>Formación Universitaria en Fundamentos de Ingeniería", body_style),
                Paragraph("2023 – 2025<br/>Madrid, España", meta_style)
            ]
        ]
        t_edu2 = Table(edu_rows2, colWidths=[395, 129])
        t_edu2.setStyle(TableStyle([('VALIGN', (0, 0), (-1, -1), 'TOP'), ('LEFTPADDING', (0, 0), (-1, -1), 0), ('RIGHTPADDING', (0, 0), (-1, -1), 0), ('BOTTOMPADDING', (0, 0), (-1, -1), 1), ('TOPPADDING', (0, 0), (-1, -1), 0)]))
        story.append(t_edu2)
        story.append(Paragraph("• Base sólida en programación de bajo nivel (C, punteros y gestión de memoria heap), estructuras de datos y análisis de algoritmos, matemática discreta, lógica computacional, sistemas operativos y redes.", bullet_style))

        # 4. Experiencia Laboral
        add_section_divider("Experiencia Laboral")
        exp_rows = [
            [
                Paragraph("<b>Supervisor y Logística de Exámenes Oficiales</b><br/>Cambridge Assessment English", body_style),
                Paragraph("2023 – Actualidad<br/>Madrid, España", meta_style)
            ]
        ]
        t_exp = Table(exp_rows, colWidths=[395, 129])
        t_exp.setStyle(TableStyle([('VALIGN', (0, 0), (-1, -1), 'TOP'), ('LEFTPADDING', (0, 0), (-1, -1), 0), ('RIGHTPADDING', (0, 0), (-1, -1), 0), ('BOTTOMPADDING', (0, 0), (-1, -1), 1), ('TOPPADDING', (0, 0), (-1, -1), 0)]))
        story.append(t_exp)
        story.append(Paragraph("• Custodia, trazabilidad y transporte de material confidencial bajo auditoría y estrictas normativas internacionales.", bullet_style))
        story.append(Paragraph("• Coordinación de equipos de sala y resolución de contingencias técnicas en plataformas informáticas de evaluación en tiempo real.", bullet_style))

        # 5. Habilidades y Stack Técnico
        add_section_divider("Habilidades y Stack Técnico")
        skills_data = [
            [Paragraph("<b>Lenguajes Dominados:</b>", body_style), Paragraph("C (bajo nivel y memoria), Java (Spring Boot), TypeScript, JavaScript, Python, SQL, Bash.", body_style)],
            [Paragraph("<b>Lenguajes en Práctica:</b>", body_style), Paragraph("Go (sintaxis y fundamentos aplicados en prototipos de sistemas y daemons).", body_style)],
            [Paragraph("<b>Desarrollo & Backend:</b>", body_style), Paragraph("Android nativo (Room/SQLite), Node.js, Express, Next.js, React, WebSockets, REST APIs, Redis, PostgreSQL, MySQL.", body_style)],
            [Paragraph("<b>Sistemas & Seguridad:</b>", body_style), Paragraph("Linux (Ubuntu/Debian, WSL 2), Docker, Docker Compose, Git, eBPF (CO-RE), Raw Sockets, Wireshark, Nmap, Wazuh XDR.", body_style)],
            [Paragraph("<b>Idiomas & Certificación:</b>", body_style), Paragraph("Inglés: Nivel B2 acreditado mediante APTIS ADVANCED (British Council) con fluidez profesional y técnica. · Español: Nativo.", body_style)]
        ]
        t_skills = Table(skills_data, colWidths=[130, 394])
        t_skills.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('LEFTPADDING', (0, 0), (-1, -1), 0),
            ('RIGHTPADDING', (0, 0), (-1, -1), 0),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 1.5),
            ('TOPPADDING', (0, 0), (-1, -1), 0),
        ]))
        story.append(t_skills)

    else:
        # ENGLISH VERSION
        story.append(Paragraph("Luis Lázaro Pimentel", title_style))
        story.append(Paragraph("Software Engineer · Multiplatform Application Development (DAM), Backend & Cybersecurity", role_style))
        story.append(Paragraph(
            "Madrid, Spain &nbsp;|&nbsp; luislazaropimentel@gmail.com &nbsp;|&nbsp; +34 626 01 57 23 &nbsp;|&nbsp; "
            "<a href='https://luislazaro-dev.netlify.app' color='#0284c7'>luislazaro-dev.netlify.app</a> &nbsp;|&nbsp; "
            "<a href='https://github.com/Thepimen' color='#0284c7'>github.com/Thepimen</a> &nbsp;|&nbsp; "
            "<a href='https://www.linkedin.com/in/luis-l%C3%A1zaro-pimentel/' color='#0284c7'>linkedin.com/in/luis-lázaro-pimentel</a>",
            contact_style
        ))

        # 1. Professional Summary
        add_section_divider("Professional Summary")
        profile_text = (
            "Software developer specialized in software engineering, multiplatform applications (DAM), backend systems, "
            "and cybersecurity. Previous university studies in Engineering provided a rigorous foundation in low-level C programming, "
            "manual memory management, computational logic, discrete mathematics, and algorithm design. Currently combining these core fundamentals "
            "with hands-on enterprise application development (2nd year Higher Diploma in DAM at Instituto Nebrija). "
            "Consistent professional track record since 2023 at Cambridge Assessment English coordinating operational security under strict international audit standards. "
            "Accredited Level B2 in English via APTIS ADVANCED (British Council) with professional technical fluency."
        )
        story.append(Paragraph(profile_text, body_style))
        story.append(Spacer(1, 2))

        # 2. Key Technical Projects
        add_section_divider("Key Technical Projects")

        def add_project_en(name, url, tech, desc_bullets):
            proj_header = f"<b>{name}</b> (<a href='https://{url}' color='#0284c7'>{url}</a>) — <i>{tech}</i>"
            story.append(Paragraph(proj_header, body_style))
            for bullet in desc_bullets:
                story.append(Paragraph(f"• {bullet}", bullet_style))
            story.append(Spacer(1, 2))

        add_project_en(
            "VulnFollowUp · DevSecOps & DORA Compliance Platform",
            "github.com/Thepimen/VulnFollowUp",
            "Java 17 REST, Android (Room Offline-First), TypeScript/JS SPA (WCAG 2.1 AA), SQL, CVSS v3.1/v4.0",
            [
                "Enterprise vulnerability management and operational resilience platform aligned with EU DORA (Regulation EU 2022/2554).",
                "Automated CVSS v3.1/v4.0 validation engine, RBAC authentication with BCrypt/Argon2, concurrent Java backend, and offline-first Android client."
            ]
        )

        add_project_en(
            "kshield · Linux Kernel eBPF Observability Sentinel",
            "github.com/Thepimen/kshield",
            "C, eBPF CO-RE (BTF), Go (userspace daemon), Linux Internals, Clang/LLVM, Docker",
            [
                "Kernel-space intrusion detection and observability agent with measured CPU overhead under 1.5% using eBPF CO-RE probes written in C.",
                "Instruments <i>sys_enter_execve</i>, <i>sys_enter_connect</i>, and <i>sys_enter_openat</i> tracepoints via zero-copy BPF Ring Buffers to a Go daemon."
            ]
        )

        add_project_en(
            "ShadowAudit · Distributed Vulnerability & Network Scanner",
            "github.com/Thepimen/ShadowAudit",
            "TypeScript, Next.js, Express, Python, Redis, Docker, Nmap, Raw Sockets",
            [
                "Decoupled microservices architecture: Express API gateway orchestrating Redis task queues to isolated Python workers.",
                "Hybrid scanning engine combining low-level Raw Sockets with structured Nmap multi-stage sweeps."
            ]
        )

        add_project_en(
            "NanoKV · Distributed Key-Value Prototype",
            "github.com/Thepimen/NanoKV",
            "Go, Consistent Hashing (FNV-1a), Sharding with Virtual Nodes, Write-Ahead Log (WAL)",
            [
                "Lightweight distributed key-value prototype built in Go to explore consistent hashing with virtual nodes and append-only WAL crash recovery."
            ]
        )

        add_project_en(
            "πDiaDownloader · Native Desktop Media Pipeline",
            "github.com/Thepimen/PiDiaDownloader",
            "Python 3.11+, CustomTkinter, yt-dlp, FFmpeg, PyInstaller",
            [
                "Native multi-threaded desktop utility for local high-fidelity DASH/HLS audio and video muxing with zero watermarks or third-party tracking."
            ]
        )

        # 3. Education
        add_section_divider("Education")

        edu_rows_en = [
            [
                Paragraph("<b>Higher Diploma (CFGS) in Multiplatform Application Development (DAM)</b><br/>Instituto Nebrija (Vocational Education & Training)", body_style),
                Paragraph("2025 – Present<br/>Madrid, Spain", meta_style)
            ]
        ]
        t_edu1_en = Table(edu_rows_en, colWidths=[395, 129])
        t_edu1_en.setStyle(TableStyle([('VALIGN', (0, 0), (-1, -1), 'TOP'), ('LEFTPADDING', (0, 0), (-1, -1), 0), ('RIGHTPADDING', (0, 0), (-1, -1), 0), ('BOTTOMPADDING', (0, 0), (-1, -1), 1), ('TOPPADDING', (0, 0), (-1, -1), 0)]))
        story.append(t_edu1_en)
        story.append(Paragraph("• Core Modules: Data Access (SQL/JDBC), Services & Process Concurrency (sockets, threads), Android Development (PMDM), Interface Design, ERP/Odoo.", bullet_style))
        story.append(Spacer(1, 2))

        edu_rows2_en = [
            [
                Paragraph("<b>University Foundation in Software Engineering</b><br/>University Degree Level Studies in Engineering", body_style),
                Paragraph("2023 – 2025<br/>Madrid, Spain", meta_style)
            ]
        ]
        t_edu2_en = Table(edu_rows2_en, colWidths=[395, 129])
        t_edu2_en.setStyle(TableStyle([('VALIGN', (0, 0), (-1, -1), 'TOP'), ('LEFTPADDING', (0, 0), (-1, -1), 0), ('RIGHTPADDING', (0, 0), (-1, -1), 0), ('BOTTOMPADDING', (0, 0), (-1, -1), 1), ('TOPPADDING', (0, 0), (-1, -1), 0)]))
        story.append(t_edu2_en)
        story.append(Paragraph("• Solid grounding in low-level programming (C, pointers, manual heap allocation), data structures & complexity, discrete mathematics, computational logic, operating systems, and computer networks.", bullet_style))

        # 4. Work Experience
        add_section_divider("Work Experience")
        exp_rows_en = [
            [
                Paragraph("<b>Exam Supervisor & Operational Logistics Coordinator</b><br/>Cambridge Assessment English", body_style),
                Paragraph("2023 – Present<br/>Madrid, Spain", meta_style)
            ]
        ]
        t_exp_en = Table(exp_rows_en, colWidths=[395, 129])
        t_exp_en.setStyle(TableStyle([('VALIGN', (0, 0), (-1, -1), 'TOP'), ('LEFTPADDING', (0, 0), (-1, -1), 0), ('RIGHTPADDING', (0, 0), (-1, -1), 0), ('BOTTOMPADDING', (0, 0), (-1, -1), 1), ('TOPPADDING', (0, 0), (-1, -1), 0)]))
        story.append(t_exp_en)
        story.append(Paragraph("• Safeguarding, custody, and transportation of confidential examination materials under strict international security and audit standards.", bullet_style))
        story.append(Paragraph("• Coordinating invigilator teams and resolving live hardware/network incidents during computerized exam sessions in high-pressure environments.", bullet_style))

        # 5. Technical Stack & Languages
        add_section_divider("Technical Stack & Certifications")
        skills_data_en = [
            [Paragraph("<b>Proficient Languages:</b>", body_style), Paragraph("C (low-level & memory), Java (Spring Boot), TypeScript, JavaScript, Python, SQL, Bash.", body_style)],
            [Paragraph("<b>Foundational / Familiar:</b>", body_style), Paragraph("Go (syntax and fundamentals applied to prototypes and background daemons).", body_style)],
            [Paragraph("<b>Fullstack & Mobile:</b>", body_style), Paragraph("Native Android (Room/SQLite), Node.js, Express, Next.js, React, WebSockets, REST APIs, Redis, PostgreSQL, MySQL.", body_style)],
            [Paragraph("<b>Systems & Security:</b>", body_style), Paragraph("Linux (Ubuntu/Debian, WSL 2), Docker, Docker Compose, Git, eBPF (CO-RE), Raw Sockets, Wireshark, Nmap, Wazuh XDR.", body_style)],
            [Paragraph("<b>Languages & Credentials:</b>", body_style), Paragraph("English: Level B2 Accredited — APTIS ADVANCED (British Council) with professional and operational fluency. · Spanish: Native.", body_style)]
        ]
        t_skills_en = Table(skills_data_en, colWidths=[130, 394])
        t_skills_en.setStyle(TableStyle([
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('LEFTPADDING', (0, 0), (-1, -1), 0),
            ('RIGHTPADDING', (0, 0), (-1, -1), 0),
            ('BOTTOMPADDING', (0, 0), (-1, -1), 1.5),
            ('TOPPADDING', (0, 0), (-1, -1), 0),
        ]))
        story.append(t_skills_en)

    doc.build(story)
    print(f"[+] PDF ({lang.upper()}) generated at {output_path}")


def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    assets_dir = os.path.join(base_dir, "assets")
    os.makedirs(assets_dir, exist_ok=True)

    es_path = os.path.join(assets_dir, "cv_es.pdf")
    en_path = os.path.join(assets_dir, "cv_en.pdf")
    default_path = os.path.join(assets_dir, "cv.pdf")

    build_cv(lang="es", output_path=es_path)
    build_cv(lang="en", output_path=en_path)

    # Keep assets/cv.pdf in sync with Spanish CV for backwards compatibility
    shutil.copyfile(es_path, default_path)
    print(f"[+] Synchronized default CV at {default_path}")


if __name__ == "__main__":
    main()
