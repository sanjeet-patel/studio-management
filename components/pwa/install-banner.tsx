"use client";

import { useEffect, useState } from "react";
import { Download, Share, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIosSafari(): boolean {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua);
  const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS|EdgiOS/.test(ua);
  return isIOS && isSafari;
}

const DISMISS_KEY = "albify-pwa-install-dismissed";

export function InstallBanner() {
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState<"android" | "ios">("android");
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (isStandalone()) return;
    if (localStorage.getItem(DISMISS_KEY)) return;

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setMode("android");
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);

    if (isIosSafari()) {
      setMode("ios");
      setVisible(true);
    }

    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  };

  const install = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 left-4 right-4 z-[60] animate-fade-up">
      <div className="bg-slate-900 text-white rounded-2xl shadow-xl border border-white/10 p-4 max-w-md mx-auto">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center flex-shrink-0">
            <span className="font-bold text-sm">A</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">Install Albify</p>
            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
              {mode === "android"
                ? "Install for a full-screen app with no browser bar."
                : "Tap Share, then “Add to Home Screen” in Safari for the full app experience."}
            </p>
            {mode === "ios" && (
              <p className="text-xs text-amber-400/90 mt-1 flex items-center gap-1">
                <Share className="h-3 w-3" /> Use Safari — Chrome on iOS cannot hide the browser bar.
              </p>
            )}
          </div>
          <button onClick={dismiss} className="p-1 rounded-lg active:bg-white/10" aria-label="Dismiss">
            <X className="h-4 w-4 text-slate-400" />
          </button>
        </div>
        {mode === "android" && deferredPrompt && (
          <button
            onClick={install}
            className="mt-3 w-full h-10 rounded-xl bg-teal-600 hover:bg-teal-500 text-sm font-semibold flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
          >
            <Download className="h-4 w-4" />
            Install App
          </button>
        )}
      </div>
    </div>
  );
}
