import React, { useState } from 'react';
import { GeneratedApp } from '../types';
import AppRenderer from './AppRenderer';
import AppHistory from './AppHistory';
import PromptDrawer from './PromptDrawer';
import './Desktop.css';

interface DesktopProps {
  currentApp: GeneratedApp | null;
  appHistory: GeneratedApp[];
  onSwitchToApp: (app: GeneratedApp) => void;
  onCloseApp: () => void;
  onMinimizeApp: () => void;
  onRemoveApp: (appId: string) => void;
  onShowApiStatus: () => void;
  onGenerateApp?: (prompt: string) => void;
  selectedAgent: string;
}

const Desktop: React.FC<DesktopProps> = ({ 
  currentApp, 
  appHistory, 
  onSwitchToApp, 
  onCloseApp,
  onMinimizeApp,
  onRemoveApp,
  onShowApiStatus,
  onGenerateApp,
  selectedAgent
}) => {
  const [isPromptDrawerOpen, setIsPromptDrawerOpen] = useState(false);

  const handleCloseApp = () => {
    onCloseApp();
  };

  const handleMinimizeApp = () => {
    onMinimizeApp();
  };

  const handleExampleClick = (prompt: string) => {
    if (onGenerateApp) {
      onGenerateApp(prompt);
    }
  };

  return (
    <div className="desktop">
      <div className="desktop-header">
        <div className="desktop-title">
          <span className="os-icon">🚀</span>
          <span className="os-name">Agentic OS</span>
          <span className="os-version">v1.0</span>
        </div>
        <div className="desktop-actions">
          <button 
            className="prompt-drawer-btn"
            onClick={() => setIsPromptDrawerOpen(true)}
            title="Open Prompt Marketplace"
          >
            <span className="drawer-icon">🛍️</span>
            <span className="drawer-text">Prompts</span>
          </button>
          <button 
            className="api-status-btn"
            onClick={onShowApiStatus}
            title="View API Configuration"
          >
            <span className="status-icon">🔌</span>
            <span className="status-text">API Status</span>
          </button>
        </div>
      </div>
      
      <div className="desktop-main">
        {currentApp ? (
          <AppRenderer 
            app={currentApp} 
            onClose={handleCloseApp}
            onMinimize={handleMinimizeApp}
          />
        ) : (
          <div className="desktop-welcome">
            <div className="welcome-content">
              <div className="welcome-hero">
                <h1>Welcome to Agentic OS</h1>
                <p>The future of AI-powered application development</p>
              </div>
              
              <div className="welcome-examples">
                <h3>✨ Try these examples:</h3>
                <div className="example-grid">
                  <div 
                    className="example-item"
                    onClick={() => handleExampleClick("Create a calculator app")}
                  >
                    💻 "Create a calculator app"
                  </div>
                  <div 
                    className="example-item"
                    onClick={() => handleExampleClick("Make a todo list manager")}
                  >
                    📝 "Make a todo list manager"
                  </div>
                  <div 
                    className="example-item"
                    onClick={() => handleExampleClick("Build a pomodoro timer")}
                  >
                    ⏰ "Build a pomodoro timer"
                  </div>
                  <div 
                    className="example-item"
                    onClick={() => handleExampleClick("Create a tic-tac-toe game")}
                  >
                    🎮 "Create a tic-tac-toe game"
                  </div>
                  <div 
                    className="example-item"
                    onClick={() => handleExampleClick("Latest AI developments")}
                  >
                    🔍 "Latest AI developments"
                  </div>
                  <div 
                    className="example-item"
                    onClick={() => handleExampleClick("Climate change research")}
                  >
                    🌍 "Climate change research"
                  </div>
                  <div 
                    className="example-item"
                    onClick={() => handleExampleClick("Make a temperature converter")}
                  >
                    🌡️ "Make a temperature converter"
                  </div>
                  <div 
                    className="example-item"
                    onClick={() => handleExampleClick("Build a simple chart widget")}
                  >
                    📊 "Build a simple chart widget"
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {appHistory.length > 0 && (
        <AppHistory 
          apps={appHistory} 
          onSelectApp={onSwitchToApp}
          onRemoveApp={onRemoveApp}
        />
      )}

      <PromptDrawer
        isOpen={isPromptDrawerOpen}
        onClose={() => setIsPromptDrawerOpen(false)}
        selectedAgent={selectedAgent}
      />
    </div>
  );
};

export default Desktop;
