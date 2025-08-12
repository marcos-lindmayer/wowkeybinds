import React, { useState } from 'react';

interface ExtraButtonsProps {
  onKeyClick: (keyId: string) => void;
  onKeyDrop: (keyId: string, spell: any) => void;
  onKeyRemove: (keyId: string) => void;
  keybinds: { [key: string]: any };
  getModifiedKeyId: (keyId: string) => string;
  customLabels: { [key: string]: string };
  setCustomLabels: (labels: { [key: string]: string } | ((prev: { [key: string]: string }) => { [key: string]: string })) => void;
}

const ExtraButtons: React.FC<ExtraButtonsProps> = ({ onKeyClick, onKeyDrop, onKeyRemove, keybinds, getModifiedKeyId, customLabels, setCustomLabels }) => {
  const [editingButton, setEditingButton] = useState<string | null>(null);
  
  const getModifierClass = (keyId: string) => {
    if (keyId.includes('shift+')) return 'shift-modifier';
    if (keyId.includes('ctrl+')) return 'ctrl-modifier';
    if (keyId.includes('alt+')) return 'alt-modifier';
    return '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, keyId: string) => {
    e.preventDefault();
    const spellData = e.dataTransfer.getData('application/json');
    if (spellData) {
      const spell = JSON.parse(spellData);
      onKeyDrop(keyId, spell);
    }
  };

  const handleRightClick = (e: React.MouseEvent, keyId: string) => {
    e.preventDefault();
    if (keybinds[keyId]) {
      onKeyRemove(keyId);
    }
  };

  const handleButtonClick = (e: React.MouseEvent, keyId: string) => {
    e.preventDefault();
    if (keybinds[getModifiedKeyId(keyId)]) {
      onKeyClick(keyId);
    } else {
      setEditingButton(keyId);
    }
  };

  const handleLabelChange = (keyId: string, newLabel: string) => {
    setCustomLabels(prev => ({ ...prev, [keyId]: newLabel }));
    setEditingButton(null);
  };

  const extraButtons = Array.from({ length: 16 }, (_, i) => {
    const id = `extra-${i + 1}`;
    return {
      id,
      label: customLabels[id] || `Extra ${i + 1}`
    };
  });

  return (
    <div className="extra-buttons">
      <h3>Extra Buttons</h3>
      <div className="extra-buttons-grid">
        {extraButtons.map((button) => {
          const modifiedKeyId = getModifiedKeyId(button.id);
          const modifierClass = getModifierClass(modifiedKeyId);
          return (
            <div
              key={button.id}
              className={`extra-button ${keybinds[modifiedKeyId] ? 'key-bound' : ''} ${modifierClass}`}
              onClick={(e) => handleButtonClick(e, button.id)}
              onContextMenu={(e) => handleRightClick(e, button.id)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, button.id)}
            >
              {keybinds[modifiedKeyId] && (
                <img 
                  src={keybinds[modifiedKeyId].imageUrl} 
                  alt={keybinds[modifiedKeyId].name} 
                  className="key-icon"
                />
              )}
              {editingButton === button.id ? (
                <input
                  type="text"
                  defaultValue={button.label}
                  className="button-rename-input"
                  autoFocus
                  onBlur={(e) => handleLabelChange(button.id, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleLabelChange(button.id, e.currentTarget.value);
                    } else if (e.key === 'Escape') {
                      setEditingButton(null);
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span className="extra-button-label">{button.label}</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ExtraButtons;