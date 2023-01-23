import { Injectable } from '@angular/core'
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
} from '@angular/common/http'
import { Observable } from 'rxjs'

import { TenantService } from '../tenant.service'
import { InterceptorSkipHeader } from '../defaults'

@Injectable()
export class TenantInterceptor implements HttpInterceptor {
  constructor(private tenant: TenantService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (
      !req.headers.has(InterceptorSkipHeader) &&
      this.tenant.value &&
      !req.params.has('tenant')
    ) {
      req = req.clone({
        setParams: {
          tenant: this.tenant.value,
        },
      })
    }

    return next.handle(req)
  }
}
