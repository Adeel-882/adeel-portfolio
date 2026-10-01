'use client';
import Image from 'next/image';
import { useState } from 'react';
import { ArrowUpRight, ArrowUp, Copy, Check } from 'lucide-react';
import { site } from '@/data/site';
import { SectionLabel } from './SectionLabel';
export function Contact() {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(false);
  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(site.email);
      setCopied(true);
      setError(false);
    } catch {
      setError(true);
    }
  }
  return (
    <section className="contact section-pad" id="contact" aria-labelledby="contact-title">
      <span className="boundary-scan" aria-hidden="true" />
      <SectionLabel number="08">LET’S BUILD SOMETHING THAT WORKS</SectionLabel>
      <div className="contact-grid">
        <div>
          <h2 id="contact-title">
            {site.contact.headline.map((s) => (
              <span className="motion-mask" key={s}>
                <span className="motion-line">{s}</span>
              </span>
            ))}
          </h2>
          <p>{site.contact.description}</p>
          <a
            className="button button-primary"
            href={`mailto:${site.email}?subject=Let%E2%80%99s%20build%20a%20system`}
          >
            {site.contact.button}
            <ArrowUpRight size={20} />
          </a>
          <div className="contact-email">
            <a href={`mailto:${site.email}`}>{site.email}</a>
            <button
              className="copy-email"
              aria-label={copied ? 'Email copied' : 'Copy email address'}
              onClick={copyEmail}
            >
              {copied ? <Check size={15} /> : <Copy size={15} />}
            </button>
          </div>
          <span className="copy-status micro" role="status">
            {error
              ? 'Please select and copy the email address above.'
              : copied
                ? 'Email copied.'
                : ''}
          </span>
          <div className="contact-social-links" aria-label="More ways to connect">
            <a
              className="button contact-social-button contact-whatsapp"
              href={site.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat on WhatsApp at +92 339 5253217"
            >
              <span className="contact-brand-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" width="25" height="25">
                  <path
                    d="M20.5 11.7a8.5 8.5 0 0 1-12.6 7.5L3 20.5l1.3-4.8a8.5 8.5 0 1 1 16.2-4Z"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M8.1 7.3c-.4 0-1.1.8-1.1 1.7 0 2.9 4 6.9 6.9 6.9.9 0 1.7-.7 1.7-1.1l-.1-1.2-2.3-1.1-.9 1c-1.3-.6-2.2-1.5-2.8-2.8l1-.9-1.1-2.3-1.3-.2Z"
                    fill="currentColor"
                  />
                </svg>
              </span>
              <span className="contact-social-copy">
                <strong>Chat on WhatsApp</strong>
                <span>+92 339 5253217</span>
              </span>
              <ArrowUpRight size={17} aria-hidden="true" />
            </a>
            <a
              className="button contact-social-button contact-instagram"
              href={site.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram: zyora_x_adeel"
            >
              <span className="contact-brand-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" width="25" height="25">
                  <rect
                    x="3"
                    y="3"
                    width="18"
                    height="18"
                    rx="5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  />
                  <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.8" />
                  <circle cx="17.5" cy="6.5" r="1.1" fill="currentColor" />
                </svg>
              </span>
              <span className="contact-social-copy">
                <strong>Connect on Instagram</strong>
                <span>@zyora_x_adeel</span>
              </span>
              <ArrowUpRight size={17} aria-hidden="true" />
            </a>
          </div>
        </div>
        <div className="contact-art">
          <div className="envelope-pointer">
            <div className="envelope-drift">
              <Image
                src="/images/glass-envelope.jpg"
                alt="Optical glass envelope with fine spectral reflections"
                width={736}
                height={736}
                sizes="(max-width: 640px) 240px, 35vw"
              />
            </div>
          </div>
          <span className="micro">GOOD SYSTEMS START WITH A CONVERSATION.</span>
        </div>
      </div>
      <footer className="footer">
        <a className="wordmark" href="#">
          ADEEL<span>.</span>
        </a>
        <span className="micro">RAJA ADEEL AHMED / RAWALPINDI, PAKISTAN</span>
        <div>
          {site.linkedin && (
            <a href={site.linkedin} target="_blank" rel="noreferrer">
              LinkedIn ↗
            </a>
          )}
          <a href="#" className="back-top">
            Back to top <ArrowUp size={15} />
          </a>
        </div>
      </footer>
    </section>
  );
}
