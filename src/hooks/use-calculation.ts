"use client";

import { useMemo } from "react";
import type { Calculo, DatosCaja, PrecioResistencia } from "@/lib/types";
import { calcularCotizacion } from "@/lib/calculations";

export function useCalculation(
  caja: DatosCaja | null,
  precios: PrecioResistencia[]
): Calculo | null {
  return useMemo(() => {
    if (!caja || !caja.largo || !caja.ancho || !caja.alto || !caja.cantidad) {
      return null;
    }
    return calcularCotizacion(caja, precios);
  }, [caja, precios]);
}
