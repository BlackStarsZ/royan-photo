/**
 * Default predefined themes used when seeding the database.
 * These are also used client-side for previewing theme variables.
 */

export interface ThemeTemplate {
  text: string;
  hasPlayerVar: boolean;
  hasRandomPlayerVar: boolean;
}

export const DEFAULT_THEMES: ThemeTemplate[] = [
  { text: 'Un coucher de soleil depuis là où vous êtes', hasPlayerVar: false, hasRandomPlayerVar: false },
  { text: 'Votre plat préféré du moment', hasPlayerVar: false, hasRandomPlayerVar: false },
  { text: 'Un détail architectural qui vous plaît', hasPlayerVar: false, hasRandomPlayerVar: false },
  { text: 'La vue depuis votre chambre', hasPlayerVar: false, hasRandomPlayerVar: false },
  { text: 'Quelque chose de rouge dans votre environnement', hasPlayerVar: false, hasRandomPlayerVar: false },
  { text: '{player} prend un selfie avec la mer en fond', hasPlayerVar: true, hasRandomPlayerVar: false },
  { text: '{player} mange une glace', hasPlayerVar: true, hasRandomPlayerVar: false },
  { text: 'Prenez un selfie avec {random_player}', hasPlayerVar: false, hasRandomPlayerVar: true },
  { text: 'Faites rire {random_player} et photographiez-le', hasPlayerVar: false, hasRandomPlayerVar: true },
];
