'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ArrowUpRight, Plus, X } from 'lucide-react';
import { site } from '@/data/site';

export function Header() {
  const [open, setOpen] = useState(false);
  const toggle = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        toggle.current?.focus();
      }
    };
    const resize = () => {
      if (window.innerWidth > 640) setOpen(false);
    };
    window.addEventListener('keydown', close);
    window.addEventListener('resize', resize);
    return () => {
      window.removeEventListener('keydown', close);
      window.removeEventListener('resize', resize);
    };
  }, [open]);
  return (
    <header className="site-header">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Link className="wordmark" href="/" aria-label="Adeel home">
        ADEEL<span>.</span>
      </Link>
      <div className="header-role">
        AUTOMATION &<br />
        SYSTEMS DEVELOPMENT
      </div>
      <button
        ref={toggle}
        className="menu-toggle"
        aria-expanded={open}
        aria-controls="primary-navigation"
        onClick={() => setOpen(!open)}
      >
        {open ? 'Close' : 'Menu'}
        {open ? <X size={17} /> : <Plus size={17} />}
      </button>
      <nav
        id="primary-navigation"
        className={open ? 'nav open' : 'nav'}
        aria-label="Main navigation"
      >
        {site.nav.map((item) => (
          <Link key={item.label} href={item.href} onClick={() => setOpen(false)}>
            {item.label}
            {item.label === 'Contact' && <ArrowUpRight size={14} />}
          </Link>
        ))}
      </nav>
    </header>
  );
}
