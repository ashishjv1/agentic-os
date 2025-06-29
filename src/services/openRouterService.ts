import PromptService from './promptService';
import NewsService from './newsService';

export interface AIConfig {
  provider: 'openai' | 'anthropic' | 'openrouter';
  apiKey: string;
  baseUrl: string;
  endpoint: string;
  model: string;
}

export interface GenerationRequest {
  prompt: string;
  agentType: string;
  context?: string;
  abortSignal?: AbortSignal;
}

export interface GenerationResponse {
  html: string;
  css: string;
  js: string;
  name: string;
  description: string;
}

class AIService {
  private config: AIConfig;
  private fallbackModels: Record<string, string[]> = {
    openrouter: [
      'deepseek/deepseek-chat-v3-0324:free',
      'microsoft/wizardlm-2-8x22b:free', 
      'anthropic/claude-3-haiku:free',
      'meta-llama/llama-3.2-3b-instruct:free',
      'qwen/qwen-2.5-7b-instruct:free',
      'google/gemma-2-9b-it:free'
    ],
    openai: [
      'gpt-4o-mini',
      'gpt-3.5-turbo',
      'gpt-4'
    ],
    anthropic: [
      'claude-3-5-haiku-20241022',
      'claude-3-5-sonnet-20241022'
    ]
  };

  constructor(config: AIConfig) {
    this.config = config;
  }

  async generateApp(request: GenerationRequest): Promise<GenerationResponse> {
    console.log('🔧 OpenRouter Service - Starting generation...');
    console.log('Request:', request);
    console.log('Config:', { 
      baseUrl: this.config.baseUrl, 
      model: this.config.model,
      hasApiKey: !!this.config.apiKey
    });
    
    const systemPrompt = this.getSystemPrompt(request.agentType);
    const userPrompt = await this.buildUserPrompt(request);
    
    console.log('📝 System prompt length:', systemPrompt.length);
    console.log('📝 User prompt length:', userPrompt.length);
    console.log('📝 User prompt preview:', userPrompt.substring(0, 300) + '...');

    // Try the primary model first, then fallbacks
    const fallbackList = this.fallbackModels[this.config.provider] || [];
    const modelsToTry = [this.config.model, ...fallbackList.filter(m => m !== this.config.model)];
    
    let lastError: Error | null = null;
    
    for (const model of modelsToTry) {
      try {
        console.log(`📡 Trying model: ${model}`);
        const result = await this.tryGenerateWithModel(model, systemPrompt, userPrompt, request);
        console.log(`✅ Success with model: ${model}`);
        return result;
      } catch (error) {
        if (error instanceof Error) {
          console.warn(`❌ Model ${model} failed:`, error.message);
          lastError = error;
        } else {
          console.warn(`❌ Model ${model} failed:`, String(error));
          lastError = new Error(String(error));
        }
        continue;
      }
    }
    
    throw new Error(`All models failed. Last error: ${lastError?.message}`);
  }

