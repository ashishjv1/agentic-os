import React, { useState, useEffect } from 'react';
import './ApiStatus.css';

interface ApiStatusProps {
  isVisible: boolean;
  onClose: () => void;
  onApiKeysUpdate?: (keys: ApiKeys) => void;
  onSelectedModelsUpdate?: (models: { openai: string; anthropic: string; openrouter: string }) => void;
  onCustomModelsUpdate?: (models: { openai: string; anthropic: string; openrouter: string }) => void;
}

interface ApiKeys {
  openai: string;
  anthropic: string;
  openrouter: string;
}

const ApiStatus: React.FC<ApiStatusProps> = ({ isVisible, onClose, onApiKeysUpdate, onSelectedModelsUpdate, onCustomModelsUpdate }) => {
  const [hasApiKey, setHasApiKey] = useState(false);
  
  // API Keys state
  const [apiKeys, setApiKeys] = useState<ApiKeys>(() => {
    try {
      const saved = localStorage.getItem('agentic-os-api-keys');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.warn('Failed to load API keys from localStorage:', error);
    }
    return { openai: '', anthropic: '', openrouter: '' };
  });

  // Selected models for each provider
  const [selectedModels, setSelectedModels] = useState(() => {
    try {
      const saved = localStorage.getItem('agentic-os-selected-models');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.warn('Failed to load selected models from localStorage:', error);
    }
    return {
      openai: 'gpt-4o',
      anthropic: 'claude-3-5-sonnet-20241022',
      openrouter: 'deepseek/deepseek-chat'
    };
  });

  // Custom model inputs
  const [customModels, setCustomModels] = useState(() => {
    try {
      const saved = localStorage.getItem('agentic-os-custom-models');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.warn('Failed to load custom models from localStorage:', error);
    }
    return {
      openai: '',
      anthropic: '',
      openrouter: ''
    };
  });

  const [showApiKeys, setShowApiKeys] = useState<Record<string, boolean>>({
    openai: false,
    anthropic: false,
    openrouter: false
  });

  const [testingConnection, setTestingConnection] = useState<string | null>(null);

  // Model options for each provider
  const modelOptions = {
    openai: [
      { value: 'gpt-4o', label: 'GPT-4o (Most Advanced)' },
      { value: 'gpt-4o-mini', label: 'GPT-4o Mini (Fast)' },
      { value: 'gpt-4-turbo', label: 'GPT-4 Turbo (Vision)' },
      { value: 'gpt-4', label: 'GPT-4 (Standard)' },
      { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo (Cost-effective)' },
      { value: 'custom', label: 'Custom Model (Enter manually)' }
    ],
    anthropic: [
      { value: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet (Most Intelligent)' },
      { value: 'claude-3-5-haiku-20241022', label: 'Claude 3.5 Haiku (Fast)' },
      { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus (Most Powerful)' },
      { value: 'custom', label: 'Custom Model (Enter manually)' }
    ],
    openrouter: [
      { value: 'deepseek/deepseek-chat', label: 'DeepSeek V3 (Advanced Reasoning)' },
      { value: 'openai/gpt-4o', label: 'GPT-4o via OpenRouter' },
      { value: 'anthropic/claude-3.5-sonnet', label: 'Claude 3.5 Sonnet via OpenRouter' },
      { value: 'meta-llama/llama-3.1-405b-instruct', label: 'Llama 3.1 405B (Meta)' },
      { value: 'google/gemini-pro', label: 'Gemini Pro (Google)' },
      { value: 'microsoft/wizardlm-2-8x22b', label: 'WizardLM 2 8x22B' },
      { value: 'custom', label: 'Custom Model (Enter manually)' }
    ]
  };

  useEffect(() => {
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    console.log('ApiStatus - Raw API Key:', apiKey);
    console.log('ApiStatus - API Key length:', apiKey?.length);
    console.log('ApiStatus - API Key type:', typeof apiKey);
    
    // Check if any API keys are configured (either env or localStorage)
    const hasEnvKey = !!apiKey && apiKey !== 'your_openrouter_api_key_here' && apiKey.trim().length > 0;
    const hasStoredKeys = Object.values(apiKeys).some(key => key.trim().length > 0);
    setHasApiKey(hasEnvKey || hasStoredKeys);
  }, [apiKeys]);

  // Save API keys to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('agentic-os-api-keys', JSON.stringify(apiKeys));
      if (onApiKeysUpdate) {
        onApiKeysUpdate(apiKeys);
      }
    } catch (error) {
      console.warn('Failed to save API keys to localStorage:', error);
    }
  }, [apiKeys, onApiKeysUpdate]);

  // Save selected models to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('agentic-os-selected-models', JSON.stringify(selectedModels));
      if (onSelectedModelsUpdate) {
        onSelectedModelsUpdate(selectedModels);
      }
    } catch (error) {
      console.warn('Failed to save selected models to localStorage:', error);
    }
  }, [selectedModels, onSelectedModelsUpdate]);

  // Save custom models to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('agentic-os-custom-models', JSON.stringify(customModels));
      if (onCustomModelsUpdate) {
        onCustomModelsUpdate(customModels);
      }
    } catch (error) {
      console.warn('Failed to save custom models to localStorage:', error);
    }
  }, [customModels, onCustomModelsUpdate]);

  // API key handlers
  const handleApiKeyChange = (provider: keyof ApiKeys, value: string) => {
    setApiKeys(prev => ({
      ...prev,
      [provider]: value
    }));
  };

  const handleModelChange = (provider: string, model: string) => {
    setSelectedModels((prev: any) => ({
      ...prev,
      [provider]: model
    }));
  };

  const handleCustomModelChange = (provider: string, customModel: string) => {
    setCustomModels((prev: any) => ({
      ...prev,
      [provider]: customModel
    }));
  };

  const toggleShowApiKey = (provider: string) => {
    setShowApiKeys(prev => ({
      ...prev,
      [provider]: !prev[provider]
    }));
  };

  const clearApiKey = (provider: keyof ApiKeys) => {
    setApiKeys(prev => ({
      ...prev,
      [provider]: ''
    }));
  };

  const testApiConnection = async (provider: keyof ApiKeys) => {
    if (!apiKeys[provider]) return;
    
    setTestingConnection(provider);
    try {
      let isValid = false;
      
      if (provider === 'openai') {
        const response = await fetch('https://api.openai.com/v1/models', {
          headers: {
            'Authorization': `Bearer ${apiKeys[provider]}`
          }
        });
        isValid = response.ok;
      } else if (provider === 'anthropic') {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKeys[provider]}`,
            'Content-Type': 'application/json',
            'anthropic-version': '2023-06-01'
          },
          body: JSON.stringify({
            model: 'claude-3-5-haiku-20241022',
            max_tokens: 1,
            messages: [{ role: 'user', content: 'test' }]
          })
        });
        isValid = response.status !== 401;
      } else if (provider === 'openrouter') {
        const response = await fetch('https://openrouter.ai/api/v1/models', {
          headers: {
            'Authorization': `Bearer ${apiKeys[provider]}`
          }
        });
        isValid = response.ok;
      }

      if (isValid) {
        alert(`${provider.charAt(0).toUpperCase() + provider.slice(1)} API key is valid!`);
      } else {
        alert(`${provider.charAt(0).toUpperCase() + provider.slice(1)} API key is invalid.`);
      }
    } catch (error) {
      console.error(`Error testing ${provider} API:`, error);
      alert(`Error testing ${provider.charAt(0).toUpperCase() + provider.slice(1)} API key.`);
    } finally {
      setTestingConnection(null);
    }
  };

  if (!isVisible) return null;

  return (
    <div className="api-status-overlay">
      <div className="api-status-modal">
        <div className="api-status-header">
          <h3>🔌 API Configuration</h3>
          <button onClick={onClose} className="close-btn">×</button>
        </div>
        
        <div className="api-status-content">
          <div className="status-section">
            <div className="api-connection-status">
              <span className="api-status-label">API Status:</span>
              <div className={`status-indicator ${hasApiKey ? 'online' : 'offline'}`}>
                <span className="status-dot"></span>
              </div>
            </div>
            
            {!hasApiKey && (
              <div className="setup-instructions">
                <p>To enable AI-powered app generation:</p>
                <ol>
                  <li>Get an API key from <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer">OpenRouter.ai</a> or other providers</li>
                  <li>Edit your <code>.env</code> file</li>
                  <li>Replace <code>your_openrouter_api_key_here</code> with your actual API key</li>
                  <li>Restart the development server</li>
                </ol>
              </div>
            )}
          </div>

          <div className="status-section">
            <h4>API Key Management</h4>
            <p className="api-keys-description">
              Configure your API keys to access different AI models. Keys are stored locally and never sent to our servers.
            </p>

            {/* OpenAI */}
            <div className="api-key-group">
              <div className="api-key-header">
                <div className="provider-info">
                  <h5>OpenAI</h5>
                  <span className="provider-description">GPT-4o, GPT-4 Turbo, GPT-3.5</span>
                </div>
                <div className="api-key-status">
                  {apiKeys.openai && <span className="status-indicator connected">●</span>}
                </div>
              </div>
              <div className="api-key-input-group">
                <input
                  type={showApiKeys.openai ? "text" : "password"}
                  value={apiKeys.openai}
                  onChange={(e) => handleApiKeyChange('openai', e.target.value)}
                  placeholder="sk-..."
                  className="api-key-input"
                />
                <button 
                  className="api-key-btn toggle-btn"
                  onClick={() => toggleShowApiKey('openai')}
                  title={showApiKeys.openai ? "Hide key" : "Show key"}
                >
                  {showApiKeys.openai ? "👁️" : "👁️‍🗨️"}
                </button>
                <button 
                  className="api-key-btn test-btn"
                  onClick={() => testApiConnection('openai')}
                  disabled={!apiKeys.openai || testingConnection === 'openai'}
                  title="Test connection"
                >
                  {testingConnection === 'openai' ? "⏳" : "🔍"}
                </button>
                <button 
                  className="api-key-btn clear-btn"
                  onClick={() => clearApiKey('openai')}
                  disabled={!apiKeys.openai}
                  title="Clear key"
                >
                  🗑️
                </button>
              </div>
              {apiKeys.openai && (
                <div className="model-selection">
                  <label className="model-label">Preferred Model:</label>
                  <select 
                    className="model-select"
                    value={selectedModels.openai}
                    onChange={(e) => handleModelChange('openai', e.target.value)}
                  >
                    {modelOptions.openai.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {selectedModels.openai === 'custom' && (
                    <div className="custom-model-input">
                      <input
                        type="text"
                        value={customModels.openai}
                        onChange={(e) => handleCustomModelChange('openai', e.target.value)}
                        placeholder="Enter model name (e.g., gpt-4.1-preview)"
                        className="custom-model-field"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Anthropic */}
            <div className="api-key-group">
              <div className="api-key-header">
                <div className="provider-info">
                  <h5>Anthropic</h5>
                  <span className="provider-description">Claude 3.5 Sonnet, Claude 3 Opus</span>
                </div>
                <div className="api-key-status">
                  {apiKeys.anthropic && <span className="status-indicator connected">●</span>}
                </div>
              </div>
              <div className="api-key-input-group">
                <input
                  type={showApiKeys.anthropic ? "text" : "password"}
                  value={apiKeys.anthropic}
                  onChange={(e) => handleApiKeyChange('anthropic', e.target.value)}
                  placeholder="sk-ant-..."
                  className="api-key-input"
                />
                <button 
                  className="api-key-btn toggle-btn"
                  onClick={() => toggleShowApiKey('anthropic')}
                  title={showApiKeys.anthropic ? "Hide key" : "Show key"}
                >
                  {showApiKeys.anthropic ? "👁️" : "👁️‍🗨️"}
                </button>
                <button 
                  className="api-key-btn test-btn"
                  onClick={() => testApiConnection('anthropic')}
                  disabled={!apiKeys.anthropic || testingConnection === 'anthropic'}
                  title="Test connection"
                >
                  {testingConnection === 'anthropic' ? "⏳" : "🔍"}
                </button>
                <button 
                  className="api-key-btn clear-btn"
                  onClick={() => clearApiKey('anthropic')}
                  disabled={!apiKeys.anthropic}
                  title="Clear key"
                >
                  🗑️
                </button>
              </div>
              {apiKeys.anthropic && (
                <div className="model-selection">
                  <label className="model-label">Preferred Model:</label>
                  <select 
                    className="model-select"
                    value={selectedModels.anthropic}
                    onChange={(e) => handleModelChange('anthropic', e.target.value)}
                  >
                    {modelOptions.anthropic.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {selectedModels.anthropic === 'custom' && (
                    <div className="custom-model-input">
                      <input
                        type="text"
                        value={customModels.anthropic}
                        onChange={(e) => handleCustomModelChange('anthropic', e.target.value)}
                        placeholder="Enter model name (e.g., claude-3-5-sonnet-20250101)"
                        className="custom-model-field"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* OpenRouter */}
            <div className="api-key-group">
              <div className="api-key-header">
                <div className="provider-info">
                  <h5>OpenRouter</h5>
                  <span className="provider-description">Access to multiple providers</span>
                </div>
                <div className="api-key-status">
                  {apiKeys.openrouter && <span className="status-indicator connected">●</span>}
                </div>
              </div>
              <div className="api-key-input-group">
                <input
                  type={showApiKeys.openrouter ? "text" : "password"}
                  value={apiKeys.openrouter}
                  onChange={(e) => handleApiKeyChange('openrouter', e.target.value)}
                  placeholder="sk-or-..."
                  className="api-key-input"
                />
                <button 
                  className="api-key-btn toggle-btn"
                  onClick={() => toggleShowApiKey('openrouter')}
                  title={showApiKeys.openrouter ? "Hide key" : "Show key"}
                >
                  {showApiKeys.openrouter ? "👁️" : "👁️‍🗨️"}
                </button>
                <button 
                  className="api-key-btn test-btn"
                  onClick={() => testApiConnection('openrouter')}
                  disabled={!apiKeys.openrouter || testingConnection === 'openrouter'}
                  title="Test connection"
                >
                  {testingConnection === 'openrouter' ? "⏳" : "🔍"}
                </button>
                <button 
                  className="api-key-btn clear-btn"
                  onClick={() => clearApiKey('openrouter')}
                  disabled={!apiKeys.openrouter}
                  title="Clear key"
                >
                  🗑️
                </button>
              </div>
              {apiKeys.openrouter && (
                <div className="model-selection">
                  <label className="model-label">Preferred Model:</label>
                  <select 
                    className="model-select"
                    value={selectedModels.openrouter}
                    onChange={(e) => handleModelChange('openrouter', e.target.value)}
                  >
                    {modelOptions.openrouter.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {selectedModels.openrouter === 'custom' && (
                    <div className="custom-model-input">
                      <input
                        type="text"
                        value={customModels.openrouter}
                        onChange={(e) => handleCustomModelChange('openrouter', e.target.value)}
                        placeholder="Enter model name (e.g., openai/gpt-4.1-preview)"
                        className="custom-model-field"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="status-section">
            <h4>Model Configuration</h4>
            <div className="models-list">
              {apiKeys.openai && (
                <div className="model-item">
                  <span className="agent-name">OpenAI Assistant:</span>
                  <span className="model-name">
                    {selectedModels.openai === 'custom' 
                      ? (customModels.openai || 'Custom model not set') 
                      : selectedModels.openai
                    }
                  </span>
                </div>
              )}
              {apiKeys.anthropic && (
                <div className="model-item">
                  <span className="agent-name">Claude Assistant:</span>
                  <span className="model-name">
                    {selectedModels.anthropic === 'custom' 
                      ? (customModels.anthropic || 'Custom model not set') 
                      : selectedModels.anthropic
                    }
                  </span>
                </div>
              )}
              {apiKeys.openrouter && (
                <div className="model-item">
                  <span className="agent-name">OpenRouter Assistant:</span>
                  <span className="model-name">
                    {selectedModels.openrouter === 'custom' 
                      ? (customModels.openrouter || 'Custom model not set') 
                      : selectedModels.openrouter
                    }
                  </span>
                </div>
              )}
              {!apiKeys.openai && !apiKeys.anthropic && !apiKeys.openrouter && (
                <div className="model-item">
                  <span className="agent-name">No API keys configured</span>
                  <span className="model-name">Add API keys above to see configured models</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiStatus;
