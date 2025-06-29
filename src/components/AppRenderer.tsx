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
  const [isLoading, setIsLoading] = useState(true);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [contentSize, setContentSize] = useState(() => {
    // Start with more reasonable responsive sizing
    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1024;
    const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 768;
    
    // Calculate initial size based on viewport, but with reasonable constraints
    const initialWidth = Math.min(600, Math.max(320, viewportWidth * 0.6));
    const initialHeight = Math.min(450, Math.max(240, viewportHeight * 0.5));
    
    return { 
      width: `${initialWidth}px`, 
      height: `${initialHeight}px` 
    };
  });

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
    if (onMinimize && !isMinimized) {
      onMinimize();
    }
  };

  const handleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  // Function to detect content size from iframe
  const detectContentSize = () => {
    const iframe = iframeRef.current;
    if (!iframe || !iframe.contentDocument) return;

    try {
      const body = iframe.contentDocument.body;
      const html = iframe.contentDocument.documentElement;
      
      if (body && html) {
        // Remove default margin/padding that might affect measurements
        body.style.margin = '0';
        body.style.padding = '20px';
        
        // Wait a bit for layout to settle, then measure
        setTimeout(() => {
          const bodyRect = body.getBoundingClientRect();
          const scrollWidth = Math.max(body.scrollWidth, html.scrollWidth);
          const scrollHeight = Math.max(body.scrollHeight, html.scrollHeight);
          
          // Use the larger of the two measurements for accuracy
          const width = Math.max(bodyRect.width, scrollWidth, 320);
          const height = Math.max(bodyRect.height, scrollHeight, 240);
          
          // No extra padding needed since we're showing content directly
          const maxWidth = window.innerWidth - 80; // Margin for safety
          const maxHeight = window.innerHeight - 180; // More space for chat bar
          
          const adjustedWidth = Math.min(width, maxWidth);
          const adjustedHeight = Math.min(height, maxHeight);
          
          // Only update if there's a meaningful change (reduced threshold)
          const currentWidth = parseInt(contentSize.width);
          const currentHeight = parseInt(contentSize.height);
          
          if (Math.abs(adjustedWidth - currentWidth) > 50 || Math.abs(adjustedHeight - currentHeight) > 50) {
            setContentSize({
              width: `${adjustedWidth}px`,
              height: `${adjustedHeight}px`
            });
          }
        }, 100);
      }
    } catch (error) {
      // Fallback to smaller responsive size
      console.log('Could not detect content size, using responsive default');
      const fallbackWidth = Math.min(480, window.innerWidth - 100);
      const fallbackHeight = Math.min(360, window.innerHeight - 200);
      setContentSize({
        width: `${fallbackWidth}px`,
        height: `${fallbackHeight}px`
      });
    }
  };

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    setIsLoading(true);

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
              box-sizing: border-box;
              overflow-x: hidden; /* Prevent horizontal scroll */
              max-width: 100%; /* Prevent content from expanding beyond container */
              min-height: 200px; /* Minimum height for usability */
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
        
        // Detect content size once after content is fully rendered
        setTimeout(() => {
          detectContentSize();
        }, 500); // Reduced from 1000ms to 500ms for faster response
        
        iframe.removeEventListener('load', handleLoad);
      };
      
      iframe.addEventListener('load', handleLoad);
      
      // Fallback timeout in case load event doesn't fire
      const fallbackTimeout = setTimeout(() => {
        console.log('Fallback: Setting loading to false');
        setIsLoading(false);
        // Don't call detectContentSize here to avoid double sizing
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

  const dynamicStyle = isMaximized 
    ? {} // Let CSS handle maximized state
    : isMinimized 
    ? { width: '320px', height: '50px' }
    : { width: contentSize.width, height: contentSize.height };

  return (
    <div 
      className={`app-renderer ${isMaximized ? 'maximized' : ''} ${isMinimized ? 'minimized' : ''} ${isLoading ? 'loading' : ''}`}
      style={dynamicStyle}
    >
      <div className="window-controls">
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
