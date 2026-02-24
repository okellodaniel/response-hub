import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { GeneralNewsRecord } from '@/types/search';
import { toast } from '@/hooks/use-toast';
import { adverseNewsApi } from '@/integrations/adverse-news-api/client';
import { useAuth } from '@clerk/clerk-react';

interface GeneralNewsContextType {
  records: GeneralNewsRecord[];
  addSearch: (names: string) => Promise<void>;
  isSearching: boolean;
  selectedRecord: GeneralNewsRecord | null;
  setSelectedRecord: (record: GeneralNewsRecord | null) => void;
  refreshRecords: () => Promise<void>;
  isLoading: boolean;
}

const GeneralNewsContext = createContext<GeneralNewsContextType | undefined>(undefined);

export const GeneralNewsProvider = ({ children }: { children: ReactNode }) => {
  const { isSignedIn, isLoaded } = useAuth();
  const [records, setRecords] = useState<GeneralNewsRecord[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<GeneralNewsRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load records only when user is authenticated
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      refreshRecords();
    }
  }, [isLoaded, isSignedIn]);

  const refreshRecords = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await adverseNewsApi.getGeneralNewsSearches();
      const newsRecords: GeneralNewsRecord[] = response.items.map(item => ({
        id: item.id,
        query: item.query,
        resultsCount: item.results_count,
        createdAt: item.created_at ? new Date(item.created_at) : new Date(),
      }));
      setRecords(newsRecords);
    } catch (error) {
      console.error('Failed to fetch general news searches:', error);
      toast({
        title: "Error",
        description: "Failed to load general news records",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addSearch = async (names: string): Promise<void> => {
    setIsSearching(true);
    try {
      const searchResponse = await adverseNewsApi.searchGeneralNews({ names });
      console.log('General news search response:', searchResponse);

      const newRecord: GeneralNewsRecord = {
        id: searchResponse.search_id,
        query: names,
        resultsCount: searchResponse.total_hits,
        createdAt: new Date(),
      };

      setRecords(prev => [newRecord, ...prev]);

      toast({
        title: "Search Completed",
        description: searchResponse.total_hits > 0
          ? `Found ${searchResponse.total_hits} results for "${names}".`
          : `No general news found for "${names}".`,
      });

      // Refresh the list after a short delay
      setTimeout(() => {
        refreshRecords();
      }, 1000);
    } catch (error) {
      console.error('Failed to add general news search:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: "Search Failed",
        description: `Failed to perform search: ${errorMessage}. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <GeneralNewsContext.Provider value={{
      records,
      addSearch,
      isSearching,
      selectedRecord,
      setSelectedRecord,
      refreshRecords,
      isLoading,
    }}>
      {children}
    </GeneralNewsContext.Provider>
  );
};

export const useGeneralNews = () => {
  const context = useContext(GeneralNewsContext);
  if (context === undefined) {
    throw new Error('useGeneralNews must be used within a GeneralNewsProvider');
  }
  return context;
};
