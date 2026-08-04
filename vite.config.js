import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Configuration Vite : plugin React + découpage manuel des bundles lourds
// (éditeur riche, supabase) pour un premier chargement plus rapide.
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          editor: [
            '@tiptap/react',
            '@tiptap/starter-kit',
            '@tiptap/extension-color',
            '@tiptap/extension-text-style',
            '@tiptap/extension-underline',
            '@tiptap/extension-link',
            '@tiptap/extension-image',
            '@tiptap/extension-text-align',
            '@tiptap/extension-placeholder',
          ],
          supabase: ['@supabase/supabase-js'],
        },
      },
    },
  },
});
