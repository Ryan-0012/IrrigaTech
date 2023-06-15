import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IrrigationCreate } from '../models/schedule/irrigation-create.models';
import { environment } from 'src/environments/environment';
import { Observable, map, of } from 'rxjs';
import { Irrigation } from '../models/schedule/irrigation.models';
import { IrrigationHistory } from '../models/schedule/irrigation-history.models';

interface Mensagem {
  topic: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class SchedulingService {
  irrigations: Irrigation[] = [];
  mensagem: Mensagem = { topic: 'StatusInit', message: '?' };
  
  constructor(private http: HttpClient) { }

  
  scheduler(model: IrrigationCreate): Observable<Irrigation> {
    console.log("AAA");
    const irrigationIndex = this.irrigations.findIndex(x => x.id === model.id);
    const url = `${environment.webApi}/Schedule/scheduler`;
    const data = this.convertToBackendModel(model);
    return this.http.post<Irrigation>(url, data).pipe(
      map(newIrrigation => {
        if (irrigationIndex !== -1) {
          this.irrigations.splice(irrigationIndex, 1);
        }
        this.irrigations.push(newIrrigation);
        return newIrrigation;
      })
    );
  }

  getByApplicationUserId(applicationUserId: number) : Observable<Irrigation[]> {
    if(this.irrigations.length > 0) return of(this.irrigations)
    return this.http.get<Irrigation[]>(`${environment.webApi}/Schedule/user/${applicationUserId}`).pipe(
      map(irrigations => {
        this.irrigations = irrigations
        return irrigations;
      })
    );
  }

  getHistoryByApplicationUserId(applicationUserId: number) : Observable<IrrigationHistory[]> {
    return this.http.get<IrrigationHistory[]>(`${environment.webApi}/Schedule/user/history/${applicationUserId}`);
  }

  get(irrigationId: string) : Observable<Irrigation> {
    const irrigation = this.irrigations.find(x => x.id === irrigationId);
    if(irrigation) return of(irrigation)
    return this.http.get<Irrigation>(`${environment.webApi}/Schedule/${irrigationId}`);
  }

  getStatus(){
    this.http.post('http://localhost:9000/api/Status', this.mensagem)
      .subscribe(
        (response) => {
          console.log('Mensagem enviada com sucesso!');
        },
        (error) => {
          console.error('Erro ao enviar mensagem:', error);
        }
      );
  }
  delete(irrigationId: string) : Observable<number> {
    return this.http.delete<number>(`${environment.webApi}/Schedule/${irrigationId}`);
  }

  private convertToBackendModel(model: IrrigationCreate): any {
    return {
      id: model.id ? model.id: "00000000-0000-0000-0000-000000000000",
      applicationUserId: model.applicationUserId,
      startTime: model.startTime,
      duration: model.duration,
      daysOfWeek: model.daysOfWeek || null,
      specificDate: model.specificDate
    };
  }
}
