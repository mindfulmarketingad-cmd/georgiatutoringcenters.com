"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { headerLinks, site } from "@/lib/site";

export default function Header() {
  const pathname = usePathname();
  // The menu remembers which route it was opened on, so navigating anywhere
  // closes it without an effect that would re-render the header twice.
  const [openedOn, setOpenedOn] = useState<string | null>(null);
  const open = openedOn === pathname;

  const isCurrent = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="site-header">
      <div className="wrap header-inner">
        <Link href="/" className="brand" aria-label={`${site.name} home`}>
          <Image src="/logo.svg" alt={site.name} width={340} height={64} priority />
        </Link>

        <button
          type="button"
          className="nav-toggle"
          aria-expanded={open}
          aria-controls="primary-navigation"
          onClick={() => setOpenedOn(open ? null : pathname)}
        >
          {open ? "Close" : "Menu"}
        </button>

        <nav
          id="primary-navigation"
          className={`nav${open ? " is-open" : ""}`}
          aria-label="Primary"
        >
          {headerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isCurrent(link.href) ? "page" : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
