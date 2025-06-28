import React from 'react';
import { GeneratedApp } from '../types';
import './AppHistory.css';

interface AppHistoryProps {
  apps: GeneratedApp[];
  onSelectApp: (app: GeneratedApp) => void;
  onRemoveApp?: (appId: string) => void;
}

const AppHistory: React.FC<AppHistoryProps> = ({ apps, onSelectApp, onRemoveApp }) => {
  const handleRemoveApp = (e: React.MouseEvent, appId: string) => {
    e.stopPropagation();
    if (onRemoveApp) {
      onRemoveApp(appId);
    }
  };

  return (
    <div className="app-history">
      <div className="history-header">
        <span className="history-title">Recent Apps</span>
        <span className="history-count">{apps.length}</span>
      </div>
      <div className="history-scroll">
        {apps.map((app) => (
          <div 
            key={app.id}
            className="history-item"
            onClick={() => onSelectApp(app)}
          >
            <div className="history-item-content">
              <span className="history-item-name">{app.name}</span>
              <span className="history-item-prompt">"{app.prompt}"</span>
              <span className="history-item-time">
                {app.createdAt.toLocaleTimeString()}
              </span>
            </div>
            {onRemoveApp && (
              <button
                className="history-item-remove"
                onClick={(e) => handleRemoveApp(e, app.id)}
                title="Remove app"
              >
                ×
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AppHistory;
