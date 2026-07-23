"use client";

import { useState } from "react";

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1600);
        } catch {}
      }}
      className="shrink-0 font-mono text-xs text-muted hover:text-npmred transition-colors px-2 py-1 rounded border border-hairline hover:border-npmred"
      aria-label={`Copy "${text}" to clipboard`}
    >
      {copied ? "copied ✓" : "copy"}
    </button>
  );
}
