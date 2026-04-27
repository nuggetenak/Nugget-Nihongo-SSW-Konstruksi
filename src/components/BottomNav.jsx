import { T } from "../styles/theme.js";

const TABS = [
  { key: "home",    icon: "🏠", iconActive: "🏠", label: "Beranda" },
  { key: "belajar", icon: "📚", iconActive: "📚", label: "Belajar" },
  { key: "ujian",   icon: "✍️", iconActive: "✍️", label: "Ujian" },
  { key: "lainnya", icon: "⋯",  iconActive: "⋯",  label: "Lainnya" },
];

export default function BottomNav({ active, onChange }) {
  return (
    <nav style={{
      position: "fixed", bottom: 0, left: 0, right: 0,
      height: T.navH,
      background: "rgba(13,11,8,0.92)",
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      borderTop: `1px solid ${T.border}`,
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 100,
      paddingBottom: "env(safe-area-inset-bottom, 0px)",
    }}>
      <div style={{ display: "flex", width: "100%", maxWidth: T.maxW }}>
        {TABS.map(tab => {
          const isActive = active === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => onChange(tab.key)}
              style={{
                flex: 1, display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                gap: 2, padding: "6px 0",
                fontFamily: "inherit", fontSize: 10, fontWeight: isActive ? 700 : 500,
                background: "none", border: "none", cursor: "pointer",
                color: isActive ? T.amber : T.textDim,
                transition: "color 0.15s",
                position: "relative",
              }}
            >
              {isActive && (
                <div style={{
                  position: "absolute", top: -1, left: "50%", transform: "translateX(-50%)",
                  width: 20, height: 2, borderRadius: T.r.pill,
                  background: T.amber,
                }} />
              )}
              <span style={{ fontSize: 18, lineHeight: 1 }}>{isActive ? tab.iconActive : tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export { TABS };
