import React from 'react';
import { Spell } from './types';

interface SpellCardProps {
  spell: Spell;
  onClick?: (spell: Spell) => void;
  isSelected?: boolean;
}

const SpellCard: React.FC<SpellCardProps> = ({ spell, onClick, isSelected }) => {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('application/json', JSON.stringify(spell));
  };

  return (
    <div 
      className={`spell-card ${isSelected ? 'selected' : ''}`}
      onClick={() => onClick?.(spell)}
      draggable
      onDragStart={handleDragStart}
    >
      <img 
        src={spell.imageUrl} 
        alt={spell.name}
        className="spell-icon"
        onError={(e) => {
          e.currentTarget.src = 'https://placehold.co/32x32/cccccc/666666?text=?';
        }}
      />
      <span className="spell-name">{spell.name}</span>
    </div>
  );
};

export default SpellCard;