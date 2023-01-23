import { Injectable } from '@angular/core'
import {
  HttpInterceptor,
  HttpEvent,
  HttpHandler,
  HttpRequest,
  HttpResponse,
  HttpErrorResponse,
} from '@angular/common/http'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'
import { MatSnackBar } from '@angular/material/snack-bar'

import { CustomHttpErrors } from './http-errors'
import { InterceptorErrorSkipHeader } from '../defaults'

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private snackbar: MatSnackBar) {}
  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const onResponse = (err, statusCode: number) => {
      if (err?.error?.message) {
        this.snackbar.open(err.error.message, 'Dismiss')
        return
      }
      if (err?.error?.messages) {
        this.snackbar.open(err.error.messages[0], 'Dismiss')
        return
      }
      const findCustomError = CustomHttpErrors.find((e) =>
        e.codes.includes(statusCode)
      )
      if (findCustomError) {
        this.snackbar.open(findCustomError.message, 'Dismiss')
      } else if (statusCode >= 400 && statusCode < 500) {
        this.snackbar.open('Something went wrong.', 'Dismiss')
      } else if (statusCode >= 500) {
        this.snackbar.open('SERVER ERROR. Try Again later', 'Dismiss')
      }
    }

    return next.handle(req).pipe(
      tap(
        (evt) => {
          if (
            !req.headers.has(InterceptorErrorSkipHeader) &&
            window.navigator.onLine &&
            evt instanceof HttpResponse
          ) {
            onResponse(null, evt.status)
          }
        },
        (err) => {
          if (
            !req.headers.has(InterceptorErrorSkipHeader) &&
            window.navigator.onLine &&
            err instanceof HttpErrorResponse
          ) {
            onResponse(err, err.status)
          }
        }
      )
    )
  }
}
