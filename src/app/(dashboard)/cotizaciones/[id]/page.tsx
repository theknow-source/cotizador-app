"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useCotizaciones } from "@/hooks/use-cotizaciones";
import { useSettings } from "@/hooks/use-settings";
import { formatMXN, formatDateLong } from "@/lib/format";
import type { Cotizacion } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Download,
  Trash2,
  Ruler,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { generateQuotePdf } from "@/components/pdf/quote-pdf";
import { generateTechnicalDrawingPdf } from "@/components/pdf/technical-drawing-pdf";

export default function DetalleCotizacionPage() {
  const params = useParams();
  const router = useRouter();
  const { get, remove } = useCotizaciones();
  const { settings } = useSettings();
  const [cotizacion, setCotizacion] = useState<Cotizacion | null>(null);
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    const id = params.id as string;
    const data = get(id);
    if (data) {
      setCotizacion(data);
    } else {
      router.push("/cotizaciones");
    }
  }, [params.id, get, router]);

  if (!cotizacion) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const { cliente, caja, calculo } = cotizacion;

  const handleDownloadQuote = () => {
    if (!settings) return;
    generateQuotePdf(cotizacion, settings.empresa);
    toast.success("PDF de cotización descargado");
  };

  const handleDownloadDrawing = () => {
    generateTechnicalDrawingPdf(cotizacion);
    toast.success("Plano técnico descargado");
  };

  const handleDelete = () => {
    remove(cotizacion.id);
    toast.success("Cotización eliminada");
    router.push("/cotizaciones");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/cotizaciones">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{cotizacion.folio}</h1>
              <Badge variant="outline">{caja.resistencia}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {formatDateLong(cotizacion.fecha)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleDownloadQuote}>
            <FileText className="mr-2 h-4 w-4" />
            Cotización PDF
          </Button>
          <Button variant="outline" onClick={handleDownloadDrawing}>
            <Ruler className="mr-2 h-4 w-4" />
            Plano técnico
          </Button>
          <Button variant="destructive" size="icon" onClick={() => setShowDelete(true)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Cliente */}
        <Card>
          <CardHeader>
            <CardTitle>Datos del cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">Nombre: </span>
              <span className="font-medium">{cliente.nombre}</span>
            </div>
            {cliente.empresa && (
              <div>
                <span className="text-muted-foreground">Empresa: </span>
                <span>{cliente.empresa}</span>
              </div>
            )}
            {cliente.telefono && (
              <div>
                <span className="text-muted-foreground">Teléfono: </span>
                <span>{cliente.telefono}</span>
              </div>
            )}
            {cliente.email && (
              <div>
                <span className="text-muted-foreground">Email: </span>
                <span>{cliente.email}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Especificaciones */}
        <Card>
          <CardHeader>
            <CardTitle>Especificaciones de la caja</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">Dimensiones: </span>
              <span className="font-medium">
                {caja.largo} × {caja.ancho} × {caja.alto} cm
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Resistencia: </span>
              <span>{caja.resistencia}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Tintas: </span>
              <span>
                {caja.numTintas === 0
                  ? "Sin tintas"
                  : `${caja.numTintas} tinta${caja.numTintas > 1 ? "s" : ""}`}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Cantidad: </span>
              <span className="font-medium">
                {caja.cantidad.toLocaleString()} piezas
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Desglose de precio */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Desglose de precio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Largo pliego</span>
                  <span>{calculo.largoPliego} cm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Ancho pliego</span>
                  <span>{calculo.anchoPliego} cm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Área del pliego</span>
                  <span>{calculo.areaM2} m²</span>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Costo base</span>
                  <span>{formatMXN(calculo.costoBase)}</span>
                </div>
                {calculo.recargoTintas > 0 && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Recargo tintas ({caja.numTintas}×3%)
                    </span>
                    <span>{formatMXN(calculo.recargoTintas)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Precio unitario (×1.30)</span>
                  <span>{formatMXN(calculo.precioVenta)}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total ({caja.cantidad.toLocaleString()} pzas)</span>
                  <span>{formatMXN(calculo.total)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notas */}
        {cotizacion.notas && (
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Notas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm whitespace-pre-wrap">{cotizacion.notas}</p>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={showDelete} onOpenChange={setShowDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar cotización</DialogTitle>
            <DialogDescription>
              ¿Eliminar {cotizacion.folio}? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDelete(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
