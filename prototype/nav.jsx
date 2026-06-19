/* ============================================================
   LANDSCAPE — navigation chrome (appbar, sidebar, bottom nav)
   ============================================================ */

const NAV_FOR = {
  admin:    [
    { key: 'home',     label: 'Dashboard', icon: I.home },
    { key: 'projects', label: 'Projects',  icon: I.grid },
    { key: 'clients',  label: 'Clients',   icon: I.briefcase },
    { key: 'team',     label: 'Team',      icon: I.users },
  ],
  foreman:  [
    { key: 'home',     label: 'Today',     icon: I.home },
    { key: 'projects', label: 'Projects',  icon: I.grid },
    { key: 'team',     label: 'Crew',      icon: I.users },
  ],
  employee: [
    { key: 'home',     label: 'Today',     icon: I.home },
    { key: 'projects', label: 'My Work',   icon: I.grid },
  ],
};

function pendingCount(ctx) {
  if (ctx.role === 'admin') return ctx.data.projects.filter(p => p.stage === 'after').length;
  return 0;
}

function Sidebar() {
  const ctx = useApp();
  const items = NAV_FOR[ctx.role];
  const active = ['home','projects','clients','team'].includes(ctx.route.screen) ? ctx.route.screen
    : ctx.route.screen === 'project' ? 'projects'
    : ctx.route.screen === 'client' ? 'clients' : ctx.route.screen;
  const pend = pendingCount(ctx);
  return (
    <div className="sidebar">
      <div className="logo"><I.leaf size={22} style={{ color: 'var(--accent)' }} /><b>LANDSCAPE</b></div>
      {items.map(it => (
        <button key={it.key} className="navitem" data-on={active === it.key}
          onClick={() => ctx.replace(it.key)}>
          <it.icon size={20} />{it.label}
          {it.key === 'projects' && pend > 0 && <span className="badge-n">{pend}</span>}
        </button>
      ))}
      <div style={{ flex: 1 }} />
      <UserCard />
    </div>
  );
}

function UserCard() {
  const ctx = useApp();
  return (
    <div className="card card-pad" style={{ padding: 12, display: 'flex', alignItems: 'center', gap: 11 }}>
      <Avatar id={ctx.user.id} name={ctx.user.name} size="md" />
      <div className="grow">
        <div style={{ fontSize: 13.5, fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ctx.user.name}</div>
        <div style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>{ctx.user.trade}</div>
      </div>
    </div>
  );
}

function AppBar({ title, sub, back, right, big }) {
  const ctx = useApp();
  return (
    <div className="appbar">
      {back && <IconBtn ghost icon={<I.arrowL size={21} />} onClick={ctx.back} />}
      <div className="grow" style={{ minWidth: 0 }}>
        <div className="title" style={big ? { fontSize: 22 } : null}>{title}</div>
        {sub && <div className="sub">{sub}</div>}
      </div>
      {right}
    </div>
  );
}

function BottomNav() {
  const ctx = useApp();
  const items = NAV_FOR[ctx.role];
  const active = ['home','projects','clients','team'].includes(ctx.route.screen) ? ctx.route.screen
    : ctx.route.screen === 'project' ? 'projects'
    : ctx.route.screen === 'client' ? 'clients' : null;
  const pend = pendingCount(ctx);
  return (
    <div className="bottomnav">
      {items.map(it => (
        <button key={it.key} className="bn-item" data-on={active === it.key}
          onClick={() => ctx.replace(it.key)}>
          <it.icon size={22} />
          <span>{it.label}</span>
          {it.key === 'projects' && pend > 0 && <span className="pip" />}
        </button>
      ))}
    </div>
  );
}

Object.assign(window, { Sidebar, AppBar, BottomNav, NAV_FOR });
