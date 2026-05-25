import { useState, useEffect } from "react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
  prompt(): Promise<void>;
}

interface UsePWAInstallerReturn {
  /** True when the browser has a deferred install prompt ready to fire */
  isReadyToInstall: boolean;
  /** True when the app is running in standalone (PWA) mode */
  isStandalone: boolean;
  /** Call this to trigger the native browser install dialog */
  triggerInstall: () => Promise<void>;
}

/**
 * usePWAInstaller
 * ───────────────
 * Intercepts the browser's `beforeinstallprompt` event, stores it, and
 * exposes a `triggerInstall()` function so a custom UI can drive the flow.
 *
 * Also detects whether the app is already running in PWA standalone mode
 * so the install banner can be hidden when it's no longer needed.
 */
export function usePWAInstaller(): UsePWAInstallerReturn {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isReadyToInstall, setIsReadyToInstall] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // ── 1. Standalone detection ──────────────────────────────────────────
    // CSS media query approach (Chrome, Edge, Samsung Browser, Firefox)
    const standaloneQuery = window.matchMedia("(display-mode: standalone)");

    const checkStandalone = () => {
      const isIosStandalone =
        "standalone" in navigator &&
        (navigator as { standalone?: boolean }).standalone === true;
      const isMqStandalone = standaloneQuery.matches;
      setIsStandalone(isIosStandalone || isMqStandalone);
    };

    checkStandalone();

    // React to changes if the user installs mid-session
    standaloneQuery.addEventListener("change", checkStandalone);

    // ── 2. Intercept install prompt ──────────────────────────────────────
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar / native UI from appearing automatically
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      setIsReadyToInstall(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // ── 3. Detect successful install ─────────────────────────────────────
    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setIsReadyToInstall(false);
      setIsStandalone(true);
    };

    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      standaloneQuery.removeEventListener("change", checkStandalone);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  // ── 4. Trigger native install dialog ────────────────────────────────────
  const triggerInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();

    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setIsReadyToInstall(false);
    }
  };

  return { isReadyToInstall, isStandalone, triggerInstall };
}
