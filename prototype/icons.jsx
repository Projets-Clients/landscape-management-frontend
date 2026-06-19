/* Simple stroke icons — functional UI glyphs, 24px grid */
const Ic = ({ d, size = 22, fill, ...p }) => (
  React.createElement('svg', {
    width: size, height: size, viewBox: '0 0 24 24', fill: fill || 'none',
    stroke: 'currentColor', strokeWidth: 1.9, strokeLinecap: 'round', strokeLinejoin: 'round', ...p
  }, typeof d === 'string' ? React.createElement('path', { d }) : d));

const I = {
  home:    (p) => <Ic {...p} d="M3 10.5 12 3l9 7.5M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" />,
  grid:    (p) => <Ic {...p} d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" />,
  users:   (p) => <Ic {...p} d="M16 19v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 9a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7M22 19v-2a4 4 0 0 0-3-3.8M16 2.2A3.5 3.5 0 0 1 16 9" />,
  user:    (p) => <Ic {...p} d="M19 20v-1.5a5 5 0 0 0-5-5h-4a5 5 0 0 0-5 5V20M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8" />,
  briefcase:(p)=> <Ic {...p} d="M4 8h16a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1ZM8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13h18" />,
  camera:  (p) => <Ic {...p} d={<><path d="M3 8.5A1.5 1.5 0 0 1 4.5 7H7l1.4-2.1A1 1 0 0 1 9.2 4.5h5.6a1 1 0 0 1 .8.4L17 7h2.5A1.5 1.5 0 0 1 21 8.5v9A1.5 1.5 0 0 1 19.5 19h-15A1.5 1.5 0 0 1 3 17.5z"/><circle cx="12" cy="12.5" r="3.3"/></>} />,
  image:   (p) => <Ic {...p} d={<><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9.5" r="1.6"/><path d="m3 17 4.5-4.5a2 2 0 0 1 2.7 0L17 19"/><path d="m14 15 1.6-1.6a2 2 0 0 1 2.7 0L21 16"/></>} />,
  doc:     (p) => <Ic {...p} d={<><path d="M14 3v4a1 1 0 0 0 1 1h4"/><path d="M5 21V5a2 2 0 0 1 2-2h7l5 5v13a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2Z"/><path d="M9 12h6M9 16h4"/></>} />,
  pen:     (p) => <Ic {...p} d="M3 21s3.5-.4 5-1.9L20 7.1a2 2 0 0 0 0-2.8l-.3-.3a2 2 0 0 0-2.8 0L4.9 16a8 8 0 0 0-1.9 5ZM15 6l3 3" />,
  check:   (p) => <Ic {...p} d="M5 12.5 10 17.5 19.5 6.5" />,
  checkCircle:(p)=><Ic {...p} d={<><circle cx="12" cy="12" r="9"/><path d="m8.5 12.5 2.5 2.5 4.5-5"/></>} />,
  plus:    (p) => <Ic {...p} d="M12 5v14M5 12h14" />,
  chevR:   (p) => <Ic {...p} d="M9 6l6 6-6 6" />,
  chevL:   (p) => <Ic {...p} d="M15 6l-6 6 6 6" />,
  chevD:   (p) => <Ic {...p} d="M6 9l6 6 6-6" />,
  bell:    (p) => <Ic {...p} d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0" />,
  search:  (p) => <Ic {...p} d={<><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></>} />,
  pin:     (p) => <Ic {...p} d={<><path d="M20 10c0 5.5-8 12-8 12s-8-6.5-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="2.6"/></>} />,
  calendar:(p) => <Ic {...p} d={<><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></>} />,
  clock:   (p) => <Ic {...p} d={<><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>} />,
  send:    (p) => <Ic {...p} d="M22 2 11 13M22 2 15 22l-4-9-9-4 20-7Z" />,
  download:(p) => <Ic {...p} d="M12 3v12m0 0 4-4m-4 4-4-4M4 17v2a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-2" />,
  link:    (p) => <Ic {...p} d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1" />,
  arrowL:  (p) => <Ic {...p} d="M19 12H5M5 12l6 6M5 12l6-6" />,
  more:    (p) => <Ic {...p} d={<><circle cx="5" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.4" fill="currentColor" stroke="none"/></>} />,
  x:       (p) => <Ic {...p} d="M6 6l12 12M18 6 6 18" />,
  settings:(p) => <Ic {...p} d={<><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/></>} />,
  shield:  (p) => <Ic {...p} d={<><path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6Z"/><path d="m9 12 2 2 4-4"/></>} />,
  leaf:    (p) => <Ic {...p} d="M5 21c.5-5 3-9 9-11 3-1 5-3 5-3s1 8-4 12c-3 2.4-7 2.5-10 2ZM5 21c2-4 5-6 8-7" />,
  sun:     (p) => <Ic {...p} d={<><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5 3.6 3.6M20.4 20.4 19 19M19 5l1.4-1.4M3.6 20.4 5 19"/></>} />,
  truck:   (p) => <Ic {...p} d={<><path d="M3 7a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v9H3ZM15 9h3.5L21 12v4h-6"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></>} />,
  list:    (p) => <Ic {...p} d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01" />,
  flag:    (p) => <Ic {...p} d="M5 21V4M5 4l9 1-1.5 4L14 13l-9-1" />,
  layers:  (p) => <Ic {...p} d="m12 3 9 5-9 5-9-5 9-5ZM3 13l9 5 9-5M3 16l9 5 9-5" />,
};
Object.assign(window, { I, Ic });
