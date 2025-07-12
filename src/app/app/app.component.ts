import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../components/header/header.component';
import { FooterComponent } from '../components/footer/footer.component';
import { filter } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-app',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent, FormsModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {

  shouldShowHeaderFooter = true;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(event => {
      const currentRoute = this.router.url;

      // Ẩn header và footer chỉ khi ở những trang /login hoặc các trang admin
      if (currentRoute === '/login' || currentRoute.startsWith('/admin') || currentRoute === '/register') {
        this.shouldShowHeaderFooter = false;
      } else {
        this.shouldShowHeaderFooter = true;
      }
    });
  }
}
