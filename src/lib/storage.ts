import type { Cotizacion, Settings } from "./types";
import {
  COTIZACIONES_KEY,
  SETTINGS_KEY,
  DEFAULT_SETTINGS,
} from "./constants";

// --- Cotizaciones ---

export function getCotizaciones(): Cotizacion[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(COTIZACIONES_KEY);
  return data ? JSON.parse(data) : [];
}

export function getCotizacion(id: string): Cotizacion | undefined {
  return getCotizaciones().find((c) => c.id === id);
}

export function saveCotizacion(cotizacion: Cotizacion): void {
  const all = getCotizaciones();
  const index = all.findIndex((c) => c.id === cotizacion.id);
  if (index >= 0) {
    all[index] = cotizacion;
  } else {
    all.unshift(cotizacion);
  }
  localStorage.setItem(COTIZACIONES_KEY, JSON.stringify(all));
}

export function deleteCotizacion(id: string): void {
  const all = getCotizaciones().filter((c) => c.id !== id);
  localStorage.setItem(COTIZACIONES_KEY, JSON.stringify(all));
}

export function getNextFolio(): string {
  const all = getCotizaciones();
  const maxNum = all.reduce((max, c) => {
    const num = parseInt(c.folio.replace("COT-", ""), 10);
    return isNaN(num) ? max : Math.max(max, num);
  }, 0);
  return `COT-${String(maxNum + 1).padStart(4, "0")}`;
}

// --- Settings ---

export function getSettings(): Settings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  const data = localStorage.getItem(SETTINGS_KEY);
  return data ? JSON.parse(data) : DEFAULT_SETTINGS;
}

export function saveSettings(settings: Settings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}
