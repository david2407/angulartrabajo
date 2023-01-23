import { Component, OnInit } from '@angular/core'
import { Router, ActivatedRoute } from '@angular/router'
import {
  FormControl,
  FormGroup,
  Validators,
  FormBuilder,
  FormArray,
} from '@angular/forms'
import { MatSnackBar } from '@angular/material/snack-bar'

import { lastValueFrom } from 'rxjs'
import { startWith, map } from 'rxjs/operators'

import { IngredientsService } from '../erp/ingredients.service'
import { RecipesService } from '../erp/recipes.service'
import { ErpService, RecipesKinds } from '../erp/erp.service'
import { AuthService } from '../auth.service'
import { checkIfValidMongoID, Utils } from '../core/utils'
import { isMongoIdValidator } from '../shared/shared.index'

const requiredProductsFields = ['bottle']

const defaultNewItem: any = {
  ingredientId: null,
  gramsTab: null,
  gramsPortion: null,
  ingredientQtyCps: null,
  priceCps: null,
  kg: null,
  carbPerCent: null,
  fatPerCent: null,
  proteinPerCent: null,
}

const formDataValidators = {
  bottleQty: {
    types: ['omega-cla', 'cps-gelatin', 'cps-vege-000', 'cps-vege'],
    validators: [Validators.required],
  },
  cpsQty: {
    types: ['omega-cla', 'cps-gelatin', 'cps-vege-000', 'cps-vege'],
    validators: [Validators.required],
  },
  batch: {
    types: ['prot-gain', 'amino', 'ren-amino', 'rtd'],
    validators: [Validators.required],
  },
  canPriceEUR: {
    types: ['rtd'],
    validators: [Validators.required],
  },
}

