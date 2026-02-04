export interface Service {
  id: number;
  name: string;
  description: string;
  icon: string;
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
  accessLevel: 'ALL' | 'ADMIN_ONLY' | 'DOCTOR_ONLY' | 'RESTRICTED';
  usersCount: number;
  lastAccessed: Date;
  url?: string;
}

export interface ServiceAccessLog {
  id: number;
  userId: number;
  userName: string;
  serviceId: number;
  serviceName: string;
  action: 'ACCESS' | 'DENIED' | 'LOGOUT';
  timestamp: Date;
  ipAddress: string;
}