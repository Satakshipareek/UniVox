import { Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { ExpensesComponent } from './features/expenses/expenses.component';
import { TasksComponent } from './features/tasks/tasks.component';
import { CampusComponent } from './features/campus/campus.component';
import { SettingsComponent } from './features/settings/settings.component';
export const routes:Routes=[
 {path:'',component:DashboardComponent,title:'Dashboard · UniVox'},
 {path:'expenses',component:ExpensesComponent,title:'Expenses · UniVox'},
 {path:'tasks',component:TasksComponent,title:'Tasks & Reminders · UniVox'},
 {path:'campus',component:CampusComponent,title:'Campus Info · UniVox'},
 {path:'settings',component:SettingsComponent,title:'Settings · UniVox'},
 {path:'**',redirectTo:''}
];
