/**
 * Utilitaires pour générer des couleurs aléatoires pour les graphiques
 */

/**
 * Génère une couleur aléatoire en format HSLA
 */
export const genererCouleur = (opacity = 0.7): string => {
  const hue = Math.floor(Math.random() * 360);
  const saturation = 60 + Math.floor(Math.random() * 20); // 60-80%
  const lightness = 50 + Math.floor(Math.random() * 20); // 50-70%
  return `hsla(${hue}, ${saturation}%, ${lightness}%, ${opacity})`;
};

/**
 * Génère des paires de couleurs (fond + bordure) avec la même teinte
 */
export const genererPaireCouleurs = (nombre: number) => {
  const couleurs = [];
  for (let i = 0; i < nombre; i++) {
    const hue = Math.floor(Math.random() * 360);
    const saturation = 60 + Math.floor(Math.random() * 20); // 60-80%
    const lightness = 50 + Math.floor(Math.random() * 20); // 50-70%
    couleurs.push({
      bg: `hsla(${hue}, ${saturation}%, ${lightness}%, 0.6)`,
      border: `hsla(${hue}, ${saturation}%, ${lightness}%, 1)`
    });
  }
  return couleurs;
};
