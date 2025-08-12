export interface Spell {
  name: string;
  imageUrl: string;
}

export interface ClassSpells {
  [className: string]: Spell[];
}

export interface ExpansionData {
  General: Spell[];
  [className: string]: Spell[];
}

export interface SpellData {
  [expansion: string]: ExpansionData;
}