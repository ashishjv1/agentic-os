import React, { useEffect, useRef, useState } from 'react';
import { GeneratedApp } from '../types';
import './AppRenderer.css';

interface AppRendererProps {
  app: GeneratedApp;
  onClose?: () => void;
  onMinimize?: () => void;
}

const AppRenderer: React.FC<AppRendererProps> = ({ app, onClose, onMinimize }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
    if (onMinimize) {
      onMinimize();
    }
  };

  const handleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    setIsLoading(true);
    setIsMinimized(false); // Ensure app starts expanded
    setIsMaximized(false); // Reset maximize state

    // Simple approach - just load the content and let the JS run naturally
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            :root {
              --bg-primary: #1a1a1a;
              --bg-secondary: #2d2d2d;
              --bg-tertiary: #3a3a3a;
              --text-primary: #ffffff;
              --text-secondary: #b0b0b0;
              --accent-blue: #007acc;
              --accent-green: #4caf50;
              --border-color: #404040;
              --shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
              --border-radius: 8px;
            }
            body {
              margin: 0;
              padding: 20px;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
              background: var(--bg-primary);
              color: var(--text-primary);
              min-height: 100vh;
              box-sizing: border-box;
            }
            * {
              box-sizing: border-box;
            }
            ${app.css || ''}
          </style>
        </head>
        <body>
          ${app.html || '<div>Loading...</div>'}
          <script>
            ${app.js || 'console.log("No JavaScript provided");'}
          </script>
        </body>
      </html>
    `;

    // Force iframe to reload by setting src to blank first
    iframe.src = 'about:blank';
    
    // Small delay to ensure iframe is cleared, then load new content
    const loadTimeout = setTimeout(() => {
      iframe.srcdoc = htmlContent;
      
      // More reliable loading detection - check when iframe loads
      const handleLoad = () => {
        console.log('Iframe loaded successfully');
        setIsLoading(false);
        iframe.removeEventListener('load', handleLoad);
      };
      
      iframe.addEventListener('load', handleLoad);
      
      // Fallback timeout in case load event doesn't fire
      const fallbackTimeout = setTimeout(() => {
        console.log('Fallback: Setting loading to false');
        setIsLoading(false);
      }, 3000);

      return () => {
        clearTimeout(fallbackTimeout);
        iframe.removeEventListener('load', handleLoad);
      };
    }, 100);

    return () => {
      clearTimeout(loadTimeout);
    };
  }, [app]);

  return (
    <div className={`app-renderer ${isMaximized ? 'maximized' : ''} ${isMinimized ? 'minimized' : ''} ${isLoading ? 'loading' : ''}`}>
      <div className="app-header">
        <div className="app-title">
          <div className="app-icon">🤖</div>
          <div className="app-info">
            <span className="app-name">{app.name}</span>
            <span className="app-prompt">"{app.prompt}"</span>
          </div>
        </div>
        <div className="app-actions">
          <button 
            className="window-btn minimize-btn"
            onClick={handleMinimize}
            title={isMinimized ? "Restore" : "Minimize"}
          >
            −
          </button>
          <button 
            className="window-btn maximize-btn"
            onClick={handleMaximize}
            title={isMaximized ? "Restore" : "Maximize"}
          >
            {isMaximized ? '⧉' : '□'}
          </button>
          <button 
            className="window-btn close-btn"
            onClick={handleClose}
            title="Close"
          >
            ×
          </button>
        </div>
      </div>
      
      {!isMinimized && (
        <div className="app-content">
          {isLoading && (
            <div className="app-loading">
              <div className="loading-spinner"></div>
              <span className="loading-text">Initializing {app.name}...</span>
            </div>
          )}
          <iframe
            ref={iframeRef}
            className={`app-iframe ${isLoading ? 'iframe-loading' : ''}`}
            title={app.name}
            sandbox="allow-scripts allow-same-origin allow-forms"
          />
        </div>
      )}
    </div>
  );
};

export default AppRenderer;
