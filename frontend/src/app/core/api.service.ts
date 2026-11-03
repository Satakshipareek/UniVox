import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
@Injectable({ providedIn:'root' })
export class ApiService {
  private http = inject(HttpClient); private base = environment.apiUrl;
  command(transcript:string):Observable<any>{return this.http.post(`${this.base}/voice/command`,{transcript});}
  health():Observable<any>{return this.http.get(`${this.base}/health`);}
  summary():Observable<any>{return this.http.get(`${this.base}/expenses/summary`);}
  expenses():Observable<any>{return this.http.get(`${this.base}/expenses`);}
  tasks(status=''):Observable<any>{return this.http.get(`${this.base}/tasks`,{params:status?{status}:{}});}
  completeTask(id:string):Observable<any>{return this.http.patch(`${this.base}/tasks/${id}/complete`,{});}
  reminders():Observable<any>{return this.http.get(`${this.base}/reminders`);}
  campus():Observable<any>{return this.http.get(`${this.base}/campus`);}
  createTask(data:any):Observable<any>{return this.http.post(`${this.base}/tasks`,data);}
  createExpense(data:any):Observable<any>{return this.http.post(`${this.base}/expenses`,data);}
  createReminder(data:any):Observable<any>{return this.http.post(`${this.base}/reminders`,data);}
}
