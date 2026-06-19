/* ============================================================
   LANDSCAPE — app root: toolbar, device frame, router, tweaks
   ============================================================ */

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#C2603E",
  "headingFont": "Instrument Serif",
  "hubLayout": "overview",
  "radius": 16
}/*EDITMODE-END*/;

const ACCENTS = {
  "#C2603E": "oklch(0.63 0.125 45)",   // terracotta (default)
  "#A8843B": "oklch(0.63 0.105 80)",   // ochre
  "#4F7A52": "oklch(0.58 0.085 145)",  // sage
  "#3E6B8C": "oklch(0.55 0.08 240)",   // slate blue
};
const ACCENT_DEEP = {
  "#C2603E": "oklch(0.53 0.115 42)",
  "#A8843B": "oklch(0.52 0.095 78)",
  "#4F7A52": "oklch(0.47 0.075 145)",
  "#3E6B8C": "oklch(0.45 0.07 240)",
};
const ACCENT_SOFT = {
  "#C2603E": "oklch(0.93 0.045 55)",
  "#A8843B": "oklch(0.94 0.045 85)",
  "#4F7A52": "oklch(0.93 0.04 145)",
  "#3E6B8C": "oklch(0.93 0.035 240)",
};
const HEADING_FONTS = {
  "Instrument Serif": "'Instrument Serif', Georgia, serif",
  "Hanken Grotesk": "'Hanken Grotesk', system-ui, sans-serif",
  "Fraunces": "'Fraunces', Georgia, serif",
};

const ROLES = [
  { key: 'admin', label: 'Admin', color: 'var(--clay)' },
  { key: 'foreman', label: 'Foreman', color: 'var(--moss)' },
  { key: 'employee', label: 'Employee', color: 'var(--info)' },
];
const VPS = [
  { key: 'mobile', label: 'Mobile' },
  { key: 'tablet', label: 'Tablet' },
  { key: 'desktop', label: 'Desktop' },
];

/* router → screen component */
function Screen({ vp, hubLayout }) {
  const ctx = useApp();
  const s = ctx.route.screen;
  switch (s) {
    case 'home':         return <DashboardScreen vp={vp} />;
    case 'projects':     return <ProjectsScreen vp={vp} />;
    case 'project':      return <ProjectScreen vp={vp} hubLayout={hubLayout} />;
    case 'photos':       return <PhotosScreen vp={vp} />;
    case 'report':       return <ReportScreen vp={vp} />;
    case 'clients':      return <ClientsScreen vp={vp} />;
    case 'client':       return <ClientScreen vp={vp} />;
    case 'team':         return <TeamScreen vp={vp} />;
    case 'newClient':    return <NewClientScreen vp={vp} />;
    case 'newProject':   return <NewProjectScreen vp={vp} />;
    case 'assign':       return <AssignScreen vp={vp} />;
    case 'sendSig':      return <SendSigScreen vp={vp} />;
    case 'clientReview': return <ClientReviewScreen vp={vp} />;
    default:             return <DashboardScreen vp={vp} />;
  }
}

/* the product UI inside the frame */
function ProductUI({ vp, hubLayout }) {
  const ctx = useApp();
  const isPublic = ctx.route.screen === 'clientReview';
  const desktop = vp === 'desktop';

  if (isPublic) return <Screen vp={vp} hubLayout={hubLayout} />;

  if (desktop) {
    return (
      <div className="app">
        <div className="shell">
          <Sidebar />
          <div className="col grow" style={{ minWidth: 0 }}>
            <Screen vp={vp} hubLayout={hubLayout} />
          </div>
        </div>
      </div>
    );
  }
  // mobile / tablet: bottom nav
  return (
    <div className="app">
      <Screen vp={vp} hubLayout={hubLayout} />
      <BottomNav />
    </div>
  );
}

function Root() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [role, setRole] = React.useState('admin');
  const [vp, setVp] = React.useState('mobile');

  // apply tweaks to :root
  React.useEffect(() => {
    const r = document.documentElement.style;
    r.setProperty('--accent', ACCENTS[t.accent] || ACCENTS['#C2603E']);
    r.setProperty('--accent-deep', ACCENT_DEEP[t.accent] || ACCENT_DEEP['#C2603E']);
    r.setProperty('--accent-soft', ACCENT_SOFT[t.accent] || ACCENT_SOFT['#C2603E']);
    r.setProperty('--serif', HEADING_FONTS[t.headingFont] || HEADING_FONTS['Instrument Serif']);
    r.setProperty('--r-md', t.radius + 'px');
    r.setProperty('--r-lg', (t.radius + 6) + 'px');
    r.setProperty('--r-sm', Math.max(6, t.radius - 5) + 'px');
  }, [t.accent, t.headingFont, t.radius]);

  return (
    <div className="stage">
      {/* toolbar (outside product) */}
      <div className="toolbar">
        <div className="brandmark"><I.leaf size={20} style={{ color: 'var(--accent)' }} /><b>LANDSCAPE</b><span>Field PM</span></div>
        <div className="tb-spacer" />
        <div className="tb-group">
          <span className="tb-label" style={{ paddingLeft: 8 }}>Role</span>
          {ROLES.map(r => (
            <button key={r.key} className="tb-seg" data-on={role === r.key} onClick={() => setRole(r.key)}>
              <span className="dot" style={{ background: r.color }} />{r.label}
            </button>
          ))}
        </div>
        <div className="tb-group">
          {VPS.map(v => (
            <button key={v.key} className="tb-seg" data-on={vp === v.key} onClick={() => setVp(v.key)}>{v.label}</button>
          ))}
        </div>
      </div>

      {/* device */}
      <div className="stage-body scroll">
        <div className="device" data-vp={vp} key={vp}>
          <div className="notch" />
          <AppProvider role={role} setRole={setRole}>
            <ProductUI vp={vp} hubLayout={t.hubLayout} />
          </AppProvider>
        </div>
      </div>

      {/* Tweaks */}
      <TweaksPanel>
        <TweakSection label="Brand" />
        <TweakColor label="Accent" value={t.accent} options={Object.keys(ACCENTS)} onChange={v => setTweak('accent', v)} />
        <TweakSelect label="Heading font" value={t.headingFont} options={Object.keys(HEADING_FONTS)} onChange={v => setTweak('headingFont', v)} />
        <TweakSlider label="Corner radius" value={t.radius} min={6} max={24} step={1} unit="px" onChange={v => setTweak('radius', v)} />
        <TweakSection label="Project hub layout" />
        <TweakRadio label="Layout" value={t.hubLayout} options={['overview', 'tabbed', 'timeline']} onChange={v => setTweak('hubLayout', v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<Root />);
