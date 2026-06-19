/* ============================================================
   LANDSCAPE — seed data + domain helpers
   ============================================================ */

// Workflow stages (ordered)
const STAGES = [
  { key: 'created',  label: 'Project created',    short: 'Created' },
  { key: 'assigned', label: 'Crew assigned',       short: 'Assigned' },
  { key: 'before',   label: 'Before photos',       short: 'Before' },
  { key: 'after',    label: 'Work done & report',  short: 'Documented' },
  { key: 'sent',     label: 'Sent for signature',  short: 'Awaiting sign' },
  { key: 'signed',   label: 'Signed & complete',   short: 'Complete' },
];
const stageIndex = (k) => STAGES.findIndex(s => s.key === k);

const STATUS_BADGE = {
  created:  { cls: 'gray', label: 'Draft' },
  assigned: { cls: 'info', label: 'Scheduled' },
  before:   { cls: 'warn', label: 'In progress' },
  after:    { cls: 'clay', label: 'Ready to send' },
  sent:     { cls: 'clay', label: 'Awaiting signature' },
  signed:   { cls: 'ok',   label: 'Complete' },
};

const AV = ['oklch(0.6 0.12 45)','oklch(0.55 0.09 145)','oklch(0.6 0.1 250)','oklch(0.62 0.12 25)','oklch(0.58 0.1 300)','oklch(0.6 0.1 190)','oklch(0.64 0.11 80)'];
const avColor = (id) => AV[Math.abs([...String(id)].reduce((a,c)=>a+c.charCodeAt(0),0)) % AV.length];
const initials = (name) => name.split(' ').filter(Boolean).slice(0,2).map(w=>w[0]).join('').toUpperCase();

const EMPLOYEES = [
  { id: 'u1', name: 'Marcus Reyes',   role: 'foreman',  trade: 'Lead Foreman',        phone: '(503) 555-0142' },
  { id: 'u2', name: 'Diego Santos',   role: 'employee', trade: 'Hardscape Tech',      phone: '(503) 555-0188' },
  { id: 'u3', name: 'Tasha Brooks',   role: 'employee', trade: 'Planting Specialist', phone: '(503) 555-0119' },
  { id: 'u4', name: 'Owen Pratt',     role: 'employee', trade: 'Irrigation Tech',     phone: '(503) 555-0167' },
  { id: 'u5', name: 'Lena Fischer',   role: 'foreman',  trade: 'Crew Foreman',        phone: '(503) 555-0173' },
  { id: 'u6', name: 'Caleb Owens',    role: 'employee', trade: 'Groundskeeper',       phone: '(503) 555-0150' },
];
const ADMIN = { id: 'a1', name: 'Renata Vogel', role: 'admin', trade: 'Operations Manager', phone: '(503) 555-0100', company: 'Cedar & Stone Landscapes' };

const CLIENTS = [
  { id: 'c1', name: 'Maple Grove HOA',        contact: 'Brian Whitfield', email: 'bwhitfield@maplegrovehoa.org', phone: '(503) 555-0211', address: '4120 Maple Grove Ln, Portland, OR' },
  { id: 'c2', name: 'Bennett Residence',      contact: 'Sara Bennett',    email: 'sara.bennett@gmail.com',       phone: '(503) 555-0234', address: '88 Hawthorne Ct, Lake Oswego, OR' },
  { id: 'c3', name: 'Northside Dental',       contact: 'Dr. Amy Cho',     email: 'office@northsidedental.com',   phone: '(503) 555-0299', address: '1200 NE Broadway, Portland, OR' },
  { id: 'c4', name: 'Holloway Estate',        contact: 'James Holloway',  email: 'jh@hollowayestate.com',        phone: '(503) 555-0277', address: '15 Ridgecrest Dr, West Linn, OR' },
];

const ph = (cap) => ({ id: 'p'+Math.random().toString(36).slice(2,8), caption: cap });

