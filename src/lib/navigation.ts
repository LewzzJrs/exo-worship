import {
  BookmarkIcon,
  HomeIcon,
  LibraryBigIcon,
  ListMusicIcon,
  MessageSquarePlusIcon,
} from "lucide-react";

export const NAV_LINKS = [
  { href: "/", label: "Beranda", icon: HomeIcon },
  { href: "/library", label: "Library", icon: LibraryBigIcon },
  { href: "/setlist", label: "Setlist", icon: ListMusicIcon },
  { href: "/library-saya", label: "Library Saya", icon: BookmarkIcon },
  { href: "/request", label: "Request", icon: MessageSquarePlusIcon },
];

export function isActiveLink(href: string, pathname: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}
