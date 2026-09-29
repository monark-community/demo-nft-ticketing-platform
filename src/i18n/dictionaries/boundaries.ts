/**
 * Copy for the not-found and error boundaries. They are client components, so
 * this file stays tiny rather than pulling the full dictionaries into the bundle.
 */
export const boundaries = {
  en: {
    notFound: {
      metaTitle: "Page not found",
      stamp: "Void",
      title: "This page isn't on the programme.",
      body: "The link may be old, or the show moved.",
      home: "Back to home",
      app: "Open the box office",
    },
    error: {
      title: "Something went wrong on our side.",
      body: "Your demo data is safe in this browser.",
      retry: "Try again",
    },
  },
  fr: {
    notFound: {
      metaTitle: "Page introuvable",
      stamp: "Refusé",
      title: "Cette page n'est pas au programme.",
      body: "Le lien est peut-être ancien, ou le spectacle a déménagé.",
      home: "Retour à l'accueil",
      app: "Ouvrir la billetterie",
    },
    error: {
      title: "Un problème est survenu de notre côté.",
      body: "Vos données de démo sont intactes dans ce navigateur.",
      retry: "Réessayer",
    },
  },
}
