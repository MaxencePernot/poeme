// Identifiant anonyme et persistant du visiteur, stocké localement.
// Sert uniquement à empêcher un même navigateur d'aimer deux fois la même
// publication. Aucune donnée personnelle n'est collectée.
const KEY = 'el_visitor_id';

export function getVisitorId() {
  if (typeof window === 'undefined') return 'server';
  let id = localStorage.getItem(KEY);
  if (!id) {
    id =
      (crypto?.randomUUID?.() ||
        `v_${Date.now()}_${Math.random().toString(36).slice(2)}`);
    localStorage.setItem(KEY, id);
  }
  return id;
}
