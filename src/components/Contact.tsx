'use client';
import Image from 'next/image';
import { useState } from 'react';
import { ArrowUpRight, ArrowUp, Copy, Check, MessageCircle, Camera } from 'lucide-react';
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
              className="button contact-social-button"
              href={site.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat on WhatsApp at +92 339 5253217"
            >
              <MessageCircle size={19} aria-hidden="true" />
              WhatsApp
              <ArrowUpRight size={17} aria-hidden="true" />
            </a>
            <a
              className="button contact-social-button"
              href={site.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram: zyora_x_adeel"
            >
              <Camera size={19} aria-hidden="true" />
              Instagram
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
