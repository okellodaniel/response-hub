export interface SearchRecord {
  id: string;
  names: string;
  createdAt: Date;
  status: 'pending' | 'completed' | 'error';
}

export interface SearchFormData {
  names: string;
}

export interface GeneralNewsRecord {
  id: string;
  query: string;
  resultsCount: number;
  createdAt: Date;
}