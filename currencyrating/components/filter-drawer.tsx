"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function FilterDrawer() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [region, setRegion] = React.useState(params.get("region") || "");
  const onRegionPage = pathname.startsWith("/regions/");
  const [gradeMin, setGradeMin] = React.useState(params.get("min") || "");
  const [gradeMax, setGradeMax] = React.useState(params.get("max") || "");
  const firstFieldRef = React.useRef<HTMLInputElement>(null);
  const dialogRef = React.useRef<HTMLElement>(null);

  const apply = () => {
    const p = new URLSearchParams(params.toString());
    if (!onRegionPage) {
      if (region) p.set("region", region); else p.delete("region");
    }
    if (gradeMin) p.set("min", gradeMin); else p.delete("min");
    if (gradeMax) p.set("max", gradeMax); else p.delete("max");
    router.push(`${pathname}?${p.toString()}`);
    setOpen(false);
  };

  React.useEffect(() => {
    if (open) {
      if (firstFieldRef.current) firstFieldRef.current.focus();
      else dialogRef.current?.focus();
    }
  }, [open]);

  const onKeyDownOverlay = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") setOpen(false);
  };

  const trapFocus = (e: React.KeyboardEvent<HTMLElement>) => {
    if (e.key !== "Tab" || !dialogRef.current) return;
    const selector = 'a[href], button:not([disabled]), textarea, input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const focusables = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(selector)).filter((el) => !el.hasAttribute("disabled") && el.tabIndex !== -1);
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = (document.activeElement as HTMLElement) || null;
    if (e.shiftKey) {
      if (active === first || !dialogRef.current.contains(active)) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (active === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  return (
    <div>
      <button
        className="cr-btn text-sm"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="filters-drawer"
      >
        Filters
      </button>
      {open && (
        <div className="fixed inset-0 z-50 bg-black/40" onClick={() => setOpen(false)} onKeyDown={onKeyDownOverlay}>
          <aside
            id="filters-drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="filters-title"
            className="absolute right-0 top-0 h-full w-80 bg-[var(--cr-card)] border-l border-[var(--cr-border)] p-4"
            ref={dialogRef}
            tabIndex={-1}
            onKeyDown={trapFocus}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="filters-title" className="font-semibold mb-4">Filters</h3>
            <div className="space-y-3">
              {!onRegionPage && (
                <label className="block text-sm">Region
                  <input
                    ref={firstFieldRef}
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    placeholder="e.g. Asia"
                    className="mt-1 w-full px-3 py-2 rounded-lg bg-white/5 border border-[var(--cr-border)] text-sm"
                  />
                </label>
              )}
              <label className="block text-sm">Grade min
                <input value={gradeMin} onChange={(e) => setGradeMin(e.target.value.toUpperCase())} placeholder="e.g. BBB" className="mt-1 w-full px-3 py-2 rounded-lg bg-white/5 border border-[var(--cr-border)] text-sm" />
              </label>
              <label className="block text-sm">Grade max
                <input value={gradeMax} onChange={(e) => setGradeMax(e.target.value.toUpperCase())} placeholder="e.g. AA" className="mt-1 w-full px-3 py-2 rounded-lg bg-white/5 border border-[var(--cr-border)] text-sm" />
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button className="cr-btn text-sm" onClick={() => setOpen(false)}>Cancel</button>
              <button className="cr-btn text-sm" onClick={apply}>Apply</button>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
