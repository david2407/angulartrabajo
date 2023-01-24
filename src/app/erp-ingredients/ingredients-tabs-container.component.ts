import { Component, OnInit } from '@angular/core'
import { FormControl } from '@angular/forms'
import { ErpService } from '../erp/erp.service'

@Component({
  selector: 'app-ingredients-tabs-container',
  templateUrl: './ingredients-tabs-container.component.html',
  styleUrls: ['./ingredients-tabs-container.component.sass'],
})
export class IngredientsTabsContainerComponent implements OnInit {
  tabs: string[] = ['New Search']
  stateKey = 'ingredients'
  selected = new FormControl(0)
  savedInfo = []
  isNewTab: boolean = false

  ngOnInit() {
    this.getTabsFromService()
  }

  addTab(change) {
    if (!this.isNewTab) {

      this.tabs.push('New Search')
      this.selected.setValue(this.tabs.length)
      this.savedInfo.push(['New Search', change])
      this.isNewTab = true
    }
  }

  removeTab(index: number) {
    this.tabs.splice(index, 1)
    this.isNewTab = false
  }

  refresh(index: number) {
    this.getTabsFromService()
    this.isNewTab = false
  }

  constructor(private erpService: ErpService) {}

  getTabsFromService() {
    const savedTabs = this.erpService.getTabsInfo(this.stateKey)
    if (savedTabs !== null) {
      this.tabs = []
      savedTabs.map((tab) => this.tabs.push(tab[0]))
      this.savedInfo = savedTabs
    }else{
      this.isNewTab = true
    }

  }
}
