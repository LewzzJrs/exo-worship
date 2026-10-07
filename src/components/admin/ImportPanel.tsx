"use client";

import { useRef, useState } from "react";
import { FileUpIcon, LinkIcon, Loader2Icon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ImportResult } from "@/lib/import/normalize";

type ImportPanelProps = {
  onImported: (result: ImportResult) => void;
};

// impor dari Word, PowerPoint, PDF, atau link Google Docs/Slides ke editor
export default function ImportPanel({ onImported }: ImportPanelProps) {
  const [link, setLink] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  async function runImport(body: FormData) {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/import", { method: "POST", body });
      const result = await response.json();
      if (!response.ok) {
        toast.error(result.error ?? "Impor gagal.");
        return;
      }
      onImported(result as ImportResult);
      setLink("");
      toast.success("Berhasil diimpor. Cek lagi posisi chord dan label bagiannya.");
    } catch {
      toast.error("Impor gagal, periksa koneksi internet.");
    } finally {
      setIsLoading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  function handleFile(file: File | undefined) {
    if (!file) return;
    const body = new FormData();
    body.set("file", file);
    runImport(body);
  }

  function handleLink() {
    if (!link.trim()) return;
    const body = new FormData();
    body.set("url", link.trim());
    runImport(body);
  }

  return (
    <div className="rounded-xl border border-dashed bg-card p-4">
      <p className="text-sm font-medium">Impor dari file atau Google</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Word (.docx), PowerPoint (.pptx), PDF berisi teks, atau link Google Docs/Slides yang
        aksesnya &quot;Siapa saja yang memiliki link&quot;.
      </p>

      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input
          ref={fileInput}
          type="file"
          accept=".docx,.pptx,.pdf"
          className="hidden"
          onChange={(event) => handleFile(event.target.files?.[0])}
        />
        <Button
          type="button"
          variant="outline"
          disabled={isLoading}
          onClick={() => fileInput.current?.click()}
        >
          {isLoading ? <Loader2Icon className="animate-spin" /> : <FileUpIcon />}
          Pilih file
        </Button>
        <div className="flex flex-1 gap-2">
          <Input
            type="url"
            inputMode="url"
            placeholder="https://docs.google.com/..."
            aria-label="Link Google Docs atau Slides"
            value={link}
            onChange={(event) => setLink(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                handleLink();
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            disabled={isLoading || !link.trim()}
            onClick={handleLink}
          >
            <LinkIcon />
            Impor
          </Button>
        </div>
      </div>
    </div>
  );
}
