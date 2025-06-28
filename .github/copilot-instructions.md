<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Agentic OS Prototype Instructions

This project is an OS prototype with an agentic interface for dynamic app generation. Key architectural principles:

## Core Concepts
- **OS Environment**: Desktop-style interface with seamless app integration
- **Agent System**: Multiple specialized agents for different app types
- **Dynamic Generation**: Apps generated on-demand via AI APIs
- **Single Focus**: One app displayed at a time with scrollable history
- **Isolated Execution**: Apps run in sandboxed iframes for security

## Component Structure
- `Desktop`: Main workspace area with welcome screen and app rendering
- `ChatBar`: Bottom interface with agent selector and input
- `AppRenderer`: Secure iframe-based app execution environment
- `AgentSelector`: Dropdown for choosing specialized agents
- `AppHistory`: Scrollable list of previously generated apps

## Styling Guidelines
- Use CSS custom properties defined in index.css
- Maintain dark theme consistency
- Smooth animations for transitions
- OS-like visual elements (window controls, etc.)

## Agent Development
- Each agent should specialize in specific app types
- Use consistent prompt templates for generation
- Include proper error handling for AI API calls
- Generate complete HTML/CSS/JS for functional apps

When adding new features, maintain the OS metaphor and ensure seamless integration.
