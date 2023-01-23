import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'

import { AuthGuard } from './auth.guard'

const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      {
        path: 'ingredients',
        loadChildren: () =>
          import('./erp-ingredients/ingredients.module').then(
            (m) => m.IngredientsModule
          ),
      },
      {
        path: 'recipes',
        loadChildren: () =>
          import('./erp-recipes/recipes.module').then((m) => m.RecipesModule),
      },
    ],
  },
  {
    path: 'login',
    loadChildren: () =>
      import('./login/login.module').then((m) => m.LoginModule),
  }
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
