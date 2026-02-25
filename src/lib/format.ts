import { format } from "date-fns";
import { es } from "date-fns/locale";

export function formatMXN(amount: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  return format(new Date(dateStr), "dd/MM/yyyy", { locale: es });
}

export function formatDateLong(dateStr: string): string {
  return format(new Date(dateStr), "dd 'de' MMMM 'de' yyyy", { locale: es });
}
