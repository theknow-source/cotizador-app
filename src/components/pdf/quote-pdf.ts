import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Cotizacion, DatosEmpresa } from "@/lib/types";
import { formatMXN, formatDateLong } from "@/lib/format";

export function generateQuotePdf(
  cotizacion: Cotizacion,
  empresa: DatosEmpresa
) {
  const doc = new jsPDF();
  const { cliente, caja, calculo } = cotizacion;
  const pageWidth = doc.internal.pageSize.getWidth();

  // --- Header empresa ---
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(empresa.nombre || "Cajas CRR", 14, 20);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  let headerY = 26;
  if (empresa.direccion) {
    doc.text(empresa.direccion, 14, headerY);
    headerY += 4;
  }
  if (empresa.telefono) {
    doc.text(`Tel: ${empresa.telefono}`, 14, headerY);
    headerY += 4;
  }
  if (empresa.email) {
    doc.text(empresa.email, 14, headerY);
    headerY += 4;
  }
  if (empresa.rfc) {
    doc.text(`RFC: ${empresa.rfc}`, 14, headerY);
    headerY += 4;
  }

  // Folio y fecha a la derecha
  doc.setTextColor(0);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(cotizacion.folio, pageWidth - 14, 20, { align: "right" });
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text(formatDateLong(cotizacion.fecha), pageWidth - 14, 26, {
    align: "right",
  });

  // Línea separadora
  doc.setDrawColor(200);
  doc.setLineWidth(0.5);
  const lineY = Math.max(headerY + 4, 40);
  doc.line(14, lineY, pageWidth - 14, lineY);

  // --- Datos del cliente ---
  let y = lineY + 10;
  doc.setTextColor(0);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("DATOS DEL CLIENTE", 14, y);
  y += 7;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  const clienteLines = [
    `Nombre: ${cliente.nombre}`,
    cliente.empresa ? `Empresa: ${cliente.empresa}` : "",
    cliente.telefono ? `Teléfono: ${cliente.telefono}` : "",
    cliente.email ? `Email: ${cliente.email}` : "",
  ].filter(Boolean);

  clienteLines.forEach((line) => {
    doc.text(line, 14, y);
    y += 5;
  });

  y += 5;

  // --- Especificaciones ---
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("ESPECIFICACIONES DE LA CAJA", 14, y);
  y += 3;

  autoTable(doc, {
    startY: y,
    head: [["Concepto", "Valor"]],
    body: [
      ["Dimensiones interiores (L × W × H)", `${caja.largo} × ${caja.ancho} × ${caja.alto} cm`],
      ["Resistencia", caja.resistencia],
      ["Tintas", caja.numTintas === 0 ? "Sin tintas" : `${caja.numTintas} tinta${caja.numTintas > 1 ? "s" : ""}`],
      ["Cantidad", `${caja.cantidad.toLocaleString()} piezas`],
      ["Largo pliego", `${calculo.largoPliego} cm`],
      ["Ancho pliego", `${calculo.anchoPliego} cm`],
      ["Área del pliego", `${calculo.areaM2} m²`],
    ],
    theme: "striped",
    headStyles: { fillColor: [41, 41, 41] },
    margin: { left: 14, right: 14 },
    styles: { fontSize: 9 },
  });

  // @ts-expect-error jspdf-autotable extends jsPDF
  y = doc.lastAutoTable.finalY + 10;

  // --- Desglose de precio ---
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("DESGLOSE DE PRECIO", 14, y);
  y += 3;

  const precioBody: (string | number)[][] = [
    ["Costo base (área × precio/m²)", formatMXN(calculo.costoBase)],
  ];

  if (calculo.recargoTintas > 0) {
    precioBody.push([
      `Recargo tintas (${caja.numTintas} × 3%)`,
      formatMXN(calculo.recargoTintas),
    ]);
  }

  precioBody.push(
    ["Precio unitario de venta (margen 30%)", formatMXN(calculo.precioVenta)],
    [`Cantidad: ${caja.cantidad.toLocaleString()} piezas`, ""],
  );

  autoTable(doc, {
    startY: y,
    head: [["Concepto", "Monto"]],
    body: precioBody,
    foot: [["TOTAL", formatMXN(calculo.total)]],
    theme: "striped",
    headStyles: { fillColor: [41, 41, 41] },
    footStyles: {
      fillColor: [41, 41, 41],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 11,
    },
    margin: { left: 14, right: 14 },
    styles: { fontSize: 9 },
    columnStyles: {
      1: { halign: "right" },
    },
  });

  // --- Notas ---
  if (cotizacion.notas) {
    // @ts-expect-error jspdf-autotable extends jsPDF
    y = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("NOTAS", 14, y);
    y += 6;
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(cotizacion.notas, pageWidth - 28);
    doc.text(lines, 14, y);
  }

  // --- Footer ---
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text(
    "Cotización generada por Cotizador CRR",
    pageWidth / 2,
    pageHeight - 10,
    { align: "center" }
  );

  doc.save(`${cotizacion.folio}.pdf`);
}
