// News and Information Search Service
// This service provides current information and news search capabilities

export interface NewsSearchRequest {
  query: string;
  category?: 'general' | 'technology' | 'business' | 'science' | 'health' | 'sports' | 'entertainment';
  limit?: number;
}

export interface NewsItem {
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  category: string;
}

export interface SearchResult {
  items: NewsItem[];
  totalResults: number;
  query: string;
  searchedAt: string;
}

class NewsService {
  private static mockNews: NewsItem[] = [
    {
      title: "AI Breakthrough: New Language Model Achieves Human-Level Performance",
      description: "Researchers announce a new AI model that demonstrates unprecedented capabilities in reasoning and language understanding.",
      url: "https://example.com/ai-breakthrough",
      source: "Tech News",
      publishedAt: "2025-06-28T10:00:00Z",
      category: "technology"
    },
    {
      title: "Global Climate Summit Reaches Historic Agreement",
      description: "World leaders unite on comprehensive climate action plan with binding commitments for carbon reduction.",
      url: "https://example.com/climate-summit",
      source: "Environmental Times",
      publishedAt: "2025-06-28T08:30:00Z",
      category: "science"
    },
    {
      title: "Stock Markets Rally as Tech Sector Shows Strong Growth",
      description: "Major indices reach new highs driven by robust earnings from technology companies.",
      url: "https://example.com/markets-rally",
      source: "Financial Daily",
      publishedAt: "2025-06-28T07:15:00Z",
      category: "business"
    },
    {
      title: "Revolutionary Gene Therapy Shows Promise for Rare Diseases",
      description: "Clinical trials demonstrate significant improvement in patients with previously untreatable genetic conditions.",
      url: "https://example.com/gene-therapy",
      source: "Medical Journal",
      publishedAt: "2025-06-28T06:45:00Z",
      category: "health"
    },
    {
      title: "Space Exploration Milestone: New Mission to Mars Launches Successfully",
      description: "International space mission begins journey to Mars with advanced rovers and scientific equipment.",
      url: "https://example.com/mars-mission",
      source: "Space News",
      publishedAt: "2025-06-28T05:20:00Z",
      category: "science"
    }
  ];

  static async searchNews(request: NewsSearchRequest): Promise<SearchResult> {
    console.log('🔍 NewsService: Searching for:', request.query);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Filter mock news based on query and category
    let filteredNews = this.mockNews;
    
    if (request.category && request.category !== 'general') {
      filteredNews = filteredNews.filter(item => item.category === request.category);
    }
    
    if (request.query.trim()) {
      const queryLower = request.query.toLowerCase();
      filteredNews = filteredNews.filter(item => 
        item.title.toLowerCase().includes(queryLower) ||
        item.description.toLowerCase().includes(queryLower) ||
        item.category.toLowerCase().includes(queryLower)
      );
    }
    
    // Apply limit
    const limit = request.limit || 10;
    const limitedNews = filteredNews.slice(0, limit);
    
    const result: SearchResult = {
      items: limitedNews,
      totalResults: filteredNews.length,
      query: request.query,
      searchedAt: new Date().toISOString()
    };
    
    console.log('✅ NewsService: Found', result.items.length, 'results');
    return result;
  }

  static async getLatestNews(category?: string, limit: number = 5): Promise<SearchResult> {
    console.log('📰 NewsService: Getting latest news for category:', category || 'all');
    
    return this.searchNews({
      query: '',
      category: category as any,
      limit
    });
  }

  static async searchGeneral(query: string): Promise<SearchResult> {
    console.log('🌐 NewsService: General search for:', query);
    
    // For general search, we'll create mock search results based on the query
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const mockResults: NewsItem[] = [
      {
        title: `Understanding ${query}: A Comprehensive Overview`,
        description: `Learn about ${query} with this detailed analysis covering key concepts, recent developments, and expert insights.`,
        url: `https://example.com/search/${encodeURIComponent(query)}`,
        source: "Knowledge Base",
        publishedAt: new Date().toISOString(),
        category: "general"
      },
      {
        title: `Latest Developments in ${query}`,
        description: `Recent updates and breakthrough discoveries related to ${query} from leading researchers and industry experts.`,
        url: `https://example.com/latest/${encodeURIComponent(query)}`,
        source: "Research Today",
        publishedAt: new Date(Date.now() - 3600000).toISOString(),
        category: "general"
      },
      {
        title: `${query}: Practical Applications and Use Cases`,
        description: `Explore real-world applications of ${query} and how it's being implemented across various industries.`,
        url: `https://example.com/applications/${encodeURIComponent(query)}`,
        source: "Industry Insights",
        publishedAt: new Date(Date.now() - 7200000).toISOString(),
        category: "general"
      }
    ];

    return {
      items: mockResults,
      totalResults: mockResults.length,
      query,
      searchedAt: new Date().toISOString()
    };
  }
}

export default NewsService;
