document.addEventListener('DOMContentLoaded', () => {
    const spellContainer = document.getElementById('spell-container');
    const keys = document.querySelectorAll('.key');
    const clearAllButton = document.getElementById('clear-all-keybinds');
    const shiftModifierButton = document.getElementById('shift-modifier-button');
    const expansionSelect = document.getElementById('expansion-select'); // New: Get the expansion select dropdown
    const classSelect = document.getElementById('class-select');

    let draggedSpell = null;
    let shiftActive = false;
    let allSpellsData = {}; // Stores all spells nested by expansion and class
    let currentSelectedExpansion = ''; // Track currently selected expansion

    // Function to update a key's display based on current shift state and bound spells
    function updateKeyDisplay(keyElement) {
        const baseKeyText = keyElement.dataset.originalKeyText;
        let spellImageUrlToShow = '';
        let spellNameToShow = '';
        let prefix = '';

        if (shiftActive) {
            if (keyElement.dataset.boundShiftSpellImageUrl && keyElement.dataset.boundShiftSpellName) {
                spellImageUrlToShow = keyElement.dataset.boundShiftSpellImageUrl;
                spellNameToShow = keyElement.dataset.boundShiftSpellName;
                prefix = 'Shift + ';
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
            keyElement.innerHTML = baseKeyText; // Keep key blank if no spell is bound
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

    // Toggle Shift Modifier Button Functionality
    shiftModifierButton.addEventListener('click', () => {
        shiftActive = !shiftActive;
        shiftModifierButton.classList.toggle('active-modifier-button', shiftActive);
        shiftModifierButton.textContent = shiftActive ? 'Shift Active' : 'Shift Modifier';
        keys.forEach(updateKeyDisplay);
    });

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

                let targetBoundSpellIdDataset = shiftActive ? 'boundShiftSpellId' : 'boundSpellId';
                let targetBoundSpellNameDataset = shiftActive ? 'boundShiftSpellName' : 'boundSpellName';
                let targetBoundSpellImageUrlDataset = shiftActive ? 'boundShiftSpellImageUrl' : 'boundSpellImageUrl';

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
            let targetBoundSpellIdDataset = shiftActive ? 'boundShiftSpellId' : 'boundSpellId';
            let targetBoundSpellNameDataset = shiftActive ? 'boundShiftSpellName' : 'boundSpellName';
            let targetBoundSpellImageUrlDataset = shiftActive ? 'boundShiftSpellImageUrl' : 'boundSpellImageUrl';

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
            // Check and clear normal binding
            if (key.dataset.boundSpellId) {
                const spellToReturn = document.getElementById(key.dataset.boundSpellId);
                if (spellToReturn) {
                    spellToReturn.style.display = '';
                    spellContainer.appendChild(spellToReturn);
                }
                delete key.dataset.boundSpellId;
                delete key.dataset.boundSpellName;
                delete key.dataset.boundSpellImageUrl;
            }
            // Check and clear shift binding
            if (key.dataset.boundShiftSpellId) {
                const spellToReturn = document.getElementById(key.dataset.boundShiftSpellId);
                if (spellToReturn) {
                    spellToReturn.style.display = '';
                    spellContainer.appendChild(spellToReturn);
                }
                delete key.dataset.boundShiftSpellId;
                delete key.dataset.boundShiftSpellName;
                delete key.dataset.boundShiftSpellImageUrl;
            }
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

    // Load expansions and initial class/spells when the DOM is ready
    initializeExpansionAndClassSelection();
});
