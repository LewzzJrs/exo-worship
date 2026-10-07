"use client";

import { useState, useTransition } from "react";
import { HeartIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { toggleLike } from "@/lib/actions/stats";
import type { LikeSummary } from "@/lib/stats";
import { cn } from "@/lib/utils";

type LikeButtonProps = {
  slug: string;
  initial: LikeSummary;
};

export default function LikeButton({ slug, initial }: LikeButtonProps) {
  const [summary, setSummary] = useState(initial);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    const previous = summary;
    // langsung ubah tampilan, lalu samakan dengan hasil dari server
    setSummary({
      liked: !previous.liked,
      count: previous.count + (previous.liked ? -1 : 1),
    });

    startTransition(async () => {
      const result = await toggleLike(slug);
      if ("error" in result) {
        setSummary(previous);
        toast.error(result.error);
      } else {
        setSummary(result);
      }
    });
  }

  return (
    <Button
      variant="outline"
      className="bg-card"
      aria-pressed={summary.liked}
      disabled={isPending}
      onClick={handleClick}
    >
      <HeartIcon className={cn(summary.liked && "fill-red-500 text-red-500")} />
      {summary.liked ? "Disukai" : "Suka"}
      <span className="text-muted-foreground tabular-nums">{summary.count}</span>
    </Button>
  );
}
