"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import ChordSheet from "@/components/song/ChordSheet";
import TransposeControl from "@/components/song/TransposeControl";
import { isSameKey } from "@/lib/keys";

type SongViewerProps = {
  content: string;
  originalKey: string;
  initialKey: string;
};

export default function SongViewer({ content, originalKey, initialKey }: SongViewerProps) {
  const [currentKey, setCurrentKey] = useState(initialKey);

  function handleKeyChange(key: string) {
    setCurrentKey(key);
    // simpan key di URL supaya link yang dibagikan langsung terbuka di key yang sama
    const url = new URL(window.location.href);
    if (isSameKey(key, originalKey)) url.searchParams.delete("key");
    else url.searchParams.set("key", key);
    window.history.replaceState(null, "", url);
  }

  return (
    <div className="space-y-4">
      <TransposeControl
        originalKey={originalKey}
        currentKey={currentKey}
        onChange={handleKeyChange}
      />
      <Card>
        <CardContent>
          <ChordSheet content={content} originalKey={originalKey} currentKey={currentKey} />
        </CardContent>
      </Card>
    </div>
  );
}
