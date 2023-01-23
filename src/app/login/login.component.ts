import { Component, AfterViewInit } from '@angular/core'
import { AuthService } from '../auth.service'

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.sass'],
})
export class LoginComponent implements AfterViewInit {
  constructor(private authService: AuthService) {}

  ngAfterViewInit() {
    this.authService.loadGoogleAccounts()
    this.authService.renderGoogleButton()
  }
}
