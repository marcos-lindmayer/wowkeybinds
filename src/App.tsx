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

  // Filter spells based on search term
  const filteredSpells = selectedClass && spells[selectedExpansion][selectedClass] 
    ? spells[selectedExpansion][selectedClass].filter(spell => 
        spell.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  const getModifiedKeyId = (keyId: string) => {
    let modifiedKey = keyId;
    if (ctrlModifier) modifiedKey = `ctrl+${modifiedKey}`;
    if (altModifier) modifiedKey = `alt+${modifiedKey}`;
    if (shiftModifier) modifiedKey = `shift+${modifiedKey}`;
    return modifiedKey;
  };

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

  const saveConfig = (name: string, description: string) => {
    const config = { name, description, keybinds, expansion: selectedExpansion, customLabels };
    setSavedConfigs(prev => [...prev, config]);
    localStorage.setItem('wowKeybinds', JSON.stringify([...savedConfigs, config]));
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
            <div className="profile-controls">
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
            <button onClick={clearAllKeybinds} className="button-style">Clear All Keybinds</button>
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
            <button onClick={() => { setModalMode('save'); setModalOpen(true); }} className="button-style">Save Configuration</button>
            <button onClick={() => { setModalMode('load'); setModalOpen(true); }} className="button-style">Load Configuration</button>
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