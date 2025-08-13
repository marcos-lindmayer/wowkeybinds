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
    const hasShift = keyId.includes('shift+');
    const hasCtrl = keyId.includes('ctrl+');
    const hasAlt = keyId.includes('alt+');
    
    if (hasShift && hasCtrl && hasAlt) return 'shift-ctrl-alt-modifier';
    if (hasShift && hasCtrl) return 'shift-ctrl-modifier';
    if (hasShift && hasAlt) return 'shift-alt-modifier';
    if (hasCtrl && hasAlt) return 'ctrl-alt-modifier';
    if (hasShift) return 'shift-modifier';
    if (hasCtrl) return 'ctrl-modifier';
    if (hasAlt) return 'alt-modifier';
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
    const modifiedKeyId = getModifiedKeyId(keyId);
    if (keybinds[modifiedKeyId]) {
      onKeyRemove(keyId);
    }
  };

  const handleDragStart = (e: React.DragEvent, keyId: string) => {
    const modifiedKeyId = getModifiedKeyId(keyId);
    if (keybinds[modifiedKeyId]) {
      e.dataTransfer.setData('application/json', JSON.stringify(keybinds[modifiedKeyId]));
      e.dataTransfer.setData('text/plain', modifiedKeyId);
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
          const baseKeyId = button.id;
          const modifierClass = getModifierClass(modifiedKeyId);
          const hasModifiedBind = !!keybinds[modifiedKeyId];
          const hasBaseBind = !!keybinds[baseKeyId];
          const showFallback = !hasModifiedBind && hasBaseBind && modifiedKeyId !== baseKeyId;
          
          return (
            <div
              key={button.id}
              className={`extra-button ${hasModifiedBind ? 'key-bound' : ''} ${modifierClass}`}
              onClick={(e) => handleButtonClick(e, button.id)}
              onContextMenu={(e) => handleRightClick(e, button.id)}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, button.id)}
              draggable={hasModifiedBind}
              onDragStart={(e) => handleDragStart(e, button.id)}
            >
              {hasModifiedBind && (
                <img 
                  src={keybinds[modifiedKeyId].imageUrl} 
                  alt={keybinds[modifiedKeyId].name} 
                  className="key-icon"
                />
              )}
              {showFallback && (
                <img 
                  src={keybinds[baseKeyId].imageUrl} 
                  alt={keybinds[baseKeyId].name} 
                  className="key-icon fallback"
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