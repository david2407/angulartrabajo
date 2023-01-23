import { Validators } from '@angular/forms'
import { isMongoIdValidator } from '../shared/shared.index'
import clone from 'lodash-es/clone'
import { RecipesKinds } from '../erp/erp.service'

const formOptions = {
  title: {
    value: '',
    required: true,
  },
  publicTitle: '',
  functionalTitle: '',
  addToQuantity: null,
  removeFromQuantity: null,
  internalArticleNr: '',
  articleNr: '',
  batch: '',
  price: { value: 0, validators: [Validators.required] },
  pricePrivate: 0,
  currency: { value: '', validators: [Validators.required] },
  category: { value: '', validators: [Validators.required] },
  settings: [],
  shelf: '',
  ean: '',
  eNumber: '',
  note: '',
  labelSize: '',
  // supplierId: {
  //   value: null,
  //   validators: [Validators.required, isMongoIdValidator()],
  // },
  // ownerId: {
  //   value: null,
  //   validators: [Validators.required, isMongoIdValidator()],
  // },
  unit: { value: '', validators: [Validators.required] },
  carbsSugarPerCent: null,
  carbsPerCent: null,
  fatPerCent: null,
  fatPerCentSaturated: null,
  fiberPerCent: null,
  proteinPerCent: null,
  saltPerCent: null,
  expirationDate: null,
  marked: false,
  public: false,
  nid: null,
  allergen: [],
}

const privateFields = []

export const categories = [
  {
    name: 'Aroma',
    value: 'aroma',
  },
  {
    name: 'Amino Acid',
    value: 'aminoacid',
  },
  {
    name: 'Carbohydrate',
    value: 'carbohydrate',
  },
  {
    name: 'Cap',
    value: 'cap',
  },
  {
    name: 'Fibre',
    value: 'fibre',
  },
  {
    name: 'Herb',
    value: 'herb',
  },
  {
    name: 'Protein',
    value: 'protein',
  },
  {
    name: 'Other',
    value: 'other',
  },
  {
    name: 'Sweetener',
    value: 'sweetener',
  },
  {
    name: 'Vitamin - Mineral',
    value: 'vitamin-mineral',
  },
  {
    name: 'Bag',
    value: 'bag',
  },
  {
    name: 'Bottle',
    value: 'bottle',
  },
  {
    name: 'Closure',
    value: 'closure',
  },
  {
    name: 'Scoop',
    value: 'scoop',
  },
  {
    name: 'Label',
    value: 'label',
  },
  {
    name: 'Box',
    value: 'box',
  },
]

interface Allergen {
  name: string
  value: string
  extendedDescription?: string
}

export const allergenList: Allergen[] = [
  {
    name: 'Egg',
    value: 'egg',
    extendedDescription: 'Egg and products thereof',
  },
  {
    name: 'Crustaceans',
    value: 'crustaceans',
    extendedDescription: 'Crustaceans and products thereof',
  },
  {
    name: 'Fish',
    value: 'fish',
    extendedDescription: 'Fish and products thereof',
  },
  {
    name: 'Gluten',
    value: 'gluten',
    extendedDescription: 'Gluten and products thereof',
  },
  {
    name: 'Peanuts',
    value: 'peanuts',
    extendedDescription: 'Peanuts and products thereof',
  },
  {
    name: 'Soybeans',
    value: 'soybeans',
    extendedDescription: 'Soybeans and products thereof',
  },
  {
    name: 'Milk',
    value: 'milk',
    extendedDescription: 'Milk and products thereof',
  },
  {
    name: 'Nuts',
    value: 'nuts',
    extendedDescription: 'Nuts and products thereof',
  },
  {
    name: 'Celery',
    value: 'celery',
    extendedDescription: 'Celery and products thereof',
  },
  {
    name: 'Mustard',
    value: 'mustard',
    extendedDescription: 'Mustard and products thereof',
  },
  {
    name: 'Sesame',
    value: 'sesame',
    extendedDescription: 'Sesame seeds and products thereof',
  },
  {
    name: 'Sulphur/Sulphite',
    value: 'sulphur/sulphite',
    extendedDescription:
      'Sulphur dioxide and sulphite at concentrations of more than 10 mg/kg or 10 mg/L',
  },
  {
    name: 'Lupin',
    value: 'lupin',
    extendedDescription: 'Lupin and products thereof',
  },
  {
    name: 'Molluscs',
    value: 'molluscs',
    extendedDescription: 'Molluscs and products thereof',
  },
]

export const categoriesToAlwaysShowFutureQuantity: string[] = [
  'bottle',
  'scoop',
  'closure',
]

export class IngredientUtils {
  categories = categories
  formOptions = formOptions
  units: string[] = ['kg', 'st']
  settings = RecipesKinds

  constructor(public auth: any) {}

  getErrorMessage(form, key): string {
    const status = form.controls[key]
    if (status.hasError('required')) {
      return 'You must enter a value'
    }
    return ''
  }

  onData(data = {}) {
    const fields = {}
    console.log("HERE")
    for (const key in this.formOptions) {
      fields[key] = [
        clone(
          this.formOptions[key] !== null &&
            Object.keys(this.formOptions[key]).length
            ? this.formOptions[key].value
            : this.formOptions[key]
        ),
      ]

      const haveValidators = this.formOptions[key]?.validators

      if (haveValidators) {
        fields[key].push([...this.formOptions[key].validators])
      }
    }

    Object.keys(data).forEach((key) => {
      if (!(key in this.formOptions)) {
        return
      }
      fields[key][0] = data[key]
    })
    return fields
  }

  static getPublicTitle(ingredient): string {
    if (!ingredient) {
      return ''
    }
    let title = ingredient.publicTitle || ingredient.title
    if (ingredient.publicTitle && ingredient.eNumber) {
      title += ` (${ingredient.eNumber})`
    }
    if (ingredient.publicTitle && ingredient.functionalTitle) {
      title += ` - ${ingredient.functionalTitle}`
    }
    return title
  }

  isRequired(key): boolean {
    return !!(this.formOptions[key] && this.formOptions[key].required)
  }
}
