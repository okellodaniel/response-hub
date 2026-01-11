import { SearchFormData, SearchRecord } from '@/types/search';

// Use environment variable with fallback for development
const API_BASE_URL = import.meta.env.VITE_ADVERSE_NEWS_API_URL
    ? `${import.meta.env.VITE_ADVERSE_NEWS_API_URL}/api/v1`
    : 'http://localhost:8000/api/v1';

export interface AdverseNewsSearchRequest {
    surname: string;
    given_name: string;
    other_name?: string;
}

// Interface matching the actual API response for a search item
export interface ApiSearchItem {
    id: number;
    image_id: string;
    search_query: string;
    adverse_news_found: boolean;
    individuals_mentioned: Array<{
        surname: string;
        givenName: string;
        otherName: string | null;
    }> | string; // Can be string or array
    newspaper_metadata: {
        newspaper_name: string | null;
        date: string | null;
        page_number: number | null;
        section: string | null;
    } | string;
    article_identification: {
        headline: string;
        sub_headlines: string | null;
    } | string;
    adverse_news_classification: {
        category: string;
        severity_level: string;
    } | string;
    key_adverse_outcomes: Record<string, unknown> | string;
    summary: Record<string, unknown> | string;
    risk_assessment: Record<string, unknown> | string;
    quotes_and_evidence: Record<string, unknown> | string;
    risk_scoring: Record<string, unknown> | string;
    relevance_to_query: Record<string, unknown> | string;
    processing_metadata: Record<string, unknown> | string;
    raw_response: Record<string, unknown> | string;
    headline: string;
    newspaper_name: string | null;
    category: string;
    severity_level: string;
    overall_risk_score: number;
    priority_level: string;
    relevance_score: number;
    created_at: string;
    updated_at: string | null;
}

export interface AdverseNewsSearchResponse {
    id: string;
    surname: string;
    given_name: string;
    other_name?: string;
    created_at: string;
    status: 'pending' | 'completed' | 'error';
    results?: AdverseNewsResult[];
}

export interface AdverseNewsResult {
    id: string;
    title: string;
    source: string;
    date: string;
    summary: string;
    relevance_score: number;
    url: string;
}

export interface PaginatedSearchesResponse {
    items: ApiSearchItem[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
}

class AdverseNewsApiClient {
    private baseUrl: string;

    constructor(baseUrl: string = API_BASE_URL) {
        this.baseUrl = baseUrl;
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${this.baseUrl}${endpoint}`;
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            mode: 'cors', // Enable CORS
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }

        return response.json();
    }

    // Search adverse news - returns array of search results
    async searchAdverseNews(data: AdverseNewsSearchRequest): Promise<ApiSearchItem[]> {
        return this.request<ApiSearchItem[]>('/adverse-news/search', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    // Get list of searches
    async getSearches(params?: {
        surname?: string;
        given_name?: string;
        page?: number;
        limit?: number;
    }): Promise<PaginatedSearchesResponse> {
        const queryParams = new URLSearchParams();
        if (params?.surname) queryParams.append('surname', params.surname);
        if (params?.given_name) queryParams.append('given_name', params.given_name);
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());

        const queryString = queryParams.toString();
        const endpoint = `/adverse-news/searches${queryString ? `?${queryString}` : ''}`;

        return this.request<PaginatedSearchesResponse>(endpoint, {
            method: 'GET',
        });
    }

    // Get search result by ID
    async getSearchResultById(id: string): Promise<ApiSearchItem> {
        return this.request<ApiSearchItem>(`/adverse-news/search/${id}`, {
            method: 'GET',
        });
    }

    // Get image by ID
    async getImageById(imageId: string): Promise<string> {
        const url = `${this.baseUrl}/images/${imageId}`;
        const response = await fetch(url, {
            method: 'GET',
            mode: 'cors',
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
        }

        // Convert the image to a blob URL
        const blob = await response.blob();
        return URL.createObjectURL(blob);
    }

    // Convert SearchFormData to AdverseNewsSearchRequest
    convertSearchFormData(data: SearchFormData): AdverseNewsSearchRequest {
        return {
            surname: data.surname,
            given_name: data.givenName,
            other_name: data.otherName || undefined,
        };
    }

    // Extract name from search query or individuals_mentioned
    private extractNamesFromSearchItem(item: ApiSearchItem): { surname: string; givenName: string; otherName: string } {
        // Try to parse search_query (e.g., "Trump Donald")
        if (item.search_query) {
            const parts = item.search_query.split(' ');
            if (parts.length >= 2) {
                return {
                    surname: parts[0],
                    givenName: parts[1],
                    otherName: parts.slice(2).join(' ') || '',
                };
            }
        }

        // Try to get from individuals_mentioned
        if (Array.isArray(item.individuals_mentioned) && item.individuals_mentioned.length > 0) {
            const firstPerson = item.individuals_mentioned[0];
            if (typeof firstPerson === 'object') {
                return {
                    surname: firstPerson.surname || '',
                    givenName: firstPerson.givenName || '',
                    otherName: firstPerson.otherName || '',
                };
            }
        }

        // Fallback
        return {
            surname: 'Unknown',
            givenName: '',
            otherName: '',
        };
    }

    // Convert ApiSearchItem to SearchRecord
    convertToSearchRecord(item: ApiSearchItem): SearchRecord {
        const names = this.extractNamesFromSearchItem(item);

        // Determine status based on adverse_news_found and processing
        let status: 'pending' | 'completed' | 'error' = 'completed';
        if (!item.adverse_news_found && item.relevance_score === 0) {
            status = 'pending';
        } else if (item.severity_level === 'Error' || item.priority_level === 'ERROR') {
            status = 'error';
        }

        return {
            id: item.id.toString(),
            surname: names.surname,
            givenName: names.givenName,
            otherName: names.otherName,
            createdAt: new Date(item.created_at),
            status,
        };
    }

    // Convert PaginatedSearchesResponse to SearchRecord array
    convertToSearchRecords(response: PaginatedSearchesResponse): SearchRecord[] {
        return response.items.map(item => this.convertToSearchRecord(item));
    }

    // Convert ApiSearchItem to AdverseNewsResult array for detailed view
    convertToAdverseNewsResults(item: ApiSearchItem): AdverseNewsResult[] {
        // For now, create a single result from the main item
        // In a real implementation, you might parse the raw_response for multiple articles

        let summaryText = 'No summary available';
        if (typeof item.summary === 'string') {
            summaryText = item.summary;
        } else if (item.summary && typeof item.summary === 'object') {
            const summaryObj = item.summary as { brief_summary?: string };
            summaryText = summaryObj.brief_summary || 'No summary available';
        }

        return [{
            id: item.id.toString(),
            title: item.headline || 'No headline',
            source: item.newspaper_name || 'Unknown source',
            date: item.created_at.split('T')[0],
            summary: summaryText,
            relevance_score: item.relevance_score / 10, // Convert from 0-10 to 0-1 scale
            url: '#', // No URL in API response
        }];
    }
}

// Create and export a singleton instance
export const adverseNewsApi = new AdverseNewsApiClient();

// Export the class for testing or custom instances
export default AdverseNewsApiClient;