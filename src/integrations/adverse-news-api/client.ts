import { SearchFormData, SearchRecord } from '@/types/search';

// Use environment variable with fallback for development
const API_BASE_URL = import.meta.env.VITE_ADVERSE_NEWS_API_URL
    ? `${import.meta.env.VITE_ADVERSE_NEWS_API_URL}/api/v1`
    : 'http://localhost:8000/api/v1';

export interface AdverseNewsSearchRequest {
    names: string;
}

// Interface matching the actual API response for a search result article
export interface ApiSearchItem {
    id: string;
    image_id: string;
    search_query: string | null;
    adverse_news_found: boolean;
    individuals_mentioned: Array<{
        name: string;
        surname: string;
        givenName: string;
        otherName: string | null;
        role: string;
        reason_for_mention: string;
    }> | string; // Can be string or array
    newspaper_metadata: {
        publication_name: string;
        publication_date: string;
        newspaper_name: string | null;
        date: string | null;
        page_number: number | null;
        section: string | null;
    } | string;
    article_identification: {
        headline: string;
        subheadline: string | null;
        sub_headlines: string | null;
    } | string;
    adverse_news_classification: {
        adverse_categories: string[];
        severity_level: string;
    } | string;
    key_adverse_outcomes: {
        primary_impact: string;
        secondary_effects: string;
        affected_parties: string;
        financial_implications: string;
        legal_consequences: string;
    } | string;
    summary: {
        brief_summary: string;
        key_facts: string[];
        timeline: string;
    } | string;
    risk_assessment: {
        reputational_risk: { score: string; reason: string };
        operational_risk: { score: string; reason: string };
        regulatory_risk: { score: string; reason: string };
    } | string;
    quotes_and_evidence: {
        key_quotes: string[];
        supporting_evidence: string[];
    } | string;
    risk_scoring: {
        overall_risk_score: number;
        financial_risk_score: number;
        reputational_risk_score: number;
        legal_risk_score: number;
        operational_risk_score: number;
        priority_level: string;
        recommended_action: string;
    } | string;
    relevance_to_query: Record<string, unknown> | string | null;
    processing_metadata: {
        processed_at: string;
        model_used: string;
        processing_type: string;
    } | string;
    raw_response: Record<string, unknown> | string;
    headline: string;
    newspaper_name: string | null;
    category: string;
    severity_level: string;
    overall_risk_score: number;
    priority_level: string;
    relevance_score: number | null;
    created_at: string;
    updated_at: string | null;
}

