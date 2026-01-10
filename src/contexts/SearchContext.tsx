import React, { createContext, useContext, useState, ReactNode } from 'react';
import { SearchRecord, SearchFormData } from '@/types/search';
import { toast } from '@/hooks/use-toast';

interface SearchContextType {
  records: SearchRecord[];
  addSearch: (data: SearchFormData) => Promise<void>;
  isSearching: boolean;
  selectedRecord: SearchRecord | null;
  setSelectedRecord: (record: SearchRecord | null) => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export const SearchProvider = ({ children }: { children: ReactNode }) => {
  const [records, setRecords] = useState<SearchRecord[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<SearchRecord | null>(null);

  const addSearch = async (data: SearchFormData): Promise<void> => {
    setIsSearching(true);
    
    const newRecord: SearchRecord = {
      id: crypto.randomUUID(),
      ...data,
      createdAt: new Date(),
      status: 'pending',
    };
    
    setRecords(prev => [newRecord, ...prev]);
    
    // Simulate API call with delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Update record status to completed
    setRecords(prev => 
      prev.map(record => 
        record.id === newRecord.id 
          ? { ...record, status: 'completed' as const }
          : record
      )
    );
    
    setIsSearching(false);
    
    toast({
      title: "Search Completed",
      description: `Results found for ${data.givenName} ${data.surname}`,
    });
  };

  return (
    <SearchContext.Provider value={{ records, addSearch, isSearching, selectedRecord, setSelectedRecord }}>
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
