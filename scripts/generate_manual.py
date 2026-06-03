import sys
import os
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, ListFlowable, ListItem
from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super(NumberedCanvas, self).__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_elements(num_pages)
            super(NumberedCanvas, self).showPage()
        super(NumberedCanvas, self).save()

    def draw_page_elements(self, page_count):
        # Omitir encabezado y pie de página en la portada
        if self._pageNumber == 1:
            return
            
        self.saveState()
        
        # Color corporativo para decoraciones (Morado Calafate: #31254A)
        primary_color = HexColor("#31254A")
        text_muted = HexColor("#767576")
        border_light = HexColor("#E8E8E8")
        
        # Encabezado (Header)
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(primary_color)
        self.drawString(54, 750, "CALAFATE PROPIEDADES")
        self.setFont("Helvetica", 8)
        self.setFillColor(text_muted)
        self.drawRightString(558, 750, "Manual de Usuario - Panel de Administración v1.0")
        
        # Línea divisoria del encabezado
        self.setStrokeColor(border_light)
        self.setLineWidth(0.5)
        self.line(54, 742, 558, 742)
        
        # Línea divisoria del pie de página
        self.line(54, 60, 558, 60)
        
        # Pie de página (Footer)
        self.drawString(54, 45, "Confidencial · Uso Exclusivo Interno")
        page_text = f"Página {self._pageNumber} de {page_count}"
        self.drawRightString(558, 45, page_text)
        
        self.restoreState()

