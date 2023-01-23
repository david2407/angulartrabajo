import { NgModule } from '@angular/core'
import { BrowserModule } from '@angular/platform-browser'

import { CoreModule } from './core/core.module'
import { AppRoutingModule } from './app-routing.module'
import { AppComponent } from './app.component'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field'

import { ErpService } from './erp/erp.service'
import { IngredientsService } from './erp/ingredients.service'
import { RecipesService } from './erp/recipes.service';

const providers: any = [
  ErpService,
  IngredientsService,
  RecipesService,
  {
    provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
    useValue: {
      appearance: 'outline',
    },
  },
]

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    CoreModule,
  ],
  providers,
  bootstrap: [AppComponent],
})
export class AppModule {}
