import { NgModule } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterModule, Routes } from '@angular/router'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'

import { SharedModule } from '../shared/shared.module'
import { RecipesSubmitComponent } from './recipes-submit.component'

const routes: Routes = [
  {
    path: 'create',
    component: RecipesSubmitComponent,
  },
]

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    FormsModule,
    ReactiveFormsModule,
    SharedModule,
  ],
  exports: [],
  declarations: [RecipesSubmitComponent],
  providers: [],
})
export class RecipesModule {}
