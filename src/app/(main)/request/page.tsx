import type { Metadata } from "next";
import RequestForm from "@/components/request/RequestForm";
import RequestList from "@/components/request/RequestList";
import { getMyRequests } from "@/lib/requests";

export const metadata: Metadata = {
  title: "Request Lagu",
};

export default async function RequestPage() {
  const requests = await getMyRequests();

  return (
    <>
      <h1 className="text-2xl font-semibold">Request Lagu</h1>
      <p className="mt-1 mb-5 text-sm text-muted-foreground">
        Lagu belum ada di Library? Kirim request, nanti admin yang membuatkan chord-nya.
      </p>

      <RequestForm />

      <section className="mt-8">
        <h2 className="mb-3 text-base font-semibold">Request saya</h2>
        <RequestList requests={requests} />
      </section>
    </>
  );
}
