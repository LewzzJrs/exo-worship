import BottomNav from "@/components/shared/BottomNav";
import Header from "@/components/shared/Header";

export default function MainLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pt-6 pb-10">{children}</main>
      {/* sengaja kecil dan pudar; ruang bawah di HP supaya tidak tertutup navigasi bawah */}
      <footer className="pb-24 text-center text-[11px] text-muted-foreground/60 md:pb-6">
        © {new Date().getFullYear()} Lewi Maropo
      </footer>
      <BottomNav />
    </>
  );
}
