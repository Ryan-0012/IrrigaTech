import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { UserAuthComponent } from './components/user-auth/user-auth.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { AuthGuard } from './guards/auth.guard';
import { SchedulingComponent } from './components/scheduling/scheduling.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';

const routes: Routes = [
  {path: '', component: HomeComponent, canActivate: [AuthGuard]},
  {path: 'home', component: HomeComponent, canActivate: [AuthGuard]},
  {path: 'nav', component: NavbarComponent, canActivate: [AuthGuard] },
  {path: 'scheduling', component: SchedulingComponent, canActivate: [AuthGuard]},
  {path: 'userauth', component: UserAuthComponent},
  {path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard]},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
