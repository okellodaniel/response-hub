export interface SearchRecord {
  id: string;
  names: string;
  createdAt: Date;
  status: 'pending' | 'completed' | 'error';
}

export interface SearchFormData {
  names: string;
}