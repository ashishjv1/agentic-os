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
  const [isSettingsPanelOpen, setIsSettingsPanelOpen] = useState(false);
  
  // Settings state
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('agentic-os-settings');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.warn('Failed to load settings from localStorage:', error);
    }
    
    // Default settings
    return {
      theme: 'dark',
      accentColor: '#007acc',
      panelOrientation: 'horizontal',
      fontSize: 'medium',
      mainFont: 'Inter',
      panelFont: 'Inter',
      animations: true
    };
  });
  
  // Save settings to localStorage whenever settings change
  React.useEffect(() => {
    try {
      localStorage.setItem('agentic-os-settings', JSON.stringify(settings));
      
      // Apply theme changes to CSS variables and document
      const root = document.documentElement;
      
      // Apply accent color
      root.style.setProperty('--accent-blue', settings.accentColor);
      
      // Apply theme
      if (settings.theme === 'light') {
        root.setAttribute('data-theme', 'light');
        root.style.setProperty('--bg-primary', '#ffffff');
        root.style.setProperty('--bg-secondary', '#f8f9fa');
        root.style.setProperty('--bg-tertiary', '#e9ecef');
        root.style.setProperty('--text-primary', '#212529');
        root.style.setProperty('--text-secondary', '#6c757d');
        root.style.setProperty('--border-color', 'rgba(0, 0, 0, 0.1)');
        root.style.setProperty('--glass-primary', 'rgba(255, 255, 255, 0.8)');
        root.style.setProperty('--glass-secondary', 'rgba(255, 255, 255, 0.9)');
        root.style.setProperty('--glass-tertiary', 'rgba(255, 255, 255, 0.95)');
      } else if (settings.theme === 'dark') {
        root.setAttribute('data-theme', 'dark');
        root.style.setProperty('--bg-primary', '#1a1a1a');
        root.style.setProperty('--bg-secondary', '#2a2a2a');
        root.style.setProperty('--bg-tertiary', '#3a3a3a');
        root.style.setProperty('--text-primary', '#ffffff');
        root.style.setProperty('--text-secondary', '#b0b0b0');
        root.style.setProperty('--border-color', 'rgba(255, 255, 255, 0.15)');
        root.style.setProperty('--glass-primary', 'rgba(26, 26, 26, 0.8)');
        root.style.setProperty('--glass-secondary', 'rgba(42, 42, 42, 0.9)');
        root.style.setProperty('--glass-tertiary', 'rgba(58, 58, 58, 0.95)');
      } else { // auto
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
          root.setAttribute('data-theme', 'dark');
          // Apply dark theme
          root.style.setProperty('--bg-primary', '#1a1a1a');
          root.style.setProperty('--bg-secondary', '#2a2a2a');
          root.style.setProperty('--bg-tertiary', '#3a3a3a');
          root.style.setProperty('--text-primary', '#ffffff');
          root.style.setProperty('--text-secondary', '#b0b0b0');
          root.style.setProperty('--border-color', 'rgba(255, 255, 255, 0.15)');
          root.style.setProperty('--glass-primary', 'rgba(26, 26, 26, 0.8)');
          root.style.setProperty('--glass-secondary', 'rgba(42, 42, 42, 0.9)');
          root.style.setProperty('--glass-tertiary', 'rgba(58, 58, 58, 0.95)');
        } else {
          root.setAttribute('data-theme', 'light');
          // Apply light theme
          root.style.setProperty('--bg-primary', '#ffffff');
          root.style.setProperty('--bg-secondary', '#f8f9fa');
          root.style.setProperty('--bg-tertiary', '#e9ecef');
          root.style.setProperty('--text-primary', '#212529');
          root.style.setProperty('--text-secondary', '#6c757d');
          root.style.setProperty('--border-color', 'rgba(0, 0, 0, 0.1)');
          root.style.setProperty('--glass-primary', 'rgba(255, 255, 255, 0.8)');
          root.style.setProperty('--glass-secondary', 'rgba(255, 255, 255, 0.9)');
          root.style.setProperty('--glass-tertiary', 'rgba(255, 255, 255, 0.95)');
        }
      }
      
      // Apply font size
      if (settings.fontSize === 'small') {
        root.style.setProperty('--font-size-base', '14px');
      } else if (settings.fontSize === 'large') {
        root.style.setProperty('--font-size-base', '18px');
      } else {
        root.style.setProperty('--font-size-base', '16px');
      }
      
      // Apply main font
      root.style.setProperty('--font-family-main', `"${settings.mainFont}", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`);
      
      // Apply panel font
      root.style.setProperty('--font-family-panel', `"${settings.panelFont}", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`);
      
    } catch (error) {
      console.warn('Failed to save settings to localStorage:', error);
    }
  }, [settings]);
  
  // Enhanced examples structure with localStorage persistence
  const [examples, setExamples] = useState(() => {
    try {
      const saved = localStorage.getItem('agentic-os-examples');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.warn('Failed to load examples from localStorage:', error);
    }
    
    // Default examples if nothing saved or error loading
    return [
      { title: "Calculator", detailedPrompt: "Create a fully functional calculator with basic arithmetic operations (addition, subtraction, multiplication, division), clear button, and display screen. Include keyboard support and handle edge cases like division by zero." },
      { title: "Todo List", detailedPrompt: "Build a todo list application with the ability to add new tasks, mark tasks as complete, delete tasks, and filter between all/active/completed tasks. Include local storage to persist tasks between sessions." },
      { title: "Timer", detailedPrompt: "Create a countdown timer where users can set minutes and seconds, start/pause/reset the timer, and get visual/audio feedback when the timer reaches zero. Include a progress indicator." },
      { title: "Game", detailedPrompt: "Design a simple interactive game like tic-tac-toe, memory matching, or a number guessing game. Include score tracking, game state management, and replay functionality." },
      { title: "AI News", detailedPrompt: "Create a news dashboard that displays current AI and technology news with headlines, summaries, publication dates, and source links. Organize content in a clean, readable format." },
      { title: "Research", detailedPrompt: "Build an information research tool that can display structured data about a topic, with sections for key facts, statistics, recent developments, and cited sources." },
      { title: "Converter", detailedPrompt: "Design a unit converter tool supporting multiple categories (length, weight, temperature, currency) with instant conversion as the user types, conversion history, and clear input/output display." },
      { title: "Charts", detailedPrompt: "Create a data visualization tool that can generate different types of charts (bar, line, pie) from user input data, with customizable colors and labels." },
      { title: "Weather", detailedPrompt: "Build a weather dashboard showing current conditions, forecast, temperature trends, and weather icons. Include location-based information and multiple weather metrics." }
    ];
  });
  
  // Save examples to localStorage whenever examples change
  React.useEffect(() => {
    try {
      localStorage.setItem('agentic-os-examples', JSON.stringify(examples));
    } catch (error) {
      console.warn('Failed to save examples to localStorage:', error);
    }
  }, [examples]);
  
  const [showAddExample, setShowAddExample] = useState(false);
  const [newExample, setNewExample] = useState('');
  const [newExampleTitle, setNewExampleTitle] = useState('');
  const [newExamplePrompt, setNewExamplePrompt] = useState('');
  const [contextMenu, setContextMenu] = useState<{
    visible: boolean;
    x: number;
    y: number;
    example: any;
  }>({ visible: false, x: 0, y: 0, example: null });

  // Drag functionality for examples container
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [examplePosition, setExamplePosition] = useState(() => {
    try {
      const saved = localStorage.getItem('agentic-os-example-position');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.warn('Failed to load example position from localStorage:', error);
    }
    // Default position (inside the main area, top-right)
    return { right: 20, top: 20 };
  });

  // Save example position to localStorage
  React.useEffect(() => {
    try {
      localStorage.setItem('agentic-os-example-position', JSON.stringify(examplePosition));
    } catch (error) {
      console.warn('Failed to save example position to localStorage:', error);
    }
  }, [examplePosition]);

  // Save and load panel size to localStorage
  const [panelSize, setPanelSize] = useState(() => {
    try {
      const saved = localStorage.getItem('agentic-os-panel-size');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.warn('Failed to load panel size from localStorage:', error);
    }
    // Default size
    return { width: 450, height: 350 };
  });

  // Track when we're programmatically setting the size to avoid ResizeObserver loops
  const isSettingSizeRef = React.useRef(false);

  // Set initial panel size CSS variables on mount
  React.useEffect(() => {
    const root = document.documentElement;
    isSettingSizeRef.current = true;
    root.style.setProperty('--panel-width', `${panelSize.width}px`);
    root.style.setProperty('--panel-height', `${panelSize.height}px`);
    setTimeout(() => {
      isSettingSizeRef.current = false;
    }, 100);
  }, []); // Only run on mount

  // Save panel size to localStorage
  React.useEffect(() => {
    try {
      localStorage.setItem('agentic-os-panel-size', JSON.stringify(panelSize));
      // Apply panel size as CSS variables
      const root = document.documentElement;
      isSettingSizeRef.current = true;
      root.style.setProperty('--panel-width', `${panelSize.width}px`);
      root.style.setProperty('--panel-height', `${panelSize.height}px`);
      setTimeout(() => {
        isSettingSizeRef.current = false;
      }, 100);
    } catch (error) {
      console.warn('Failed to save panel size to localStorage:', error);
    }
  }, [panelSize]);

  // ResizeObserver to detect when the panel is resized by the user
  React.useEffect(() => {
    const examplesContainer = document.querySelector('.examples-container');
    if (!examplesContainer) return;

    const resizeObserver = new ResizeObserver((entries) => {
      // Skip if we're programmatically setting the size
      if (isSettingSizeRef.current) return;
      
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        // Only update if the size actually changed significantly and is reasonable
        if (width > 200 && height > 150 && (Math.abs(width - panelSize.width) > 5 || Math.abs(height - panelSize.height) > 5)) {
          setPanelSize({ width: Math.round(width), height: Math.round(height) });
        }
      }
    });

    // Delay observation to ensure DOM is stable
    const timer = setTimeout(() => {
      resizeObserver.observe(examplesContainer);
    }, 200);

    return () => {
      clearTimeout(timer);
      resizeObserver.disconnect();
    };
  }, []); // Only run on mount

  const handleCloseApp = () => {
    onCloseApp();
  };

  const handleMinimizeApp = () => {
    onMinimizeApp();
  };


  const handleSettingChange = (key: string, value: any) => {
    setSettings((prev: any) => ({
      ...prev,
      [key]: value
    }));
  };

  const handleExampleClick = (example: any) => {
    if (onGenerateApp) {
      // Use the detailed prompt if available, otherwise use the title
      const prompt = typeof example === 'string' ? example : example.detailedPrompt || example.title;
      onGenerateApp(prompt);
    }
  };

  const handleExampleRightClick = (e: React.MouseEvent, example: any) => {
    e.preventDefault();
    
    // Calculate position to keep menu within viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const menuWidth = 500; // max-width of context menu
    const menuHeight = 400; // max-height of context menu
    
    let x = e.clientX;
    let y = e.clientY;
    
    // Adjust X position if menu would go off right edge
    if (x + menuWidth > viewportWidth) {
      x = viewportWidth - menuWidth - 20; // 20px margin
    }
    
    // Adjust Y position if menu would go off bottom edge
    if (y + menuHeight > viewportHeight) {
      y = viewportHeight - menuHeight - 20; // 20px margin
    }
    
    // Ensure minimum margins from edges
    x = Math.max(20, x);
    y = Math.max(20, y);
    
    setContextMenu({
      visible: true,
      x: x,
      y: y,
      example: example
    });
  };

  const handleAddExample = () => {
    if (newExampleTitle.trim() && newExamplePrompt.trim()) {
      // Add with separate title and detailed prompt
      const newExampleObj = {
        title: newExampleTitle.trim(),
        detailedPrompt: newExamplePrompt.trim()
      };
      setExamples([...examples, newExampleObj]);
      setNewExampleTitle('');
      setNewExamplePrompt('');
      setShowAddExample(false);
    } else if (newExample.trim()) {
      // Fallback for single field (backwards compatibility)
      const newExampleObj = {
        title: newExample.trim(),
        detailedPrompt: newExample.trim()
      };
      setExamples([...examples, newExampleObj]);
      setNewExample('');
      setShowAddExample(false);
    }
  };

  const handleDeleteExample = (index: number) => {
    setExamples(examples.filter((_: any, i: number) => i !== index));
  };

  const addPromptToExamples = (prompt: any) => {
    const newExample = {
      title: prompt.title,
      detailedPrompt: prompt.detailedPrompt || prompt.prompt
    };
    
    // Check if this prompt already exists (avoid duplicates)
    const exists = examples.some((example: any) => example.title === newExample.title);
    if (!exists) {
      setExamples([...examples, newExample]);
    }
  };

  // Close context menu when clicking elsewhere
  React.useEffect(() => {
    const handleClickOutside = () => {
      setContextMenu({ visible: false, x: 0, y: 0, example: null });
    };
    
    if (contextMenu.visible) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [contextMenu.visible]);

  // Close settings panel when clicking elsewhere
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.settings-panel') && !target.closest('.settings-button')) {
        setIsSettingsPanelOpen(false);
      }
    };
    
    if (isSettingsPanelOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isSettingsPanelOpen]);

  // Drag event handlers
  const handleDragStart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Store the initial mouse position relative to the current panel position
    setDragOffset({
      x: e.clientX,
      y: e.clientY
    });
    setIsDragging(true);
  };

  const handleDragMove = React.useCallback((e: MouseEvent) => {
    if (!isDragging) return;
    
    e.preventDefault();
    
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Calculate the delta movement
    const deltaX = e.clientX - dragOffset.x;
    const deltaY = e.clientY - dragOffset.y;
    
    // Update position - use top/right positioning for more intuitive dragging
    let newRight = examplePosition.right - deltaX;
    let newTop = (examplePosition.top || 0) + deltaY;
    
    // Keep within viewport bounds (account for actual panel size)
    const minMargin = 20;
    const maxRight = viewportWidth - panelSize.width - minMargin;
    const maxTop = viewportHeight - panelSize.height - 80; // Leave space for chat bar
    
    newRight = Math.max(minMargin, Math.min(newRight, maxRight));
    newTop = Math.max(80, Math.min(newTop, maxTop)); // Start below the logo
    
    setExamplePosition({ right: newRight, top: newTop });
    
    // Update drag offset for next movement
    setDragOffset({
      x: e.clientX,
      y: e.clientY
    });
  }, [isDragging, dragOffset, examplePosition, panelSize]);

  const handleDragEnd = React.useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add global mouse event listeners for dragging
  React.useEffect(() => {
    if (isDragging) {
      const handleMouseMove = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        handleDragMove(e);
      };
      
      const handleMouseUp = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        handleDragEnd();
      };
      
      // Add listeners to document to catch mouse events outside the component
      document.addEventListener('mousemove', handleMouseMove, { passive: false });
      document.addEventListener('mouseup', handleMouseUp, { passive: false });
      
      // Prevent default drag behavior on images and other elements
      const preventDrag = (e: DragEvent) => e.preventDefault();
      document.addEventListener('dragstart', preventDrag);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('dragstart', preventDrag);
      };
    }
  }, [isDragging, handleDragMove, handleDragEnd]);

  return (
    <div className="desktop">
      <div className="logo-container">
        <svg className="agentic-logo" width="40" height="40" viewBox="0 0 120 120" fill="none">
          <defs>
            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--accent-blue)" />
              <stop offset="50%" stopColor="#00a0ff" />
              <stop offset="100%" stopColor="var(--accent-green)" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <g filter="url(#glow)">
            <path d="M60 15L90 35L75 60L60 50L45 60L30 35Z" fill="url(#logoGradient)" opacity="0.9"/>
            <path d="M45 60L60 50L75 60L90 85L60 105L30 85Z" fill="url(#logoGradient)" opacity="0.6"/>
            <circle cx="60" cy="60" r="12" fill="url(#logoGradient)"/>
          </g>
        </svg>
        <div className="logo-text-container">
          <span className="logo-title">Agentic</span>
          <span className="logo-subtitle">OS</span>
        </div>
      </div>
      
      <div className="desktop-main">
        {currentApp ? (
          <div className="app-display-area">
            <AppRenderer 
              app={currentApp} 
              onClose={handleCloseApp}
              onMinimize={handleMinimizeApp}
            />
          </div>
        ) : (
          <div className="desktop-welcome">
            <div 
              className={`examples-container ${settings.panelOrientation === 'vertical' ? 'vertical-layout' : 'horizontal-layout'} ${isDragging ? 'dragging' : ''}`}
              style={{
                right: `${examplePosition.right}px`,
                top: `${examplePosition.top || 20}px`,
                cursor: isDragging ? 'grabbing' : 'auto'
              }}
            >
              <div className="examples-header">
                <div 
                  className="drag-handle"
                  onMouseDown={handleDragStart}
                  title="Click and drag to move this panel"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M7,19V17H9V19H7M11,19V17H13V19H11M15,19V17H17V19H15M7,15V13H9V15H7M11,15V13H13V15H11M15,15V13H17V15H15M7,11V9H9V11H7M11,11V9H13V11H11M15,11V9H17V11H15M7,7V5H9V7H7M11,7V5H13V7H11M15,7V5H17V7H15Z"/>
                  </svg>
                </div>
                <span className="examples-title">Quick Start</span>
                <div className="header-actions">
                  <button 
                    className="icon-btn"
                    onClick={() => setIsPromptDrawerOpen(true)}
                    title="Marketplace"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 7H16V6A4 4 0 0 0 8 6V7H5A1 1 0 0 0 4 8V19A3 3 0 0 0 7 22H17A3 3 0 0 0 20 19V8A1 1 0 0 0 19 7ZM10 6A2 2 0 0 1 14 6V7H10V6ZM18 19A1 1 0 0 1 17 20H7A1 1 0 0 1 6 19V9H8V10A1 1 0 0 0 10 10A1 1 0 0 0 10 8V9H14V10A1 1 0 0 0 16 10A1 1 0 0 0 14 8V9H18V19Z"/>
                    </svg>
                  </button>
                  <button 
                    className="icon-btn"
                    onClick={onShowApiStatus}
                    title="Settings"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.22,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.22,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.68 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z"/>
                    </svg>
                  </button>
                </div>
              </div>
              <div className="example-grid" style={{
                gridTemplateColumns: (() => {
                  const totalItems = examples.length + 1; // +1 for add button
                  if (totalItems <= 2) return 'repeat(2, 1fr)';
                  if (totalItems <= 6) return 'repeat(3, 1fr)';
                  if (totalItems <= 12) return 'repeat(4, 1fr)';
                  if (totalItems <= 20) return 'repeat(5, 1fr)';
                  return 'repeat(6, 1fr)';
                })(),
                gap: (() => {
                  const totalItems = examples.length + 1;
                  if (totalItems <= 6) return '16px';
                  if (totalItems <= 12) return '12px';
                  if (totalItems <= 20) return '10px';
                  return '8px';
                })(),
                '--example-font-size': (() => {
                  const totalItems = examples.length + 1;
                  if (totalItems <= 6) return '0.9rem';
                  if (totalItems <= 12) return '0.8rem';
                  if (totalItems <= 20) return '0.75rem';
                  return '0.7rem';
                })(),
                '--example-min-height': (() => {
                  const totalItems = examples.length + 1;
                  if (totalItems <= 6) return '80px';
                  if (totalItems <= 12) return '70px';
                  if (totalItems <= 20) return '60px';
                  return '50px';
                })(),
                '--example-padding': (() => {
                  const totalItems = examples.length + 1;
                  if (totalItems <= 6) return '12px';
                  if (totalItems <= 12) return '10px';
                  if (totalItems <= 20) return '8px';
                  return '6px';
                })()
              } as React.CSSProperties & { [key: string]: string }}>
                {examples.map((example: any, index: number) => (
                  <div key={index} className="example-item-wrapper">
                    <div 
                      className="example-item"
                      onClick={() => handleExampleClick(example)}
                      onContextMenu={(e) => handleExampleRightClick(e, example)}
                    >
                      {typeof example === 'string' ? example : example.title}
                    </div>
                    <button 
                      className="delete-example"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteExample(index);
                      }}
                      title="Delete example"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19,4H15.5L14.5,3H9.5L8.5,4H5V6H19M6,19A2,2 0 0,0 8,21H16A2,2 0 0,0 18,19V7H6V19Z"/>
                      </svg>
                    </button>
                  </div>
                ))}
                {showAddExample ? (
                  <div className="add-example-form">
                    <input
                      type="text"
                      value={newExampleTitle}
                      onChange={(e) => setNewExampleTitle(e.target.value)}
                      placeholder="Title (appears on button)"
                      className="add-example-input"
                      autoFocus
                    />
                    <textarea
                      value={newExamplePrompt}
                      onChange={(e) => setNewExamplePrompt(e.target.value)}
                      placeholder="Detailed prompt (appears on right-click)"
                      className="add-example-textarea"
                      rows={3}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && e.ctrlKey) {
                          handleAddExample();
                        }
                      }}
                    />
                    <div className="add-example-buttons">
                      <button onClick={handleAddExample} className="confirm-add" title="Ctrl+Enter to save">✓</button>
                      <button onClick={() => {
                        setShowAddExample(false);
                        setNewExampleTitle('');
                        setNewExamplePrompt('');
                      }} className="cancel-add">×</button>
                    </div>
                  </div>
                ) : (
                  <div 
                    className="add-example-btn"
                    onClick={() => setShowAddExample(true)}
                  >
                    +
                  </div>
                )}
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
        onAddToExamples={addPromptToExamples}
      />

      {/* Context Menu for Example Prompts */}
      {contextMenu.visible && (
        <div 
          className="context-menu"
          style={{ 
            position: 'fixed', 
            left: contextMenu.x, 
            top: contextMenu.y,
            zIndex: 1001
          }}
        >
          <div className="context-menu-item">
            <div className="context-menu-title">Full Prompt:</div>
            <div className="context-menu-content">
              {typeof contextMenu.example === 'string' 
                ? contextMenu.example 
                : contextMenu.example.detailedPrompt || contextMenu.example.title}
            </div>
          </div>
        </div>
      )}

      {/* Settings Button */}
      <button 
        className="settings-button"
        onClick={() => setIsSettingsPanelOpen(!isSettingsPanelOpen)}
        title="Settings"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.22,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.22,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.68 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z"/>
        </svg>
      </button>

      {/* Settings Panel */}
      {isSettingsPanelOpen && (
        <div className="settings-panel">
          <div className="settings-panel-header">
            <h3 className="settings-panel-title">Settings</h3>
            <button 
              className="settings-close-btn"
              onClick={() => setIsSettingsPanelOpen(false)}
            >
              ×
            </button>
          </div>

          <div className="settings-section">
            <h4 className="settings-section-title">Appearance</h4>
            
            <div className="settings-option">
              <span className="settings-label">Theme</span>
              <div className="settings-control">
                <select 
                  className="settings-select"
                  value={settings.theme}
                  onChange={(e) => handleSettingChange('theme', e.target.value)}
                >
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                  <option value="auto">Auto</option>
                </select>
              </div>
            </div>

            <div className="settings-option">
              <span className="settings-label">Accent Color</span>
              <div className="settings-control">
                <input 
                  type="color"
                  className="color-picker"
                  value={settings.accentColor}
                  onChange={(e) => handleSettingChange('accentColor', e.target.value)}
                />
              </div>
            </div>

            <div className="settings-option">
              <span className="settings-label">Font Size</span>
              <div className="settings-control">
                <select 
                  className="settings-select"
                  value={settings.fontSize}
                  onChange={(e) => handleSettingChange('fontSize', e.target.value)}
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>
            </div>

            <div className="settings-option">
              <span className="settings-label">Main Font</span>
              <div className="settings-control">
                <select 
                  className="settings-select"
                  value={settings.mainFont}
                  onChange={(e) => handleSettingChange('mainFont', e.target.value)}
                >
                  <option value="Inter">Inter</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Open Sans">Open Sans</option>
                  <option value="Lato">Lato</option>
                  <option value="Poppins">Poppins</option>
                  <option value="Montserrat">Montserrat</option>
                  <option value="Source Sans Pro">Source Sans Pro</option>
                  <option value="Arial">Arial</option>
                  <option value="Helvetica">Helvetica</option>
                </select>
              </div>
            </div>

            <div className="settings-option">
              <span className="settings-label">Panel Font</span>
              <div className="settings-control">
                <select 
                  className="settings-select"
                  value={settings.panelFont}
                  onChange={(e) => handleSettingChange('panelFont', e.target.value)}
                >
                  <option value="Inter">Inter</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Open Sans">Open Sans</option>
                  <option value="Lato">Lato</option>
                  <option value="Poppins">Poppins</option>
                  <option value="Montserrat">Montserrat</option>
                  <option value="Source Sans Pro">Source Sans Pro</option>
                  <option value="JetBrains Mono">JetBrains Mono</option>
                  <option value="Fira Code">Fira Code</option>
                  <option value="Courier New">Courier New</option>
                </select>
              </div>
            </div>
          </div>

          <div className="settings-section">
            <h4 className="settings-section-title">Layout</h4>
            
            <div className="settings-option">
              <span className="settings-label">Panel Orientation</span>
              <div className="settings-control">
                <select 
                  className="settings-select"
                  value={settings.panelOrientation}
                  onChange={(e) => handleSettingChange('panelOrientation', e.target.value)}
                >
                  <option value="horizontal">Horizontal</option>
                  <option value="vertical">Vertical</option>
                </select>
              </div>
            </div>

            <div className="settings-option">
              <span className="settings-label">Animations</span>
              <div className="settings-control">
                <div 
                  className={`settings-toggle ${settings.animations ? 'active' : ''}`}
                  onClick={() => handleSettingChange('animations', !settings.animations)}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Desktop;
