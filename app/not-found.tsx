import Link from "next/link";
import { site } from "@/lib/data";

export default function NotFound() {
  return (
    <main className="flex-1 grid place-items-center px-4 py-24">
      <div className="w-full max-w-lg">
        <div className="rounded-lg border border-white/10 bg-term text-term-text shadow-[0_8px_24px_-12px_rgba(28,28,26,0.35)]">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
            <span className="size-2.5 rounded-full bg-white/15" aria-hidden />
            <span className="size-2.5 rounded-full bg-white/15" aria-hidden />
            <span className="size-2.5 rounded-full bg-npmred/80" aria-hidden />
            <span className="ml-2 font-mono text-xs text-term-dim">exit code 404</span>
          </div>
          <div className="px-5 py-6 font-mono text-sm leading-[1.9]">
            <div>
              <span className="text-npmred font-bold">$ </span>
              <span className="text-white">pacman -S this-page</span>
            </div>
            <div className="text-term-dim">resolving dependencies...</div>
            <div className="text-[#e05d5b]">error: target not found: this-page</div>
            <div className="h-4" aria-hidden />
            <div>
              <span className="text-npmred font-bold">$ </span>
              <Link href="/" className="text-white underline hover:text-npmred">
                cd ~
              </Link>
              <span className="text-term-dim">  # back to {site.name}</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
