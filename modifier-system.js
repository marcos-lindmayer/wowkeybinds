// Enhanced Modifier Key System
class ModifierSystem {
    constructor() {
        this.activeModifiers = new Set();
        this.supportedModifiers = ['shift', 'ctrl', 'alt'];
        this.modifierButtons = {};
        this.onModifierChange = null;
    }

    initialize() {
        this.createModifierButtons();
        this.setupEventListeners();
    }

    createModifierButtons() {
        const buttonContainer = document.querySelector('.text-center.mt-6');
        
        // Remove old shift button
        const oldShiftButton = document.getElementById('shift-modifier-button');
        if (oldShiftButton) {
            oldShiftButton.remove();
        }

        // Create new modifier buttons
        this.supportedModifiers.forEach(modifier => {
            const button = document.createElement('button');
            button.id = `${modifier}-modifier-button`;
            button.className = 'button-style modifier-button';
            button.textContent = modifier.charAt(0).toUpperCase() + modifier.slice(1);
            button.dataset.modifier = modifier;
            
            button.addEventListener('click', () => this.toggleModifier(modifier));
            
            // Insert before save button
            const saveButton = document.getElementById('save-config-button');
            buttonContainer.insertBefore(button, saveButton);
            
            this.modifierButtons[modifier] = button;
        });
    }

    setupEventListeners() {
        // Keyboard shortcuts for modifiers
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            
            switch(e.key) {
                case 'Shift':
                    if (!this.activeModifiers.has('shift')) {
                        this.toggleModifier('shift');
                    }
                    break;
                case 'Control':
                    if (!this.activeModifiers.has('ctrl')) {
                        this.toggleModifier('ctrl');
                    }
                    break;
                case 'Alt':
                    if (!this.activeModifiers.has('alt')) {
                        this.toggleModifier('alt');
                    }
                    break;
            }
        });

        document.addEventListener('keyup', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            
            switch(e.key) {
                case 'Shift':
                    if (this.activeModifiers.has('shift')) {
                        this.toggleModifier('shift');
                    }
                    break;
                case 'Control':
                    if (this.activeModifiers.has('ctrl')) {
                        this.toggleModifier('ctrl');
                    }
                    break;
                case 'Alt':
                    if (this.activeModifiers.has('alt')) {
                        this.toggleModifier('alt');
                    }
                    break;
            }
        });
    }

    toggleModifier(modifier) {
        if (this.activeModifiers.has(modifier)) {
            this.activeModifiers.delete(modifier);
            this.modifierButtons[modifier].classList.remove('active-modifier-button');
            this.modifierButtons[modifier].textContent = modifier.charAt(0).toUpperCase() + modifier.slice(1);
        } else {
            this.activeModifiers.add(modifier);
            this.modifierButtons[modifier].classList.add('active-modifier-button');
            this.modifierButtons[modifier].textContent = modifier.charAt(0).toUpperCase() + modifier.slice(1) + ' Active';
        }

        // Notify of modifier change
        if (this.onModifierChange) {
            this.onModifierChange(this.getActiveModifierString());
        }
    }

    getActiveModifierString() {
        if (this.activeModifiers.size === 0) return '';
        
        const modifierOrder = ['ctrl', 'alt', 'shift'];
        const activeInOrder = modifierOrder.filter(mod => this.activeModifiers.has(mod));
        
        return activeInOrder.map(mod => mod.charAt(0).toUpperCase() + mod.slice(1)).join(' + ') + ' + ';
    }

    getModifierDatasetSuffix() {
        if (this.activeModifiers.size === 0) return '';
        
        const modifierOrder = ['ctrl', 'alt', 'shift'];
        const activeInOrder = modifierOrder.filter(mod => this.activeModifiers.has(mod));
        
        return activeInOrder.map(mod => mod.charAt(0).toUpperCase() + mod.slice(1)).join('');
    }

    hasActiveModifiers() {
        return this.activeModifiers.size > 0;
    }

    clearAllModifiers() {
        this.activeModifiers.clear();
        Object.values(this.modifierButtons).forEach(button => {
            button.classList.remove('active-modifier-button');
            const modifier = button.dataset.modifier;
            button.textContent = modifier.charAt(0).toUpperCase() + modifier.slice(1);
        });
        
        if (this.onModifierChange) {
            this.onModifierChange('');
        }
    }
}

// Export for use in main script
window.ModifierSystem = ModifierSystem;