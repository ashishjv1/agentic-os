import React, { useState } from 'react';
import { Agent, ChatMessage, GeneratedApp } from '../types';
import AgentSelector from './AgentSelector';
import ChatInput from './ChatInput';
import './ChatBar.css';

interface ChatBarProps {
  selectedAgent: Agent;
  onAgentChange: (agent: Agent) => void;
  availableAgents: Agent[];
  onSendMessage: (message: string) => void;
  onCancelGeneration: () => void;
  chatHistory: ChatMessage[];
  isGenerating: boolean;
  hasCurrentApp?: boolean;
  appHistory?: GeneratedApp[];
  onSwitchToApp?: (app: GeneratedApp) => void;
}

const ChatBar: React.FC<ChatBarProps> = ({
  selectedAgent,
  onAgentChange,
  availableAgents,
  onSendMessage,
  onCancelGeneration,
  isGenerating,
  hasCurrentApp = false,
  appHistory = [],
  onSwitchToApp,
}) => {
  const [showHistory, setShowHistory] = useState(false);

  return (
    <div className={`chat-bar ${hasCurrentApp ? 'with-app' : ''}`}>
      {showHistory && appHistory.length > 0 && (
        <div className="chat-history">
          <div className="chat-history-header">
            <span>App History</span>
            <button onClick={() => setShowHistory(false)}>×</button>
          </div>
          <div className="chat-history-content">
            {appHistory.map((app) => (
              <div 
                key={app.id} 
                className="app-history-item"
                onClick={() => {
                  if (onSwitchToApp) {
                    onSwitchToApp(app);
                    setShowHistory(false);
                  }
                }}
              >
                <div className="app-history-header">
                  <div className="app-history-icon">🤖</div>
                  <div className="app-history-info">
                    <span className="app-history-name">{app.name}</span>
                    <span className="app-history-time">
                      {app.createdAt.toLocaleTimeString()}
                    </span>
                  </div>
                </div>
                <div className="app-history-prompt">"{app.prompt}"</div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="chat-input-container">
        {isGenerating && (
          <div className="generation-status">
            <div className="status-indicator">
              <div className="pulse-dot"></div>
              <span>Generating...</span>
            </div>
          </div>
        )}
        
        <div className="search-bar-wrapper">
          <AgentSelector
            selectedAgent={selectedAgent}
            agents={availableAgents}
            onAgentChange={onAgentChange}
          />
          <ChatInput
            onSendMessage={onSendMessage}
            onCancelGeneration={onCancelGeneration}
            isGenerating={isGenerating}
            placeholder="Create something..."
          />
        </div>
        
        {appHistory.length > 0 && (
          <button 
            className="history-toggle"
            onClick={() => setShowHistory(!showHistory)}
            title="App history"
          >
            📱
          </button>
        )}
      </div>
    </div>
  );
};

export default ChatBar;
