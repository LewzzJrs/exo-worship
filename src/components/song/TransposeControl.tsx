"use client";

import { MinusIcon, PlusIcon, RotateCcwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getKeyOptions, isSameKey, shiftKey } from "@/lib/keys";

type TransposeControlProps = {
  originalKey: string;
  currentKey: string;
  onChange: (key: string) => void;
};

export default function TransposeControl({
  originalKey,
  currentKey,
  onChange,
}: TransposeControlProps) {
  const options = getKeyOptions(originalKey);
  const isChanged = !isSameKey(currentKey, originalKey);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm font-medium">Key</span>
      <Button
        variant="outline"
        size="icon"
        aria-label="Turunkan setengah nada"
        onClick={() => onChange(shiftKey(currentKey, -1, originalKey))}
      >
        <MinusIcon />
      </Button>
      <Select value={currentKey} onValueChange={onChange}>
        <SelectTrigger className="w-20 bg-card" aria-label="Pilih key">
          {/* tampilkan key saja, tanda "(asli)" cukup di daftar pilihan */}
          <SelectValue>{currentKey}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {options.map((key) => (
            <SelectItem key={key} value={key}>
              {key}
              {key === originalKey && " (asli)"}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        variant="outline"
        size="icon"
        aria-label="Naikkan setengah nada"
        onClick={() => onChange(shiftKey(currentKey, 1, originalKey))}
      >
        <PlusIcon />
      </Button>
      {isChanged && (
        <Button variant="ghost" size="sm" onClick={() => onChange(originalKey)}>
          <RotateCcwIcon />
          Key asli ({originalKey})
        </Button>
      )}
    </div>
  );
}
