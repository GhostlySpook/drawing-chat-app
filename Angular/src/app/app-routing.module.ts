/*import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
*/

import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';

const app_routes: Routes = [
  {path: 'home', component: HomeComponent},
  {path:'**', pathMatch: 'full', redirectTo:'home'}
]

export const app_routing = RouterModule.forRoot(app_routes);