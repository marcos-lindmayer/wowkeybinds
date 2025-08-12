import React from 'react';

interface MouseLayoutProps {
  onKeyClick: (keyId: string) => void;
  onKeyDrop: (keyId: string, spell: any) => void;
  onKeyRemove: (keyId: string) => void;
  keybinds: { [key: string]: any };
  getModifiedKeyId: (keyId: string) => string;
}

const MouseLayout: React.FC<MouseLayoutProps> = ({ onKeyClick, onKeyDrop, onKeyRemove, keybinds, getModifiedKeyId }) => {
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
            return (
              <div
                key={button.id}
                className={`mouse-button ${button.id} ${keybinds[modifiedKeyId] ? 'key-bound' : ''}`}
                onClick={() => onKeyClick(button.id)}
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