// Debug utility to check environment variables
export function debugEnvVars() {
  console.log('=== Environment Variables Debug ===');
  console.log('VITE_OPENROUTER_API_KEY:', import.meta.env.VITE_OPENROUTER_API_KEY ? 'Set (length: ' + import.meta.env.VITE_OPENROUTER_API_KEY.length + ')' : 'Not set');
  console.log('VITE_OPENROUTER_BASE_URL:', import.meta.env.VITE_OPENROUTER_BASE_URL);
  console.log('VITE_APP_GENERATOR_MODEL:', import.meta.env.VITE_APP_GENERATOR_MODEL);
  console.log('All env vars:', import.meta.env);
  console.log('=====================================');
}
