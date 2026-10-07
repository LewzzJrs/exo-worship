import BottomNav from "@/components/shared/BottomNav";
import CopyrightFooter from "@/components/shared/CopyrightFooter";
import Header from "@/components/shared/Header";

export default function MainLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <Header />
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 pt-6 pb-10">{children}</main>
      {/* ruang bawah di HP supaya tidak tertutup navigasi bawah */}
      <CopyrightFooter className="pb-24 md:pb-6" />
      <BottomNav />
    </>
  );
}
