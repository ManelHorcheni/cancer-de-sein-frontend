import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
//import { environment } from '../../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class StreamlitService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getAccessLink(): Observable<{ link: string }> {
    return this.http.get<{ link: string }>(`${this.apiUrl}/auth/streamlit-access`);
  }

  verifyToken(token: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/auth/verify-streamlit-token?token=${token}`);
  }
}