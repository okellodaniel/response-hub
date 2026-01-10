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

      // Call the API - it returns an array of search results
      const searchResults = await adverseNewsApi.searchAdverseNews(requestData);

      // Create a search record from the first result (if any)
      if (searchResults && searchResults.length > 0) {
        // For now, create a simple record from the search data
        // In a real app, you might want to store all results
        const newRecord: SearchRecord = {
          id: crypto.randomUUID(),
          ...data,
          createdAt: new Date(),
          status: 'completed', // The API returns results immediately
        };

        setRecords(prev => [newRecord, ...prev]);

        toast({
          title: "Search Completed",
          description: `Found ${searchResults.length} results for ${data.givenName} ${data.surname}.`,
        });

        // Refresh the records list to show the new search
        setTimeout(() => {
          refreshRecords();
        }, 1000);
      } else {
        // No results found
        const newRecord: SearchRecord = {
          id: crypto.randomUUID(),
          ...data,
          createdAt: new Date(),
          status: 'completed',
        };

        setRecords(prev => [newRecord, ...prev]);

        toast({
          title: "Search Completed",
          description: `No adverse news found for ${data.givenName} ${data.surname}.`,
        });
      }

    } catch (error) {
      console.error('Failed to add search:', error);
      toast({
        title: "Error",
        description: "Failed to perform search. Please try again.",
        variant: "destructive",
      });

      // Add a failed record for UI consistency
      const failedRecord: SearchRecord = {
        id: crypto.randomUUID(),
        ...data,
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
