import React, { useState, useEffect } from 'react';
import './ApiStatus.css';

interface ApiStatusProps {
  isVisible: boolean;
  onClose: () => void;
}

const ApiStatus: React.FC<ApiStatusProps> = ({ isVisible, onClose }) => {
  const [hasApiKey, setHasApiKey] = useState(false);
  const [models, setModels] = useState<string[]>([]);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    console.log('ApiStatus - Raw API Key:', apiKey);
    console.log('ApiStatus - API Key length:', apiKey?.length);
    console.log('ApiStatus - API Key type:', typeof apiKey);
    
    setHasApiKey(!!apiKey && apiKey !== 'your_openrouter_api_key_here' && apiKey.trim().length > 0);
    
    setModels([
      import.meta.env.VITE_APP_GENERATOR_MODEL || 'meta-llama/llama-3.1-8b-instruct:free',
      import.meta.env.VITE_UTILITY_AGENT_MODEL || 'meta-llama/llama-3.1-8b-instruct:free',
      import.meta.env.VITE_WIDGET_AGENT_MODEL || 'meta-llama/llama-3.1-8b-instruct:free',
      import.meta.env.VITE_GAME_AGENT_MODEL || 'meta-llama/llama-3.1-8b-instruct:free'
    ]);
  }, []);

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
            <h4>OpenRouter Connection</h4>
            <div className={`status-indicator ${hasApiKey ? 'connected' : 'disconnected'}`}>
              {hasApiKey ? '✅ API Key Configured' : '❌ API Key Missing'}
            </div>
            
            {!hasApiKey && (
              <div className="setup-instructions">
                <p>To enable AI-powered app generation:</p>
                <ol>
                  <li>Get an API key from <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer">OpenRouter.ai</a></li>
                  <li>Edit your <code>.env</code> file</li>
                  <li>Replace <code>your_openrouter_api_key_here</code> with your actual API key</li>
                  <li>Restart the development server</li>
                </ol>
              </div>
            )}
          </div>

          <div className="status-section">
            <h4>Model Configuration</h4>
            <div className="models-list">
              <div className="model-item">
                <span className="agent-name">App Generator:</span>
                <span className="model-name">{models[0]}</span>
              </div>
              <div className="model-item">
                <span className="agent-name">Utility Agent:</span>
                <span className="model-name">{models[1]}</span>
              </div>
              <div className="model-item">
                <span className="agent-name">Widget Agent:</span>
                <span className="model-name">{models[2]}</span>
              </div>
              <div className="model-item">
                <span className="agent-name">Game Agent:</span>
                <span className="model-name">{models[3]}</span>
              </div>
            </div>
          </div>

          <div className="status-section">
            <h4>Current Mode</h4>
            <p className="mode-description">
              {hasApiKey 
                ? '🤖 AI-powered generation enabled - Apps will be created using OpenRouter models'
                : '🔄 Fallback mode - Using pre-built templates and mock generation'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiStatus;
