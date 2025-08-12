import React, { useState } from 'react';
import { SpellData, Spell } from './types';
import ClassSection from './ClassSection';
import KeyboardLayout from './KeyboardLayout';
import MouseLayout from './MouseLayout';
import ExtraButtons from './ExtraButtons';
import ConfigModal from './ConfigModal';
import ProfileModal from './ProfileModal';
import { spellsData } from './spellsData';
import './App.css';

const App: React.FC = () => {
  const [selectedExpansion, setSelectedExpansion] = useState<string>('Classic');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [spells] = useState<SpellData>(spellsData as SpellData);
  const [keybinds, setKeybinds] = useState<{ [key: string]: Spell }>({});
  const [selectedSpell, setSelectedSpell] = useState<Spell | null>(null);
  const [shiftModifier, setShiftModifier] = useState(false);
  const [ctrlModifier, setCtrlModifier] = useState(false);
  const [altModifier, setAltModifier] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showExtraButtons, setShowExtraButtons] = useState(false);
  const [customLabels, setCustomLabels] = useState<{ [key: string]: string }>({});
  const [profiles, setProfiles] = useState<any[]>([]);
  const [currentProfile, setCurrentProfile] = useState<string>('');
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'save' | 'load'>('save');
  const [savedConfigs, setSavedConfigs] = useState<any[]>([]);

  const expansions = Object.keys(spells);
  const classes = selectedExpansion ? Object.keys(spells[selectedExpansion]).filter(c => c !== 'General') : [];
  const generalSpells = selectedExpansion ? spells[selectedExpansion].General || [] : [];
  
  // Set first class as default when expansion changes
  React.useEffect(() => {
    if (classes.length > 0 && !classes.includes(selectedClass)) {
      setSelectedClass(classes[0]);
    }
  }, [selectedExpansion, classes, selectedClass]);

  const getModifiedKeyId = (keyId: string) => {
    let modifiedKey = keyId;
    if (ctrlModifier) modifiedKey = `ctrl+${modifiedKey}`;
    if (altModifier) modifiedKey = `alt+${modifiedKey}`;
    if (shiftModifier) modifiedKey = `shift+${modifiedKey}`;
    return modifiedKey;
  };

  const handleKeyPress = React.useCallback((event: KeyboardEvent) => {
    if (!selectedSpell) return;
    
    // Prevent default behavior for certain keys
    event.preventDefault();
    
    // Map special keys to their display names
    const keyMap: { [key: string]: string } = {
      ' ': 'space',
      'ArrowUp': 'up',
      'ArrowDown': 'down',
      'ArrowLeft': 'left',
      'ArrowRight': 'right',
      'Enter': 'enter',
      'Escape': 'esc',
      'Tab': 'tab',
      'Backspace': 'backspace',
      'Delete': 'delete',
      'Insert': 'insert',
      'Home': 'home',
      'End': 'end',
      'PageUp': 'pageup',
      'PageDown': 'pagedown'
    };
    
    let keyId = keyMap[event.key] || event.key.toLowerCase();
    
    // Handle function keys
    if (event.key.startsWith('F') && event.key.length <= 3) {
      keyId = event.key.toLowerCase();
    }
    
    // Handle number pad
    if (event.code.startsWith('Numpad')) {
      keyId = `num${event.code.slice(6).toLowerCase()}`;
    }
    
    // Build the modified key ID
    const modifiedKeyId = getModifiedKeyId(keyId);
    
    // Bind the spell to the key
    setKeybinds(prev => ({ ...prev, [modifiedKeyId]: selectedSpell }));
    setSelectedSpell(null);
  }, [selectedSpell, getModifiedKeyId]);

  // Auto-load profile data when switching class/expansion
  React.useEffect(() => {
    if (currentProfile && selectedClass) {
      const profile = profiles.find(p => p.name === currentProfile);
      if (profile?.data[selectedExpansion]?.[selectedClass]) {
        const classData = profile.data[selectedExpansion][selectedClass];
        setKeybinds(classData.keybinds || {});
        setCustomLabels(classData.customLabels || {});
      } else {
        setKeybinds({});
        setCustomLabels({});
      }
    }
  }, [selectedExpansion, selectedClass, currentProfile, profiles]);

  // Add keyboard event listeners
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Toggle modifier states when keys are pressed
      if (event.key === 'Shift') {
        setShiftModifier(true);
        return;
      }
      if (event.key === 'Control') {
        setCtrlModifier(true);
        return;
      }
      if (event.key === 'Alt') {
        setAltModifier(true);
        return;
      }
      
      // Handle spell binding
      handleKeyPress(event);
    };
    
    const handleKeyUp = (event: KeyboardEvent) => {
      // Release modifier states when keys are released
      if (event.key === 'Shift') {
        setShiftModifier(false);
      }
      if (event.key === 'Control') {
        setCtrlModifier(false);
      }
      if (event.key === 'Alt') {
        setAltModifier(false);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyPress]);

  // Filter spells based on search term
  const filteredSpells = selectedClass && spells[selectedExpansion][selectedClass] 
    ? spells[selectedExpansion][selectedClass].filter(spell => 
        spell.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const handleSpellClick = (spell: Spell) => {
    setSelectedSpell(spell);
  };

  const handleKeyClick = (keyId: string) => {
    if (selectedSpell) {
      const modifiedKeyId = getModifiedKeyId(keyId);
      setKeybinds(prev => ({ ...prev, [modifiedKeyId]: selectedSpell }));
      setSelectedSpell(null);
    }
  };

  const handleKeyDrop = (keyId: string, spell: Spell) => {
    const modifiedKeyId = getModifiedKeyId(keyId);
    setKeybinds(prev => ({ ...prev, [modifiedKeyId]: spell }));
  };

  const handleKeyRemove = (keyId: string) => {
    const modifiedKeyId = getModifiedKeyId(keyId);
    setKeybinds(prev => {
      const newKeybinds = { ...prev };
      delete newKeybinds[modifiedKeyId];
      return newKeybinds;
    });
  };

  const clearAllKeybinds = () => {
    setKeybinds({});
  };

  const saveConfig = (name: string, description: string, download?: boolean) => {
    const config = { name, description, keybinds, expansion: selectedExpansion, customLabels };
    setSavedConfigs(prev => [...prev, config]);
    localStorage.setItem('wowKeybinds', JSON.stringify([...savedConfigs, config]));
    
    if (download) {
      const dataStr = JSON.stringify(config, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${name.replace(/[^a-z0-9]/gi, '_')}_keybinds.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
    
    setModalOpen(false);
  };

  const loadConfig = (config: any) => {
    setKeybinds(config.keybinds);
    setSelectedExpansion(config.expansion);
    if (config.customLabels) {
      setCustomLabels(config.customLabels);
    }
    setModalOpen(false);
  };

  const importConfig = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const config = JSON.parse(e.target?.result as string);
        loadConfig(config);
      } catch (error) {
        alert('Invalid configuration file');
      }
    };
    reader.readAsText(file);
  };

  const saveProfile = (name: string, description: string) => {
    const profileData = {
      [selectedExpansion]: {
        [selectedClass]: {
          keybinds,
          customLabels
        }
      }
    };
    const existingProfile = profiles.find(p => p.name === name);
    if (existingProfile) {
      existingProfile.data = { ...existingProfile.data, ...profileData };
      existingProfile.description = description;
      setProfiles([...profiles]);
    } else {
      setProfiles(prev => [...prev, { name, description, data: profileData }]);
    }
    setCurrentProfile(name);
    localStorage.setItem('wowProfiles', JSON.stringify(profiles));
  };

  const loadProfile = (profileName: string) => {
    const profile = profiles.find(p => p.name === profileName);
    if (profile?.data[selectedExpansion]?.[selectedClass]) {
      const classData = profile.data[selectedExpansion][selectedClass];
      setKeybinds(classData.keybinds || {});
      setCustomLabels(classData.customLabels || {});
    }
    setCurrentProfile(profileName);
  };

  const generateShareString = () => {
    const config = { name: 'Shared Config', keybinds, expansion: selectedExpansion, customLabels };
    const jsonString = JSON.stringify(config);
    return btoa(jsonString);
  };

  const importShareString = (shareString: string) => {
    try {
      const jsonString = atob(shareString);
      const config = JSON.parse(jsonString);
      loadConfig(config);
    } catch (error) {
      alert('Invalid share string');
    }
  };

  return (
    <div className="app">
      <div className="main-container">
        <div className="spells-panel">
          <div className="header">
            <h1>WoW Keybinds</h1>
          </div>
          
          <div className="selectors">
            <div className="expansion-selector">
              <label>Expansion: </label>
              <select 
                value={selectedExpansion} 
                onChange={(e) => setSelectedExpansion(e.target.value)}
              >
                {expansions.map(expansion => (
                  <option key={expansion} value={expansion}>
                    {expansion}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="class-selector">
              <label>Class: </label>
              <select 
                value={selectedClass} 
                onChange={(e) => setSelectedClass(e.target.value)}
              >
                {classes.map(className => (
                  <option key={className} value={className}>
                    {className}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="search-container">
            <input
              type="text"
              placeholder="Search spells..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="spells-container">
            {generalSpells.length > 0 && (
              <ClassSection 
                className="General"
                spells={generalSpells.filter(spell => 
                  spell.name.toLowerCase().includes(searchTerm.toLowerCase())
                )}
                onSpellClick={handleSpellClick}
                selectedSpell={selectedSpell}
              />
            )}
            {selectedClass && filteredSpells.length > 0 && (
              <ClassSection 
                className={selectedClass}
                spells={filteredSpells}
                onSpellClick={handleSpellClick}
                selectedSpell={selectedSpell}
              />
            )}
            {selectedClass && searchTerm && filteredSpells.length === 0 && generalSpells.filter(spell => 
              spell.name.toLowerCase().includes(searchTerm.toLowerCase())
            ).length === 0 && (
              <div className="no-results">No spells found matching "{searchTerm}"</div>
            )}
          </div>
        </div>

        <div className="keyboard-panel">
          <div className="input-layouts">
            <KeyboardLayout onKeyClick={handleKeyClick} onKeyDrop={handleKeyDrop} onKeyRemove={handleKeyRemove} keybinds={keybinds} getModifiedKeyId={getModifiedKeyId} />
            <div className="right-panel">
              <MouseLayout onKeyClick={handleKeyClick} onKeyDrop={handleKeyDrop} onKeyRemove={handleKeyRemove} keybinds={keybinds} getModifiedKeyId={getModifiedKeyId} />
              <div className="extra-buttons-toggle">
                <button 
                  onClick={() => setShowExtraButtons(!showExtraButtons)} 
                  className={`button-style ${showExtraButtons ? 'active' : ''}`}
                >
                  {showExtraButtons ? 'Hide' : 'Show'} Extra Buttons
                </button>
              </div>
              {showExtraButtons && (
                <ExtraButtons onKeyClick={handleKeyClick} onKeyDrop={handleKeyDrop} onKeyRemove={handleKeyRemove} keybinds={keybinds} getModifiedKeyId={getModifiedKeyId} customLabels={customLabels} setCustomLabels={setCustomLabels} />
              )}
            </div>
          </div>
          
          <div className="controls">
            <div className="controls-row">
              <div className="controls-section">
                <span className="controls-label">Profile:</span>
                <select 
                  value={currentProfile} 
                  onChange={(e) => loadProfile(e.target.value)}
                  className="profile-select"
                >
                  <option value="">Select Profile</option>
                  {profiles.map(profile => (
                    <option key={profile.name} value={profile.name}>
                      {profile.name}
                    </option>
                  ))}
                </select>
                <button 
                  onClick={() => setProfileModalOpen(true)} 
                  className="button-style"
                >
                  Save Profile
                </button>
              </div>
            </div>
            
            <div className="controls-row">
              <div className="controls-section">
                <span className="controls-label">Modifiers:</span>
                <button 
                  onClick={() => setShiftModifier(!shiftModifier)} 
                  className={`button-style ${shiftModifier ? 'active' : ''}`}
                >
                  Shift
                </button>
                <button 
                  onClick={() => setCtrlModifier(!ctrlModifier)} 
                  className={`button-style ${ctrlModifier ? 'active' : ''}`}
                >
                  Ctrl
                </button>
                <button 
                  onClick={() => setAltModifier(!altModifier)} 
                  className={`button-style ${altModifier ? 'active' : ''}`}
                >
                  Alt
                </button>
              </div>
              
              <div className="controls-section">
                <span className="controls-label">Actions:</span>
                <button onClick={clearAllKeybinds} className="button-style">Clear All</button>
                <button onClick={() => { setModalMode('save'); setModalOpen(true); }} className="button-style">Save Config</button>
                <button onClick={() => { setModalMode('load'); setModalOpen(true); }} className="button-style">Load Config</button>
              </div>
            </div>
          </div>
          
          <div className="instructions">
            <h3>Instructions & Tips</h3>
            <ul>
              <li>Click a spell, then press a key to bind it</li>
              <li>Right-click any bound key to remove the binding</li>
              <li>Drag and drop spells directly onto keys</li>
              <li>Hold modifier keys (Shift/Ctrl/Alt) to toggle them automatically</li>
              <li className="warning">Avoid Ctrl+W, Ctrl+T, Ctrl+R - these will close/refresh your browser tab</li>
              <li className="warning">Avoid Alt+F4 - this will close your browser window</li>
              <li>Color coding: Green = no modifier, Red = Shift, Orange = Ctrl, Purple = Alt</li>
            </ul>
          </div>
        </div>
      </div>

      <ConfigModal
        isOpen={modalOpen}
        mode={modalMode}
        onClose={() => setModalOpen(false)}
        onSave={saveConfig}
        onLoad={loadConfig}
        onImport={importConfig}
        onGenerateShare={generateShareString}
        onImportShare={importShareString}
        savedConfigs={savedConfigs}
      />

      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        onSave={saveProfile}
        profiles={profiles}
      />
    </div>
  );
};

export default App;