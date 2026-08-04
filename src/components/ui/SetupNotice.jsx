import Icon from './Icon';

// Affiché tant que le fichier .env n'est pas rempli : évite l'écran blanc et
// guide la personne vers la configuration.
export default function SetupNotice() {
  return (
    <div className="mx-auto max-w-xl px-5 py-24 text-center">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-lilac-100 text-lilac-500">
        <Icon name="feather" size={26} />
      </span>
      <h1 className="mt-6 font-display text-2xl text-ink">Presque prêt</h1>
      <p className="mt-3 text-ink-soft">
        Le site n'est pas encore relié à sa base de données. Créez un projet
        Supabase, copiez le fichier <code className="rounded bg-lilac-50 px-1.5 py-0.5 text-lilac-500">.env.example</code> en
        <code className="rounded bg-lilac-50 px-1.5 py-0.5 text-lilac-500"> .env</code>, puis renseignez vos clés.
      </p>
      <p className="mt-4 text-sm text-ink-soft">
        Toutes les étapes sont détaillées dans le fichier <strong>README.md</strong>.
      </p>
    </div>
  );
}
