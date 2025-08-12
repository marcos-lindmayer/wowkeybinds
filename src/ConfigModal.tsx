import React, { useState } from 'react';

interface ConfigModalProps {
  isOpen: boolean;
  mode: 'save' | 'load';
  onClose: () => void;
  onSave: (name: string, description: string) => void;
  onLoad: (config: any) => void;
  onImport: (file: File) => void;
  savedConfigs: any[];
}

const ConfigModal: React.FC<ConfigModalProps> = ({
  isOpen,
  mode,
  onClose,
  onSave,
  onLoad,
  onImport,
  savedConfigs
}) => {
  const [configName, setConfigName] = useState('');
  const [configDescription, setConfigDescription] = useState('');

  const handleSave = () => {
    if (configName.trim()) {
      onSave(configName, configDescription);
      setConfigName('');
      setConfigDescription('');
    }
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImport(file);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{mode === 'save' ? 'Save Configuration' : 'Load Configuration'}</h3>
          <button onClick={onClose} className="close-button">&times;</button>
        </div>
        <div className="modal-body">
          {mode === 'save' ? (
            <div className="config-form">
              <input
                type="text"
                value={configName}
                onChange={(e) => setConfigName(e.target.value)}
                placeholder="Configuration name"
                className="form-input"
              />
              <textarea
                value={configDescription}
                onChange={(e) => setConfigDescription(e.target.value)}
                placeholder="Description (optional)"
                className="form-textarea"
              />
              <div className="form-buttons">
                <button onClick={handleSave} className="button-primary">Save</button>
                <button onClick={onClose} className="button-secondary">Cancel</button>
              </div>
            </div>
          ) : (
            <div className="config-form">
              <div className="config-list">
                {savedConfigs.map((config, index) => (
                  <div key={index} className="config-item">
                    <div>
                      <h4>{config.name}</h4>
                      <p>{config.description}</p>
                    </div>
                    <button onClick={() => onLoad(config)} className="button-primary">Load</button>
                  </div>
                ))}
              </div>
              <div className="form-buttons">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileImport}
                  className="file-input"
                />
                <button onClick={onClose} className="button-secondary">Cancel</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfigModal;