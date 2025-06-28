// Simple test function to verify OpenRouter API connectivity
export async function testOpenRouterConnection() {
  console.log('🧪 Testing OpenRouter connection...');
  
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  const baseUrl = import.meta.env.VITE_OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';
  
  if (!apiKey) {
    console.error('❌ No API key found for testing');
    return false;
  }
  
  try {
    // Simple fetch test instead of axios
    const response = await fetch(`${baseUrl}/models`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('🧪 Test response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ OpenRouter API connection successful');
      console.log('📋 Available models count:', data.data?.length || 'unknown');
      return true;
    } else {
      console.error('❌ OpenRouter API test failed:', response.status, response.statusText);
      return false;
    }
  } catch (error) {
    console.error('❌ OpenRouter connection test error:', error);
    return false;
  }
}
