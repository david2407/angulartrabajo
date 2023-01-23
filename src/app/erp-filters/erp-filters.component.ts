import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core'
import { FormBuilder, FormGroup } from '@angular/forms'
import { map } from 'rxjs/operators'
import { filterListAutocomplete } from '../erp/erp-utils'
import { ErpFilter } from '../erp/erp.interface'
import { ErpService } from '../erp/erp.service'

@Component({
  selector: 'erp-filters',
  templateUrl: './erp-filters.component.html',
  styleUrls: ['./erp-filters.component.sass'],
})
export class ErpFiltersComponent implements OnInit {
  @Output() onChange = new EventEmitter<any>()
  @Output() deleteSearch = new EventEmitter<any>()
  @Input() stateKey: string = ''
  @Input() filtersOpts: ErpFilter[]
  @Input() savedFilterValues: [string, string[]]
  tabName: string
  showFilters: boolean
  showSearchName: boolean
  activeFilters: any[] = []
  validFilters: any[] = []
  filtersForm: FormGroup
  filteredLists: any = {}
  constructor(private fb: FormBuilder, private erpService: ErpService) {}

  ngOnInit() {
    const activeFilters = this.savedFilterValues
      ? Object.keys(this.savedFilterValues[1])
      : this.erpService.getActiveFilters(this.stateKey)
    const savedPreferences = this.erpService.getSectionFilters(this.stateKey)

    const dataForm = {}
    for (const filter of this.filtersOpts) {
      let valid = true
      if (filter.access && !filter.access()) {
        valid = false
      }
      if (valid) {
        if (typeof filter.opts === 'function') {
          filter.opts = filter.opts()
        }
        if (
          activeFilters?.includes(filter.name) ||
          (!activeFilters && savedPreferences?.includes(filter.name))
        ) {
          filter.active = true
        }
        if (filter.default) {
          dataForm[filter.name] = [filter.default]
        } else {
          dataForm[filter.name] = []
        }
        this.validFilters.push(filter)
      }
    }

    this.onOptionToggle()

    this.filtersForm = this.fb.group(dataForm)

    for (const key in dataForm) {
      const filter = this.filtersOpts.find((f) => f.name === key)
      if (filter.interface === 'autocomplete') {
        this.filteredLists[key] = this.filtersForm
          .get(key)
          .valueChanges.pipe(
            map((input: any) =>
              filterListAutocomplete(input, filter.opts, [filter.optTitle])
            )
          )
      }
    }

    if (this.savedFilterValues) {
      Object.entries(this.savedFilterValues[1]).map((filter) => {
        const porpValue = Object.values(filter[1])
        const propTitle = filter[0]
        this.filtersForm.get(propTitle).patchValue(porpValue[0])
      })
    }
  }

  stringAutocomplete(filter) {
    return (val) => {
      if (val) {
        const toFind: any = filter.opts.find((c) => c.value === val)
        return toFind.name
      }
      return ''
    }
  }

  clear() {
    for (const filter of this.validFilters) {
      filter.active = false
    }
    this.onOptionToggle()
  }

  onOperatorChange(filter, opt) {
    filter.operator = opt
  }

  refreshActiveFilters() {
    const filters = {}
    for (const filter of this.validFilters.filter((f) => f.active)) {
      const val = this.filtersForm.get(filter.name).value
      if (val) {
        filters[filter.name] = {
          value: this.filtersForm.get(filter.name).value,
        }
        if (filter.operator) {
          filters[filter.name].operator = filter.operator
        }
      }
    }
    return filters
  }

  done() {
    this.showFilters = false
    const filters = this.refreshActiveFilters()
    this.onChange.next(filters)
  }

  closeAndSaveState() {
    this.showFilters = false
    this.erpService.saveActiveFilters(
      this.stateKey,
      this.validFilters.filter((f) => f.active).map((f) => f.name)
    )
  }

  save() {
    this.erpService.saveSectionFilters(
      this.stateKey,
      this.validFilters.filter((f) => f.active).map((f) => f.name)
    )
  }

  saveTabFilter() {
    this.erpService.saveTabFilter(
      this.stateKey,
      this.tabName || 'Custom Search',
      this.refreshActiveFilters()
    )
    this.deleteSearch.emit()
  }

  closeInputTabName() {
    this.showSearchName = false
  }

  openInputTabName() {
    this.showSearchName = true
  }

  onOptionToggle() {
    this.activeFilters = this.validFilters.filter((f) => f.active)
  }
}
