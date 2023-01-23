declare const window: any
import { Router } from '@angular/router'
import { Injectable, NgZone } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { MatSnackBar } from '@angular/material/snack-bar'
import { Observable, Subject, ReplaySubject, lastValueFrom } from 'rxjs'

import { environment } from '../environments/environment'
import { TokenService } from './token.service'
import { TenantService } from './tenant.service'
@Injectable({ providedIn: 'root' })
export class AuthService {
  data: any
  loggedIn: Subject<boolean> = new ReplaySubject(1)
  validRoles: string[] = ['admin', 'super-admin']
  roles: any
  isSuperAdmin: boolean
  isDeveloper: boolean
  opts: any
  exponentialBackoffTime = 200

  constructor(
    private zone: NgZone,
    private http: HttpClient,
    private router: Router,
    private snackbar: MatSnackBar,
    private tokenService: TokenService,
    private tenantService: TenantService
  ) {
    this.init()
  }

  async init() {
    this.tenantService.onChange.subscribe(() => this.getUserInfo())
    const token = localStorage.getItem('tokenService')
    if (token) {
      await this.getMember(token)
      this.getUserInfo()
    } else {
      this.loggedIn.next(false)
    }
  }

  getUserInfo() {
    if (!this.checkIfValid()) {
      return
    }

    this.roles = this.data.roles[this.tenantService.value]
    this.getOpts()
    this.isSuperAdmin = this.checkIfSuperAdmin()
  }

  getOpts(tenant?: string) {
    this.opts = this.data.opts?.[tenant || this.tenantService.value] || {}
  }

  checkLocalStorage() {
    const test = 'testLocalStorage'
    try {
      localStorage.setItem(test, test)
      localStorage.removeItem(test)
    } catch (err) {
      return false
    }
    return true
  }

  get isLoggedIn(): Observable<boolean> {
    return this.loggedIn
  }

  async getMember(token: string) {
    const headers = {}
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const urlMember = `${environment.host}/api/member`

    let res
    try {
      res = await lastValueFrom(this.http.get(urlMember, { headers }))
    } catch (err) {
      if (err.status === 401) {
        this.tokenService.removeToken()
        this.navigateToLogin()
      }
      return
    }

    this.data = res
    this.setToken(res.token)
  }

  async updateMember() {
    await lastValueFrom(
      this.http.put(`${environment.host}/v1/member`, this.data)
    )
  }

  navigateToLogin() {
    this.router.navigate(['/login'])
  }

  setToken(token: string) {
    if (this.checkLocalStorage()) {
      localStorage.setItem('tokenService', token)
    }

    if (this.checkIfValid()) {
      this.tokenService.value = token
      this.loggedIn.next(true)
      return
    }

    this.snackbar.open("Your account doesn't have access", '', {
      duration: 5000,
    })
    this.loggedIn.next(false)
    this.logout()
  }

  checkIfValid() {
    for (const tenant in this.data.roles) {
      for (const role of this.data.roles[tenant]) {
        if (this.validRoles.includes(role)) {
          return true
        }
      }
    }

    return false
  }

  // Find role by exact name
  hasRole(role: string): boolean {
    if (this.isSuperAdmin) {
      return true
    }
    return this.roles.includes(role)
  }

  // Find if access is allowed even if limited
  hasAccess(role: string): boolean {
    if (this.isSuperAdmin) {
      return true
    }
    return this.roles.some((r) => r.includes(role))
  }

  canMakeChanges(role: string): boolean {
    if (this.isSuperAdmin) {
      return true
    }
    return this.roles.includes(role)
  }

  checkIfSuperAdmin(): boolean {
    return this.hasRole('super-admin')
  }

  checkPermission(
    system: string,
    section: string,
    permission: string
  ): boolean {
    if (this.isSuperAdmin) {
      return true
    }

    return this.roles.some(
      (role) =>
        role.includes(system) &&
        role.includes(section) &&
        role.includes(permission)
    )
  }

  renderGoogleButton(count?: number) {
    if (typeof window.google === 'undefined') {
      if (count === 10) {
        const snackBarRef = this.snackbar.open(
          'ERROR when loading button to sign in',
          'Reload page'
        )
        snackBarRef.onAction().subscribe(() => {
          location.reload()
        })
      } else {
        count ??= 1
        setTimeout(() => {
          count++
          this.renderGoogleButton(count)
        }, this.exponentialBackoffTime * count)
      }
      return
    }

    setTimeout(() => {
      try {
        window.google.accounts.id.renderButton(
          document.getElementById('google-sign-in'),
          { theme: 'outline', size: 'medium' }
        )
      } catch (err) {
        console.log('err3', err)
      }
    })
  }

  logout() {
    this.tokenService.value = null
    this.data = null
    this.roles = []
    localStorage.removeItem('tokenService')
    this.loggedIn.next(false)
    this.navigateToLogin()
  }

  loadGoogleAccounts(count?: number) {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: environment.googleClientId,
        callback: this.onSuccessGoogle.bind(this),
      })
    } else {
      count ??= 1
      setTimeout(() => {
        count++
        this.loadGoogleAccounts(count)
      }, this.exponentialBackoffTime * count)
    }
  }

  async onSuccessGoogle(browserLibrary?, id_token?) {
    let res
    try {
      res = await lastValueFrom(
        this.http.post(
          `${environment.host}/auth/google`,
          {
            tokenId: browserLibrary?.credential || id_token,
          },
          {
            params: {
              tenant: 'dev',
            },
            responseType: 'text',
          }
        )
      )
    } catch (err) {
      console.error(err)
      return
    }

    await this.getMember(res)

    this.zone.run(() => {
      this.router.navigate([''])
    })
  }

  onFailureGoogle(err) {
    console.error(err)
  }

  isMe(names: string[]): boolean {
    return names.includes(this.data.name)
  }
}
