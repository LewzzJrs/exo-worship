"use client";

import { useState } from "react";
import { PlayIcon, XIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

type YoutubePlayerProps = {
  videoId: string;
  title: string;
};

export default function YoutubePlayer({ videoId, title }: YoutubePlayerProps) {
  const [isOpen, setIsOpen] = useState(true);

  if (!isOpen) {
    return (
      <Button variant="outline" className="bg-card" onClick={() => setIsOpen(true)}>
        <PlayIcon />
        Tampilkan video
      </Button>
    );
  }

  return (
    <div className="space-y-2">
      <div className="aspect-video overflow-hidden rounded-xl bg-black">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}`}
          title={`Video ${title}`}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          loading="lazy"
          className="size-full"
        />
      </div>
      <Button variant="outline" className="bg-card" onClick={() => setIsOpen(false)}>
        <XIcon />
        Tutup video
      </Button>
    </div>
  );
}
