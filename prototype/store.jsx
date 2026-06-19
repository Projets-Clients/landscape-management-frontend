/* ============================================================
   LANDSCAPE — app store (context + actions)
   ============================================================ */

const AppCtx = React.createContext(null);
const useApp = () => React.useContext(AppCtx);

function AppProvider({ children, role, setRole }) {
  const [data, setData] = React.useState(() => seedState());
  const [route, setRoute] = React.useState({ screen: 'home', params: {} });
  const [history, setHistory] = React.useState([]);
  const [toast, setToast] = React.useState(null);

  const user = React.useMemo(() => {
    if (role === 'admin') return ADMIN;
    return data.employees.find(e => e.id === route.userId) || data.employees.find(e => e.role === role) || data.employees[0];
  }, [role, data.employees, route.userId]);

  const prevRole = React.useRef(role);
  React.useEffect(() => {
    if (prevRole.current !== role) {
      prevRole.current = role;
      const u = role === 'admin' ? ADMIN : data.employees.find(e => e.role === role) || data.employees[0];
      setRoute({ screen: 'home', params: {}, userId: u.id });
      setHistory([]);
    }
  }, [role]);

  const nav = (screen, params = {}) => {
    setHistory(h => [...h, route]);
    setRoute(r => ({ screen, params, userId: r.userId }));
  };
  const replace = (screen, params = {}) => setRoute(r => ({ screen, params, userId: r.userId }));
  const back = () => setHistory(h => {
    if (!h.length) return h;
    const prev = h[h.length - 1];
    setRoute(r => ({ ...prev, userId: r.userId }));
    return h.slice(0, -1);
  });
  const goHome = () => { setHistory([]); replace('home'); };
  const setActiveUser = (id) => setRoute(r => ({ ...r, userId: id }));
  const flash = (msg) => setToast(msg);

  const patchProject = (id, patch) => setData(d => ({
    ...d, projects: d.projects.map(p => p.id === id ? { ...p, ...(typeof patch === 'function' ? patch(p) : patch) } : p),
  }));
  const addActivity = (id, entry) => patchProject(id, p => ({ activity: [...p.activity, entry] }));

  const addClient = (c) => {
    const id = 'c' + Math.random().toString(36).slice(2, 7);
    setData(d => ({ ...d, clients: [{ id, ...c }, ...d.clients] }));
    return id;
  };
  const addProject = (p) => {
    const id = 'pr' + Math.random().toString(36).slice(2, 7);
    const proj = {
      id, stage: p.foremanId ? 'assigned' : 'created', before: [], after: [],
      report: { summary: '', items: [], materials: [] }, signature: null,
      activity: [{ who: 'a1', t: 'created the project', at: 'Today' }],
      crew: p.crew || [], ...p,
    };
    setData(d => ({ ...d, projects: [proj, ...d.projects] }));
    return id;
  };

  const clientOf = (p) => data.clients.find(c => c.id === p.clientId);
  const empOf = (id) => data.employees.find(e => e.id === id) || (id === 'a1' ? ADMIN : null);
  const crewOf = (p) => (p.crew || []).map(empOf).filter(Boolean);

  const myProjects = React.useMemo(() => {
    if (role === 'admin') return data.projects;
    return data.projects.filter(p => p.foremanId === user.id || (p.crew || []).includes(user.id));
  }, [role, data.projects, user.id]);

  const ctx = {
    data, role, user, route, history,
    nav, replace, back, goHome, setActiveUser, flash,
    patchProject, addActivity, addClient, addProject,
    clientOf, empOf, crewOf, myProjects,
    setRole,
  };

  return (
    <AppCtx.Provider value={ctx}>
      {children}
      {toast && <Toast msg={toast} onDone={() => setToast(null)} />}
    </AppCtx.Provider>
  );
}

Object.assign(window, { AppCtx, useApp, AppProvider });
