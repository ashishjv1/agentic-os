import React, { useState } from 'react';
import { GeneratedApp } from '../types';
import AppRenderer from './AppRenderer';
import PromptDrawer from './PromptDrawer';
import './Desktop.css';

interface DesktopProps {
  currentApp: GeneratedApp | null;
  onCloseApp: () => void;
  onMinimizeApp: () => void;
  onShowApiStatus: () => void;
  onGenerateApp?: (prompt: string) => void;
  selectedAgent: string;
}

const Desktop: React.FC<DesktopProps> = ({ 
  currentApp, 
  onCloseApp,
  onMinimizeApp,
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
      fontSize: 'medium',
      panelFont: 'Inter',
      textColor: '#ffffff'
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
        // Only set default text color if no custom color is set
        if (!settings.textColor || settings.textColor === '#ffffff') {
          root.style.setProperty('--text-primary', '#212529');
        } else {
          root.style.setProperty('--text-primary', settings.textColor);
        }
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
        // Always use the custom text color or default white for dark theme
        root.style.setProperty('--text-primary', settings.textColor || '#ffffff');
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
          root.style.setProperty('--text-primary', settings.textColor || '#ffffff');
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
          if (!settings.textColor || settings.textColor === '#ffffff') {
            root.style.setProperty('--text-primary', '#212529');
          } else {
            root.style.setProperty('--text-primary', settings.textColor);
          }
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
      { title: "Expense Tracker", detailedPrompt: "Create a personal expense tracker with categories (food, transport, entertainment, etc.), monthly budget goals, visual spending charts, and the ability to add/edit/delete expenses. Include localStorage for data persistence and export functionality." },
      { title: "Password Generator", detailedPrompt: "Build a secure password generator with customizable options: length (8-128 chars), include/exclude uppercase, lowercase, numbers, symbols. Add strength indicator, copy to clipboard, and save generated passwords with labels." },
      { title: "Pomodoro Timer", detailedPrompt: "Design a Pomodoro productivity timer with 25-minute work sessions and 5-minute breaks. Include session counter, progress visualization, notification sounds, pause/resume functionality, and customizable time intervals." },
      { title: "Habit Tracker", detailedPrompt: "Create a habit tracking app where users can add daily habits, mark them complete, view streak counters, and see visual progress with calendar heatmaps. Include weekly/monthly statistics and motivational quotes." },
      { title: "Recipe Manager", detailedPrompt: "Build a recipe management app with ingredient lists, cooking instructions, prep/cook times, difficulty ratings, and search functionality. Include favorites, categories (breakfast, dinner, etc.), and shopping list generation." },
      { title: "Markdown Editor", detailedPrompt: "Create a live markdown editor with split-pane view (editor/preview), syntax highlighting, export to HTML/PDF, table of contents generation, and common formatting shortcuts. Include dark/light themes." },
      { title: "Color Palette Generator", detailedPrompt: "Design a color palette generator that creates harmonious color schemes from a base color. Include different harmony types (complementary, triadic, analogous), hex/rgb/hsl values, copy functionality, and palette export." },
      { title: "QR Code Generator", detailedPrompt: "Build a QR code generator that converts text, URLs, WiFi credentials, or contact info into QR codes. Include customizable size, error correction levels, download functionality, and batch generation." },
      { title: "Memory Game", detailedPrompt: "Create an interactive memory card matching game with multiple difficulty levels, themes (animals, flags, emojis), high score tracking, timer, move counter, and smooth flip animations." },
      { title: "URL Shortener", detailedPrompt: "Design a URL shortener service with custom short codes, click tracking, expiration dates, QR code generation for short links, and analytics dashboard showing click statistics and geographic data." },
      { title: "Drawing Canvas", detailedPrompt: "Build a digital drawing canvas with brush tools, color picker, different brush sizes, layers, undo/redo functionality, save/load drawings, and export as PNG/SVG. Include drawing templates and stamps." },
      { title: "Word Counter", detailedPrompt: "Create a text analysis tool that counts words, characters, paragraphs, reading time estimation, keyword density, and provides readability scores. Include real-time analysis and text formatting options." },
      { title: "Calculator", detailedPrompt: "Build a scientific calculator with standard arithmetic operations, advanced functions (sin, cos, tan, log, sqrt), memory storage, calculation history, keyboard shortcuts, and both basic and scientific modes with a clean, responsive interface." },
      { title: "Todo List", detailedPrompt: "Create a feature-rich todo list with drag-and-drop reordering, priority levels, due dates, categories/tags, progress tracking, search functionality, data export, and local storage persistence. Include filters for completed, pending, and overdue tasks." },
      { title: "Weather App", detailedPrompt: "Design a weather dashboard with current conditions, 7-day forecast, hourly predictions, weather maps, location search, favorite cities, weather alerts, and beautiful weather icons. Include temperature units toggle and background themes." },
      { title: "Note Taking", detailedPrompt: "Build a note-taking app with rich text editing, categories/folders, tagging system, search functionality, export options (PDF, TXT), auto-save, and synchronization indicators. Include formatting toolbar and keyboard shortcuts." },
      { title: "Image Resizer", detailedPrompt: "Create an image resizing tool that allows users to upload images, resize by percentage or exact dimensions, maintain aspect ratio, apply filters (brightness, contrast, saturation), and download processed images in multiple formats." },
      { title: "Unit Converter", detailedPrompt: "Design a comprehensive unit converter supporting length, weight, temperature, volume, area, speed, and data units. Include search functionality, conversion history, favorite conversions, and real-time conversion as you type." },
      { title: "Music Player", detailedPrompt: "Build a web-based music player with playlist creation, shuffle/repeat modes, volume control, progress bar with seek functionality, music library organization, and visualizer effects. Support multiple audio formats and keyboard controls." },
      { title: "Chat Bot", detailedPrompt: "Create an AI-powered chatbot interface with conversation history, typing indicators, message timestamps, emoji support, conversation export, and different chat themes. Include predefined quick responses and conversation starters." },
      { title: "Password Manager", detailedPrompt: "Build a secure password manager with categories for different accounts, search functionality, password strength indicators, auto-generate secure passwords, encrypted local storage, and master password protection with timeout." },
      { title: "Code Snippet Manager", detailedPrompt: "Create a code snippet organizer with syntax highlighting for multiple languages, tags/categories, search functionality, copy to clipboard, export/import features, and code execution preview for web technologies." },
      { title: "File Organizer", detailedPrompt: "Design a file management tool that helps organize files by type, date, size, with bulk rename functionality, duplicate detection, storage analytics, folder structure visualization, and batch file operations." },
      { title: "Time Zone Converter", detailedPrompt: "Build a world clock and timezone converter with multiple cities, meeting scheduler across timezones, daylight saving time awareness, countdown timers, and time zone comparison view with visual time bars." },
      { title: "Expense Splitter", detailedPrompt: "Create a bill splitting app for groups, with expense categorization, multiple split methods (equal, percentage, custom amounts), debt tracking between people, expense history, and settlement suggestions." },
      { title: "Meditation Timer", detailedPrompt: "Design a meditation app with customizable session lengths, ambient sounds, guided breathing exercises, progress tracking, streak counters, different meditation types, and mindfulness reminders." },
      { title: "Virtual Keyboard", detailedPrompt: "Build an on-screen virtual keyboard with multiple layouts (QWERTY, DVORAK, international), key sound effects, customizable themes, accessibility features, and support for special characters and emojis." },
      { title: "Invoice Generator", detailedPrompt: "Create a professional invoice generator with client management, itemized billing, tax calculations, multiple templates, PDF export, payment tracking, recurring invoices, and company branding options." },
      { title: "Flashcard App", detailedPrompt: "Build a study flashcard application with spaced repetition algorithm, multiple card types (text, image, audio), categories/decks, progress tracking, study statistics, and export/import functionality." },
      { title: "Budget Planner", detailedPrompt: "Design a comprehensive budget planning tool with income/expense categories, monthly/yearly views, savings goals, spending alerts, visual charts, bill reminders, and financial goal tracking." },
      { title: "Calendar Scheduler", detailedPrompt: "Create a calendar application with event creation, recurring events, reminders, different view modes (month, week, day), color-coded categories, event search, and integration with holiday calendars." },
      { title: "Markdown to HTML", detailedPrompt: "Build a markdown to HTML converter with live preview, custom CSS styling options, syntax highlighting for code blocks, table support, export functionality, and common markdown extensions." },
      { title: "Pixel Art Editor", detailedPrompt: "Design a pixel art creation tool with grid-based canvas, color palette, drawing tools (pencil, fill, line, rectangle), layers, animation frames, zoom functionality, and export as GIF/PNG." },
      { title: "Screen Recorder", detailedPrompt: "Create a screen recording tool with area selection, webcam overlay, audio recording, countdown timer, recording controls, multiple output formats, and playback functionality with basic editing options." },
      { title: "Link Organizer", detailedPrompt: "Build a bookmark manager with categories, tags, search functionality, link validation, duplicate detection, bulk import/export, visual previews, and sharing options for bookmark collections." }
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
  
  // Scroll form into view when opened
  React.useEffect(() => {
    if (showAddExample) {
      setTimeout(() => {
        const form = document.querySelector('.add-example-form');
        if (form) {
          form.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center',
            inline: 'nearest'
          });
        }
      }, 100); // Small delay to allow DOM update
    }
  }, [showAddExample]);
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
    // Always start with default position on page load/refresh for consistent experience
    return { right: 20, top: 80 };
  });

  // Save example position to localStorage
  React.useEffect(() => {
    try {
      localStorage.setItem('agentic-os-example-position', JSON.stringify(examplePosition));
    } catch (error) {
      console.warn('Failed to save example position to localStorage:', error);
    }
  }, [examplePosition]);

  // Save and load panel size to localStorage - but always reset to default on page load
  const [panelSize, setPanelSize] = useState(() => {
    // Always start with default size on page load/refresh for consistent experience
    return { width: 500, height: 400 };
  });

  // Track when we're programmatically setting the size to avoid ResizeObserver loops
  const isSettingSizeRef = React.useRef(false);
  
  // Force re-render key to trigger grid recalculation
  const [renderKey, setRenderKey] = useState(0);

  // Set initial panel size CSS variables on mount - always reset to default
  React.useEffect(() => {
    const root = document.documentElement;
    isSettingSizeRef.current = true;
    
    // Always use default size on page load
    const defaultWidth = 500;
    const defaultHeight = 400;
    
    root.style.setProperty('--panel-width', `${defaultWidth}px`);
    root.style.setProperty('--panel-height', `${defaultHeight}px`);
    
    // Ensure state matches default and force re-render
    setPanelSize({ width: defaultWidth, height: defaultHeight });
    
    // Force a re-render after a short delay to ensure grid calculations are correct
    setTimeout(() => {
      setPanelSize({ width: defaultWidth, height: defaultHeight });
      setRenderKey(prev => prev + 1); // Force re-render to recalculate grid
      isSettingSizeRef.current = false;
    }, 150);
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
    setSettings((prev: any) => {
      const newSettings = {
        ...prev,
        [key]: value
      };
      
      // Auto-update text color to appropriate default when theme changes
      if (key === 'theme') {
        if (value === 'light' && (prev.textColor === '#ffffff' || !prev.textColor)) {
          newSettings.textColor = '#212529'; // Dark text for light theme
        } else if ((value === 'dark' || value === 'auto') && (prev.textColor === '#212529' || !prev.textColor)) {
          newSettings.textColor = '#ffffff'; // Light text for dark theme
        }
      }
      
      return newSettings;
    });
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
              className={`examples-container vertical-layout ${isDragging ? 'dragging' : ''}`}
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
                  <button 
                    className="reset-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Reset panel size and position
                      setPanelSize({ width: 500, height: 400 });
                      setExamplePosition({ right: 20, top: 80 });
                      setRenderKey(prev => prev + 1); // Force grid recalculation
                    }}
                    title="Reset panel size and position"
                  >
                    ⌂
                  </button>
                </div>
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
              <div key={renderKey} className="example-grid" style={{
                gridTemplateColumns: 'repeat(2, 1fr)', // Always use vertical layout (2 columns)
                gap: '14px',
                '--example-font-size': '0.85rem',
                '--example-min-height': '75px',
                '--example-padding': '12px'
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
                  <div className="add-example-form" style={{
                    gridColumn: 'span 2', // Span across multiple columns for more space
                    aspectRatio: 'auto',
                    minHeight: '180px',
                    height: 'auto'
                  }}>
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
              <span className="settings-label">Text Color</span>
              <div className="settings-control">
                <input 
                  type="color"
                  className="color-picker"
                  value={settings.textColor}
                  onChange={(e) => handleSettingChange('textColor', e.target.value)}
                />
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
        </div>
      )}
    </div>
  );
};

export default Desktop;
