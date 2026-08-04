// Petit jeu d'icônes SVG « au trait », cohérent avec l'esprit délicat du site.
// Évite une dépendance externe et garde le bundle léger.

const paths = {
  heart: 'M12 21s-7.5-4.9-10-9.2C.5 8.6 2 5 5.3 5c2 0 3.3 1.2 4.2 2.4C10.4 6.2 11.7 5 13.7 5 17 5 18.5 8.6 17 11.8 14.5 16.1 12 21 12 21z',
  reply: 'M9 14l-5-5 5-5M4 9h9a7 7 0 0 1 7 7v3',
  pin: 'M9 4h6l-1 6 3 3v2H7v-2l3-3-1-6zM12 15v5',
  eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7z',
  'eye-off': 'M2 12s4-7 10-7a9.6 9.6 0 0 1 4 .9M22 12s-4 7-10 7a9.6 9.6 0 0 1-4-.9M3 3l18 18M10 10a3 3 0 0 0 4 4',
  trash: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13',
  edit: 'M4 20h4L18 10l-4-4L4 16v4zM14 6l4 4',
  search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3',
  close: 'M6 6l12 12M18 6L6 18',
  menu: 'M4 7h16M4 12h16M4 17h16',
  arrow: 'M5 12h14M13 6l6 6-6 6',
  share: 'M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v13',
  tag: 'M3 11l8-8 10 10-8 8L3 13V11zM7.5 7.5h.01',
  image: 'M3 5h18v14H3zM3 15l5-5 4 4 3-3 6 6M8.5 9.5a1 1 0 1 0 0-2 1 1 0 0 0 0 2z',
  feather: 'M20 4C13 4 8 9 6 15l-2 5 5-2C15 16 20 11 20 4zM6 18l6-6M11 9h5',
  lock: 'M6 10V8a6 6 0 0 1 12 0v2M5 10h14v10H5zM12 15v2',
  check: 'M4 12l5 5L20 6',
  plus: 'M12 5v14M5 12h14',
  logout: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9',
  star: 'M12 3.5l2.6 5.6 6 .7-4.5 4.1 1.2 5.9L12 16.9 6.7 19.8l1.2-5.9L3.4 9.8l6-.7z',
  book: 'M12 6C10 4.3 6.5 4.3 3.5 5.2v13C6.5 17.3 10 17.3 12 19c2-1.7 5.5-1.7 8.5-.8v-13C17.5 4.3 14 4.3 12 6zM12 6v13',
  mail: 'M3 6h18v12H3zM3 7l9 6 9-6',
  external: 'M14 4h6v6M20 4l-9 9M10 5H5a1 1 0 0 0-1 1v13a1 1 0 0 0 1 1h13a1 1 0 0 0 1-1v-5',
  download: 'M12 3v12M7 10l5 5 5-5M4 21h16',
  cart: 'M4 5h2l2 11h9l2-8H7M9 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM17 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2z',
};

export default function Icon({ name, size = 20, filled = false, className = '', ...rest }) {
  const d = paths[name];
  if (!d) return null;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      <path d={d} />
    </svg>
  );
}
