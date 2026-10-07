import { NextResponse, type NextRequest } from "next/server";
import {
  ACCESS_COOKIE,
  ADMIN_COOKIE,
  ADMIN_NAME_COOKIE,
  DEVICE_COOKIE,
  DEVICE_MAX_AGE,
  isAdminName,
} from "@/lib/constants";
import { isValidAccessToken, isValidAdminToken } from "@/lib/access-token";

function isAdminPath(pathname: string) {
  return (
    pathname === "/admin" || pathname.startsWith("/admin/") || pathname.startsWith("/api/admin/")
  );
}

async function handleAdmin(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdmin = await isValidAdminToken(request.cookies.get(ADMIN_COOKIE)?.value);

  if (pathname === "/admin/masuk") {
    return isAdmin ? NextResponse.redirect(new URL("/admin", request.url)) : NextResponse.next();
  }

  if (isAdmin) {
    // setelah masuk, admin wajib memilih nama dulu supaya perubahannya tercatat
    const hasName = isAdminName(request.cookies.get(ADMIN_NAME_COOKIE)?.value);
    if (!hasName && pathname !== "/admin/pilih-nama" && !pathname.startsWith("/api/admin/")) {
      return NextResponse.redirect(new URL("/admin/pilih-nama", request.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/admin/")) {
    return Response.json({ error: "Sesi admin habis, silakan masuk lagi." }, { status: 401 });
  }
  return NextResponse.redirect(new URL("/admin/masuk", request.url));
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // halaman admin punya password sendiri, terpisah dari kode akses tim
  if (isAdminPath(pathname)) return handleAdmin(request);

  const hasAccess = await isValidAccessToken(request.cookies.get(ACCESS_COOKIE)?.value);

  if (pathname === "/masuk") {
    // sudah punya akses, tidak perlu masuk lagi
    return hasAccess ? NextResponse.redirect(new URL("/", request.url)) : NextResponse.next();
  }

  if (!hasAccess) {
    const url = new URL("/masuk", request.url);
    if (pathname !== "/") url.searchParams.set("next", pathname + search);
    return NextResponse.redirect(url);
  }

  if (request.cookies.has(DEVICE_COOKIE)) {
    return NextResponse.next();
  }

  // HP baru: buat ID perangkat, langsung bisa dipakai di request ini juga
  const deviceId = crypto.randomUUID();
  request.cookies.set(DEVICE_COOKIE, deviceId);
  const response = NextResponse.next({ request: { headers: request.headers } });
  response.cookies.set(DEVICE_COOKIE, deviceId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: DEVICE_MAX_AGE,
  });
  return response;
}

// semua halaman dikunci, kecuali file statis, manifest, dan service worker (untuk pasang di HP dan offline)
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|robots.txt|manifest.webmanifest|admin.webmanifest|sw.js|.*\\.(?:svg|png|jpg|jpeg|webp|ico)$).*)",
  ],
};