export interface AdverseNewsSearchResponse {
    id: string;
    names: string;
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

export interface SearchSummary {
    id: string;
    image_id: string | null;
    names: string;
    adverse_news_found: boolean;
    results_count: number;
    top_adverse_news_id: string;
    adverse_news_ids: string[];
    created_at: string;
    search_duration_ms: number;
}

export interface PaginatedSearchesResponse {
    items: SearchSummary[];
    total: number;
    page: number;
    limit: number;
    total_pages: number;
}

// Interface for search result wrapper (GET /adverse-news/searches/{id})
export interface SearchResultResponse {
    query: string;
    names: string;
    total_hits: number;
    search_id: string;
    search_duration_ms: number;
    timestamp: string;
    results: ApiSearchItem[];
}

// New interface for the updated search API response (POST /adverse-news/searches/)
export interface AdverseNewsSearchResponseV2 {
    query: string;
    names: string;
    total_hits: number;
    search_id: string;
    search_duration_ms: number;
    timestamp: string;
    results: ApiSearchItem[];
}

// ─── General News Interfaces ──────────────────────────────────────────────────

export interface GeneralNewsSearchRequest {
    names: string;
}

export interface GeneralNewsSearchResultSummary {
    id: string;
    image_id: string;
    headline: string | null;
    primary_topic: string | null;
    overall_sentiment: string | null;
    created_at: string | null;
}

export interface GeneralNewsSearchResponse {
    query: string;
    search_id: string;
    total_hits: number;
    search_duration_ms: number;
    timestamp: string | null;
    results: GeneralNewsSearchResultSummary[];
}

export interface GeneralNewsSearchListItem {
    id: string;
    query: string;
    results_count: number;
    top_result_id: string | null;
    result_ids: string[] | null;
    search_duration_ms: number | null;
    created_at: string | null;
}

export interface PaginatedGeneralNewsSearchResponse {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
    items: GeneralNewsSearchListItem[];
}

export interface GeneralNewsDetailResponse {
    id: string;
    image_id: string;
    search_query: string | null;
    headline: string | null;
    newspaper_name: string | null;
    overall_sentiment: string | null;
    primary_topic: string | null;
    news_type: string | null;
    geographic_scope: string | null;
    created_at: string | null;
    updated_at: string | null;
    newspaper_metadata: {
        publication_name: string | null;
        publication_date: string | null;
        newspaper_name: string | null;
        date: string | null;
        page_number: string | null;
        section: string | null;
    } | null;
    article_identification: {
        headline: string | null;
        subheadline: string | null;
        sub_headlines: string | null;
    } | null;
    article_classification: {
        primary_topic: string | null;
        secondary_topics: string[] | null;
        overall_sentiment: string | null;
        sentiment_explanation: string | null;
    } | null;
    key_information: {
        primary_subject: string | null;
        key_events: string[] | null;
        key_facts: string[] | null;
        financial_figures: string[] | null;
        dates_mentioned: string[] | null;
        locations_mentioned: string[] | null;
        timeline: string | null;
    } | null;
    outcomes_and_implications: {
        stated_outcomes: string | null;
        projected_outcomes: string | null;
        affected_parties: string | null;
        stakeholder_reactions: string | null;
    } | null;
    news_significance: {
        news_type: string | null;
        geographic_scope: string | null;
        impact_scope: string | null;
        timeliness: string | null;
    } | null;
    general_summary: {
        brief_summary: string | null;
        key_takeaways: string[] | null;
    } | null;
    individuals_mentioned: Array<{
        name: string | null;
        surname: string | null;
        givenName: string | null;
        otherName: string | null;
        role: string | null;
        sentiment_context: string | null;
        reason_for_mention: string | null;
    }> | null;
    relevance_to_query: { relevance_score: number | null; relevance_explanation: string | null } | null;
}

export interface GeneralNewsSearchDetailResponse {
    query: string;
    search_id: string;
    total_hits: number;
    search_duration_ms: number | null;
    timestamp: string | null;
    results: GeneralNewsDetailResponse[];
}

// ─── API Client ───────────────────────────────────────────────────────────────

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
            mode: 'cors',
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status} ${response.statusText}`);
        }

        return response.json();
    }

    // ─── Adverse News ──────────────────────────────────────────────────────────

    // Search adverse news
    async searchAdverseNews(data: AdverseNewsSearchRequest): Promise<AdverseNewsSearchResponseV2> {
        try {
            const response = await this.request<AdverseNewsSearchResponseV2>('/adverse-news/searches/', {
                method: 'POST',
                body: JSON.stringify(data),
            });
            console.log('Search API response:', response);
            return response;
        } catch (error) {
            console.error('Search API error:', error);
            throw error;
        }
    }

    // Get list of adverse news searches
    async getSearches(params?: {
        names?: string;
        page?: number;
        limit?: number;
    }): Promise<PaginatedSearchesResponse> {
        const queryParams = new URLSearchParams();
        if (params?.names) queryParams.append('names', params.names);
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());

        const queryString = queryParams.toString();
        const endpoint = `/adverse-news/searches/${queryString ? `?${queryString}` : ''}`;

        return this.request<PaginatedSearchesResponse>(endpoint, {
            method: 'GET',
        });
    }

    // Get adverse news search result by ID
    async getSearchResultById(id: string): Promise<SearchResultResponse> {
        return this.request<SearchResultResponse>(`/adverse-news/searches/${id}`, {
            method: 'GET',
        });
    }

    // ─── General News ──────────────────────────────────────────────────────────

    // Search general news
    async searchGeneralNews(data: GeneralNewsSearchRequest): Promise<GeneralNewsSearchResponse> {
        try {
            const response = await this.request<GeneralNewsSearchResponse>('/general-news/search', {
                method: 'POST',
                body: JSON.stringify(data),
            });
            console.log('General news search response:', response);
            return response;
        } catch (error) {
            console.error('General news search error:', error);
            throw error;
        }
    }

    // Get list of general news searches
    async getGeneralNewsSearches(params?: {
        query?: string;
        page?: number;
        limit?: number;
    }): Promise<PaginatedGeneralNewsSearchResponse> {
        const queryParams = new URLSearchParams();
        if (params?.query) queryParams.append('query', params.query);
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());

        const queryString = queryParams.toString();
        const endpoint = `/general-news/searches${queryString ? `?${queryString}` : ''}`;

        return this.request<PaginatedGeneralNewsSearchResponse>(endpoint, {
            method: 'GET',
        });
    }

    // Get general news search by ID
    async getGeneralNewsSearchById(id: string): Promise<GeneralNewsSearchDetailResponse> {
        return this.request<GeneralNewsSearchDetailResponse>(`/general-news/searches/${id}`, {
            method: 'GET',
        });
    }

    // Get a single general news record by ID
    async getGeneralNewsById(id: string): Promise<GeneralNewsDetailResponse> {
        return this.request<GeneralNewsDetailResponse>(`/general-news/${id}`, {
            method: 'GET',
        });
    }

    // ─── Images ────────────────────────────────────────────────────────────────

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

    // ─── Conversion Helpers ────────────────────────────────────────────────────

    // Convert SearchFormData to AdverseNewsSearchRequest
    convertSearchFormData(data: SearchFormData): AdverseNewsSearchRequest {
        return {
            names: data.names,
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

    // Convert SearchSummary to SearchRecord
    convertToSearchRecord(item: SearchSummary): SearchRecord {
        // Determine status based on adverse_news_found
        let status: 'pending' | 'completed' | 'error' = 'completed';
        if (!item.adverse_news_found) {
            status = 'pending';
        }

        return {
            id: item.id,
            names: item.names,
            createdAt: new Date(item.created_at),
            status,
        };
    }

    // Convert ApiSearchItem to SearchRecord (for backward compatibility)
    convertApiSearchItemToSearchRecord(item: ApiSearchItem): SearchRecord {
        const extractedNames = this.extractNamesFromSearchItem(item);

        // Determine status based on adverse_news_found and processing
        let status: 'pending' | 'completed' | 'error' = 'completed';
        if (!item.adverse_news_found && (item.relevance_score === 0 || item.relevance_score === null)) {
            status = 'pending';
        } else if (item.severity_level === 'Error' || item.priority_level === 'ERROR') {
            status = 'error';
        }

        // Combine extracted names into a single string
        const names = [extractedNames.givenName, extractedNames.surname, extractedNames.otherName]
            .filter(n => n)
            .join(' ');

        return {
            id: item.id,
            names: names || 'Unknown',
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
        let summaryText = 'No summary available';
        if (typeof item.summary === 'string') {
            summaryText = item.summary;
        } else if (item.summary && typeof item.summary === 'object') {
            const summaryObj = item.summary as { brief_summary?: string };
            summaryText = summaryObj.brief_summary || 'No summary available';
        }

        const relevanceScore = item.relevance_score !== null ? item.relevance_score / 10 : 0;

        return [{
            id: item.id,
            title: item.headline || 'No headline',
            source: item.newspaper_name || 'Unknown source',
            date: item.created_at.split('T')[0],
            summary: summaryText,
            relevance_score: relevanceScore,
            url: '#',
        }];
    }
}

// Create and export a singleton instance
export const adverseNewsApi = new AdverseNewsApiClient();

// Export the class for testing or custom instances
export default AdverseNewsApiClient;