@Component({
  selector: 'app-recipes-submit',
  templateUrl: './recipes-submit.component.html',
  styleUrls: ['./recipes-submit.component.sass'],
})
export class RecipesSubmitComponent implements OnInit {
  stateKey = 'recipes'
  formData: FormGroup
  newItem: FormGroup = this.fb.group({ ...defaultNewItem })
  loaded!: boolean
  data: any = {}
  params: any
  filteredData: any = {
    ingredients: [],
    clients: [],
    bottles: [],
    scoops: [],
    locks: [],
    products: [],
  }
  filters: any = {}
  invalid: any = {}
  isProposal: FormControl = new FormControl()
  permissions: any
  canEdit!: boolean
  showPrivateControl!: boolean
  types!: any[]
  filteredIngredients: any[] = []
  minMarginalProfit: number

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private snackbar: MatSnackBar,
    public ingredientsService: IngredientsService,
    public recipes: RecipesService,
    public erpService: ErpService,
    public auth: AuthService
  ) {}

  ngOnInit() {
    this.permissions = Utils.getSectionPermissions(
      this.auth.roles,
      this.erpService.sectionKey,
      this.stateKey
    )

    this.showPrivateControl =
      this.permissions['showPrivate'] || this.auth.isSuperAdmin

    const defaults = {
      title: ['', Validators.required],
      date: [null],
      kind: ['', Validators.required],
      client: ['', isMongoIdValidator()],
      capId: ['', isMongoIdValidator()],
      bottleId: ['', isMongoIdValidator()],
      lockId: ['', isMongoIdValidator()],
      scoopId: ['', isMongoIdValidator()],
      productId: ['', isMongoIdValidator()],
      taste: [''],
      articleNr: [''],
      bottleQty: [null],
      cpsQty: [null],
      priceCpsEUR: [null],
      canPriceEUR: [null],
      priceIncludesContainer: [false],
      useDefaultPriceCps: [true],
      private: [false],
      bottleSize: [null, Validators.required],
      batch: [null],
      production: [null, Validators.required],
      profit: [null],
      colorCps: [''],
      clientPrice: [null],
      currency: [''],
      tabForm: [''],
      gramsPerPortion: [null],
      servingsPerPortion: [null],
      ean: [''],
      rtd: [false],
      note: [''],
      items: this.fb.array([]),
    }

    this.formData = this.fb.group({ ...defaults })

    this.types = RecipesKinds

    this.route.params.subscribe((r) => {
      this.loaded = false
      this.params = r
      this.getBasics()
    })

    this.formData.get('kind').valueChanges.subscribe((kind) => {
      for (const key in formDataValidators) {
        if (formDataValidators[key].types.includes(kind)) {
          this.formData
            .get(key)
            .addValidators(formDataValidators[key].validators)
        } else {
          this.formData.get(key).clearValidators()
        }
      }
    })

    this.filteredData.clients = this.formData.get('client').valueChanges.pipe(
      startWith(''),
      map((val) => this.filter(val, []))
    )

    this.filteredData.products = this.formData
      .get('articleNr')
      .valueChanges.pipe(
        map((val: any) => {
          let product

          if (product) {
            this.formData.get('productId').setValue(product._id)
            const title = this.formData.get('title')
            if (title.value !== product.title) {
              title.setValue(product.title)
              this.snackbar.open('Product found. Recipe title updated', 'OK')
            }
          } else {
            this.formData.get('productId').setValue(null)
          }

          return []
        })
      )

    this.filteredData.ingredients = this.newItem
      .get('ingredientId')
      .valueChanges.pipe(
        startWith(''),
        map((val) => {
          if (!val) {
            return []
          }
          return this.filter(val, this.filteredIngredients).slice(0, 10)
        })
      )

    this.filteredData.caps = this.formData.get('capId').valueChanges.pipe(
      startWith(''),
      map((val) => this.filter(val, this.ingredientsService.groups.cap))
    )

    this.filteredData.bottles = this.formData.get('bottleId').valueChanges.pipe(
      startWith(''),
      map((val) => this.filter(val, this.ingredientsService.groups.bottle))
    )

    this.filteredData.scoops = this.formData.get('scoopId').valueChanges.pipe(
      startWith(''),
      map((val) => this.filter(val, this.ingredientsService.groups.scoop))
    )

    this.filteredData.locks = this.formData.get('lockId').valueChanges.pipe(
      startWith(''),
      map((val) => this.filter(val, this.ingredientsService.groups.closure))
    )
  }

  filter(val: any, list: any[]) {
    if (!val || val?.nid || val?._id) {
      return list
    }

    return list
  }

  async getBasics() {
    await lastValueFrom(this.ingredientsService.fetch())

    this.filteredIngredients = this.ingredientsService.data.filter(
      (i: any) =>
        !this.erpService.filteredIngredientsTypesRecipes.includes(i.category)
    )

    if (this.params.id || this.params.copy) {
      this.getData()
    } else {
      this.onData()
    }
  }

  getData() {
    this.recipes
      .getById(this.params.id || this.params.copy)
      .subscribe((res) => {
        this.data = res

        this.isProposal.setValue(this.data.type === 'proposal')
        this.onData()
      })
  }

  onData() {
    this.canEdit =
      !this.params.id ||
      !this.data.author ||
      this.isProposal.value ||
      this.permissions['editAllRecipes'] ||
      this.auth.isSuperAdmin ||
      this.data.author === this.auth.data._id

    if (this.data._id || this.params.copy) {
      Object.keys(this.data).forEach((key) => {
        if (!this.formData.controls[key]) {
          return
        }
        if (key === 'items') {
          const items = this.formData.get('items') as FormArray
          this.data.items.forEach((item) => {
            items.push(this.buildItem(item))
          })
        } else {
          this.formData.get(key).setValue(this.data[key])
        }
      })
    }

    if (this.formData.get('profit').value < this.minMarginalProfit) {
      this.formData.get('profit').setValue(this.minMarginalProfit)
    }

    this.loaded = true
  }

  addItem() {
    const items = this.formData.get('items') as FormArray
    if (!checkIfValidMongoID(this.newItem.value.productId)) {
      this.newItem.value.productTitle = this.newItem.value.productId
      this.newItem.value.productId = null
    }

    items.push(this.buildItem(this.newItem.value))
    this.newItem.setValue({ ...defaultNewItem })
  }

  removeItem(idx) {
    const items = this.formData.get('items') as FormArray
    items.removeAt(idx)
  }

  buildItem(item): FormGroup {
    const newItem = { ...defaultNewItem }
    for (const key in newItem) {
      newItem[key] = item[key] || newItem[key]
    }
    return this.fb.group(newItem)
  }

  checkIfValidArticleNr(): Promise<boolean> {
    if (!this.data.articleNr) {
      return Promise.resolve(true)
    }

    return this.recipes
      .fetch({
        params: { articleNr: this.data.articleNr },
      })
      .toPromise()
      .then(
        (res: any) => !res.filter((r: any) => r._id !== this.params.id).length
      )
  }

  async save() {
    if (!this.loaded) {
      return
    }
    const data: any = {}
    for (const field in this.formData.controls) {
      data[field] = this.formData.controls[field].value
    }

    let product: any

    if (product) {
      data.productId = product._id
      data.client = null
      data.bottleId = null
      data.lockId = null
      data.scoopId = null
    } else {
      data.productId = null
      data.bottleId = checkIfValidMongoID(data.bottleId) ? data.bottleId : null
      data.lockId = checkIfValidMongoID(data.lockId) ? data.lockId : null
      data.scoopId = checkIfValidMongoID(data.scoopId) ? data.scoopId : null
    }

    if (product && product.title !== data.title) {
      data.title = product.title
      this.snackbar.open(
        "Recipe title has been updated to match it's product",
        'OK'
      )
    }

    data.type = this.isProposal.value ? 'proposal' : 'recipe'

    if (!this.isProposal.value && !product) {
      this.snackbar.open("Assign a product if it's not a proposal", 'OK')
      return
    }

    if (!this.isProposal.value) {
      const invalidFieldProduct = requiredProductsFields.filter(
        (k) => !product[k]
      )

      if (invalidFieldProduct.length) {
        this.snackbar.open(
          `Product linked not complete: ${invalidFieldProduct.join(', ')}`,
          'OK'
        )
        return
      }
    }

    const validRecipeArticleNr = await this.checkIfValidArticleNr()
    if (!validRecipeArticleNr) {
      this.snackbar.open('That article number is already being used', 'OK')
      return
    }

    if (this.data._id) {
      this.recipes.update(this.params.id, data).subscribe(() => {
        this.router.navigate(['..'], { relativeTo: this.route })
      })
    } else {
      this.recipes.create(data).subscribe((res: any) => {
        this.router.navigate(['..', res._id], { relativeTo: this.route })
      })
    }
  }
}
