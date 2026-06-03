import os
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle

def generate_pdf():
    pdf_path = r"c:\cygwin64\home\portfolio\assets\cv.pdf"
    
    # Page setup - letter size, 20pt top/bottom and 36pt left/right margins
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=letter,
        leftMargin=36,
        rightMargin=36,
        topMargin=20,
        bottomMargin=20
    )
    
    styles = getSampleStyleSheet()
    
    # Custom Paragraph Styles for professional rendering and ATS indexing
    title_style = ParagraphStyle(
        'NameHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=22,
        leading=25,
        textColor=colors.HexColor('#0f172a'),
        spaceAfter=4
    )
    
    subtitle_style = ParagraphStyle(
        'Subtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13,
        textColor=colors.HexColor('#475569'),
        spaceAfter=2
    )
    
    section_heading = ParagraphStyle(
        'SectionHeading',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11.5,
        leading=14,
        textColor=colors.HexColor('#1e3a8a'), # Deep slate blue
        spaceBefore=8,
        spaceAfter=2
    )
    
    body_style = ParagraphStyle(
        'BodyTextCustom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13,
        textColor=colors.HexColor('#334155'), # Neutral dark
        spaceAfter=4
    )
    
    bullet_style = ParagraphStyle(
        'BulletText',
        parent=body_style,
        leftIndent=15,
        spaceAfter=2.5
    )
    
    meta_style = ParagraphStyle(
        'MetaText',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor('#64748b'),
        alignment=2 # Right align
    )
    
    bold_body_style = ParagraphStyle(
        'BoldBody',
        parent=body_style,
        fontName='Helvetica-Bold'
    )
    
    story = []
    
    # 1. Header with Photo (Name, Contacts on Left, Photo on Right)
    photo_path = r"c:\cygwin64\home\portfolio\assets\profile.png"
    
    header_left = []
    header_left.append(Paragraph("Luis Lázaro Pimentel", title_style))
    contact_info = (
        "Madrid, España  |  luislazaropimentel@gmail.com  |  +34 626 01 57 23<br/>"
        "github.com/Thepimen  |  linkedin.com/in/luis-lázaro-pimentel"
    )
    header_left.append(Paragraph(contact_info, subtitle_style))
    
    header_image = Image(photo_path, width=120, height=120)
    
    header_table_data = [
        [header_left, header_image]
    ]
    
    header_table = Table(header_table_data, colWidths=[410, 130])
    header_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('ALIGN', (1,0), (1,0), 'RIGHT'),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
        ('TOPPADDING', (0,0), (-1,-1), 0),
    ]))
    
    story.append(header_table)
    story.append(Spacer(1, 4))
    
    # Section Divider Helper
    def add_section_divider(title):
        story.append(Paragraph(title, section_heading))
        story.append(HRFlowable(
            width="100%",
            thickness=1,
            color=colors.HexColor('#cbd5e1'),
            spaceBefore=2,
            spaceAfter=4
        ))
        
    # 2. Perfil Profesional
    add_section_divider("Perfil Profesional")
    profile_text = (
        "Desarrollador de software de sistemas y entusiasta de la ciberseguridad con una sólida base "
        "en programación a bajo nivel (C/C++), redes y sistemas distribuidos. Especializado en el diseño "
        "de arquitecturas seguras y backends de alto rendimiento (Go, Python, Java/Spring, Node.js). "
        "Nivel C1 de inglés certificado, con excelente capacidad para colaborar y gestionar documentación técnica "
        "en entornos internacionales."
    )
    story.append(Paragraph(profile_text, body_style))
    story.append(Spacer(1, 4))
    
    # 3. Educación
    add_section_divider("Educación")
    
    # Table layout for clean, aligned education metadata
    edu_data = [
        [
            Paragraph("<b>Técnico Superior en Desarrollo de Aplicaciones Multiplataforma (DAM)</b><br/>Nebrija Formación Profesional", body_style),
            Paragraph("2025 – Actualidad<br/>Madrid, España", meta_style)
        ]
    ]
    t_edu1 = Table(edu_data, colWidths=[400, 140])
    t_edu1.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2),
        ('TOPPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(t_edu1)
    story.append(Paragraph("• Especialización en desarrollo Full Stack, bases de datos relacionales y despliegue seguro de aplicaciones.", bullet_style))
    story.append(Spacer(1, 2))
    
    edu_data2 = [
        [
            Paragraph("<b>Grado en Ingeniería de Software</b><br/>U-tad (Centro Universitario de Tecnología y Arte Digital)", body_style),
            Paragraph("2023 – 2025<br/>Madrid, España", meta_style)
        ]
    ]
    t_edu2 = Table(edu_data2, colWidths=[400, 140])
    t_edu2.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2),
        ('TOPPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(t_edu2)
    story.append(Paragraph("• Asignaturas clave: Estructuras de Datos y Algoritmos, Sistemas Operativos, Redes y Comunicaciones, Gestión de Memoria, Bases de Datos.", bullet_style))
    story.append(Spacer(1, 4))
    
    # 4. Proyectos Técnicos
    add_section_divider("Proyectos Técnicos")
    
    def add_project(name, tech, desc_bullets):
        proj_header = f"<b>{name}</b> — <i>{tech}</i>"
        story.append(Paragraph(proj_header, body_style))
        for bullet in desc_bullets:
            story.append(Paragraph(f"• {bullet}", bullet_style))
        story.append(Spacer(1, 2))
 
    add_project(
        "ShadowAudit (Vulnerabiliy Scanner)",
        "TypeScript, Next.js, Express, Python, Redis, Docker, Nmap",
        [
            "Monorepo de auditoría de seguridad automatizada con arquitectura de microservicios decoupled.",
            "API Gateway en Express que gestiona colas en Redis para distribuir tareas a workers en Python.",
            "Escáner Nmap integrado para detección de puertos y servicios, con motor de fallback basado en Raw Sockets."
        ]
    )
    
    add_project(
        "OmniLens (Telemetry SaaS)",
        "React, Node.js, WebSockets, OpenAI API, CSS Grid",
        [
            "Plataforma de análisis de telemetría y diagnóstico de excepciones de red en tiempo real.",
            "Canal de datos bidireccional mediante WebSockets de baja latencia para streaming de logs.",
            "Integración de LLM (OpenAI) para analizar trazas de error e inyectar playbooks de remediación instantáneos."
        ]
    )
    
    add_project(
        "NanoKV (Distributed DB)",
        "Go (Golang), Distributed Systems, Consistent Hashing, WAL",
        [
            "Base de datos distribuida clave-valor ligera con particionamiento consistente (Sharding).",
            "Mecanismo Write-Ahead Log (WAL) para garantizar persistencia y tolerancia a fallos en caso de crash."
        ]
    )
    
    # 5. Habilidades Técnicas
    add_section_divider("Habilidades Técnicas")
    
    skills_data = [
        [Paragraph("<b>Lenguajes y Sistemas:</b>", body_style), Paragraph("C, C++, Go, Python, Java (Spring Boot), Bash, Linux Kernel, SQL.", body_style)],
        [Paragraph("<b>Tecnologías y Web:</b>", body_style), Paragraph("Node.js, Express, Next.js, React, WebSockets, Socket.io, Redis, MySQL.", body_style)],
        [Paragraph("<b>Infraestructura y Redes:</b>", body_style), Paragraph("Docker, Docker Compose, Git, Wireshark, UFW, Nmap, Raw Sockets.", body_style)],
        [Paragraph("<b>Idiomas:</b>", body_style), Paragraph("Español (Nativo), Inglés (C1 Avanzado - Cambridge Supervisor).", body_style)]
    ]
    t_skills = Table(skills_data, colWidths=[140, 400])
    t_skills.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2),
        ('TOPPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(t_skills)
    story.append(Spacer(1, 4))
    
    # 6. Experiencia Laboral
    add_section_divider("Experiencia Laboral")
    
    exp_data = [
        [
            Paragraph("<b>Supervisor y Logística de Exámenes Oficiales</b><br/>Cambridge Assessment English", body_style),
            Paragraph("2023 – Actualidad<br/>Madrid, España", meta_style)
        ]
    ]
    t_exp = Table(exp_data, colWidths=[400, 140])
    t_exp.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('LEFTPADDING', (0,0), (-1,-1), 0),
        ('RIGHTPADDING', (0,0), (-1,-1), 0),
        ('BOTTOMPADDING', (0,0), (-1,-1), 2),
        ('TOPPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(t_exp)
    story.append(Paragraph("• Custodia de materiales confidenciales y estricta aplicación de protocolos de seguridad internacionales.", bullet_style))
    story.append(Paragraph("• Coordinación y resolución de incidentes técnicos en plataformas de examen digitalizadas.", bullet_style))
    
    # Build Document
    doc.build(story)
    print("[+] PDF Generated successfully at assets/cv.pdf")

if __name__ == "__main__":
    generate_pdf()
