import React, { useState } from 'react';

interface ConfigModalProps {
  isOpen: boolean;
  mode: 'save' | 'load';
  onClose: () => void;
  onSave: (name: string, description: string, download?: boolean) => void;
  onLoad: (config: any) => void;
  onImport: (file: File) => void;
  onGenerateShare?: () => string;
  onImportShare?: (shareString: string) => void;
  savedConfigs: any[];
}

const ConfigModal: React.FC<ConfigModalProps> = ({
  isOpen,
  mode,
  onClose,
  onSave,
  onLoad,
  onImport,
  onGenerateShare,
  onImportShare,
  savedConfigs
}) => {
  const [configName, setConfigName] = useState('');
  const [configDescription, setConfigDescription] = useState('');
  const [shareString, setShareString] = useState('');
  const [importString, setImportString] = useState('');

  const handleSave = (download?: boolean) => {
    if (configName.trim()) {
      onSave(configName, configDescription, download);
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

  const handleGenerateShare = () => {
    if (onGenerateShare) {
      const generated = onGenerateShare();
      setShareString(generated);
    }
  };

  const handleImportShare = () => {
    if (onImportShare && importString.trim()) {
      onImportShare(importString.trim());
      setImportString('');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareString);
    alert('Share string copied to clipboard!');
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
                <button onClick={() => handleSave(false)} className="button-primary">Save</button>
                <button onClick={() => handleSave(true)} className="button-secondary">Save & Download</button>
                <button onClick={handleGenerateShare} className="button-secondary">Generate Share String</button>
                <button onClick={onClose} className="button-secondary">Cancel</button>
              </div>
              {shareString && (
                <div className="share-section">
                  <label>Share String:</label>
                  <textarea
                    value={shareString}
                    readOnly
                    className="form-textarea"
                    style={{ fontSize: '11px', height: '10px' }}
                  />
                  <button onClick={copyToClipboard} className="button-primary">Copy to Clipboard</button>
                </div>
              )}
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
              <div className="share-import-section">
                <label>Import Share String:</label>
                <textarea
                  value={importString}
                  onChange={(e) => setImportString(e.target.value)}
                  placeholder="Paste share string here..."
                  className="form-textarea"
                  style={{ fontSize: '11px', height: '60px' }}
                />
                <button onClick={handleImportShare} className="button-primary">Import Share String</button>
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