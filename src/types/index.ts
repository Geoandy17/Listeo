// Types pour l'API CDR Analytics

export interface User {
  id: number;
  email: string;
  fullName: string;
  serviceName: string;
  role: string;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  tokenType: string;
  expiresIn: number;
  user: User;
}

export interface AuthMeResponse {
  success: boolean;
  user: User;
}

export interface SearchSingleBody {
  phoneNumber: string;
  startDate: string;
  endDate: string;
  format?: 'pdf' | 'json';
}

export interface SearchGroupBody {
  mode: 'group';
  phoneNumbers: string;
  startDate: string;
  endDate: string;
  format?: 'pdf' | 'json';
}

export interface BatchTarget {
  phoneNumber: string;
  startDate: string;
  endDate: string;
}

export interface SearchBatchBody {
  mode: 'batch';
  targets: BatchTarget[];
  format?: 'pdf' | 'json';
}

export interface SearchImeiBody {
  imei: string;
  startDate: string;
  endDate: string;
  format?: 'pdf' | 'json';
}

export interface CDRRecord {
  [key: string]: unknown;
}

export interface SearchJsonResponse {
  success: boolean;
  records: CDRRecord[];
  summary: {
    rows: number;
    mode: string;
    tookMs: number;
    description: string;
  };
  totalCount: number;
  mainPhone?: string;
  imei?: string;
}

export interface GroupResult {
  phoneNumber: string;
  startDate: string;
  endDate: string;
  recordCount: number;
  records: CDRRecord[];
}

export interface SearchGroupJsonResponse {
  success: boolean;
  groupedResults: GroupResult[];
  totalGroups: number;
  tookMs: number;
}

export interface ApiError {
  success: false;
  error: string;
}
