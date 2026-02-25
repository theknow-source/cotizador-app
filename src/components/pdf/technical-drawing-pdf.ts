import jsPDF from "jspdf";
import type { Cotizacion } from "@/lib/types";

export function generateTechnicalDrawingPdf(cotizacion: Cotizacion) {
  const doc = new jsPDF({ orientation: "landscape" });
  const { caja, calculo } = cotizacion;
  const { largo: L, ancho: W, alto: H } = caja;

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // --- Header ---
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("PLANO TÉCNICO — CAJA CRR DESPLEGADA", 14, 15);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`${cotizacion.folio} | ${caja.resistencia} | ${caja.numTintas} tinta${caja.numTintas !== 1 ? "s" : ""}`, 14, 22);
  doc.text(
    `Dimensiones: ${L} × ${W} × ${H} cm | Pliego: ${calculo.largoPliego} × ${calculo.anchoPliego} cm | Área: ${calculo.areaM2} m²`,
    14,
    27
  );

  // --- Drawing area ---
  const drawAreaTop = 35;
  const drawAreaBottom = pageHeight - 20;
  const drawAreaLeft = 30;
  const drawAreaRight = pageWidth - 30;
  const drawWidth = drawAreaRight - drawAreaLeft;
  const drawHeight = drawAreaBottom - drawAreaTop;

  // CRR box dimensions for drawing
  const solapa = 4; // cm
  const flapDepth = W / 2; // cm (half of W for top/bottom flaps)

  // Total unfolded dimensions
  const totalWidth = L + W + L + W + solapa; // horizontal
  const totalHeight = flapDepth + H + flapDepth; // vertical

  // Scale to fit
  const scaleX = drawWidth / (totalWidth + 20); // padding
  const scaleY = drawHeight / (totalHeight + 20);
  const scale = Math.min(scaleX, scaleY);

  // Center offset
  const scaledTotalW = totalWidth * scale;
  const scaledTotalH = totalHeight * scale;
  const offsetX = drawAreaLeft + (drawWidth - scaledTotalW) / 2;
  const offsetY = drawAreaTop + (drawHeight - scaledTotalH) / 2;

  // Helper: convert box coords to page coords
  const px = (x: number) => offsetX + x * scale;
  const py = (y: number) => offsetY + y * scale;

  // Panel positions (from left to right in the central strip)
  const panels = [
    { x: 0, w: L, label: "L" },
    { x: L, w: W, label: "W" },
    { x: L + W, w: L, label: "L" },
    { x: L + W + L, w: W, label: "W" },
    { x: L + W + L + W, w: solapa, label: "Solapa" },
  ];

  // --- Draw panels ---
  doc.setDrawColor(0);
  doc.setLineWidth(0.4);

  // Central strip (the body/walls)
  const bodyTop = flapDepth;
  const bodyBottom = flapDepth + H;

  // Draw main body rectangle
  doc.setFillColor(245, 245, 245);
  doc.rect(
    px(0), py(bodyTop),
    scaledTotalW, H * scale,
    "FD"
  );

  // Panel dividers (vertical dashed lines)
  doc.setLineDashPattern([2, 2], 0);
  doc.setDrawColor(150);
  for (let i = 1; i < panels.length; i++) {
    const x = panels[i].x;
    doc.line(px(x), py(bodyTop), px(x), py(bodyBottom));
  }

  // Solid outline for main body
  doc.setLineDashPattern([], 0);
  doc.setDrawColor(0);
  doc.setLineWidth(0.6);
  doc.rect(px(0), py(bodyTop), scaledTotalW, H * scale);

  // Top flaps (for first 4 panels, not solapa)
  doc.setLineWidth(0.4);
  for (let i = 0; i < 4; i++) {
    const panel = panels[i];
    doc.setFillColor(252, 252, 252);
    doc.rect(
      px(panel.x), py(0),
      panel.w * scale, flapDepth * scale,
      "FD"
    );
  }

  // Bottom flaps
  for (let i = 0; i < 4; i++) {
    const panel = panels[i];
    doc.setFillColor(252, 252, 252);
    doc.rect(
      px(panel.x), py(bodyBottom),
      panel.w * scale, flapDepth * scale,
      "FD"
    );
  }

  // --- Labels inside panels ---
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(80);

  panels.forEach((panel) => {
    const cx = px(panel.x + panel.w / 2);
    const cy = py(bodyTop + H / 2);
    doc.text(panel.label, cx, cy, { align: "center" });
    doc.setFont("helvetica", "normal");
    if (panel.label !== "Solapa") {
      doc.setFontSize(7);
      doc.text(`${panel.w} cm`, cx, cy + 4, { align: "center" });
      doc.setFontSize(8);
    } else {
      doc.setFontSize(7);
      doc.text(`${solapa} cm`, cx, cy + 4, { align: "center" });
      doc.setFontSize(8);
    }
    doc.setFont("helvetica", "bold");
  });

  // Flap labels
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  for (let i = 0; i < 4; i++) {
    const panel = panels[i];
    const cx = px(panel.x + panel.w / 2);
    // Top flap
    doc.text("Flap", cx, py(flapDepth / 2), { align: "center" });
    doc.text(`${flapDepth} cm`, cx, py(flapDepth / 2) + 4, { align: "center" });
    // Bottom flap
    doc.text("Flap", cx, py(bodyBottom + flapDepth / 2), { align: "center" });
    doc.text(`${flapDepth} cm`, cx, py(bodyBottom + flapDepth / 2) + 4, { align: "center" });
  }

  // --- Dimension lines ---
  doc.setDrawColor(200, 50, 50);
  doc.setLineWidth(0.3);
  doc.setTextColor(200, 50, 50);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");

  // Horizontal total dimension (top)
  const dimY = py(0) - 12;
  drawDimLine(doc, px(0), dimY, px(totalWidth), dimY, `${calculo.largoPliego} cm`, py(0) - 5);

  // Vertical total dimension (left)
  const dimX = px(0) - 12;
  drawDimLineV(doc, dimX, py(0), dimX, py(totalHeight), `${calculo.anchoPliego} cm`, px(0) - 5);

  // Vertical H dimension (right side)
  const dimXR = px(totalWidth) + 8;
  drawDimLineV(doc, dimXR, py(bodyTop), dimXR, py(bodyBottom), `H=${H}`, px(totalWidth) + 5);

  // --- Footer ---
  doc.setTextColor(150);
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.text(
    "Plano técnico generado por Cotizador CRR — No a escala real",
    pageWidth / 2,
    pageHeight - 8,
    { align: "center" }
  );

  doc.save(`${cotizacion.folio}-plano.pdf`);
}

