import type { Calculo, DatosCaja, PrecioResistencia } from "./types";
import { MARGEN_VENTA, PORCENTAJE_TINTA } from "./constants";

export function calcularCotizacion(
  caja: DatosCaja,
  precios: PrecioResistencia[]
): Calculo {
  const { largo, ancho, alto, resistencia, numTintas, cantidad } = caja;

  // Largo pliego = 2L + 2W + 8cm (4 solapa + 4 refil)
  const largoPliego = 2 * largo + 2 * ancho + 8;

  // Ancho pliego = H + W + 0.5cm
  const anchoPliego = alto + ancho + 0.5;

  // Area en m²
  const areaM2 = (largoPliego * anchoPliego) / 10000;

  // Precio por m² según resistencia
  const precioConfig = precios.find((p) => p.resistencia === resistencia);
  const precioM2 = precioConfig?.precioM2 ?? 0;

  // Costo base
  const costoBase = areaM2 * precioM2;

  // Recargo tintas = costo base × (num_tintas × 3%)
  const recargoTintas = costoBase * (numTintas * PORCENTAJE_TINTA);

  // Precio venta = (costo base + recargo) × 1.30
  const precioVenta = (costoBase + recargoTintas) * MARGEN_VENTA;

  // Total = precio venta × cantidad
  const total = precioVenta * cantidad;

  return {
    largoPliego: Math.round(largoPliego * 100) / 100,
    anchoPliego: Math.round(anchoPliego * 100) / 100,
    areaM2: Math.round(areaM2 * 10000) / 10000,
    costoBase: Math.round(costoBase * 100) / 100,
    recargoTintas: Math.round(recargoTintas * 100) / 100,
    precioVenta: Math.round(precioVenta * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
}
