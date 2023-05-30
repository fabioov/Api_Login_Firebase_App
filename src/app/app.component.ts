import { Component } from '@angular/core';
import { AuthenticationService } from './services/authentication.service';
import { Router } from '@angular/router';
import { UsersService } from './services/users.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  user$ = this.userService.currentUserProfile$;
  
  constructor(private authService: AuthenticationService,
              private router: Router,
              public userService: UsersService){

  }

  logout() {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['']);
    })
  }
}
