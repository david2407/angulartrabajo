import { Injectable } from '@angular/core';
import jwt_decode from 'jwt-decode';

@Injectable({ providedIn: 'root' })
export class TokenService {
  value: string = '';

  public isTokenExpired(token: string): boolean {
    const currenTime = new Date().getTime() / 1000;
    const decodedToken: any = jwt_decode(token);
    return currenTime > decodedToken.exp;
  }

  public removeToken() {
    this.value = '';
    window.localStorage.removeItem('tokenService');
  }
}