  private async tryGenerateWithModel(
    model: string, 
    systemPrompt: string, 
    userPrompt: string, 
    request: GenerationRequest
  ): Promise<GenerationResponse> {

    // Check if API key is configured
    if (!this.config.apiKey || this.config.apiKey === '' || this.config.apiKey === 'your_openrouter_api_key_here') {
      throw new Error('No API key configured. Please open the settings panel (⚙️ icon) and add your API keys to generate apps.');
    }

    try {
      console.log('📡 Making API request to:', `${this.config.baseUrl}${this.config.endpoint}`);
      console.log('📡 Using provider:', this.config.provider);
      console.log('📡 Using model:', model);
      
      // Prepare headers based on provider
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      // Prepare request body based on provider
      let requestBody: any;

      if (this.config.provider === 'openai' || this.config.provider === 'openrouter') {
        headers['Authorization'] = `Bearer ${this.config.apiKey}`;
        if (this.config.provider === 'openrouter') {
          headers['HTTP-Referer'] = window.location.origin;
          headers['X-Title'] = 'Agentic OS Prototype';
        }
        
        requestBody = {
          model: model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 6000,
          stream: false
        };
      } else if (this.config.provider === 'anthropic') {
        headers['Authorization'] = `Bearer ${this.config.apiKey}`;
        headers['anthropic-version'] = '2023-06-01';
        
        requestBody = {
          model: model,
          messages: [
            { role: 'user', content: `${systemPrompt}\n\n${userPrompt}` }
          ],
          max_tokens: 6000,
          temperature: 0.7
        };
      }

      // Use fetch for the API call
      const response = await fetch(`${this.config.baseUrl}${this.config.endpoint}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
        signal: request.abortSignal
      });

      console.log('✅ API Response status:', response.status);
      console.log('✅ API Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error Response:', errorText);
        console.error('❌ Request headers check:', {
          hasAuthHeader: !!this.config.apiKey,
          authHeaderFormat: this.config.apiKey ? 'Bearer [REDACTED]' : 'MISSING',
          contentType: 'application/json',
          baseUrl: this.config.baseUrl
        });
        throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('✅ API Response data:', data);

      // Extract content based on provider response format
      let content: string;
      if (this.config.provider === 'anthropic') {
        content = data.content?.[0]?.text;
      } else {
        // OpenAI and OpenRouter format
        content = data.choices?.[0]?.message?.content;
      }
      
      if (!content) {
        throw new Error(`No content received from ${this.config.provider}`);
      }

      console.log('📄 Raw content from AI:', content);
      const parsed = this.parseResponse(content, request.prompt);
      console.log('✅ Parsed response:', parsed);
      
      return parsed;
    } catch (error) {
      if (error instanceof Error) {
        console.error('❌ OpenRouter API Error Details:', {
          message: error.message,
          stack: error.stack
        });
      } else {
        console.error('❌ OpenRouter API Error Details:', error);
      }
      throw error; // Re-throw without wrapping to allow fallback logic
    }
  }

  private getSystemPrompt(agentType: string): string {
    // Check if there's a custom prompt selected for this agent
    const selectedPrompt = PromptService.getSelectedPromptForAgent(agentType);
    
    const basePrompt = `You are an expert web developer creating functional web applications. 

CRITICAL: You must respond with ONLY a valid JSON object. No other text before or after.

The JSON must have exactly this structure:
{
  "name": "App Name",
  "description": "Brief description",
  "html": "Complete HTML structure",
  "css": "Complete CSS styling", 
  "js": "Complete JavaScript functionality"
}

Requirements for the generated app:
- Create fully functional, interactive applications
- Use modern CSS with the provided CSS variables for theming
- Include proper event handlers and interactivity
- Make apps responsive and accessible
- Use semantic HTML structure
- Ensure all functionality works without external dependencies
- CRITICAL: Do NOT reference external files (no <link> tags for CSS, no <script src=""> tags)
- All CSS must be inline in the <style> section
- All JavaScript must be inline - no external JS files
- JavaScript REQUIREMENTS:
  * Write simple, direct JavaScript that works in a basic HTML page
  * Use document.getElementById() to find elements by ID
  * Use .onclick = function() { } for simple button clicks
  * OR use addEventListener('click', function() { }) if you prefer
  * Make sure every interactive element has a unique ID
  * Test your code - it will run directly in an iframe
  * Example:
    HTML: <button id="myBtn">Click me</button>
    JS: document.getElementById('myBtn').onclick = function() { alert('Clicked!'); };
  * Keep it simple - no complex frameworks or libraries needed
- Style for dark theme with these CSS variables:
  --bg-primary: #1a1a1a
  --bg-secondary: #2d2d2d
  --bg-tertiary: #3a3a3a
  --text-primary: #ffffff
  --text-secondary: #b0b0b0
  --accent-blue: #007acc
  --accent-green: #4caf50
  --border-color: #404040
  --border-radius: 8px

IMPORTANT: 
- The HTML should be complete and functional
- The CSS should include all necessary styling  
- The JavaScript should handle all interactions without syntax errors
- Make sure the JSON is properly formatted and closed
- Do not include any explanatory text outside the JSON
- Test your JavaScript syntax carefully - avoid quotes/escaping issues`;

    // Use custom prompt if available, otherwise use default agent-specific prompt
    if (selectedPrompt && selectedPrompt.agentPrompt) {
      return basePrompt + '\n\n' + selectedPrompt.agentPrompt;
    }

    const agentSpecific = {
      'app-generator': `
You specialize in creating interactive applications like calculators, converters, text editors, forms, and productivity tools.
Focus on functionality and user experience.`,
      'utility-agent': `
You create simple utility tools like timers, counters, unit converters, password generators, and small helper apps.
Prioritize simplicity and usefulness.`,
      'widget-agent': `
You build dashboard widgets like clocks, weather displays, progress bars, charts, and status indicators.
Focus on visual appeal and real-time updates.`,
      'game-agent': `
You create simple games like tic-tac-toe, memory games, word games, puzzles, and interactive entertainment.
Emphasize fun gameplay and clear rules.`,
      'info-agent': `
You specialize in creating information apps that display current news, research results, fact sheets, and knowledge summaries.
Focus on presenting information in an organized, readable format with proper citations and sources.
Create apps that display research results, news summaries, fact comparisons, timelines, and informational dashboards.`
    };

    type AgentType = keyof typeof agentSpecific;
    const agentKey = (agentType in agentSpecific ? agentType : 'app-generator') as AgentType;

    return basePrompt + agentSpecific[agentKey];
  }

  private async buildUserPrompt(request: GenerationRequest): Promise<string> {
    // Check if there's a custom prompt selected for this agent
    const selectedPrompt = PromptService.getSelectedPromptForAgent(request.agentType);
    
    console.log('🎯 buildUserPrompt: Agent type:', request.agentType);
    console.log('🎯 buildUserPrompt: Selected prompt:', selectedPrompt);
    
    let prompt = `Create a web application based on this request: "${request.prompt}"`;
    
    // Special handling for info-agent: search for current information
    if (request.agentType === 'info-agent') {
      try {
        console.log('🔍 Info agent detected, searching for current information...');
        const searchResult = await NewsService.searchGeneral(request.prompt);
        
        prompt += `\n\nCURRENT INFORMATION SEARCH RESULTS for "${request.prompt}":`;
        searchResult.items.forEach((item, index) => {
          prompt += `\n\n${index + 1}. **${item.title}**
   Source: ${item.source}
   Published: ${new Date(item.publishedAt).toLocaleDateString()}
   Description: ${item.description}
   URL: ${item.url}`;
        });
        
        prompt += `\n\nPlease create an informative app that presents this information in a clean, organized format. Include:
- A clear title and summary
- Well-organized sections for each search result
- Source citations
- Publication dates
- Clean, readable typography
- Links to original sources (make them look like links but note they're placeholder URLs)`;
        
      } catch (error) {
        console.warn('⚠️ News search failed, proceeding without current data:', error);
        prompt += `\n\nNote: Unable to fetch current information. Please create an informational app about "${request.prompt}" using your knowledge base.`;
      }
    }
    
    // Add custom prompt instructions if available
    // REMOVED: Custom agent instructions are no longer automatically added to avoid cluttering prompts
    
    // Different instructions based on agent type
    if (request.agentType === 'info-agent') {
      prompt += `

Please generate a complete, informational web app with:
1. Clean, readable layout optimized for information consumption
2. Proper typography hierarchy (headings, subheadings, body text)
3. Organized sections and clear information structure
4. Source citations and attribution
5. Professional styling suitable for research and reference

Focus on:
- Information clarity and readability
- Logical organization of content
- Professional appearance
- Easy navigation through information
- Proper citation format`;
    } else {
      prompt += `

Please generate a complete, functional web app with:
1. Proper HTML structure with unique IDs for interactive elements
2. Attractive CSS styling (dark theme)
3. Interactive JavaScript functionality that actually works
4. Responsive design
5. Clear user interface

CRITICAL JavaScript Requirements:
- All interactive elements (buttons, inputs, etc.) must have unique IDs
- Use addEventListener() to attach event handlers
- Ensure all event listeners target existing DOM elements
- Test that buttons and interactions actually work
- Use document.getElementById() or document.querySelector() to find elements
- Make sure the JavaScript executes after the DOM is ready

Example JavaScript structure:
document.addEventListener('DOMContentLoaded', function() {
    const button = document.getElementById('myButton');
    if (button) {
        button.addEventListener('click', function() {
            // Your functionality here
        });
    }
});

The app should be self-contained and work immediately when rendered with all buttons and interactions functional.`;
    }

    if (request.context) {
      prompt += `\n\nAdditional context: ${request.context}`;
    }

    prompt += '\n\nRespond with ONLY the JSON object, no other text.';

    return prompt;
  }

  private parseResponse(content: string, originalPrompt: string): GenerationResponse {
    try {
      console.log('🔍 Parsing AI response...');
      console.log('Raw content length:', content.length);
      console.log('Raw content preview:', content.substring(0, 200) + '...');
      
      // Try to extract JSON from the response - look for complete JSON blocks
      let jsonContent = content;
      
      // Look for JSON block between triple backticks
      const codeBlockMatch = content.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
      if (codeBlockMatch) {
        jsonContent = codeBlockMatch[1];
        console.log('📋 Found JSON in code block');
      } else {
        // Look for the first complete JSON object
        const jsonMatch = content.match(/\{[\s\S]*?\}/);
        if (jsonMatch) {
          jsonContent = jsonMatch[0];
          console.log('📋 Found JSON object');
        }
      }
      
      // Try to fix incomplete JSON by adding missing closing braces
      if (!jsonContent.endsWith('}')) {
        console.log('🔧 JSON seems incomplete, attempting to fix...');
        const openBraces = (jsonContent.match(/\{/g) || []).length;
        const closeBraces = (jsonContent.match(/\}/g) || []).length;
        const missingBraces = openBraces - closeBraces;
        
        if (missingBraces > 0) {
          jsonContent += '}'.repeat(missingBraces);
          console.log('🔧 Added', missingBraces, 'missing closing braces');
        }
      }
      
      console.log('🔧 Processed JSON content:', jsonContent.substring(0, 300) + '...');
      
      const parsed = JSON.parse(jsonContent);
      console.log('✅ Successfully parsed JSON:', parsed);
      
      // Validate required fields and provide defaults if missing
      const result = {
        html: parsed.html || `<div class="generated-app"><h2>${parsed.name || 'Generated App'}</h2><p>Content generation incomplete</p></div>`,
        css: parsed.css || `.generated-app { padding: 20px; background: var(--bg-secondary); border-radius: var(--border-radius); color: var(--text-primary); }`,
        js: parsed.js || 'console.log("Generated app loaded");',
        name: parsed.name || 'Generated App',
        description: parsed.description || `Generated from: "${originalPrompt}"`
      };
      
      // Validate that we have meaningful content
      if (!result.html.includes('<') || result.html.length < 20) {
        throw new Error('Generated HTML appears to be incomplete or invalid');
      }
      
      console.log('✅ Validation passed, returning result');
      return result;
      
    } catch (error) {
      console.error('❌ Failed to parse AI response:', error);
      console.error('Raw content that failed to parse:', content);
      
      // Enhanced fallback response
      return {
        name: 'Generated App (Parse Error)',
        description: `AI-generated app for: "${originalPrompt}" (parsing failed)`,
        html: `<div class="error-app">
          <h2>🤖 AI Generation Attempted</h2>
          <p><strong>Request:</strong> "${originalPrompt}"</p>
          <p><strong>Issue:</strong> The AI response couldn't be parsed properly.</p>
          <details>
            <summary>Show Raw AI Response</summary>
            <pre style="max-height: 300px; overflow: auto; background: var(--bg-primary); padding: 10px; border-radius: 4px; margin-top: 10px;">${content}</pre>
          </details>
          <p style="margin-top: 15px;"><em>The AI did respond, but the response format needs improvement.</em></p>
        </div>`,
        css: `.error-app { 
          padding: 20px; 
          background: var(--bg-secondary); 
          border-radius: var(--border-radius);
          color: var(--text-primary);
          max-width: 700px;
          margin: 20px auto;
          line-height: 1.6;
        }
        .error-app h2 { 
          color: #ffa726; 
          margin-bottom: 15px; 
        }
        .error-app details {
          margin: 15px 0;
        }
        .error-app summary {
          cursor: pointer;
          padding: 8px;
          background: var(--bg-tertiary);
          border-radius: 4px;
          margin-bottom: 5px;
        }
        .error-app pre { 
          font-size: 11px;
          color: var(--text-secondary);
        }`,
        js: 'console.log("App generation failed during parsing, showing debug info");'
      };
    }
  }
}

// Factory function to create service with localStorage config
export function createOpenRouterService(agentType: string): AIService {
  console.log('🏭 Factory: Creating AI service for agent:', agentType);
  
  // Get API keys and models from localStorage
  let selectedProvider: 'openai' | 'anthropic' | 'openrouter' = 'openrouter';
  let apiKey = '';
  let model = '';
  
  try {
    const savedKeys = localStorage.getItem('agentic-os-api-keys');
    const savedModels = localStorage.getItem('agentic-os-selected-models');
    const savedCustomModels = localStorage.getItem('agentic-os-custom-models');
    
    if (savedKeys) {
      const keys = JSON.parse(savedKeys);
      const models = savedModels ? JSON.parse(savedModels) : {};
      const customModels = savedCustomModels ? JSON.parse(savedCustomModels) : {};
      
      // Determine which provider to use based on available API keys
      if (keys.openai && keys.openai.trim()) {
        selectedProvider = 'openai';
        apiKey = keys.openai;
        model = models.openai === 'custom' ? customModels.openai : models.openai || 'gpt-4o';
      } else if (keys.anthropic && keys.anthropic.trim()) {
        selectedProvider = 'anthropic';
        apiKey = keys.anthropic;
        model = models.anthropic === 'custom' ? customModels.anthropic : models.anthropic || 'claude-3-5-sonnet-20241022';
      } else if (keys.openrouter && keys.openrouter.trim()) {
        selectedProvider = 'openrouter';
        apiKey = keys.openrouter;
        model = models.openrouter === 'custom' ? customModels.openrouter : models.openrouter || 'deepseek/deepseek-chat-v3-0324:free';
      }
    }
  } catch (error) {
    console.warn('⚠️ Factory: Failed to load API keys from localStorage:', error);
  }
  
  // Determine base URL based on provider
  const baseUrlMap = {
    openai: 'https://api.openai.com/v1',
    anthropic: 'https://api.anthropic.com/v1',
    openrouter: 'https://openrouter.ai/api/v1'
  };
  
  const baseUrl = baseUrlMap[selectedProvider];
  
  // Determine the correct endpoint based on provider
  let endpoint = '/chat/completions';
  if (selectedProvider === 'anthropic') {
    endpoint = '/messages';
  }
  
  console.log('🔑 Factory: Selected provider:', selectedProvider);
  console.log('🔑 Factory: API Key check:', {
    hasApiKey: !!apiKey,
    apiKeyLength: apiKey?.length,
    baseUrl: baseUrl,
    model: model
  });
  
  if (!apiKey || apiKey === '') {
    console.warn('⚠️ Factory: No valid API key found - service will use demo mode');
  }

  const service = new AIService({
    provider: selectedProvider,
    apiKey,
    baseUrl,
    endpoint,
    model
  });
  
  console.log('✅ Factory: AI service created successfully');
  return service;
}

export default AIService;