function drawDimLine(
  doc: jsPDF,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  label: string,
  tickY: number
) {
  // Ticks
  doc.line(x1, tickY, x1, y1);
  doc.line(x2, tickY, x2, y2);
  // Main line
  doc.line(x1, y1, x2, y2);
  // Arrows
  const arrowSize = 2;
  doc.line(x1, y1, x1 + arrowSize, y1 - arrowSize);
  doc.line(x1, y1, x1 + arrowSize, y1 + arrowSize);
  doc.line(x2, y2, x2 - arrowSize, y2 - arrowSize);
  doc.line(x2, y2, x2 - arrowSize, y2 + arrowSize);
  // Label
  const midX = (x1 + x2) / 2;
  doc.text(label, midX, y1 - 3, { align: "center" });
}

function drawDimLineV(
  doc: jsPDF,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  label: string,
  tickX: number
) {
  // Ticks
  doc.line(tickX, y1, x1, y1);
  doc.line(tickX, y2, x2, y2);
  // Main line
  doc.line(x1, y1, x2, y2);
  // Arrows
  const arrowSize = 2;
  doc.line(x1, y1, x1 - arrowSize, y1 + arrowSize);
  doc.line(x1, y1, x1 + arrowSize, y1 + arrowSize);
  doc.line(x2, y2, x2 - arrowSize, y2 - arrowSize);
  doc.line(x2, y2, x2 + arrowSize, y2 - arrowSize);
  // Label (rotated)
  doc.text(label, x1 - 5, (y1 + y2) / 2, { align: "center", angle: 90 });
}
