import './ChangelogModal.css';

interface ChangelogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChangelogModal({ isOpen, onClose }: ChangelogModalProps) {
  if (!isOpen) return null;

  const version = import.meta.env.APP_VERSION || "1.0.0";
  const buildTime = import.meta.env.APP_BUILD_TIME || "Unknown";

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Changelog</h2>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close">
            &times;
          </button>
        </div>
        <div className="modal-body">
          <div className="changelog-version-header">
            <h3>Version {version}</h3>
            <span className="changelog-date">{buildTime}</span>
          </div>
          <ul className="changelog-list">
            <li><strong>SEO:</strong> Implemented dedicated pages per instrument with static prerendering.</li>
            <li><strong>UI/UX:</strong> Added dynamic client-side routing.</li>
            <li><strong>Feature:</strong> Upgraded Pitch History Graph to canvas-based rich visualization.</li>
            <li><strong>Feature:</strong> Added Reference Tone (Tuning Fork) generator.</li>
            <li><strong>Feature:</strong> Added new Thai and International instruments to the database.</li>
            <li><strong>PWA:</strong> Added offline support and install prompt.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
