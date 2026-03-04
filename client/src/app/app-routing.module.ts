import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { OperatorDashComponent } from './operator-dash/operator-dash.component';
import { FamilyListComponent } from './family/family-list.component';
import { AddFamilyComponent } from './family/add-family.component';
import { InventoryListComponent } from './inventory/inventory-list.component';
import { AddInventoryComponent } from './inventory/add-inventory.component';

const routes: Routes = [
  {path: '', component: HomeComponent, title: 'Home'},
  {path: 'dashboard', component: OperatorDashComponent, title: 'Operator Dashboard'},
  {path: 'family', component: FamilyListComponent, title: 'Family'},
  {path: 'family/new', component: AddFamilyComponent, title: 'Add Family'},
  {path: 'inventory', component: InventoryListComponent, title: 'Inventory'},
  {path: 'inventory/new', component: AddInventoryComponent, title: 'Add Inventory'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
