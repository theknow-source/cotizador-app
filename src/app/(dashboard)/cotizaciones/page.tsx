"use client";

import { useState } from "react";
import Link from "next/link";
import { useCotizaciones } from "@/hooks/use-cotizaciones";
import { formatMXN, formatDate } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Search, Trash2, Eye, FileText } from "lucide-react";
import { toast } from "sonner";

export default function CotizacionesPage() {
  const { cotizaciones, remove } = useCotizaciones();
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = cotizaciones.filter((c) => {
    const term = search.toLowerCase();
    return (
      c.folio.toLowerCase().includes(term) ||
      c.cliente.nombre.toLowerCase().includes(term) ||
      c.cliente.empresa.toLowerCase().includes(term)
    );
  });

  const handleDelete = () => {
    if (deleteId) {
      remove(deleteId);
      setDeleteId(null);
      toast.success("Cotización eliminada");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Cotizaciones</h1>
        <Button asChild>
          <Link href="/cotizaciones/nueva">
            <Plus className="mr-2 h-4 w-4" />
            Nueva
          </Link>
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por folio, nombre o empresa..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <CardHeader className="p-0">
              <CardTitle className="text-lg font-medium">
                {cotizaciones.length === 0
                  ? "Sin cotizaciones"
                  : "Sin resultados"}
              </CardTitle>
            </CardHeader>
            <p className="mt-1 text-sm text-muted-foreground">
              {cotizaciones.length === 0
                ? "Crea tu primera cotización para empezar"
                : "Intenta con otro término de búsqueda"}
            </p>
            {cotizaciones.length === 0 && (
              <Button asChild className="mt-4">
                <Link href="/cotizaciones/nueva">
                  <Plus className="mr-2 h-4 w-4" />
                  Nueva cotización
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Folio</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Dimensiones</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="w-[100px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <Badge variant="outline">{c.folio}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(c.fecha)}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{c.cliente.nombre}</div>
                      {c.cliente.empresa && (
                        <div className="text-xs text-muted-foreground">
                          {c.cliente.empresa}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {c.caja.largo}×{c.caja.ancho}×{c.caja.alto} cm
                    </TableCell>
                    <TableCell>{c.caja.cantidad.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatMXN(c.calculo.total)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/cotizaciones/${c.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteId(c.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar cotización</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. ¿Estás seguro?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
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