def build_pdf(filename):
    # Márgenes: 54 pt (0.75 pulgadas) en los lados, 72 pt (1 pulgada) arriba/abajo para dejar espacio a encabezado/pie de página
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=72,
        bottomMargin=72
    )
    
    styles = getSampleStyleSheet()
    
    # Colores Corporativos
    c_primary = HexColor("#31254A")      # Morado Calafate
    c_secondary = HexColor("#4c5728")    # Verde Oliva Corporativo
    c_text = HexColor("#2B2B2B")         # Negro suave
    c_muted = HexColor("#767576")        # Plomo
    c_bg_light = HexColor("#F4F2F8")     # Fondo claro morado
    c_bg_alert = HexColor("#FCF9F2")     # Fondo claro alerta (dorado)
    
    # Nuevos estilos tipográficos basados en los tokens de diseño
    style_normal = ParagraphStyle(
        'ManualNormal',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=c_text,
        alignment=TA_LEFT
    )
    
    style_justify = ParagraphStyle(
        'ManualJustify',
        parent=style_normal,
        alignment=TA_JUSTIFY
    )
    
    style_bold = ParagraphStyle(
        'ManualBold',
        parent=style_normal,
        fontName='Helvetica-Bold'
    )
    
    style_cover_title = ParagraphStyle(
        'CoverTitle',
        parent=style_normal,
        fontName='Helvetica-Bold',
        fontSize=28,
        leading=34,
        textColor=HexColor("#FFFFFF"),
        alignment=TA_CENTER
    )
    
    style_cover_subtitle = ParagraphStyle(
        'CoverSubtitle',
        parent=style_normal,
        fontName='Helvetica',
        fontSize=13,
        leading=18,
        textColor=HexColor("#E2DDF0"),
        alignment=TA_CENTER
    )
    
    style_h1 = ParagraphStyle(
        'ManualH1',
        parent=style_normal,
        fontName='Helvetica-Bold',
        fontSize=18,
        leading=22,
        textColor=c_primary,
        spaceBefore=18,
        spaceAfter=8,
        keepWithNext=True
    )
    
    style_h2 = ParagraphStyle(
        'ManualH2',
        parent=style_normal,
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=c_secondary,
        spaceBefore=14,
        spaceAfter=6,
        keepWithNext=True
    )
    
    style_h3 = ParagraphStyle(
        'ManualH3',
        parent=style_normal,
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=14,
        textColor=c_primary,
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )
    
    style_bullet = ParagraphStyle(
        'ManualBullet',
        parent=style_normal,
        leftIndent=20,
        firstLineIndent=-10,
        spaceAfter=4
    )
    
    style_callout = ParagraphStyle(
        'ManualCallout',
        parent=style_normal,
        fontSize=9.5,
        leading=13.5,
        textColor=HexColor("#2B2B2B")
    )
    
    story = []
    
    # ---------------------------------------------------------
    # PORTADA (COVER PAGE)
    # ---------------------------------------------------------
    story.append(Spacer(1, 40))
    
    # Banner superior
    banner_data = [
        [Paragraph("<br/><br/><b>MANUAL DE USUARIO</b><br/>Panel de Administración y Control Comercial<br/><br/>", style_cover_title)],
        [Paragraph("Sistema de Gestión Inmobiliaria · Calafate Propiedades", style_cover_subtitle)]
    ]
    banner_table = Table(banner_data, colWidths=[504])
    banner_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), c_primary),
        ('ALIGN', (0,0), (-1,-1), 'CENTER'),
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 30),
        ('TOPPADDING', (0,0), (-1,-1), 20),
        ('LEFTPADDING', (0,0), (-1,-1), 20),
        ('RIGHTPADDING', (0,0), (-1,-1), 20),
    ]))
    story.append(banner_table)
    
    story.append(Spacer(1, 150))
    
    # Información del manual
    meta_text = """
    <b>Preparado para:</b> Calafate Propiedades<br/>
    <b>Desarrollado por:</b> Área de Tecnología e Integraciones<br/>
    <b>Fecha de Publicación:</b> Junio 2026<br/>
    <b>Versión del Documento:</b> 1.0.0 (Estable)<br/>
    <b>Estado del Sistema:</b> Producción
    """
    
    meta_table = Table([[Paragraph(meta_text, style_normal)]], colWidths=[300])
    meta_table.setStyle(TableStyle([
        ('LINELEFT', (0,0), (0,-1), 3, c_secondary),
        ('LEFTPADDING', (0,0), (-1,-1), 12),
        ('TOPPADDING', (0,0), (-1,-1), 0),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(meta_table)
    
    story.append(PageBreak())
    
    # ---------------------------------------------------------
    # ÍNDICE / TABLA DE CONTENIDOS (TOC)
    # ---------------------------------------------------------
    story.append(Paragraph("Tabla de Contenidos", style_h1))
    story.append(Spacer(1, 10))
    
    toc_items = [
        ("1. Introducción y Acceso al Sistema", "3"),
        ("2. El Dashboard Principal (Inicio)", "3"),
        ("3. Gestión de Propiedades (Casas, Terrenos y Proyectos)", "4"),
        ("4. Recepción de Consultas y Atribución UTM (Leads)", "5"),
        ("5. Edición de Páginas de Contenido Estático", "6"),
        ("6. Panel SEO y Códigos de Seguimiento (GA4, Pixel, CAPI)", "6"),
        ("7. Configuración General del Sitio (WhatsApp y UF a CLP)", "7"),
        ("8. Soporte y Solución de Problemas Frecuentes", "7")
    ]
    
    toc_table_data = []
    for title, page in toc_items:
        toc_table_data.append([
            Paragraph(f"<b>{title}</b>", style_normal),
            Paragraph(". "*40, ParagraphStyle('dots', parent=style_normal, textColor=c_muted, alignment=TA_RIGHT)),
            Paragraph(f"<b>{page}</b>", ParagraphStyle('page', parent=style_normal, alignment=TA_RIGHT))
        ])
        
    toc_table = Table(toc_table_data, colWidths=[240, 224, 40])
    toc_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'BOTTOM'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('TOPPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(toc_table)
    
    story.append(PageBreak())
    
    # ---------------------------------------------------------
    # CONTENIDO DEL MANUAL
    # ---------------------------------------------------------
    
    # SECCIÓN 1: INTRODUCCIÓN Y ACCESO
    story.append(Paragraph("1. Introducción y Acceso al Sistema", style_h1))
    story.append(Paragraph(
        "El Panel de Administración de Calafate Propiedades es el motor central del sitio web. Permite a los agentes inmobiliarios y directivos actualizar el catálogo de propiedades, gestionar consultas de clientes en tiempo real, configurar integraciones de marketing y adaptar la información básica de la empresa sin requerir conocimientos de programación.",
        style_justify
    ))
    story.append(Spacer(1, 8))
    story.append(Paragraph("Acceso al Panel:", style_h2))
    story.append(Paragraph(
        "Para ingresar al panel de control de la plataforma, siga estas instrucciones:",
        style_normal
    ))
    
    access_steps = [
        "Abra su navegador web e ingrese a la dirección: <b>https://calafatepropiedades.com/admin</b>.",
        "El sistema le mostrará la pantalla de inicio de sesión. Ingrese su correo corporativo autorizado (ejemplo: <code>admin@calafatepropiedades.com</code>).",
        "Escriba su contraseña de seguridad y presione el botón <b>Iniciar Sesión</b>."
    ]
    for step in access_steps:
        story.append(Paragraph(f"• {step}", style_bullet))
        
    story.append(Spacer(1, 10))
    
    # Caja de advertencia (Callout)
    warning_content = """
    <b>IMPORTANTE:</b> Las credenciales de acceso son personales e intransferibles. El sistema registra las acciones comerciales realizadas por cada usuario (auditoría de cambios). Si sospecha que sus claves han sido comprometidas, comuníquese de inmediato con el soporte técnico.
    """
    warning_table = Table([[Paragraph(warning_content, style_callout)]], colWidths=[504])
    warning_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), c_bg_alert),
        ('LINELEFT', (0,0), (0,-1), 3, HexColor("#D9A74A")),
        ('TOPPADDING', (0,0), (-1,-1), 10),
        ('BOTTOMPADDING', (0,0), (-1,-1), 10),
        ('LEFTPADDING', (0,0), (-1,-1), 12),
        ('RIGHTPADDING', (0,0), (-1,-1), 12),
    ]))
    story.append(warning_table)
    
    story.append(Spacer(1, 20))
    
    # SECCIÓN 2: DASHBOARD PRINCIPAL
    story.append(Paragraph("2. El Dashboard Principal (Inicio)", style_h1))
    story.append(Paragraph(
        "Una vez autenticado, ingresará a la pantalla de <b>Inicio (Dashboard)</b>. Esta sección está diseñada como una sala de situación u oficina virtual, proporcionando métricas de rendimiento en tiempo real y accesos rápidos.",
        style_justify
    ))
    story.append(Spacer(1, 8))
    story.append(Paragraph("Métricas de Control Rápido (KPIs):", style_h2))
    
    kpis = [
        "<b>Total propiedades:</b> Muestra el volumen total de fichas inmobiliarias registradas en la base de datos (tanto publicadas como borradores).",
        "<b>Publicadas:</b> Cantidad exacta de propiedades visibles en la web pública para los clientes.",
        "<b>Borradores:</b> Propiedades que están en proceso de creación o edición, y que están ocultas para el público.",
        "<b>Consultas recibidas (Leads):</b> Registro histórico de los formularios que han completado los visitantes."
    ]
    for kpi in kpis:
        story.append(Paragraph(f"• {kpi}", style_bullet))
        
    story.append(Spacer(1, 10))
    story.append(Paragraph("Alertas de Atención Inmediata:", style_h2))
    story.append(Paragraph(
        "El Dashboard destaca en la parte superior el número de <b>consultas pendientes de respuesta</b>. Si existen consultas sin atender, el panel mostrará un aviso dorado. Se recomienda responder en el menor tiempo posible para maximizar la efectividad de las campañas publicitarias.",
        style_justify
    ))
    
    story.append(Spacer(1, 20))
    
    # SECCIÓN 3: GESTIÓN DE PROPIEDADES
    story.append(Paragraph("3. Gestión de Propiedades", style_h1))
    story.append(Paragraph(
        "La gestión de propiedades es el módulo más dinámico del sitio. Se accede desde el menú izquierdo haciendo clic en <b>Propiedades</b>. Aquí podrá crear, editar y archivar el catálogo.",
        style_justify
    ))
    story.append(Spacer(1, 8))
    
    story.append(Paragraph("Crear una nueva Propiedad:", style_h2))
    story.append(Paragraph(
        "Haga clic en el botón <b>Nueva propiedad</b> situado en la parte superior derecha. Rellene los campos requeridos divididos en las siguientes pestañas técnicas:",
        style_normal
    ))
    
    tabs = [
        "<b>Información Básica:</b> Título en Español (obligatorio) e Inglés (opcional), descripción detallada del terreno o casa, tipo de propiedad (Casa o Terreno), tipo de operación (Venta o Arriendo) e indicación de propiedad destacada.",
        "<b>Precio y Finanzas:</b> Moneda de publicación (CLP o UF) y el valor numérico. El sistema calcula de forma dinámica su equivalente aproximado según el tipo de cambio configurado.",
        "<b>Ubicación:</b> Región, Comuna y Dirección. Podrá arrastrar un marcador en un mapa interactivo para fijar la geolocalización exacta que se mostrará al cliente.",
        "<b>Imágenes y Multimedia:</b> Subida de imágenes arrastrándolas o seleccionándolas desde su computador. Estas se alojan de forma segura en Supabase Storage. Puede marcar una de ellas como portada o reordenarlas.",
        "<b>Características Técnicas:</b> Superficie útil, superficie total (en metros cuadrados o hectáreas), número de habitaciones y baños."
    ]
    for tab in tabs:
        story.append(Paragraph(f"• {tab}", style_bullet))
        
    story.append(Spacer(1, 10))
    story.append(Paragraph("Casos Especiales: Loteos y Proyectos de Parcelas", style_h2))
    story.append(Paragraph(
        "Para configurar un proyecto de parcelas (loteo) que tenga múltiples lotes en venta:",
        style_normal
    ))
    story.append(Paragraph(
        "1. Seleccione tipo de propiedad: <b>Terreno</b>.<br/>"
        "2. Indique que es un proyecto e ingrese el <b>Total de lotes</b> y los <b>Lotes disponibles</b>.<br/>"
        "3. Esto cambiará la vista del cliente de forma automática para mostrar las parcelas disponibles y un diseño optimizado de proyecto.",
        style_bullet
    ))
    
    story.append(PageBreak())
    
    # SECCIÓN 4: LEADS Y ATRIBUCIÓN UTM
    story.append(Paragraph("4. Recepción de Consultas y Atribución UTM (Leads)", style_h1))
    story.append(Paragraph(
        "Cada vez que un visitante completa el formulario de contacto o consulta desde la ficha de una propiedad, el sistema genera una entrada en la base de datos de <b>Leads (Consultas)</b>.",
        style_justify
    ))
    story.append(Spacer(1, 8))
    
    story.append(Paragraph("Información Capturada por Lead:", style_h2))
    story.append(Paragraph(
        "Al hacer clic en cualquier consulta en <b>Admin > Consultas</b>, se desplegará el historial completo del cliente:",
        style_normal
    ))
    
    lead_info = [
        "<b>Datos de contacto:</b> Nombre completo, dirección de correo electrónico y teléfono celular.",
        "<b>Propiedad de Interés:</b> Enlace directo a la propiedad por la que el cliente consultó.",
        "<b>Mensaje del cliente:</b> Texto escrito por el usuario en el formulario.",
        "<b>Atribución UTM (Marketing):</b> Si el cliente llegó al sitio a través de una campaña pagada (ej. anuncios de Facebook o Instagram), el sistema captura automáticamente los campos <i>Origen (utm_source)</i>, <i>Medio (utm_medium)</i>, <i>Campaña (utm_campaign)</i> y <i>Contenido (utm_content)</i>."
    ]
    for item in lead_info:
        story.append(Paragraph(f"• {item}", style_bullet))
        
    story.append(Spacer(1, 10))
    
    story.append(Paragraph("Gestión del Ciclo de Vida del Cliente:", style_h2))
    story.append(Paragraph(
        "Los agentes comerciales deben actualizar el estado del Lead para llevar un orden administrativo. Los estados posibles son:",
        style_normal
    ))
    
    states = [
        "<b>Pendiente (Color Dorado):</b> El cliente acaba de enviar su consulta y no ha sido atendido.",
        "<b>Contactado (Color Verde):</b> Se ha llamado o enviado un correo al cliente para iniciar la gestión.",
        "<b>Cerrado/Archivado (Color Rojo):</b> La venta o gestión finalizó o fue descartada."
    ]
    for state in states:
        story.append(Paragraph(f"• {state}", style_bullet))
        
    story.append(Spacer(1, 10))
    
    # Caja de consejos (Callout)
    tip_content = """
    <b>CONSEJO DE MARKETING:</b> Utiliza el botón <b>Exportar Consultas</b> para descargar la base de datos en formato Excel/CSV. Esto es ideal para realizar campañas de remarketing por correo electrónico o analizar la efectividad de tus canales publicitarios.
    """
    tip_table = Table([[Paragraph(tip_content, style_callout)]], colWidths=[504])
    tip_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), c_bg_light),
        ('LINELEFT', (0,0), (0,-1), 3, c_primary),
        ('TOPPADDING', (0,0), (-1,-1), 10),
        ('BOTTOMPADDING', (0,0), (-1,-1), 10),
        ('LEFTPADDING', (0,0), (-1,-1), 12),
        ('RIGHTPADDING', (0,0), (-1,-1), 12),
    ]))
    story.append(tip_table)
    
    story.append(Spacer(1, 20))
    
    # SECCIÓN 5: EDICIÓN DE PÁGINAS ESTÁTICAS
    story.append(Paragraph("5. Edición de Páginas de Contenido Estático", style_h1))
    story.append(Paragraph(
        "El sitio web cuenta con páginas institucionales y de información técnica, tales como <b>Nosotros</b> o <b>Topografía</b>. Para cambiar el texto y las secciones de estas páginas:",
        style_justify
    ))
    
    pages_steps = [
        "Diríjase a la sección <b>Páginas</b> en el menú lateral.",
        "Verá la lista de páginas estáticas disponibles en el sistema. Seleccione la página que desea editar haciendo clic sobre ella.",
        "Modifique el contenido textual y de diseño usando el editor visual.",
        "Haga clic en <b>Guardar Cambios</b>. El sistema revalidará la página en producción automáticamente de forma instantánea."
    ]
    for step in pages_steps:
        story.append(Paragraph(f"{step}", style_bullet))
        
    story.append(PageBreak())
    
    # SECCIÓN 6: PANEL SEO Y CÓDIGOS DE SEGUIMIENTO
    story.append(Paragraph("6. Panel SEO y Códigos de Seguimiento (Métricas)", style_h1))
    story.append(Paragraph(
        "Para posicionar el sitio web en Google y rastrear tus campañas de anuncios pagados en redes sociales (Facebook/Instagram), el panel dispone de un apartado de <b>SEO Avanzado</b>.",
        style_justify
    ))
    story.append(Spacer(1, 8))
    
    story.append(Paragraph("Pestaña 1: Configuración de Búsqueda (SEO):", style_h2))
    story.append(Paragraph(
        "Permite definir el nombre corporativo del sitio web, títulos predeterminados en español e inglés, descripción SEO global, palabras clave (*Keywords*) y el código de verificación para dar de alta el sitio en Google Search Console.",
        style_justify
    ))
    
    story.append(Spacer(1, 8))
    story.append(Paragraph("Pestaña 2: Códigos de Seguimiento y Píxeles de Conversión:", style_h2))
    story.append(Paragraph(
        "Aquí se configuran los códigos que conectan el sitio web con tus cuentas de analítica y anuncios. No es necesario editar el código fuente de la aplicación; solo debes pegar el identificador en los siguientes campos:",
        style_normal
    ))
    
    pixels = [
        "<b>Google Analytics (GA4):</b> Ingresa tu ID de medición con formato <code>G-XXXXXXXXXX</code> para registrar visitas, procedencia geográfica y tiempo de permanencia.",
        "<b>Meta Pixel (Facebook/Instagram):</b> Ingresa el identificador de tu Pixel para hacer seguimiento de las personas que entran al catálogo de propiedades.",
        "<b>Meta Conversions API (CAPI):</b> Si usas campañas publicitarias avanzadas en Meta, introduce el Token del servidor para enviar las conversiones de consultas de forma directa y blindada contra bloqueadores de anuncios de navegador."
    ]
    for pixel in pixels:
        story.append(Paragraph(f"• {pixel}", style_bullet))
        
    story.append(Spacer(1, 20))
    
    # SECCIÓN 7: CONFIGURACIÓN GENERAL DEL SITIO
    story.append(Paragraph("7. Configuración General del Sitio (Ajustes)", style_h1))
    story.append(Paragraph(
        "La sección <b>Ajustes</b> se utiliza para editar datos administrativos e institucionales de Calafate Propiedades. Contiene los siguientes apartados clave:",
        style_justify
    ))
    
    ajustes_list = [
        "<b>Información de Contacto:</b> Número telefónico comercial y enlace directo a WhatsApp (que controla el botón flotante en la web), dirección física de la oficina principal y dirección de correo corporativo.",
        "<b>Tipo de Cambio (UF a CLP):</b> Permite configurar el valor oficial del día de la Unidad de Fomento (UF). El sistema utiliza este valor para convertir automáticamente los precios de las parcelas o propiedades y mostrárselos al usuario final en ambas monedas de manera clara.",
        "<b>Enlaces Corporativos:</b> Controla los enlaces de redes sociales (Instagram, Facebook) visibles en el pie de página (footer) de la web."
    ]
    for ajuste in ajustes_list:
        story.append(Paragraph(f"• {ajuste}", style_bullet))
        
    story.append(Spacer(1, 20))
    
    # SECCIÓN 8: SOPORTE Y SOLUCIÓN DE PROBLEMAS
    story.append(Paragraph("8. Soporte y Solución de Problemas Frecuentes", style_h1))
    story.append(Paragraph(
        "A continuación, se listan los problemas comunes detectados por el sistema y sus soluciones rápidas:",
        style_normal
    ))
    
    trouble_table_data = [
        [Paragraph("<b>Problema Común</b>", style_bold), Paragraph("<b>Solución Recomendada</b>", style_bold)],
        [
            Paragraph("La conversión de precios de UF a CLP no coincide con el valor real.", style_normal),
            Paragraph("Ve a <b>Admin > Ajustes</b> y actualiza manualmente el valor del día de la UF.", style_normal)
        ],
        [
            Paragraph("Las imágenes cargadas en una propiedad no se visualizan.", style_normal),
            Paragraph("Verifica que las imágenes no superen los 10 MB cada una y que estén en formatos estándar (JPEG, PNG, WEBP).", style_normal)
        ],
        [
            Paragraph("No se reciben notificaciones por correo de nuevos leads.", style_normal),
            Paragraph("Revisa en <b>Ajustes</b> que los correos de destino estén correctamente escritos y separados por comas.", style_normal)
        ],
        [
            Paragraph("El panel muestra alerta de error de base de datos.", style_normal),
            Paragraph("Comunícate con soporte para revisar las credenciales de Supabase o Vercel.", style_normal)
        ]
    ]
    
    trouble_table = Table(trouble_table_data, colWidths=[200, 304])
    trouble_table.setStyle(TableStyle([
        ('GRID', (0,0), (-1,-1), 0.5, HexColor("#D1D1D1")),
        ('BACKGROUND', (0,0), (-1,0), c_bg_light),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 8),
        ('TOPPADDING', (0,0), (-1,-1), 8),
        ('LEFTPADDING', (0,0), (-1,-1), 10),
        ('RIGHTPADDING', (0,0), (-1,-1), 10),
    ]))
    story.append(trouble_table)
    
    # Build Document using NumberedCanvas
    doc.build(story, canvasmaker=NumberedCanvas)

if __name__ == "__main__":
    output_pdf = "Manual_Usuario_Panel_Admin.pdf"
    if len(sys.argv) > 1:
        output_pdf = sys.argv[1]
    build_pdf(output_pdf)
    print(f"PDF generado exitosamente en: {output_pdf}")
