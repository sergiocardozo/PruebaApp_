import { Component, inject } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: true,
  imports: [IonicModule],
})
export class HomePage {
  authSrv = inject(AuthService);
  constructor(private router: Router) {}

  logout() {
    this.authSrv.signOut().then((resp) => {
      this.router.navigate(['/login']);
    })
  }
}
