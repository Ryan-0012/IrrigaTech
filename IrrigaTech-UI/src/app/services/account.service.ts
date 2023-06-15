import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { ApplicationUser } from '../models/account/application-user.models';
import { HttpClient } from '@angular/common/http';
import { ApplicationUserLogin } from '../models/account/application-user-login.models';
import { ApplicationUserCreate } from '../models/account/application-user-create.models';
import { environment } from 'src/environments/environment';
import { IrrigationCreate } from '../models/schedule/irrigation-create.models';
import { Irrigation } from '../models/schedule/irrigation.models';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private currentUserSubject$: BehaviorSubject<ApplicationUser | null>;

  constructor(
    private http: HttpClient
  ) { 
    this.currentUserSubject$ = new BehaviorSubject<ApplicationUser | null>(JSON.parse(localStorage.getItem('blogLab-currentUser') || 'null'));
  }

  login(model: ApplicationUserLogin)  {
    console.log(model)
    return this.http.post<ApplicationUser>(`${environment.webApi}/Account/login`, model).pipe(
      map((user: ApplicationUser) => {
        if (user) {
          localStorage.setItem('blogLab-currentUser', JSON.stringify(user));
          this.setCurrentUser(user);
        }
        return user;  
      })
    );
  }

  register(model: ApplicationUserCreate): Observable<ApplicationUser> {
    console.log("a");
    return this.http.post<ApplicationUser>(`${environment.webApi}/Account/register`, model).pipe(
      map((user: ApplicationUser) => {
        if (user) {
          localStorage.setItem('blogLab-currentUser', JSON.stringify(user));
          this.setCurrentUser(user);
          console.log("b");
        }
        return user;
      })
    );
  }

  setCurrentUser(user: ApplicationUser | null): void {
    this.currentUserSubject$.next(user);
  }

  public get currentUserValue(): ApplicationUser | null {
    return this.currentUserSubject$.value;
  }

  public givenUserIsLoggedIn(username: string): boolean {
    return !!this.currentUserValue && this.currentUserValue.username === username;
  }

  public isLoggedIn(): boolean {
    const currentUser = this.currentUserValue;
    const isLoggedIn = !!currentUser && !!currentUser.token;
    return isLoggedIn;
  }

  logout(): void {
    localStorage.removeItem('blogLab-currentUser');
    this.currentUserSubject$.next(null);
  }  

  scheduler(model: IrrigationCreate): Observable<Irrigation> {
    console.log("AAA");
    const url = `${environment.webApi}/Sch/`;
    const data = this.convertToBackendModel(model);
    return this.http.post<Irrigation>(url, data);
  }

  private convertToBackendModel(model: IrrigationCreate): any {
    return {
      applicationUserId: model.applicationUserId,
      startTime: model.startTime,
      duration: model.duration,
      daysOfWeek: model.daysOfWeek || null,
      specificDate: model.specificDate
    };
  }
}
