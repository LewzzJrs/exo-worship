import type { Metadata } from "next";
import Link from "next/link";
import { MessageCircleIcon } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { verifyAccess } from "@/lib/dal";

export const metadata: Metadata = {
  title: "Bantuan",
};

const FAQ: { question: string; answer: React.ReactNode }[] = [
  {
    question: "Bagaimana cara mengganti key lagu?",
    answer:
      "Buka lagunya, lalu pakai tombol − dan + di sebelah tulisan Key, atau pilih key langsung dari daftar. Tombol Key asli mengembalikan ke key semula.",
  },
  {
    question: "Lagu yang saya cari tidak ada.",
    answer: (
      <>
        Kirim lewat menu{" "}
        <Link href="/request" className="font-medium text-foreground underline">
          Request
        </Link>
        . Statusnya bisa dilihat di halaman yang sama, dan akan ada link ke lagunya setelah admin
        selesai membuatnya.
      </>
    ),
  },
  {
    question: "Bagaimana membuat setlist dan PDF-nya?",
    answer:
      "Buka menu Setlist, tekan Buat setlist, lalu tambahkan lagu. Key tiap lagu bisa diatur sendiri. Tombol Download PDF gabungan membuat satu file berisi semua lagu sesuai urutan.",
  },
  {
    question: "Kenapa Library Saya atau setlist saya hilang?",
    answer:
      "Library Saya dan setlist pribadi tersimpan di HP masing-masing. Datanya hilang kalau data browser dihapus, atau kalau kamu membuka aplikasi dari HP atau browser lain.",
  },
  {
    question: "Kenapa saya diminta memasukkan kode akses lagi?",
    answer:
      "Kode akses berlaku 180 hari, dan semua HP harus masuk ulang kalau admin mengganti kode. Tanyakan kode terbaru ke admin tim.",
  },
  {
    question: "Bagaimana memasang aplikasi ini di HP?",
    answer: (
      <ul className="list-disc space-y-1 pl-5">
        <li>
          <strong className="text-foreground">Android (Chrome):</strong> tekan menu ⋮ di kanan atas,
          lalu pilih <em>Tambahkan ke layar utama</em> atau <em>Instal aplikasi</em>.
        </li>
        <li>
          <strong className="text-foreground">iPhone (Safari):</strong> tekan tombol Bagikan (kotak
          dengan panah ke atas), lalu pilih <em>Tambah ke Layar Utama</em>.
        </li>
      </ul>
    ),
  },
];

// nomor dari .env.local, misalnya 6281234567890
function getWhatsappUrl() {
  const number = process.env.ADMIN_WHATSAPP?.replace(/\D/g, "");
  if (!number) return null;
  const text = encodeURIComponent("Halo admin, saya mau tanya soal Exo Worship Library.");
  return `https://wa.me/${number}?text=${text}`;
}

export default async function BantuanPage() {
  await verifyAccess();
  const whatsappUrl = getWhatsappUrl();

  return (
    <>
      <h1 className="text-2xl font-semibold">Bantuan</h1>
      <p className="mt-1 text-sm text-muted-foreground">Pertanyaan yang sering ditanyakan.</p>

      <Card className="mt-6">
        <CardContent>
          <Accordion type="single" collapsible>
            {FAQ.map((item) => (
              <AccordionItem key={item.question} value={item.question}>
                <AccordionTrigger className="text-left">{item.question}</AccordionTrigger>
                <AccordionContent className="text-muted-foreground">{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      <section className="mt-8 rounded-xl bg-card p-5">
        <h2 className="font-semibold">Masih butuh bantuan?</h2>
        <p className="mt-1 text-sm text-muted-foreground">Hubungi admin tim lewat WhatsApp.</p>
        {whatsappUrl ? (
          <Button asChild className="mt-4">
            <a href={whatsappUrl} target="_blank" rel="noreferrer">
              <MessageCircleIcon />
              Chat admin di WhatsApp
            </a>
          </Button>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">Nomor WhatsApp admin belum diatur.</p>
        )}
      </section>

      <p className="mt-8 text-center text-xs text-muted-foreground">
        Admin tim?{" "}
        <Link href="/admin/masuk" className="underline underline-offset-4">
          Masuk ke halaman admin
        </Link>
      </p>
    </>
  );
}
