# Agentic OS Prototype

A web-based operating system prototype featuring an agentic interface for dynamic app generation. Users can interact with specialized AI agents to create applications on-demand through natural language prompts.

## Features

### 🖥️ OS-Like Interface
- Desktop environment with seamless app integration
- Single-focus app display with scrollable history
- Modern dark theme with smooth animations
- OS-style window controls and navigation

### 🤖 Intelligent Agent System
- **App Generator**: Creates interactive applications (calculators, tools, etc.)
- **Utility Agent**: Simple tools and utilities
- **Widget Agent**: Dashboard components and widgets  
- **Game Agent**: Simple games and entertainment

### 🚀 Dynamic App Generation
- Natural language prompts for app creation
- Real-time code generation via AI APIs
- Secure sandboxed execution environment
- Instant app deployment and rendering

### 💬 Integrated Chat Interface
- Agent selection dropdown
- Persistent chat history
- Real-time generation status
- Context-aware conversations

## Architecture

```
┌─────────────────────────────────────┐
│           Desktop Area              │
│     (Generated App Renders Here)    │
│                                     │
│         ┌─ App History Scroll       │
│         │  (previous apps)          │
├─────────────────────────────────────┤
│ [Agent ▼] [Chat Input...] [Send]    │
└─────────────────────────────────────┘
```

## Getting Started

### Prerequisites
- Node.js 16+ and npm
- Modern web browser with JavaScript enabled

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd agentic-os-prototype
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
npm run preview
```

## Usage

1. **Select an Agent**: Choose from the dropdown (App Generator, Utilities, etc.)
2. **Describe Your App**: Type what you want to create (e.g., "create a calculator")
3. **Generate & Interact**: The agent generates and displays your app instantly
4. **Access History**: Scroll through previously generated apps in the history panel

### Example Prompts
- "Create a calculator app"
- "Make a simple todo list" 
- "Generate a timer widget"
- "Build a tic-tac-toe game"

## Technology Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: CSS Custom Properties + CSS Modules
- **AI Integration**: Configurable AI API endpoints
- **Execution**: Sandboxed iframe environment

## Project Structure

```
src/
├── components/          # React components
│   ├── Desktop.tsx     # Main desktop environment
│   ├── ChatBar.tsx     # Chat interface
│   ├── AppRenderer.tsx # App execution environment
│   ├── AgentSelector.tsx # Agent selection
│   └── ...
├── types.ts            # TypeScript definitions
├── App.tsx             # Main application
└── index.css           # Global styles
```

## Configuration

### Adding New Agents
1. Define agent in `AVAILABLE_AGENTS` array
2. Add generation logic in `generateApp` function
3. Create agent-specific templates and prompts

### AI API Integration
Replace the mock generation in `generateApp` with actual AI API calls:
```typescript
const response = await fetch('/api/generate', {
  method: 'POST',
  body: JSON.stringify({ prompt, agentType: agent.id })
});
```

## Security

- Apps execute in sandboxed iframes with restricted permissions
- No access to parent window or external resources
- Input sanitization for generated code
- CSP headers recommended for production

## Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production  
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Future Enhancements

- [ ] Real AI API integration (OpenAI, Anthropic, etc.)
- [ ] App persistence and sharing
- [ ] Multi-app workspace support
- [ ] Advanced agent capabilities
- [ ] Plugin system for custom agents
- [ ] Export/import functionality
- [ ] Collaborative features

## License

MIT License - see LICENSE file for details

## Support

For questions, issues, or contributions, please open an issue on GitHub or contact the development team.
