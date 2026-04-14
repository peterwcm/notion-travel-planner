"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface TopNavigationProps {
  isLoggedIn: boolean;
  logoutAction?: () => Promise<void>;
}

export function TopNavigation({ isLoggedIn, logoutAction }: TopNavigationProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const navLinks = isLoggedIn ? [{ href: "/trips", label: "Trips" }] : [];

  return (
    <header className="topbar">
      <div className="topbar__inner">
        <Link className="topbar__brand" href={isLoggedIn ? "/trips" : "/login"}>
          <span className="tag topbar__tag">Travel Planner</span>
          <strong>旅程規劃</strong>
        </Link>

        <button
          aria-controls="topbar-menu"
          aria-expanded={isOpen}
          aria-label={isOpen ? "關閉選單" : "開啟選單"}
          className="topbar__menu-button"
          onClick={() => setIsOpen((current) => !current)}
          type="button"
        >
          <span />
          <span />
          <span />
        </button>

        <div className={isOpen ? "topbar__menu topbar__menu--open" : "topbar__menu"} id="topbar-menu">
          <nav className="topbar__nav" aria-label="Main navigation">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);

              return (
                <Link
                  key={link.href}
                  className={isActive ? "topbar__link topbar__link--active" : "topbar__link"}
                  href={link.href}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="topbar__actions">
            {isLoggedIn && logoutAction ? (
              <form action={logoutAction}>
                <button className="topbar__action topbar__action--ghost" type="submit">
                  Logout
                </button>
              </form>
            ) : (
              <Link className="topbar__action" href="/login">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
