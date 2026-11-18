import io
from typing import Dict, Any
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    HRFlowable,
    KeepTogether
)

def generate_pdf_report(report_data: Dict[str, Any]) -> bytes:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=36,
        leftMargin=36,
        topMargin=36,
        bottomMargin=36
    )

    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        "DocTitle",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=20,
        leading=24,
        textColor=colors.HexColor("#1E3A8A")
    )
    subtitle_style = ParagraphStyle(
        "DocSub",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#4B5563")
    )
    h1_style = ParagraphStyle(
        "Heading1",
        parent=styles["Normal"],
        fontName="Helvetica-Bold",
        fontSize=13,
        leading=17,
        textColor=colors.HexColor("#1E3A8A"),
        spaceBefore=10,
        spaceAfter=6
    )
    body_style = ParagraphStyle(
        "Body",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=12,
        textColor=colors.HexColor("#1F2937")
    )
    bullet_style = ParagraphStyle(
        "Bullet",
        parent=styles["Normal"],
        fontName="Helvetica",
        fontSize=8.5,
        leading=12,
        leftIndent=10,
        textColor=colors.HexColor("#1F2937")
    )
    disclaimer_style = ParagraphStyle(
        "Disclaimer",
        parent=styles["Normal"],
        fontName="Helvetica-Oblique",
        fontSize=8,
        leading=11,
        textColor=colors.HexColor("#6B7280"),
        alignment=1  # Center
    )

    story = []

    rel = report_data.get("reliability", {})
    startup_name = rel.get("startup_name", "Startup")
    mode = rel.get("mode", "idea").capitalize()
    overall_score = rel.get("overall_score", 0.0)
    score_badge = rel.get("score_badge", "")
    verdict = rel.get("verdict_title", "")
    created_at = rel.get("created_at", "")[:10]

    # Header
    story.append(Paragraph("STARTUP CO-PILOT — RELIABILITY & READINESS REPORT", subtitle_style))
    story.append(Paragraph(f"{startup_name}", title_style))
    story.append(Paragraph(f"Stage: {mode} Stage  |  Industry: {rel.get('industry', 'N/A')}  |  Date: {created_at}  |  Job ID: {report_data.get('job_id', '')[:8]}", subtitle_style))
    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=1.5, color=colors.HexColor("#2563EB"), spaceBefore=2, spaceAfter=10))

    # Reliability Summary Box
    summary_data = [
        [
            Paragraph(f"<b>Overall Score:</b> <font size=14 color='#2563EB'><b>{overall_score} / 10</b></font> ({score_badge})", body_style),
            Paragraph(f"<b>Confidence:</b> {rel.get('confidence_level', 'Medium')} ({rel.get('assumed_fields_count', 0)} fields assumed)", body_style)
        ],
        [
            Paragraph(f"<b>Verdict:</b> <b>{verdict}</b><br/>{rel.get('verdict_narrative', '')[:200]}", body_style),
            Paragraph(f"<b>Strengths:</b> {rel.get('summary', {}).get('strong_count', 0)} Pillars<br/>"
                      f"<b>Needs Work:</b> {rel.get('summary', {}).get('needs_work_count', 0)} Pillars<br/>"
                      f"<b>Risk Flags:</b> {rel.get('summary', {}).get('risk_count', 0)} Pillars", body_style)
        ]
    ]
    summary_table = Table(summary_data, colWidths=[300, 240])
    summary_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F3F4F6")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#D1D5DB")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E5E7EB")),
        ('TOPPADDING', (0,0), (-1,-1), 6),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(summary_table)
    story.append(Spacer(1, 10))

    # Top 3 Immediate Actions
    story.append(Paragraph("TOP 3 IMMEDIATE ACTIONS", h1_style))
    for i, act in enumerate(rel.get("top_3_actions", []), 1):
        story.append(Paragraph(f"<b>{i}.</b> {act}", bullet_style))
    story.append(Spacer(1, 10))

    # The 10 Pillars Table
    story.append(Paragraph("THE 10 SUCCESS PILLARS AUDIT", h1_style))
    pillar_rows = [["Pillar", "Score", "Status", "Findings & Evidence", "Recommended Fix"]]
    for p in rel.get("pillars", []):
        score_str = f"{p.get('score', 'N/A')}/10" if p.get('score') is not None else "N/A"
        pillar_rows.append([
            Paragraph(f"<b>{p.get('name')}</b><br/><font color='#6B7280' size=7>Basis: {p.get('evidence_basis', '')[:30]}</font>", body_style),
            Paragraph(f"<b>{score_str}</b>", body_style),
            Paragraph(p.get("status", ""), body_style),
            Paragraph(p.get("what_we_found", "")[:140], body_style),
            Paragraph(p.get("recommended_fix", "")[:140], body_style)
        ])
    
    pillar_table = Table(pillar_rows, colWidths=[110, 45, 65, 160, 160])
    pillar_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#1E3A8A")),
        ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('GRID', (0,0), (-1,-1), 0.5, colors.HexColor("#E5E7EB")),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 4),
        ('RIGHTPADDING', (0,0), (-1,-1), 4),
    ]))
    story.append(pillar_table)
    story.append(Spacer(1, 12))

    # Market & Competitor Summary
    market = report_data.get("market", {})
    competitors = report_data.get("competitors", {})
    story.append(Paragraph("MARKET & COMPETITIVE DYNAMICS", h1_style))
    story.append(Paragraph(f"<b>TAM:</b> {market.get('tam', {}).get('value_display', '')}  |  <b>SAM:</b> {market.get('sam', {}).get('value_display', '')}  |  <b>SOM:</b> {market.get('som', {}).get('value_display', '')}", body_style))
    story.append(Paragraph(f"<b>Projected Growth:</b> {market.get('cagr_growth_rate', '')}  |  <b>Timing:</b> {market.get('timing_assessment', '')}", body_style))
    story.append(Paragraph(f"<b>Positioning Whitespace:</b> {competitors.get('positioning_gap', '')}", body_style))
    story.append(Spacer(1, 10))

    # 30-60-90 Day Execution Plan
    plan = report_data.get("execution_plan", {})
    if plan and plan.get("phases"):
        story.append(Paragraph("30-60-90 DAY EXECUTION ROADMAP", h1_style))
        story.append(Paragraph(f"<b>North Star Metric:</b> {plan.get('primary_goal', '')}", body_style))
        for phase in plan.get("phases", []):
            story.append(Paragraph(f"<b>{phase.get('phase_name')}: {phase.get('objective')}</b>", body_style))
            for task in phase.get("tasks", []):
                story.append(Paragraph(f"• <b>[{task.get('owner_role')}]</b> {task.get('title')} — <i>KPI: {task.get('success_metric')}</i>", bullet_style))
        story.append(Spacer(1, 10))

    # Assumptions Log
    assumptions = rel.get("assumptions_log", [])
    if assumptions:
        story.append(Paragraph("TRANSPARENT ASSUMPTIONS LOG", h1_style))
        for asm in assumptions:
            story.append(Paragraph(f"• <b>{asm.get('field_name')}:</b> Assumed {asm.get('assumed_value')} ({asm.get('reason')})", bullet_style))
        story.append(Spacer(1, 10))

    # Disclaimer Footer
    story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#9CA3AF"), spaceBefore=10, spaceAfter=8))
    story.append(Paragraph("AI-based analysis. Not investment or legal advice. Generated by Startup Co-Pilot (PS08).", disclaimer_style))

    doc.build(story)
    return buffer.getvalue()
