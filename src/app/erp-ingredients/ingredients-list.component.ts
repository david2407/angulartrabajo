import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core'
import { FormControl } from '@angular/forms'

import { MatTableDataSource } from '@angular/material/table'
import { MatPaginator } from '@angular/material/paginator'
import { MatSort } from '@angular/material/sort'
import { SelectionModel } from '@angular/cdk/collections'
import { lastValueFrom } from 'rxjs'

import { AuthService } from '../auth.service'
import { ErpFilter, TableColumnType } from '../erp/erp.interface'
import { IngredientsService } from '../erp/ingredients.service'
import { ErpService } from '../erp/erp.service'
import { checkIfValidMongoID } from '../core/utils'
import {
  categories,
  categoriesToAlwaysShowFutureQuantity,
} from './ingredient.utils'

@Component({
  selector: 'app-ingredients-list',
  templateUrl: './ingredients-list.component.html',
  styleUrls: ['./ingredients-list.component.sass'],
})
export class IngredientsListComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator
  @ViewChild(MatSort) sort!: MatSort

  @Output() searchEvent = new EventEmitter<{}>()
  @Output() EmptySearch = new EventEmitter()

  @Input() savedFilterValues: [string, string[]]
  @Input() tabs: string[]

  isOnline!: boolean
  stateKey = 'ingredients'
  loaded: boolean = false
  futureDataLoaded!: boolean
  permissions: any[] = []
  data: any
  filteredClients: any
  visibleColumns: FormControl = new FormControl()
  selection = new SelectionModel<any>(true, [])
  dataTable: MatTableDataSource<any> = new MatTableDataSource()
  customFilters = []
  filtersOpts: ErpFilter[] = [
    {
      title: 'Title',
      name: 'title',
      fieldType: 'string',
      inputInserted: 'fsd',
    },
    { title: 'Article nr', name: 'articleNr', fieldType: 'string' },
    {
      title: 'Category',
      name: 'category',
      fieldType: 'string',
      interface: 'autocomplete',
      opts: categories,
      optTitle: 'name',
      optValue: 'value',
    },
    {
      title: 'Only items with negative qty',
      name: 'negativeQty',
      fieldType: 'boolean',
    },
    {
      title: 'Only items without category',
      name: 'noCategory',
      fieldType: 'boolean',
    },
    {
      title: 'Only items without owner',
      name: 'noOwner',
      fieldType: 'boolean',
    },
    {
      title: 'Only items without price',
      name: 'showWithoutPrice',
      fieldType: 'boolean',
    },
    {
      title: 'Only with future negative quantity',
      name: 'showFutureNegativeQuantity',
      fieldType: 'boolean',
      access: () =>
        this.auth.isSuperAdmin || this.permissions['showFutureQuantity'],
    },
    {
      title: 'Last changed',
      name: 'modified',
      fieldType: 'date',
    },
  ]
  defaultColumns: TableColumnType[] = [
    { default: true, name: 'select', label: 'Select' },
    { default: true, name: 'title', label: 'Title' },
    { default: false, name: 'public', label: 'Public' },
    { default: true, name: 'articleNr', label: 'Article nr' },
    { default: true, name: 'ean', label: 'EAN' },
    { default: true, name: 'expirationDate', label: 'Expiration date' },
    { default: true, name: 'shelf', label: 'Shelf' },
    { default: false, name: 'labelSize', label: 'Label size' },
    {
      default: false,
      name: 'carbsSugarPerCent',
      label: 'Carbs sugar per cent',
    },
    { default: false, name: 'carbsPerCent', label: 'Carbs per cent' },
    { default: false, name: 'fatPerCent', label: 'Fat per cent' },
    {
      default: false,
      name: 'fatPerCentSaturated',
      label: 'Fat per cent saturated',
    },
    { default: false, name: 'fiberPerCent', label: 'Fiber per cent' },
    { default: false, name: 'proteinPerCent', label: 'Protein per cent' },
    { default: false, name: 'saltPerCent', label: 'Salt per cent' },
    { default: true, name: 'price', label: 'Price' },
    { default: true, name: 'note', label: 'Note' },
  ]
  categoriesToAlwaysShowFutureQuantity = categoriesToAlwaysShowFutureQuantity

  constructor(
    private erpService: ErpService,
    public auth: AuthService,
    public ingredients: IngredientsService
  ) {}

  trackById(idx: number, item: any) {
    return item._id
  }

  async ngOnInit() {
    this.loaded = false

    // Set default visible fields
    this.visibleColumns.setValue(
      this.erpService.getSectionColumns(this.stateKey, this.defaultColumns)
    )

    await lastValueFrom(this.ingredients.fetch())

    this.data = [...this.ingredients.data]
    this.dataTable = new MatTableDataSource(this.data)
    this.dataTable.paginator = this.paginator
    this.dataTable.sort = this.sort

    this.applyFilter()

    // const state: any = this.state.getState(this.stateKey)
    if (this.savedFilterValues) {
      this.updateFilter(this.savedFilterValues[1])
    } else {
      this.updateFilter()
    }
  }

  onSearch() {
    !this.tabs.includes('New Search') &&
      this.searchEvent.emit(this.dataTable.filter)
  }

  onEmptySearch() {
    this.EmptySearch.emit()
  }

  updateFilter(change?) {
    this.dataTable.filter = change
    this.paginator.firstPage()
    this.loaded = true
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length
    const numRows = this.dataTable.data.length
    return numSelected === numRows
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.dataTable.data.forEach((row) => this.selection.select(row))
  }

  applyFilter() {
    this.dataTable.filterPredicate = (item, change: any) => {
      if (
        change.title?.value &&
        !item.title.toLowerCase().includes(change.title.value.toLowerCase())
      ) {
        return false
      }

      if (
        change.articleNr?.value &&
        !item.articleNr
          .toLowerCase()
          .includes(change.articleNr.value.toLowerCase())
      ) {
        return false
      }

      if (
        checkIfValidMongoID(change.ownerId?.value) &&
        item.ownerId !== change.ownerId.value
      ) {
        return false
      }

      if (
        checkIfValidMongoID(change.supplierId?.value) &&
        item.supplierId !== change.supplierId.value
      ) {
        return false
      }

      if (
        change.category?.value &&
        change.category.value.toLowerCase() !== item.category.toLowerCase()
      ) {
        return false
      }

      if (change.negativeQty?.value && item.totalQty >= 0) {
        return false
      }

      if (change.noCategory?.value && item.category) {
        return false
      }

      if (change.workplaceId?.value) {
        let hasInventory
        for (const inventory of item.inventory) {
          if (
            inventory.workplaceId === change.workplaceId.value &&
            inventory.quantity > 0
          ) {
            hasInventory = true
          }
        }
        if (!hasInventory) {
          return false
        }
      }

      if (change.noOwner?.value && item.ownerId) {
        return false
      }

      if (change.showWithoutPrice?.value && item.price) {
        return false
      }

      if (change.modified) {
        if (
          change.modified.operator === 'gt' &&
          new Date(item.modified) < change.modified.value
        ) {
          return false
        } else if (
          change.modified.operator === 'lt' &&
          new Date(item.modified) > change.modified.value
        ) {
          return false
        }
      }

      if (
        this.visibleColumns.value.includes('futureQuantity') &&
        change?.showFutureNegativeQuantity?.value &&
        (!item.futureQuantity || item.futureQuantity >= 0)
      ) {
        return false
      }

      return true
    }
  }

  refreshTable() {
    this.dataTable.paginator = this.paginator
  }
}
