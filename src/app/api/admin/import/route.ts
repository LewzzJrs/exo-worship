import { isAdmin } from "@/lib/dal";
import { parseDocx, parseGoogleLink, parsePdf, parsePptx } from "@/lib/import/parsers";

const MAX_BYTES = 10 * 1024 * 1024;

function errorResponse(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}

// terima file Word/PPT/PDF atau link Google, kembalikan teks yang siap diedit
export async function POST(request: Request) {
  if (!(await isAdmin())) return errorResponse("Sesi admin habis, silakan masuk lagi.", 401);

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return errorResponse("Data impor tidak terbaca.");
  }

  try {
    const link = form.get("url");
    if (typeof link === "string" && link.trim()) {
      const result = await parseGoogleLink(link);
      return "error" in result ? errorResponse(result.error) : Response.json(result);
    }

    const file = form.get("file");
    if (!(file instanceof File)) return errorResponse("Pilih file atau tempel link dulu.");
    if (file.size > MAX_BYTES) return errorResponse("File terlalu besar (maksimal 10 MB).");

    const name = file.name.toLowerCase();
    const buffer = Buffer.from(await file.arrayBuffer());

    if (name.endsWith(".docx")) return Response.json(await parseDocx(buffer));
    if (name.endsWith(".pptx")) return Response.json(await parsePptx(buffer));
    if (name.endsWith(".pdf")) {
      const result = await parsePdf(buffer);
      return result.content.trim()
        ? Response.json(result)
        : errorResponse("PDF ini tidak berisi teks (mungkin hasil scan atau foto).");
    }
    if (name.endsWith(".doc") || name.endsWith(".ppt")) {
      return errorResponse("Format lama belum didukung. Simpan ulang sebagai .docx atau .pptx.");
    }
    return errorResponse("Format file harus .docx, .pptx, atau .pdf.");
  } catch (error) {
    console.error("Gagal mengimpor:", error);
    return errorResponse("File tidak bisa dibaca. Coba simpan ulang lalu impor lagi.", 500);
  }
}
