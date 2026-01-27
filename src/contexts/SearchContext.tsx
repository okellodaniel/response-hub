import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { SearchRecord, SearchFormData } from '@/types/search';
import { toast } from '@/hooks/use-toast';
import { adverseNewsApi } from '@/integrations/adverse-news-api/client';

interface SearchContextType {
  records: SearchRecord[];
  addSearch: (data: SearchFormData) => Promise<void>;
  isSearching: boolean;
  selectedRecord: SearchRecord | null;
  setSelectedRecord: (record: SearchRecord | null) => void;
  refreshRecords: () => Promise<void>;
  isLoading: boolean;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider = ({ children }: { children: ReactNode }) => {
  const [records, setRecords] = useState<SearchRecord[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<SearchRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load initial records
  useEffect(() => {
    refreshRecords();
  }, []);

  const refreshRecords = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await adverseNewsApi.getSearches();
      const searchRecords = adverseNewsApi.convertToSearchRecords(response);
      setRecords(searchRecords);
    } catch (error) {
      console.error('Failed to fetch searches:', error);
      toast({
        title: "Error",
        description: "Failed to load search records",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addSearch = async (data: SearchFormData): Promise<void> => {
    setIsSearching(true);

    try {
      // Convert to API request format
      const requestData = adverseNewsApi.convertSearchFormData(data);
      console.log('Sending search request:', requestData);

      const searchResponse = await adverseNewsApi.searchAdverseNews(requestData);
      console.log('Search response received:', searchResponse);

      // Extract results from response
      const results = searchResponse?.results || [];

      // Create a search record
      const newRecord: SearchRecord = {
        id: crypto.randomUUID(), // Temporary ID until we get a real one from backend
        names: data.names,
        createdAt: new Date(),
        status: results.length > 0 ? 'completed' : 'completed', // Always completed for now
      };

      setRecords(prev => [newRecord, ...prev]);

      if (results.length > 0) {
        toast({
          title: "Search Completed",
          description: `Found ${results.length} results for ${data.names}.`,
        });
      } else {
        toast({
          title: "Search Completed",
          description: `No adverse news found for ${data.names}.`,
        });
      }

      // Refresh the records list to show the new search
      setTimeout(() => {
        refreshRecords();
      }, 1000);

    } catch (error) {
      console.error('Failed to add search:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: "Search Failed",
        description: `Failed to perform search: ${errorMessage}. Please try again.`,
        variant: "destructive",
      });

      // Add a failed record for UI consistency
      const failedRecord: SearchRecord = {
        id: crypto.randomUUID(),
        names: data.names,
        createdAt: new Date(),
        status: 'error',
      };
      setRecords(prev => [failedRecord, ...prev]);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <SearchContext.Provider value={{
      records,
      addSearch,
      isSearching,
      selectedRecord,
      setSelectedRecord,
      refreshRecords,
      isLoading
    }}>
      {children}
    </SearchContext.Provider>
  );
};

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};
