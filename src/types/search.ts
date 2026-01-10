export interface SearchRecord {
  id: string;
  surname: string;
  givenName: string;
  otherName: string;
  createdAt: Date;
  status: 'pending' | 'completed' | 'error';
}

export interface SearchFormData {
  surname: string;
  givenName: string;
  otherName: string;
}

export interface User {
  username: string;
  isAuthenticated: boolean;
}
