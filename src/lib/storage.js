import { supabase, BUCKET } from './supabase';
import { slugify } from './utils';

// Téléverse un fichier image dans le bucket « media » et renvoie son URL
// publique. Réservé à l'administrateur (les RLS refusent sinon).
export async function uploadImage(file) {
  if (!file) throw new Error('Aucun fichier fourni.');
  if (!file.type.startsWith('image/'))
    throw new Error('Le fichier doit être une image.');
  if (file.size > 8 * 1024 * 1024)
    throw new Error("L'image ne doit pas dépasser 8 Mo.");

  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const base = slugify(file.name.replace(/\.[^.]+$/, '')) || 'image';
  const path = `${new Date().getFullYear()}/${Date.now()}-${base}.${ext}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { cacheControl: '31536000', upsert: false });

  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, path };
}
