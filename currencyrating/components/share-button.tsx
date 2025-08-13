"use client";

import html2canvas from "html2canvas";
import { Share2 } from "lucide-react";

export default function ShareButton({ targetId }: { targetId: string }) {
  const onClick = async () => {
    const el = document.getElementById(targetId);
    if (!el) return;
    const canvas = await html2canvas(el, { backgroundColor: null, scale: 2 });
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${targetId}.png`;
      a.click();
      URL.revokeObjectURL(url);
    });
  };
  return (
    <button onClick={onClick} className="cr-btn" aria-label="Share as PNG">
      <Share2 className="h-5 w-5" />
    </button>
  );
}
