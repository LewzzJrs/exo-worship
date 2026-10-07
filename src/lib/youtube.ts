// ambil ID video dari link youtube.com/watch, youtu.be, /shorts, atau /embed
export function getYoutubeId(url: string | undefined) {
  if (!url) return null;

  try {
    const { hostname, pathname, searchParams } = new URL(url);
    const host = hostname.replace(/^(www|m)\./, "");

    if (host === "youtu.be") return pathname.slice(1) || null;
    if (host !== "youtube.com" && host !== "youtube-nocookie.com") return null;
    if (pathname === "/watch") return searchParams.get("v");

    const match = pathname.match(/^\/(shorts|embed|live)\/([^/?]+)/);
    return match?.[2] ?? null;
  } catch {
    return null;
  }
}
