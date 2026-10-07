"use client";

import { useRef, useTransition } from "react";
import { CameraIcon, Trash2Icon } from "lucide-react";
import { toast } from "sonner";
import AdminAvatar from "@/components/shared/AdminAvatar";
import { Button } from "@/components/ui/button";
import { removeAdminPhoto, uploadAdminPhoto } from "@/lib/actions/admin-profile";
import { useAvatarStore } from "@/store/avatar";

const PHOTO_SIZE = 256;

// potong jadi persegi di tengah dan perkecil, supaya ringan (sekitar 20–40 KB)
async function toSquareJpeg(file: File) {
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = PHOTO_SIZE;
  canvas.height = PHOTO_SIZE;
  canvas
    .getContext("2d")
    ?.drawImage(
      bitmap,
      (bitmap.width - side) / 2,
      (bitmap.height - side) / 2,
      side,
      side,
      0,
      0,
      PHOTO_SIZE,
      PHOTO_SIZE,
    );
  bitmap.close();

  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Foto tidak bisa diproses"))),
      "image/jpeg",
      0.85,
    ),
  );
}

export default function ProfilePhotoForm({ adminName }: { adminName: string }) {
  const [isPending, startTransition] = useTransition();
  const fileInput = useRef<HTMLInputElement>(null);
  const bumpAvatar = useAvatarStore((state) => state.bump);

  function handleFile(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Pilih file gambar.");
      return;
    }

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.set("photo", await toSquareJpeg(file), "foto.jpg");
        const result = await uploadAdminPhoto(formData);
        if ("error" in result) {
          toast.error(result.error);
          return;
        }
        bumpAvatar();
        toast.success("Foto profil diganti");
      } catch {
        toast.error("Foto tidak bisa dibaca. Coba foto lain.");
      } finally {
        if (fileInput.current) fileInput.current.value = "";
      }
    });
  }

  function handleRemove() {
    startTransition(async () => {
      const result = await removeAdminPhoto();
      if ("error" in result) {
        toast.error(result.error);
        return;
      }
      bumpAvatar();
      toast.success("Foto profil dihapus");
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-5">
      <AdminAvatar name={adminName} size="xl" />
      <div>
        <p className="text-lg font-semibold">{adminName}</p>
        <p className="mb-3 text-sm text-muted-foreground">
          Foto tampil di kartu &quot;Dibuat oleh&quot; dan riwayat.
        </p>
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => handleFile(event.target.files?.[0])}
        />
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            disabled={isPending}
            onClick={() => fileInput.current?.click()}
          >
            <CameraIcon />
            {isPending ? "Menyimpan..." : "Ganti foto"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={isPending}
            onClick={handleRemove}
          >
            <Trash2Icon />
            Hapus foto
          </Button>
        </div>
      </div>
    </div>
  );
}
