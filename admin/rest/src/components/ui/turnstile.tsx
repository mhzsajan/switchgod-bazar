import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    turnstile?: any;
  }
}

interface TurnstileProps {
  siteKey: string;
  onVerify: (token: string | null) => void;
}

let scriptLoaded = false;

function loadScript(): Promise<void> {
  return new Promise((resolve) => {
    if (scriptLoaded || window.turnstile) {
      scriptLoaded = true;
      resolve();
      return;
    }
    const s = document.createElement('script');
    s.src =
      'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    s.async = true;
    s.onload = () => {
      scriptLoaded = true;
      resolve();
    };
    document.head.appendChild(s);
  });
}

const Turnstile = ({ siteKey, onVerify }: TurnstileProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadScript().then(() => {
      if (cancelled || !containerRef.current || !window.turnstile) return;
      widgetIdRef.current = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        callback: (token: string) => onVerify(token),
        'expired-callback': () => onVerify(null),
        'error-callback': () => onVerify(null),
      });
    });
    return () => {
      cancelled = true;
      if (widgetIdRef.current && window.turnstile) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [siteKey]);

  return <div ref={containerRef} />;
};

export default Turnstile;
