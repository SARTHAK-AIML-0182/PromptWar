import { jsPDF } from 'jspdf';
import { FullReport } from '../types';

export function exportReportToPdf(report: FullReport) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const rel = report.reliability;
  const isIdea = rel.mode === 'idea';
  let y = 18;

  // Title & Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('STARTUP CO-PILOT — RELIABILITY & READINESS REPORT', 14, y);
  y += 7;

  doc.setFontSize(18);
  doc.setTextColor(30, 58, 138); // Brand blue
  doc.text(rel.startup_name, 14, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(75, 85, 99);
  doc.text(`Stage: ${rel.mode.toUpperCase()} STAGE   |   Industry: ${rel.industry}   |   Date: ${rel.created_at.slice(0, 10)}`, 14, y);
  y += 4;

  doc.setDrawColor(37, 99, 235);
  doc.setLineWidth(0.6);
  doc.line(14, y, 196, y);
  y += 8;

  // Score Dashboard Card
  doc.setFillColor(243, 244, 246);
  doc.rect(14, y, 182, 28, 'F');
  doc.setDrawColor(209, 213, 219);
  doc.setLineWidth(0.3);
  doc.rect(14, y, 182, 28, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(31, 41, 55);
  doc.text(`Overall Reliability Score: ${rel.overall_score} / 10 (${rel.score_badge})`, 18, y + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Confidence: ${rel.confidence_level} (${rel.assumed_fields_count} fields assumed)`, 18, y + 14);
  doc.text(`Verdict: ${rel.verdict_title}`, 18, y + 20);
  doc.text(`Strengths: ${rel.summary.strong_count} | Needs Work: ${rel.summary.needs_work_count} | Risk: ${rel.summary.risk_count}`, 18, y + 25);
  y += 34;

  // Top 3 Actions
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 58, 138);
  doc.text('TOP 3 IMMEDIATE ACTIONS', 14, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(31, 41, 55);
  rel.top_3_actions.forEach((act, i) => {
    const textLines = doc.splitTextToSize(`${i + 1}. ${act}`, 175);
    doc.text(textLines, 16, y);
    y += textLines.length * 4 + 1;
  });
  y += 4;

  // The 10 Pillars Section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 58, 138);
  doc.text('THE 10 SUCCESS PILLARS AUDIT', 14, y);
  y += 6;

  rel.pillars.forEach((p, idx) => {
    if (y > 270) {
      doc.addPage();
      y = 18;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(17, 24, 39);
    const scoreStr = p.score !== null ? `${p.score}/10` : 'N/A';
    doc.text(`${idx + 1}. ${p.name} [${scoreStr} - ${p.status}]`, 14, y);
    y += 4;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(75, 85, 99);
    const foundLines = doc.splitTextToSize(`Found: ${p.what_we_found}`, 180);
    doc.text(foundLines, 16, y);
    y += foundLines.length * 3.5;

    const fixLines = doc.splitTextToSize(`Recommended Fix: ${p.recommended_fix}`, 180);
    doc.text(fixLines, 16, y);
    y += fixLines.length * 3.5 + 2;
  });

  // Page 2: Market & Roadmap
  doc.addPage();
  y = 18;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 58, 138);
  doc.text('MARKET & COMPETITIVE DYNAMICS', 14, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(31, 41, 55);
  doc.text(`TAM: ${report.market.tam.value_display}   |   SAM: ${report.market.sam.value_display}   |   SOM: ${report.market.som.value_display}`, 14, y);
  y += 5;
  doc.text(`Projected Growth: ${report.market.cagr_growth_rate}`, 14, y);
  y += 5;
  const wsLines = doc.splitTextToSize(`Positioning Whitespace: ${report.competitors.positioning_gap}`, 180);
  doc.text(wsLines, 14, y);
  y += wsLines.length * 4 + 4;

  // Roadmap
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 58, 138);
  doc.text('30-60-90 DAY EXECUTION ROADMAP', 14, y);
  y += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(31, 41, 55);
  doc.text(`North Star Goal: ${report.execution_plan.primary_goal}`, 14, y);
  y += 6;

  report.execution_plan.phases.forEach((ph) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(37, 99, 235);
    doc.text(`${ph.phase_name}: ${ph.objective}`, 14, y);
    y += 4.5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(55, 65, 81);
    ph.tasks.forEach((t) => {
      const tLines = doc.splitTextToSize(`• [${t.owner_role}] ${t.title} (KPI: ${t.success_metric})`, 175);
      doc.text(tLines, 18, y);
      y += tLines.length * 3.5;
    });
    y += 2;
  });

  // Assumptions
  if (rel.assumptions_log && rel.assumptions_log.length > 0) {
    y += 4;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(30, 58, 138);
    doc.text('TRANSPARENT ASSUMPTIONS LOG', 14, y);
    y += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(75, 85, 99);
    rel.assumptions_log.forEach((asm) => {
      doc.text(`• ${asm.field_name}: Assumed ${asm.assumed_value} (${asm.reason})`, 16, y);
      y += 4;
    });
  }

  // Footer Disclaimer
  y = 282;
  doc.setDrawColor(209, 213, 219);
  doc.setLineWidth(0.3);
  doc.line(14, y - 2, 196, y - 2);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(156, 163, 175);
  doc.text('AI-based analysis. Not investment or legal advice. Generated by Startup Co-Pilot (PS08).', 14, y + 2);

  // Trigger browser download
  const safeName = rel.startup_name.replace(/[^a-zA-Z0-9]/g, '_');
  doc.save(`${safeName}_reliability_report.pdf`);
}
