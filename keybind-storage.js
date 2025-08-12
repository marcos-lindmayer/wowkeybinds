// Keybind Storage and Management System
class KeybindManager {
    constructor() {
        this.storageKey = 'wow-keybinds';
        this.currentConfig = null;
    }

    // Save current keybind configuration
    saveConfiguration(name, description = '') {
        const keys = document.querySelectorAll('.key');
        const config = {
            name: name,
            description: description,
            expansion: document.getElementById('expansion-select').value,
            class: document.getElementById('class-select').value,
            timestamp: new Date().toISOString(),
            keybinds: {}
        };

        keys.forEach(key => {
            const keyId = key.id;
            const keybindData = {};
            
            // Save all modifier combinations
            const modifierCombinations = {
                'normal': '',
                'shift': 'Shift',
                'ctrl': 'Ctrl',
                'alt': 'Alt',
                'ctrlShift': 'CtrlShift',
                'ctrlAlt': 'CtrlAlt',
                'altShift': 'AltShift',
                'ctrlAltShift': 'CtrlAltShift'
            };
            
            for (const [bindingName, modifier] of Object.entries(modifierCombinations)) {
                const spellIdKey = `bound${modifier}SpellId`;
                const spellNameKey = `bound${modifier}SpellName`;
                const spellImageKey = `bound${modifier}SpellImageUrl`;
                
                if (key.dataset[spellIdKey]) {
                    keybindData[bindingName] = {
                        spellId: key.dataset[spellIdKey],
                        spellName: key.dataset[spellNameKey],
                        spellImageUrl: key.dataset[spellImageKey]
                    };
                }
            }
            
            if (Object.keys(keybindData).length > 0) {
                config.keybinds[keyId] = keybindData;
            }
        });

        // Get existing configurations
        const savedConfigs = this.getSavedConfigurations();
        savedConfigs[name] = config;
        
        // Save to localStorage
        localStorage.setItem(this.storageKey, JSON.stringify(savedConfigs));
        this.currentConfig = name;
        
        return true;
    }

    // Load keybind configuration
    loadConfiguration(name) {
        const savedConfigs = this.getSavedConfigurations();
        const config = savedConfigs[name];
        
        if (!config) return false;

        // Clear current keybinds
        this.clearAllKeybinds();
        
        // Set expansion and class
        const expansionSelect = document.getElementById('expansion-select');
        const classSelect = document.getElementById('class-select');
        
        if (config.expansion && expansionSelect.value !== config.expansion) {
            expansionSelect.value = config.expansion;
            expansionSelect.dispatchEvent(new Event('change'));
        }
        
        setTimeout(() => {
            if (config.class && classSelect.value !== config.class) {
                classSelect.value = config.class;
                classSelect.dispatchEvent(new Event('change'));
            }
            
            // Restore keybinds after a short delay to ensure spells are loaded
            setTimeout(() => {
                this.restoreKeybinds(config.keybinds);
                this.currentConfig = name;
            }, 500);
        }, 300);
        
        return true;
    }

    // Restore keybinds from configuration
    restoreKeybinds(keybinds) {
        for (const keyId in keybinds) {
            const key = document.getElementById(keyId);
            if (!key) continue;
            
            const keybindData = keybinds[keyId];
            
            // Restore all modifier combinations
            const modifierCombinations = {
                'normal': '',
                'shift': 'Shift',
                'ctrl': 'Ctrl',
                'alt': 'Alt',
                'ctrlShift': 'CtrlShift',
                'ctrlAlt': 'CtrlAlt',
                'altShift': 'AltShift',
                'ctrlAltShift': 'CtrlAltShift'
            };
            
            for (const [bindingName, modifier] of Object.entries(modifierCombinations)) {
                if (keybindData[bindingName]) {
                    const spell = document.getElementById(keybindData[bindingName].spellId);
                    if (spell) {
                        key.dataset[`bound${modifier}SpellId`] = keybindData[bindingName].spellId;
                        key.dataset[`bound${modifier}SpellName`] = keybindData[bindingName].spellName;
                        key.dataset[`bound${modifier}SpellImageUrl`] = keybindData[bindingName].spellImageUrl;
                        spell.style.display = 'none';
                    }
                }
            }
            
            // Update key display
            if (window.updateKeyDisplay) {
                window.updateKeyDisplay(key);
            }
        }
    }

    // Get all saved configurations
    getSavedConfigurations() {
        const saved = localStorage.getItem(this.storageKey);
        return saved ? JSON.parse(saved) : {};
    }

    // Delete a configuration
    deleteConfiguration(name) {
        const savedConfigs = this.getSavedConfigurations();
        delete savedConfigs[name];
        localStorage.setItem(this.storageKey, JSON.stringify(savedConfigs));
        
        if (this.currentConfig === name) {
            this.currentConfig = null;
        }
        
        return true;
    }

    // Clear all keybinds (helper method)
    clearAllKeybinds() {
        const keys = document.querySelectorAll('.key');
        const spellContainer = document.getElementById('spell-container');
        
        keys.forEach(key => {
            // Clear all possible modifier combinations
            const modifierCombinations = ['', 'Shift', 'Ctrl', 'Alt', 'CtrlShift', 'CtrlAlt', 'AltShift', 'CtrlAltShift'];
            
            modifierCombinations.forEach(modifier => {
                const spellIdKey = `bound${modifier}SpellId`;
                const spellNameKey = `bound${modifier}SpellName`;
                const spellImageKey = `bound${modifier}SpellImageUrl`;
                
                if (key.dataset[spellIdKey]) {
                    const spell = document.getElementById(key.dataset[spellIdKey]);
                    if (spell) {
                        spell.style.display = '';
                        spellContainer.appendChild(spell);
                    }
                    delete key.dataset[spellIdKey];
                    delete key.dataset[spellNameKey];
                    delete key.dataset[spellImageKey];
                }
            });
            
            if (window.updateKeyDisplay) {
                window.updateKeyDisplay(key);
            }
        });
    }

    // Export configuration as JSON
    exportConfiguration(name) {
        const savedConfigs = this.getSavedConfigurations();
        const config = savedConfigs[name];
        
        if (!config) return null;
        
        const dataStr = JSON.stringify(config, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `${name.replace(/[^a-z0-9]/gi, '_')}_keybinds.json`;
        link.click();
        
        return true;
    }

    // Import configuration from JSON file
    importConfiguration(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const config = JSON.parse(e.target.result);
                    
                    // Validate configuration structure
                    if (!config.name || !config.keybinds) {
                        reject(new Error('Invalid configuration file'));
                        return;
                    }
                    
                    // Save imported configuration
                    const savedConfigs = this.getSavedConfigurations();
                    savedConfigs[config.name] = config;
                    localStorage.setItem(this.storageKey, JSON.stringify(savedConfigs));
                    
                    resolve(config.name);
                } catch (error) {
                    reject(error);
                }
            };
            reader.readAsText(file);
        });
    }
}

// Export for use in main script
window.KeybindManager = KeybindManager;