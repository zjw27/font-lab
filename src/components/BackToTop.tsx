"use client";

import { useEffect, useState } from "react";

const SHOW_AFTER = 360;

export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const updateVisibility = () => setVisible(window.scrollY > SHOW_AFTER);
    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    return () => window.removeEventListener("scroll", updateVisibility);
  }, []);

  const scrollToTop = () => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  };

  return <button
    type="button"
    className={`back-to-top ${visible ? "visible" : ""}`}
    onClick={scrollToTop}
    aria-label="返回顶部"
    aria-hidden={!visible}
    tabIndex={visible ? 0 : -1}
  >
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="m16 14-4-4-4 4" />
    </svg>
  </button>;
}
