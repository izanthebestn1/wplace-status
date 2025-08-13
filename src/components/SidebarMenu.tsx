"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function SidebarMenu() {
  const [open, setOpen] = useState(false);

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      {/* Hamburger button */}
      <button
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((v) => !v)}
        className="fixed left-4 top-4 z-50 inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/15 bg-black/40 text-white backdrop-blur hover:bg-black/60 focus:outline-none focus:ring-2 focus:ring-white/40"
      >
        {/* three lines icon */}
        <span className="relative block h-4 w-5">
          <span
            className={`absolute left-0 top-0 block h-0.5 w-5 bg-current transition-transform ${
              open ? "translate-y-1.5 rotate-45" : ""
            }`}
          />
          <span
            className={`absolute left-0 top-1.5 block h-0.5 w-4 bg-current transition-opacity ${
              open ? "opacity-0" : "opacity-100"
            }`}
          />
          <span
            className={`absolute left-0 top-3 block h-0.5 w-5 bg-current transition-transform ${
              open ? "-translate-y-1.5 -rotate-45" : ""
            }`}
          />
        </span>
      </button>

      {/* overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* drawer */}
      <aside
        className={`fixed left-0 top-0 z-50 h-screen w-72 transform border-r border-white/10 bg-[color:var(--background)]/95 text-[color:var(--foreground)] backdrop-blur transition-transform ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between px-4 py-4">
          <span className="text-sm font-semibold tracking-wide opacity-80">Menu</span>
          <button
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-white/15 bg-black/30 text-white hover:bg-black/50"
          >
            ×
          </button>
        </div>
        <nav className="mt-2 space-y-1 px-2">
          {/* Internal links (excluding Alicante) */}
          <NavItem href="/" label="Dashboard" onClick={() => setOpen(false)} />
          <NavItem href="/pixel" label="Pixel" onClick={() => setOpen(false)} />
          <NavItem href="/region-top" label="Region Top" onClick={() => setOpen(false)} />
          <NavItem href="/regions-top" label="Regions Top" onClick={() => setOpen(false)} />
          <div className="my-3 border-t border-white/10" />
          <NavItem href="/terms" label="Terms" onClick={() => setOpen(false)} />
          {/* You can add more internal pages here as you grow */}
        </nav>
        <div className="absolute bottom-3 left-0 w-full px-4 text-xs opacity-60">
          <p>WPlace Status</p>
        </div>
      </aside>
    </>
  );
}

function NavItem({
  href,
  label,
  onClick,
}: {
  href: string;
  label: string;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block rounded-md px-3 py-2 text-sm hover:bg-white/5"
    >
      {label}
    </Link>
  );
}
