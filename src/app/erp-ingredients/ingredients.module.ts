import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule, Routes } from '@angular/router'

import { SharedModule } from '../shared/shared.module'
import { ErpFiltersModule } from '../erp-filters/erp-filters.module'
import { IngredientSubmitComponent } from './ingredient-submit.component'
import { IngredientsListComponent } from './ingredients-list.component'
import { IngredientsTabsContainerComponent } from './ingredients-tabs-container.component'
import {MatTabsModule} from '@angular/material/tabs';

const routes: Routes = [
  {
    path: '',
    component: IngredientsListComponent,
  },
  {
    path: 'create',
    component: IngredientSubmitComponent,
  },
  {
    path: 'tabs',
    component: IngredientsTabsContainerComponent,
  },
]

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    SharedModule,
    ErpFiltersModule,
    MatTabsModule,
  ],
  exports: [],
  declarations: [IngredientSubmitComponent, IngredientsListComponent, IngredientsTabsContainerComponent],
  providers: [],
})
export class IngredientsModule {}
