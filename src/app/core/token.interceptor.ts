import { Injectable } from '@angular/core'
import { Router } from '@angular/router'
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpErrorResponse,
} from '@angular/common/http'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'

import { TokenService } from '../token.service'
import { InterceptorSkipHeader } from '../defaults'

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(private token: TokenService, private router: Router) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (!req.headers.has(InterceptorSkipHeader) && this.token.value) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${this.token.value}`,
        },
      })
    }

    return next.handle(req).pipe(
      tap(
        (evt: HttpEvent<any>) => {},
        (err: any) => {
          if (err instanceof HttpErrorResponse) {
            if (err.status === 401) {
              this.token.removeToken()
              this.router.navigate(['/login'])
            }
          }
        }
      )
    )
  }
}
