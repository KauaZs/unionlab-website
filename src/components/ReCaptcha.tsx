"use client";

import { useEffect, useRef } from "react";

interface ReCaptchaProps {
  siteKey: string;
  onChange: (token: string | null) => void;
}

declare global {
  interface Window {
    grecaptcha: any;
  }
}

export default function ReCaptcha({ siteKey, onChange }: ReCaptchaProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Add Google Recaptcha script to head if not present
    if (!window.grecaptcha) {
      const script = document.createElement("script");
      script.src = "https://www.google.com/recaptcha/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);

      script.onload = () => {
        renderCaptcha();
      };
    } else {
      renderCaptcha();
    }

    function renderCaptcha() {
      if (window.grecaptcha && containerRef.current) {
        const executeRender = () => {
          if (containerRef.current) {
            containerRef.current.innerHTML = ""; // Clear existing elements
            try {
              window.grecaptcha.render(containerRef.current, {
                sitekey: siteKey,
                callback: (token: string) => onChange(token),
                "expired-callback": () => onChange(null),
              });
            } catch (err) {
              console.error("Error rendering reCAPTCHA:", err);
            }
          }
        };

        if (typeof window.grecaptcha.ready === "function") {
          window.grecaptcha.ready(executeRender);
        } else if (typeof window.grecaptcha.render === "function") {
          executeRender();
        } else {
          // If grecaptcha exists but is not yet fully initialized, retry shortly
          setTimeout(renderCaptcha, 100);
        }
      }
    }
  }, [siteKey, onChange]);

  return (
    <div className="flex justify-center my-3 min-h-[78px] bg-slate-950/20 p-2 rounded-xl border border-slate-900/50">
      <div ref={containerRef} />
    </div>
  );
}
