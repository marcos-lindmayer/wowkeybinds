import React from 'react';
import { Spell } from './types';
import SpellCard from './SpellCard';

interface ClassSectionProps {
  className: string;
  spells: Spell[];
  onSpellClick?: (spell: Spell) => void;
  selectedSpell?: Spell | null;
}

const ClassSection: React.FC<ClassSectionProps> = ({ className, spells, onSpellClick, selectedSpell }) => {
  return (
    <div className="class-section">
      <h3 className="class-title">{className}</h3>
      <div className="spells-grid">
        {spells.map((spell, index) => (
          <SpellCard 
            key={index} 
            spell={spell} 
            onClick={onSpellClick}
            isSelected={selectedSpell?.name === spell.name}
          />
        ))}
      </div>
    </div>
  );
};

export default ClassSection;