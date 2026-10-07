"use client";

import { useEffect, useRef, useState } from "react";
import { DownloadIcon, Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PDF_FONTS, PDF_SIZES, withPdfOptions, type PdfFont } from "@/lib/pdf-options";
import { usePdfPrefsStore } from "@/store/pdf-prefs";

type PdfPreviewDialogProps = {
  // link PDF tanpa pilihan font dan ukuran
  url: string | null;
  title: string;
  onClose: () => void;
};

type LoadedPdf = { bytes: ArrayBuffer; filename: string };

// ambil nama file dari header Content-Disposition (filename*=UTF-8''...)
function filenameFrom(response: Response) {
  const header = response.headers.get("content-disposition") ?? "";
  const encoded = header.match(/filename\*=UTF-8''([^;]+)/)?.[1];
  return encoded ? decodeURIComponent(encoded) : "exo-worship.pdf";
}

// preview PDF sebelum diunduh, dengan pilihan jenis font dan ukuran huruf
export default function PdfPreviewDialog({ url, title, onClose }: PdfPreviewDialogProps) {
  const { font, size, setFont, setSize } = usePdfPrefsStore();
  const [pdf, setPdf] = useState<LoadedPdf | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const pagesRef = useRef<HTMLDivElement>(null);

  // buat ulang PDF setiap kali pilihan berubah
  useEffect(() => {
    if (!url) return;
    let cancelled = false;
    const pdfUrl = withPdfOptions(url, { font, size });

    async function load() {
      setIsLoading(true);
      setPdf(null);
      try {
        const response = await fetch(pdfUrl);
        if (!response.ok) throw new Error(await response.text());
        const bytes = await response.arrayBuffer();
        if (cancelled) return;

        // gambar tiap halaman ke canvas, supaya preview juga jalan di HP
        const { getDocumentProxy } = await import("unpdf");
        const document = await getDocumentProxy(new Uint8Array(bytes.slice(0)));
        const container = pagesRef.current;
        if (cancelled || !container) return;

        const canvases: HTMLCanvasElement[] = [];
        for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber++) {
          const page = await document.getPage(pageNumber);
          const width = container.clientWidth || 600;
          const scale = (width / page.getViewport({ scale: 1 }).width) * window.devicePixelRatio;
          const viewport = page.getViewport({ scale });
          const canvas = window.document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.className = "w-full rounded-sm bg-white shadow-md";
          // intent "print": langsung digambar tanpa menunggu animation frame (tetap jalan walau tab di belakang)
          await page.render({ canvas, viewport, intent: "print" }).promise;
          if (cancelled) return;
          canvases.push(canvas);
        }

        container.replaceChildren(...canvases);
        setPdf({ bytes, filename: filenameFrom(response) });
      } catch (error) {
        console.error("Gagal membuat preview PDF:", error);
        if (!cancelled) toast.error("Preview PDF gagal dimuat, coba lagi.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [url, font, size]);

  function handleDownload() {
    if (!pdf) return;
    const blobUrl = URL.createObjectURL(new Blob([pdf.bytes], { type: "application/pdf" }));
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = pdf.filename;
    link.click();
    setTimeout(() => URL.revokeObjectURL(blobUrl), 10_000);
  }

  return (
    <Dialog open={!!url} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[94vh] flex-col sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Preview PDF</DialogTitle>
          <DialogDescription>{title}</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="pdf-font">Jenis font</Label>
            <Select value={font} onValueChange={(value) => setFont(value as PdfFont)}>
              <SelectTrigger id="pdf-font" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PDF_FONTS.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="pdf-size">Ukuran huruf</Label>
            <Select value={String(size)} onValueChange={(value) => setSize(Number(value))}>
              <SelectTrigger id="pdf-size" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PDF_SIZES.map((option) => (
                  <SelectItem key={option.value} value={String(option.value)}>
                    {option.label} ({option.value} pt)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="relative min-h-64 flex-1 overflow-y-auto rounded-lg bg-muted p-3">
          <div ref={pagesRef} className="grid gap-3" />
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-muted/70 text-sm text-muted-foreground">
              <Loader2Icon className="size-4 animate-spin" />
              Menyiapkan PDF...
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Tutup
          </Button>
          <Button disabled={!pdf || isLoading} onClick={handleDownload}>
            <DownloadIcon />
            Download PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
