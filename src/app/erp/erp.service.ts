import { Injectable } from '@angular/core'
import { MatSnackBar } from '@angular/material/snack-bar'
import { TenantService } from '../tenant.service'
import { TableColumnType } from './erp.interface'

export const RecipesTypes = [
  {
    title: 'Recipe',
    value: 'recipe',
  },
  {
    title: 'Proposal',
    value: 'proposal',
  },
]

export const RecipesKinds = [
  {
    title: 'Protein - Gainer',
    value: 'prot-gain',
    hasMaxKg: true,
  },
  {
    title: 'Amino',
    value: 'amino',
    hasMaxKg: true,
  },
  {
    title: 'Omega-Cla',
    value: 'omega-cla',
  },
  {
    title: 'Ren Amino',
    value: 'ren-amino',
    hasMaxKg: true,
  },
  {
    title: 'Cps Gelatin',
    value: 'cps-gelatin',
  },
  {
    title: 'Cps Vege',
    value: 'cps-vege',
  },
  {
    title: 'Cps Vege 000',
    value: 'cps-vege-000',
  },
  {
    title: 'Tabletter',
    value: 'tabletter',
  },
  {
    title: 'RTD',
    value: 'rtd',
  },
]

@Injectable()
export class ErpService {
  sectionKey = 'admin-private'
  firebaseKey = 'admin-erp'
  activeFilters: any = {}
  filteredIngredientsTypesRecipes: string[] = [
    'bottle',
    'closure',
    'scoop',
    'label',
    'box',
  ]
  constructor(
    private snackbar: MatSnackBar,
    private tenantService: TenantService
  ) {}

  getSectionColumns(key: string, possibleOpts: TableColumnType[]) {
    return possibleOpts.filter((c) => c.default).map((c) => c.name)
  }

  getSectionFilters(key: string) {
    const lsKey = `${this.tenantService.value}.${this.firebaseKey}.${key}.filters`
    let val: any = window.localStorage.getItem(lsKey)
    if (!val) {
      return null
    }
    return JSON.parse(val)
  }

  saveSectionPreferredColumns(key: string, columns: string[]) {
    const lsKey = `${this.tenantService.value}.${this.firebaseKey}.${key}.columns`
    window.localStorage.setItem(lsKey, JSON.stringify(columns))
    this.snackbar.open('Options saved', '', { duration: 500 })
  }

  saveSectionFilters(key: string, filters: string[]) {
    const lsKey = `${this.tenantService.value}.${this.firebaseKey}.${key}.filters`
    window.localStorage.setItem(lsKey, JSON.stringify(filters))
    this.snackbar.open('Filters saved', '', { duration: 500 })
  }

  saveTabFilter(key: string, tabName: string, criteria: {}) {
    const tabKey = `${this.tenantService.value}.${this.firebaseKey}.${key}.tabs`
    const savedTabs = JSON.parse(window.localStorage.getItem(tabKey))
    window.localStorage.setItem(
      tabKey,
      !savedTabs
        ? JSON.stringify([[tabName, criteria]])
        : JSON.stringify([...savedTabs, [tabName, criteria]])
    )
    this.snackbar.open('Search saved', '', { duration: 1000 })
  }

  getActiveFilters(key: string): string[] {
    return this.activeFilters[key]
  }

  getTabsInfo(key: string): any[] {
    const tabKey = `${this.tenantService.value}.${this.firebaseKey}.${key}.tabs`
    return JSON.parse(window.localStorage.getItem(tabKey)) || null
  }

  saveActiveFilters(key: string, filters: string[]) {
    this.activeFilters[key] = filters
  }
}