const PROJECTS = [
  {
    id: 'pr1', name: 'Backyard Retaining Wall', clientId: 'c2', stage: 'before',
    type: 'Hardscape', address: '88 Hawthorne Ct, Lake Oswego, OR',
    start: '2026-06-15', due: '2026-06-26', value: 18400,
    foremanId: 'u1', crew: ['u1','u2','u4'],
    before: [ph('North slope before grading'), ph('Existing timber wall — failing')],
    after: [],
    report: { summary: '', items: [], materials: [] },
    signature: null,
    activity: [
      { who: 'a1', t: 'created the project', at: 'Jun 12' },
      { who: 'a1', t: 'assigned Marcus, Diego & Owen', at: 'Jun 13' },
      { who: 'u1', t: 'uploaded 2 before photos', at: 'Jun 16' },
    ],
  },
  {
    id: 'pr2', name: 'Front Garden Redesign', clientId: 'c1', stage: 'after',
    type: 'Planting', address: '4120 Maple Grove Ln, Portland, OR',
    start: '2026-06-08', due: '2026-06-18', value: 9750,
    foremanId: 'u5', crew: ['u5','u3','u6'],
    before: [ph('Overgrown front beds'), ph('Lawn edge before')],
    after: [ph('New drought-tolerant beds'), ph('Fresh bark & stone border'), ph('Completed front walk')],
    report: {
      summary: 'Removed 240 sq ft of overgrown turf and replaced with a drought-tolerant native planting scheme.',
      items: ['Demo & haul-away of old turf and shrubs', 'Steel landscape edging — 64 lf', 'Native planting (38 plants)', 'Bark mulch', 'Drip irrigation retrofit'],
      materials: ['Steel edging (64 lf)', 'Bark mulch (3 cu yd)', 'Basalt cobble (1 pallet)'],
    },
    signature: null,
    activity: [
      { who: 'a1', t: 'created the project', at: 'Jun 4' },
      { who: 'u5', t: 'uploaded before photos', at: 'Jun 9' },
      { who: 'u5', t: 'uploaded 3 after photos', at: 'Jun 17' },
    ],
  },
  {
    id: 'pr3', name: 'Courtyard Paver Patio', clientId: 'c3', stage: 'sent',
    type: 'Hardscape', address: '1200 NE Broadway, Portland, OR',
    start: '2026-05-28', due: '2026-06-12', value: 22600,
    foremanId: 'u1', crew: ['u1','u2'],
    before: [ph('Cracked concrete courtyard')],
    after: [ph('New permeable paver patio'), ph('Seating area with planters')],
    report: {
      summary: 'Demolished 520 sq ft of cracked concrete and installed a permeable paver patio.',
      items: ['Demo & disposal of old concrete', 'Permeable pavers (520 sq ft)', 'Linear channel drain', '2x cedar raised planters'],
      materials: ['Permeable pavers (520 sq ft)', 'Channel drain (24 lf)'],
    },
    signature: { requestedAt: 'Jun 13', signedAt: null, signerName: null, dataUrl: null },
    activity: [
      { who: 'a1', t: 'created the project', at: 'May 24' },
      { who: 'u1', t: 'completed the work report', at: 'Jun 12' },
      { who: 'a1', t: 'sent signature request to Dr. Amy Cho', at: 'Jun 13' },
    ],
  },
  {
    id: 'pr4', name: 'Estate Spring Cleanup', clientId: 'c4', stage: 'signed',
    type: 'Maintenance', address: '15 Ridgecrest Dr, West Linn, OR',
    start: '2026-05-12', due: '2026-05-20', value: 6200,
    foremanId: 'u5', crew: ['u5','u6','u3'],
    before: [ph('Beds before cleanup')],
    after: [ph('Cleaned & edged beds'), ph('Pruned hedges')],
    report: {
      summary: 'Full spring cleanup across the 0.4-acre estate.',
      items: ['Bed cleanup & re-edge', 'Hedge & ornamental pruning', 'Lawn dethatch + mow'],
      materials: ['Bark mulch (5 cu yd)'],
    },
    signature: { requestedAt: 'May 21', signedAt: 'May 22', signerName: 'James Holloway', dataUrl: null },
    activity: [
      { who: 'a1', t: 'created the project', at: 'May 8' },
      { who: 'u5', t: 'documented the work', at: 'May 20' },
      { who: 'c4', t: 'reviewed and signed the report', at: 'May 22' },
    ],
  },
  {
    id: 'pr5', name: 'Pool Surround Planting', clientId: 'c2', stage: 'assigned',
    type: 'Planting', address: '88 Hawthorne Ct, Lake Oswego, OR',
    start: '2026-06-22', due: '2026-07-02', value: 11200,
    foremanId: 'u5', crew: ['u5','u3'],
    before: [], after: [],
    report: { summary: '', items: [], materials: [] },
    signature: null,
    activity: [{ who: 'a1', t: 'created the project', at: 'Jun 16' }],
  },
  {
    id: 'pr6', name: 'Clubhouse Entry Beds', clientId: 'c1', stage: 'created',
    type: 'Planting', address: '4120 Maple Grove Ln, Portland, OR',
    start: '2026-06-30', due: '2026-07-10', value: 8400,
    foremanId: null, crew: [],
    before: [], after: [],
    report: { summary: '', items: [], materials: [] },
    signature: null,
    activity: [{ who: 'a1', t: 'created the project', at: 'Jun 18' }],
  },
];

function seedState() {
  return {
    clients: JSON.parse(JSON.stringify(CLIENTS)),
    projects: JSON.parse(JSON.stringify(PROJECTS)),
    employees: JSON.parse(JSON.stringify(EMPLOYEES)),
  };
}

Object.assign(window, {
  STAGES, stageIndex, STATUS_BADGE, EMPLOYEES, ADMIN, CLIENTS, PROJECTS,
  seedState, avColor, initials, ph,
});
