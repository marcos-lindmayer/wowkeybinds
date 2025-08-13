import React from 'react';

interface MouseLayoutProps {
  onKeyClick: (keyId: string) => void;
  onKeyDrop: (keyId: string, spell: any) => void;
  onKeyRemove: (keyId: string) => void;
  keybinds: { [key: string]: any };
  getModifiedKeyId: (keyId: string) => string;
}

const MouseLayout: React.FC<MouseLayoutProps> = ({ onKeyClick, onKeyDrop, onKeyRemove, keybinds, getModifiedKeyId }) => {
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

  const mouseButtons = [
    { id: 'mouse-left', label: 'Left Click' },
    { id: 'mouse-right', label: 'Right Click' },
    { id: 'mouse-middle', label: 'Middle Click' },
    { id: 'mouse-scroll-up', label: 'Scroll Up' },
    { id: 'mouse-scroll-down', label: 'Scroll Down' }
  ];

  return (
    <div className="mouse-layout">
      <h2>Mouse Layout</h2>
      <div className="mouse-container">
        <div className="mouse-visual">
          {mouseButtons.map((button) => {
            const modifiedKeyId = getModifiedKeyId(button.id);
            const baseKeyId = button.id;
            const modifierClass = getModifierClass(modifiedKeyId);
            const hasModifiedBind = !!keybinds[modifiedKeyId];
            const hasBaseBind = !!keybinds[baseKeyId];
            const showFallback = !hasModifiedBind && hasBaseBind && modifiedKeyId !== baseKeyId;
            
            return (
              <div
                key={button.id}
                className={`mouse-button ${button.id} ${hasModifiedBind ? 'key-bound' : ''} ${modifierClass}`}
                onClick={() => onKeyClick(button.id)}
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
                <span className="mouse-label">{button.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MouseLayout;