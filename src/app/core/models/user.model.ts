export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: 'ADMIN' | 'DOCTOR' | 'PATIENT';
  phone?: string;
  address?: string;
  enabled: boolean;
  createdAt: Date;
  lastLogin?: Date;
}

export interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'ADMIN' | 'DOCTOR' | 'PATIENT';
  phone?: string;
  address?: string;
}