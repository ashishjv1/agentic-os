/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OPENROUTER_API_KEY: string;
  readonly VITE_OPENROUTER_BASE_URL: string;
  readonly VITE_APP_GENERATOR_MODEL: string;
  readonly VITE_UTILITY_AGENT_MODEL: string;
  readonly VITE_WIDGET_AGENT_MODEL: string;
  readonly VITE_GAME_AGENT_MODEL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
