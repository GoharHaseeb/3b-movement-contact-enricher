import { Icons } from "./Icons";

type TopBarProps = {
  masterLoaded: boolean;
  masterFileName: string | null;
  onMenu: () => void;
};

export default function TopBar({ masterLoaded, masterFileName, onMenu }: TopBarProps) {
  return (
    <header className="topbar">
      <div className="topbar-left">
        <button type="button" className="icon-btn menu-btn" onClick={onMenu} aria-label="Open navigation">
          <Icons.menu />
        </button>
        <img
          className="topbar-logo"
          src="/3b-movement-logo.png"
          alt="3B Movement"
          width={32}
          height={32}
        />
        <div className="topbar-title">
          <p>Contact Enricher</p>
          <span>Member list matching</span>
        </div>
      </div>

      <div className="topbar-right">
        <div className={`source-pill ${masterLoaded ? "is-ready" : ""}`}>
          <span className="source-dot" />
          <span className="source-label">Master</span>
          <strong>{masterLoaded ? "Loaded" : "Empty"}</strong>
          {masterFileName ? <em title={masterFileName}>{masterFileName}</em> : null}
        </div>
        <div className="workspace-chip">
          <span>3B Movement</span>
          <span className="workspace-sep">·</span>
          <span>Internal</span>
        </div>
      </div>
    </header>
  );
}
