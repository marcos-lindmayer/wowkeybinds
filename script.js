document.addEventListener('DOMContentLoaded', () => {
    const spellContainer = document.getElementById('spell-container');
    const keys = document.querySelectorAll('.key');
    const clearAllButton = document.getElementById('clear-all-keybinds');
    const shiftModifierButton = document.getElementById('shift-modifier-button');
    const expansionSelect = document.getElementById('expansion-select'); // New: Get the expansion select dropdown
    const classSelect = document.getElementById('class-select');
    const spellSearch = document.getElementById('spell-search');

    let draggedSpell = null;
    let allSpellsData = {}; // Stores all spells nested by expansion and class
    let currentSelectedExpansion = ''; // Track currently selected expansion
    let keybindManager = null; // Will be initialized after KeybindManager is loaded
    let modifierSystem = null; // Will be initialized after ModifierSystem is loaded

    // Function to update a key's display based on current modifier state and bound spells
    function updateKeyDisplay(keyElement) {
        const baseKeyText = keyElement.dataset.originalKeyText;
        let spellImageUrlToShow = '';
        let spellNameToShow = '';
        let prefix = '';

        if (modifierSystem && modifierSystem.hasActiveModifiers()) {
            const modifierSuffix = modifierSystem.getModifierDatasetSuffix();
            const modifierPrefix = modifierSystem.getActiveModifierString();
            
            if (keyElement.dataset[`bound${modifierSuffix}SpellImageUrl`] && keyElement.dataset[`bound${modifierSuffix}SpellName`]) {
                spellImageUrlToShow = keyElement.dataset[`bound${modifierSuffix}SpellImageUrl`];
                spellNameToShow = keyElement.dataset[`bound${modifierSuffix}SpellName`];
                prefix = modifierPrefix;
            } else if (keyElement.dataset.boundSpellImageUrl && keyElement.dataset.boundSpellName) {
                spellImageUrlToShow = keyElement.dataset.boundSpellImageUrl;
                spellNameToShow = keyElement.dataset.boundSpellName;
                prefix = '';
            }
        } else {
            if (keyElement.dataset.boundSpellImageUrl && keyElement.dataset.boundSpellName) {
                spellImageUrlToShow = keyElement.dataset.boundSpellImageUrl;
                spellNameToShow = keyElement.dataset.boundSpellName;
            }
        }

        if (spellImageUrlToShow) {
            keyElement.innerHTML = `
                <img src="${spellImageUrlToShow}" alt="${prefix}${baseKeyText} - ${spellNameToShow}" class="key-spell-icon" onerror="this.onerror=null;this.src='https://placehold.co/30x30/4A5568/CBD5E0?text=NO+ICON';">
            `;
        } else {
            keyElement.innerHTML = baseKeyText;
        }
    }

    // Function to populate the class dropdown based on the selected expansion
    function populateClassesForExpansion(expansionName) {
        // Clear existing classes
        classSelect.innerHTML = '<option value="">-- Choose a Class --</option>';
        currentSelectedExpansion = expansionName; // Update current selected expansion

        const classesForExpansion = allSpellsData[expansionName];
        if (classesForExpansion) {
            for (const className in classesForExpansion) {
                const option = document.createElement('option');
                option.value = className;
                option.textContent = className;
                classSelect.appendChild(option);
            }
            // Automatically select the first class and populate spells
            if (Object.keys(classesForExpansion).length > 0) {
                classSelect.value = Object.keys(classesForExpansion)[0];
                populateSpellsForClass(classSelect.value);
            } else {
                spellContainer.innerHTML = `<p class="text-gray-400">No classes available for ${expansionName}.</p>`;
            }
        } else {
            spellContainer.innerHTML = '<p class="text-gray-400">No classes found for this expansion.</p>';
        }
    }

    // Function to load spells for a given class from the currently selected expansion
    function populateSpellsForClass(className) {
        spellContainer.innerHTML = ''; // Clear existing spells
        clearAllKeybinds(); // Clear keybinds when changing class/expansion

        const spellsForClass = allSpellsData[currentSelectedExpansion]?.[className];
        if (spellsForClass) {
            spellsForClass.forEach((spell, index) => {
                const spellDiv = document.createElement('div');
                spellDiv.classList.add('spell');
                spellDiv.setAttribute('draggable', 'true');
                // Unique ID including expansion and class name
                spellDiv.id = `spell-${currentSelectedExpansion.replace(/\s+/g, '-')}-${className.replace(/\s+/g, '-')}-${index}`;
                spellDiv.dataset.spellName = spell.name;
                spellDiv.dataset.spellImageUrl = spell.imageUrl;

                spellDiv.innerHTML = `
                    <img src="${spell.imageUrl}" alt="${spell.name}" class="spell-icon" onerror="this.onerror=null;this.src='https://placehold.co/30x30/ECC94B/2D3748?text=NO+ICON';">
                    <span class="spell-name">${spell.name}</span>
                `;

                spellDiv.addEventListener('dragstart', (e) => {
                    draggedSpell = e.target;
                    e.dataTransfer.setData('text/plain', draggedSpell.id);
                    e.dataTransfer.setData('text/spell-name', draggedSpell.dataset.spellName);
                    e.dataTransfer.setData('text/spell-image-url', draggedSpell.dataset.spellImageUrl);
                    e.dataTransfer.effectAllowed = 'move';
                    draggedSpell.classList.add('opacity-50');
                });

                spellDiv.addEventListener('dragend', (e) => {
                    if (draggedSpell) {
                        draggedSpell.classList.remove('opacity-50');
                        draggedSpell = null;
                    }
                });

                spellContainer.appendChild(spellDiv);
            });
        } else {
            spellContainer.innerHTML = `<p class="text-gray-400">No spells available for ${className} in ${currentSelectedExpansion}.</p>`;
        }
    }

    // Function to filter spells based on search input
    function filterSpells() {
        const searchTerm = spellSearch.value.toLowerCase();
        const spells = spellContainer.querySelectorAll('.spell');
        
        spells.forEach(spell => {
            const spellName = spell.dataset.spellName.toLowerCase();
            spell.style.display = spellName.includes(searchTerm) ? '' : 'none';
        });
    }

    // Function to initialize expansion and class dropdowns and load initial spells
    async function initializeExpansionAndClassSelection() {
        try {
            const response = await fetch('spells.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            allSpellsData = await response.json(); // Store all spell data

            // Populate the expansion dropdown
            for (const expansionName in allSpellsData) {
                const option = document.createElement('option');
                option.value = expansionName;
                option.textContent = expansionName;
                expansionSelect.appendChild(option);
            }

            // Add event listener for expansion selection change
            expansionSelect.addEventListener('change', (e) => {
                populateClassesForExpansion(e.target.value);
            });

            // Add event listener for class selection change (already exists, but ensure it's here)
            classSelect.addEventListener('change', (e) => {
                populateSpellsForClass(e.target.value);
            });

            // Add event listener for spell search
            spellSearch.addEventListener('input', filterSpells);

            // Automatically select the first expansion if available
            if (Object.keys(allSpellsData).length > 0) {
                expansionSelect.value = Object.keys(allSpellsData)[0];
                populateClassesForExpansion(expansionSelect.value); // Populate classes for the first expansion
            } else {
                expansionSelect.innerHTML = '<option value="">No expansions found</option>';
                classSelect.innerHTML = '<option value="">No classes found</option>';
                spellContainer.innerHTML = '<p class="text-red-500">No expansion or class data found in spells.json.</p>';
            }

        } catch (error) {
            console.error("Could not load expansion/class spells data:", error);
            expansionSelect.innerHTML = '<option value="">Error loading expansions</option>';
            classSelect.innerHTML = '<option value="">Error loading classes</option>';
            spellContainer.innerHTML = '<p class="text-red-500">Failed to load spells. Please check the spells.json file.</p>';
        }
    }

    // Legacy shift button will be replaced by modifier system

    // Handle key drop (target for spells)
    keys.forEach(key => {
        key.addEventListener('dragover', (e) => {
            e.preventDefault();
            key.classList.add('drag-over');
        });

        key.addEventListener('dragleave', (e) => {
            key.classList.remove('drag-over');
        });

        key.addEventListener('drop', (e) => {
            e.preventDefault();
            key.classList.remove('drag-over');

            if (draggedSpell) {
                const spellId = e.dataTransfer.getData('text/plain');
                const spellName = e.dataTransfer.getData('text/spell-name');
                const spellImageUrl = e.dataTransfer.getData('text/spell-image-url');
                const droppedSpell = document.getElementById(spellId);

                let modifierSuffix = modifierSystem.hasActiveModifiers() ? modifierSystem.getModifierDatasetSuffix() : '';
                let targetBoundSpellIdDataset = `bound${modifierSuffix}SpellId`;
                let targetBoundSpellNameDataset = `bound${modifierSuffix}SpellName`;
                let targetBoundSpellImageUrlDataset = `bound${modifierSuffix}SpellImageUrl`;

                if (key.dataset[targetBoundSpellIdDataset]) {
                    const currentSpellIdOnKey = key.dataset[targetBoundSpellIdDataset];
                    const currentSpellOnKey = document.getElementById(currentSpellIdOnKey);
                    if (currentSpellOnKey) {
                        spellContainer.appendChild(currentSpellOnKey);
                        currentSpellOnKey.style.display = '';
                    }
                }

                key.dataset[targetBoundSpellIdDataset] = spellId;
                key.dataset[targetBoundSpellNameDataset] = spellName;
                key.dataset[targetBoundSpellImageUrlDataset] = spellImageUrl;

                updateKeyDisplay(key);
                droppedSpell.style.display = 'none';
                draggedSpell = null;
            }
        });

        // Add a double-click listener to remove a spell from a key
        key.addEventListener('dblclick', () => {
            let modifierSuffix = modifierSystem.hasActiveModifiers() ? modifierSystem.getModifierDatasetSuffix() : '';
            let targetBoundSpellIdDataset = `bound${modifierSuffix}SpellId`;
            let targetBoundSpellNameDataset = `bound${modifierSuffix}SpellName`;
            let targetBoundSpellImageUrlDataset = `bound${modifierSuffix}SpellImageUrl`;

            if (key.dataset[targetBoundSpellIdDataset]) {
                const boundSpellId = key.dataset[targetBoundSpellIdDataset];
                const spellToReturn = document.getElementById(boundSpellId);

                if (spellToReturn) {
                    spellToReturn.style.display = '';
                    spellContainer.appendChild(spellToReturn);
                }

                delete key.dataset[targetBoundSpellIdDataset];
                delete key.dataset[targetBoundSpellNameDataset];
                delete key.dataset[targetBoundSpellImageUrlDataset];

                updateKeyDisplay(key);
            }
        });
    });

    // Clear All Keybinds Button Functionality
    function clearAllKeybinds() {
        keys.forEach(key => {
            // Clear all possible modifier combinations
            const modifierCombinations = ['', 'Shift', 'Ctrl', 'Alt', 'CtrlShift', 'CtrlAlt', 'AltShift', 'CtrlAltShift'];
            
            modifierCombinations.forEach(modifier => {
                const spellIdKey = `bound${modifier}SpellId`;
                const spellNameKey = `bound${modifier}SpellName`;
                const spellImageKey = `bound${modifier}SpellImageUrl`;
                
                if (key.dataset[spellIdKey]) {
                    const spellToReturn = document.getElementById(key.dataset[spellIdKey]);
                    if (spellToReturn) {
                        spellToReturn.style.display = '';
                        spellContainer.appendChild(spellToReturn);
                    }
                    delete key.dataset[spellIdKey];
                    delete key.dataset[spellNameKey];
                    delete key.dataset[spellImageKey];
                }
            });
            
            updateKeyDisplay(key);
        });
    }
    clearAllButton.addEventListener('click', clearAllKeybinds);

    // Initialize original key text for all keys and set initial display
    keys.forEach(key => {
        if (!key.dataset.originalKeyText) {
            key.dataset.originalKeyText = key.textContent.trim();
        }
        updateKeyDisplay(key);
    });

    // Initialize systems
    keybindManager = new KeybindManager();
    modifierSystem = new ModifierSystem();
    modifierSystem.initialize();
    
    // Set up modifier change callback
    modifierSystem.onModifierChange = () => {
        keys.forEach(updateKeyDisplay);
    };
    
    // Make updateKeyDisplay globally available for keybind manager
    window.updateKeyDisplay = updateKeyDisplay;
    
    // Initialize save/load functionality
    initializeSaveLoadSystem();
    
    // Load expansions and initial class/spells when the DOM is ready
    initializeExpansionAndClassSelection();
    
    // Save/Load System Functions
    function initializeSaveLoadSystem() {
        const saveButton = document.getElementById('save-config-button');
        const loadButton = document.getElementById('load-config-button');
        const modal = document.getElementById('config-modal');
        const closeModal = document.getElementById('close-modal');
        const saveForm = document.getElementById('save-form');
        const loadForm = document.getElementById('load-form');
        const modalTitle = document.getElementById('modal-title');
        
        // Save configuration button
        saveButton.addEventListener('click', () => {
            modalTitle.textContent = 'Save Configuration';
            saveForm.classList.remove('hidden');
            loadForm.classList.add('hidden');
            modal.classList.remove('hidden');
            document.getElementById('config-name').focus();
        });
        
        // Load configuration button
        loadButton.addEventListener('click', () => {
            modalTitle.textContent = 'Load Configuration';
            loadForm.classList.remove('hidden');
            saveForm.classList.add('hidden');
            modal.classList.remove('hidden');
            populateConfigList();
        });
        
        // Close modal
        closeModal.addEventListener('click', closeConfigModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeConfigModal();
        });
        
        // Save form handlers
        document.getElementById('save-confirm').addEventListener('click', handleSaveConfig);
        document.getElementById('save-cancel').addEventListener('click', closeConfigModal);
        document.getElementById('load-cancel').addEventListener('click', closeConfigModal);
        
        // Import file handler
        document.getElementById('import-config').addEventListener('click', () => {
            document.getElementById('import-file').click();
        });
        
        document.getElementById('import-file').addEventListener('change', handleImportConfig);
        
        // Enter key to save
        document.getElementById('config-name').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSaveConfig();
        });
    }
    
    function closeConfigModal() {
        const modal = document.getElementById('config-modal');
        modal.classList.add('hidden');
        
        // Clear form inputs
        document.getElementById('config-name').value = '';
        document.getElementById('config-description').value = '';
    }
    
    function handleSaveConfig() {
        const name = document.getElementById('config-name').value.trim();
        const description = document.getElementById('config-description').value.trim();
        
        if (!name) {
            alert('Please enter a configuration name.');
            return;
        }
        
        const expansion = document.getElementById('expansion-select').value;
        const className = document.getElementById('class-select').value;
        
        if (!expansion || !className) {
            alert('Please select an expansion and class before saving.');
            return;
        }
        
        try {
            keybindManager.saveConfiguration(name, description);
            alert(`Configuration "${name}" saved successfully!`);
            closeConfigModal();
        } catch (error) {
            alert('Error saving configuration: ' + error.message);
        }
    }
    
    function populateConfigList() {
        const configList = document.getElementById('config-list');
        const savedConfigs = keybindManager.getSavedConfigurations();
        
        configList.innerHTML = '';
        
        if (Object.keys(savedConfigs).length === 0) {
            configList.innerHTML = '<div class="config-item"><div class="config-info">No saved configurations found.</div></div>';
            return;
        }
        
        for (const [name, config] of Object.entries(savedConfigs)) {
            const configItem = document.createElement('div');
            configItem.className = 'config-item';
            
            const keybindCount = Object.keys(config.keybinds || {}).length;
            const timestamp = new Date(config.timestamp).toLocaleDateString();
            
            configItem.innerHTML = `
                <div class="config-info">
                    <div class="config-name">${name}</div>
                    <div class="config-details">
                        ${config.expansion} - ${config.class}<br>
                        ${keybindCount} keybinds • Saved ${timestamp}<br>
                        ${config.description || 'No description'}
                    </div>
                </div>
                <div class="config-actions">
                    <button class="config-button" onclick="loadConfig('${name}')">Load</button>
                    <button class="config-button" onclick="exportConfig('${name}')">Export</button>
                    <button class="config-button delete" onclick="deleteConfig('${name}')">Delete</button>
                </div>
            `;
            
            configList.appendChild(configItem);
        }
    }
    
    function handleImportConfig(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        keybindManager.importConfiguration(file)
            .then((configName) => {
                alert(`Configuration "${configName}" imported successfully!`);
                populateConfigList();
                event.target.value = ''; // Clear file input
            })
            .catch((error) => {
                alert('Error importing configuration: ' + error.message);
                event.target.value = ''; // Clear file input
            });
    }
    
    // Global functions for config list buttons
    window.loadConfig = function(name) {
        if (keybindManager.loadConfiguration(name)) {
            closeConfigModal();
            setTimeout(() => {
                alert(`Configuration "${name}" loaded successfully!`);
            }, 1000);
        } else {
            alert('Error loading configuration.');
        }
    };
    
    window.exportConfig = function(name) {
        if (keybindManager.exportConfiguration(name)) {
            // Export successful - file download initiated
        } else {
            alert('Error exporting configuration.');
        }
    };
    
    window.deleteConfig = function(name) {
        if (confirm(`Are you sure you want to delete the configuration "${name}"?`)) {
            keybindManager.deleteConfiguration(name);
            populateConfigList();
            alert(`Configuration "${name}" deleted.`);
        }
    };
});

// This ICON_MAP is no longer needed as spells.json now contains the imageUrls directly