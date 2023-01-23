import { Injectable } from '@angular/core'
import { Router } from '@angular/router'
import { Subject, ReplaySubject } from 'rxjs'
import { defaultTenant } from './defaults'

export let tenantValue: string = defaultTenant

@Injectable({ providedIn: 'root' })
export class TenantService {
  value: string = defaultTenant
  onChange: Subject<any> = new ReplaySubject(1)
  constructor(private router: Router) {
    this.router.events.subscribe((evt: any) => {
      if (evt.snapshot?.params?.tenant) {
        this.setTenant(evt.snapshot.params.tenant)
      }
    })
  }

  setTenant(tenant: string) {
    if (this.value === tenant) {
      return
    }
    this.value = tenant
    tenantValue = tenant
    this.onChange.next(this.value)
  }
}
