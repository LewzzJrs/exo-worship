import BottomNav from "@/components/shared/BottomNav";
import Header from "@/components/shared/Header";

export default function MainLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <Header />
      {/* ruang bawah di HP supaya konten tidak tertutup navigasi bawah */}
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pt-6 pb-28 md:pb-10">{children}</main>
      <BottomNav />
    </>
  );
}
