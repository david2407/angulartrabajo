import { Component, OnInit, ViewChild, ElementRef } from '@angular/core'
import { Router, ActivatedRoute } from '@angular/router'
import { FormBuilder, FormControl, FormGroup } from '@angular/forms'
import { Observable, lastValueFrom } from 'rxjs'
import { map } from 'rxjs/operators'

import { IngredientsService } from '../erp/ingredients.service'
import { AuthService } from '../auth.service'
import { currencies } from '../defaults'
import { IngredientUtils } from './ingredient.utils'

@Component({
  selector: 'app-ingredient-submit',
  templateUrl: './ingredient-submit.component.html',
  styleUrls: ['./ingredient-submit.component.sass'],
})
export class IngredientSubmitComponent implements OnInit {
  @ViewChild('allergenInput') allergenInput: ElementRef<HTMLInputElement>
  stateKey = 'ingredients'
  data: any
  currencies = currencies
  formData: FormGroup
  formInventory: FormGroup
  loaded: boolean
  filteredSuppliers: Observable<any[]>
  filteredClients: Observable<any[]>
  allergenList = []
  filteredAllergen: Observable<any[]>
  allergenCtrl = new FormControl()
  changeCategory = new FormControl(false)
  params: any
  utils: any
  permissions: any = {}
  saving: boolean
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    public ingredientsService: IngredientsService,
    public auth: AuthService
  ) {}

  ngOnInit() {
    this.utils = new IngredientUtils(this.auth)

    this.loaded = false
    this.params = this.route.snapshot.params

    if (this.params.id) {
      this.getData()
    } else {
      this.formData = this.fb.group(this.utils.onData())
      this.onData()
      this.loaded = true
    }
  }

  onData() {

    this.filteredAllergen = this.allergenCtrl.valueChanges.pipe(
      map((input) => {
        const listValue = this.formData.get('allergen').value

        if (!input && !listValue.length) {
          return []
        }

        let filteredAllergenList = []

        if (listValue.length) {
          filteredAllergenList = filteredAllergenList.filter(
            (a) => !listValue.includes(a.value)
          )
        }

        input = (input || '').toLowerCase()
        return filteredAllergenList.filter((a) =>
          a.name.toLowerCase().includes(input)
        )
      })
    )

    this.formData.get('category').valueChanges.subscribe(() => {
      this.changeCategory.setValue(false)
    })
  }

  async getData() {
    const res: any = await lastValueFrom(
      this.ingredientsService.getById(this.params.id || this.params.copy)
    )

    this.data = res
    this.formData = this.fb.group(this.utils.onData(this.data))
    this.onData()
    this.loaded = true
  }

  async onSubmit() {
    if (this.formData.invalid || this.saving) {
      return
    }
    this.saving = true

    const data: any = {}

    for (const field in this.formData.controls) {
      data[field] = this.formData.controls[field].value
    }

    if (this.params.id) {
      await lastValueFrom(this.ingredientsService.update(this.params.id, data))
      this.saving = false
      this.router.navigate(['..'], { relativeTo: this.route })
    } else {
      const res: any = await lastValueFrom(this.ingredientsService.create(data))
      this.saving = false
      this.router.navigate(['..', res._id], { relativeTo: this.route })
    }
  }

  selectAllergen(evt) {
    const allergen = this.formData.get('allergen').value
    allergen.push(evt.option.value)

    this.formData.get('allergen').setValue(allergen)
    this.allergenInput.nativeElement.value = ''
    this.allergenCtrl.setValue(null)
  }

  removeAllergen(allergen) {
    let allergenInput = this.formData.get('allergen').value
    allergenInput = allergenInput.filter((a) => a !== allergen)
    this.formData.get('allergen').setValue(allergenInput)
  }

  removeBatch(wpId, batch) {
    const form = this.formInventory.get(`${wpId}.batchList`)
    form.setValue(form.value.filter((b) => b != batch))
  }
}
