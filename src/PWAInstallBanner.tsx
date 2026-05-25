import { useState } from "react";

interface PWAInstallBannerProps {
  onInstall: () => Promise<void>;
}

/**
 * PWAInstallBanner
 * ────────────────
 * A glassmorphism install portal that slides up from the bottom of the
 * viewport. Only rendered when the parent detects `isReadyToInstall &&
 * !isStandalone`. The banner can also be dismissed for the current session.
 */
export function PWAInstallBanner({ onInstall }: PWAInstallBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const [installing, setInstalling] = useState(false);

  if (dismissed) return null;

  const handleInstall = async () => {
    setInstalling(true);
    await onInstall();
    setInstalling(false);
  };

  return (
    <div className="pwa-banner" role="complementary" aria-label="Install Tuner Free app">
      {/* Dismiss button */}
      <button
        className="pwa-banner-dismiss"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss install prompt"
        id="pwa-dismiss-btn"
      >
        ✕
      </button>

      {/* Icon + text */}
      <div className="pwa-banner-body">
        <div className="pwa-banner-icon" aria-hidden="true">
          {/* Tuning fork SVG icon */}
          <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="20" fill="rgba(47,129,247,0.15)" />
            <circle cx="20" cy="20" r="4" fill="#2f81f7" />
            <circle cx="20" cy="20" r="8" stroke="#2f81f7" strokeWidth="1.5" strokeOpacity="0.5" fill="none" />
            <line x1="20" y1="28" x2="20" y2="36" stroke="#2f81f7" strokeWidth="2" strokeLinecap="round" />
            <line x1="14" y1="20" x2="12" y2="14" stroke="#2f81f7" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.7" />
            <line x1="26" y1="20" x2="28" y2="14" stroke="#2f81f7" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.7" />
          </svg>
        </div>

        <div className="pwa-banner-text">
          <p className="pwa-banner-title">Install Tuner Free</p>
          <p className="pwa-banner-desc">
            Add to your home screen — tune offline, no browser needed.
          </p>
        </div>
      </div>

      {/* CTA */}
      <button
        className={`pwa-banner-cta${installing ? " loading" : ""}`}
        onClick={handleInstall}
        disabled={installing}
        id="pwa-install-btn"
        aria-label="Install Tuner Free as an app"
      >
        {installing ? (
          <span className="pwa-spinner" aria-hidden="true" />
        ) : (
          <>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
              <path d="M8 1a.75.75 0 0 1 .75.75v6.19l1.72-1.72a.75.75 0 1 1 1.06 1.06l-3 3a.75.75 0 0 1-1.06 0l-3-3A.75.75 0 0 1 5.53 6.22L7.25 7.94V1.75A.75.75 0 0 1 8 1ZM2.75 14a.75.75 0 0 1 0-1.5h10.5a.75.75 0 0 1 0 1.5H2.75Z" />
            </svg>
            Install App
          </>
        )}
      </button>
    </div>
  );
}

/**
 * IOSInstallHint
 * ──────────────
 * iOS Safari doesn't support beforeinstallprompt. Show a subtle guide
 * explaining the manual "Add to Home Screen" flow.
 */
export function IOSInstallHint() {
  const [dismissed, setDismissed] = useState(false);

  // Only show on iOS Safari in browser mode
  const isIOS = /iP(hone|ad|od)/.test(navigator.userAgent);
  const isInBrowser =
    !("standalone" in navigator &&
      (navigator as { standalone?: boolean }).standalone === true);

  if (!isIOS || !isInBrowser || dismissed) return null;

  return (
    <div className="pwa-ios-hint" role="complementary" aria-label="iOS install instructions">
      <button
        className="pwa-banner-dismiss"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss iOS install hint"
        id="pwa-ios-dismiss-btn"
      >
        ✕
      </button>
      <div className="pwa-banner-body">
        <div className="pwa-ios-share-icon" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="8 17 12 21 16 17" />
            <line x1="12" y1="12" x2="12" y2="21" />
            <path d="M20.88 18.09A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.29" />
          </svg>
        </div>
        <div className="pwa-banner-text">
          <p className="pwa-banner-title">Add to Home Screen</p>
          <p className="pwa-banner-desc">
            Tap the <strong>Share</strong> button below, then tap <strong>"Add to Home Screen"</strong> to install Tuner Free.
          </p>
        </div>
      </div>
    </div>
  );
}
