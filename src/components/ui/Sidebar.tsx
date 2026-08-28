import { NAV_ITEMS, type ViewId } from "../../app/navigation";
import { NAV_ICONS } from "./Icons";

type SidebarProps = {
  view: ViewId;
  open: boolean;
  onNavigate: (view: ViewId) => void;
  onClose: () => void;
};

export default function Sidebar({ view, open, onNavigate, onClose }: SidebarProps) {
  return (
    <>
      <button
        type="button"
        className={`sidebar-scrim ${open ? "is-open" : ""}`}
        aria-label="Close navigation"
        onClick={onClose}
      />
      <aside className={`sidebar ${open ? "is-open" : ""}`} aria-label="Workspace">
        <div className="sidebar-brand">
          <img
            src="/3b-movement-logo-light.png"
            alt="3B Movement"
            width={44}
            height={44}
            className="sidebar-logo"
          />
          <div>
            <p className="sidebar-name">3B Movement</p>
            <p className="sidebar-product">Studio ops</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          <p className="sidebar-section">Workspace</p>
          {NAV_ITEMS.map((item) => {
            const Icon = NAV_ICONS[item.id];
            const active = view === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={`nav-item ${active ? "is-active" : ""}`}
                disabled={!item.available}
                onClick={() => {
                  if (!item.available) return;
                  onNavigate(item.id);
                  onClose();
                }}
              >
                <Icon size={18} />
                <span>{item.label}</span>
                {!item.available ? <em>Soon</em> : null}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-foot">
          <p>Internal utility</p>
          <p className="sidebar-tag">Breathe. Bend. Be.</p>
        </div>
      </aside>
    </>
  );
}
