import React from 'react';

interface KeyObject {
  id: string;
  label: string;
  ml?: boolean;
  wide?: boolean;
  extraWide?: boolean;
}

interface KeyboardLayoutProps {
  onKeyClick: (keyId: string) => void;
  onKeyDrop: (keyId: string, spell: any) => void;
  onKeyRemove: (keyId: string) => void;
  keybinds: { [key: string]: any };
  getModifiedKeyId: (keyId: string) => string;
}

const KeyboardLayout: React.FC<KeyboardLayoutProps> = ({ onKeyClick, onKeyDrop, onKeyRemove, keybinds, getModifiedKeyId }) => {
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
  const keys: KeyObject[][] = [
    // Row 1: F-keys
    [
      { id: 'esc', label: 'Esc' },
      { id: 'f1', label: 'F1', ml: true },
      { id: 'f2', label: 'F2' },
      { id: 'f3', label: 'F3' },
      { id: 'f4', label: 'F4' },
      { id: 'f5', label: 'F5', ml: true },
      { id: 'f6', label: 'F6' },
      { id: 'f7', label: 'F7' },
      { id: 'f8', label: 'F8' },
      { id: 'f9', label: 'F9', ml: true },
      { id: 'f10', label: 'F10' },
      { id: 'f11', label: 'F11' },
      { id: 'f12', label: 'F12' }
    ],
    // Row 2: Numbers
    [
      { id: 'tilde', label: '~' },
      { id: '1', label: '1' },
      { id: '2', label: '2' },
      { id: '3', label: '3' },
      { id: '4', label: '4' },
      { id: '5', label: '5' },
      { id: '6', label: '6' },
      { id: '7', label: '7' },
      { id: '8', label: '8' },
      { id: '9', label: '9' },
      { id: '0', label: '0' },
      { id: 'minus', label: '-' },
      { id: 'equals', label: '=' },
      { id: 'backspace', label: 'Backspace', wide: true }
    ],
    // Row 3: QWERTY
    [
      { id: 'tab', label: 'Tab', wide: true },
      { id: 'q', label: 'Q' },
      { id: 'w', label: 'W' },
      { id: 'e', label: 'E' },
      { id: 'r', label: 'R' },
      { id: 't', label: 'T' },
      { id: 'y', label: 'Y' },
      { id: 'u', label: 'U' },
      { id: 'i', label: 'I' },
      { id: 'o', label: 'O' },
      { id: 'p', label: 'P' },
      { id: 'open-bracket', label: '[' },
      { id: 'close-bracket', label: ']' },
      { id: 'backslash', label: '\\' }
    ],
    // Row 4: ASDF
    [
      { id: 'caps', label: 'Caps Lock', wide: true },
      { id: 'a', label: 'A' },
      { id: 's', label: 'S' },
      { id: 'd', label: 'D' },
      { id: 'f', label: 'F' },
      { id: 'g', label: 'G' },
      { id: 'h', label: 'H' },
      { id: 'j', label: 'J' },
      { id: 'k', label: 'K' },
      { id: 'l', label: 'L' },
      { id: 'semicolon', label: ';' },
      { id: 'apostrophe', label: "'" },
      { id: 'enter', label: 'Enter', wide: true }
    ],
    // Row 5: ZXCV
    [
      { id: 'shift-left', label: 'Shift', wide: true },
      { id: 'z', label: 'Z' },
      { id: 'x', label: 'X' },
      { id: 'c', label: 'C' },
      { id: 'v', label: 'V' },
      { id: 'b', label: 'B' },
      { id: 'n', label: 'N' },
      { id: 'm', label: 'M' },
      { id: 'comma', label: ',' },
      { id: 'period', label: '.' },
      { id: 'slash', label: '/' },
      { id: 'shift-right', label: 'Shift', wide: true }
    ],
    // Row 6: Bottom row
    [
      { id: 'ctrl-left', label: 'Ctrl' },
      { id: 'win', label: 'Win' },
      { id: 'alt-left', label: 'Alt' },
      { id: 'space', label: 'Space', extraWide: true },
      { id: 'alt-right', label: 'Alt' },
      { id: 'fn', label: 'Fn' },
      { id: 'menu', label: 'Menu' },
      { id: 'ctrl-right', label: 'Ctrl' }
    ]
  ];

  return (
    <div className="keyboard-layout">
      <h2>Keyboard Layout</h2>
      <div className="keyboard-container">
        {keys.map((row, rowIndex) => (
          <div key={rowIndex} className="keyboard-row">
            {row.map((key) => {
              const modifiedKeyId = getModifiedKeyId(key.id);
              const modifierClass = getModifierClass(modifiedKeyId);
              return (
                <div
                  key={key.id}
                  className={`key ${key.wide ? 'key-wide' : ''} ${key.extraWide ? 'key-extra-wide' : ''} ${key.ml ? 'key-ml' : ''} ${keybinds[modifiedKeyId] ? 'key-bound' : ''} ${modifierClass}`}
                  onClick={() => onKeyClick(key.id)}
                  onContextMenu={(e) => handleRightClick(e, key.id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, key.id)}
                >
                  {keybinds[modifiedKeyId] && (
                    <img 
                      src={keybinds[modifiedKeyId].imageUrl} 
                      alt={keybinds[modifiedKeyId].name} 
                      className="key-icon"
                    />
                  )}
                  <span className="key-label">{key.label}</span>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default KeyboardLayout;