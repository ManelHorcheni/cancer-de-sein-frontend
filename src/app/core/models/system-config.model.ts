export interface SystemConfig {
  id: number;
  key: string;
  value: string;
  description: string;
  category: 'GENERAL' | 'SECURITY' | 'EMAIL' | 'DATABASE' | 'AI';
  editable: boolean;
}

export interface ConfigCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
}