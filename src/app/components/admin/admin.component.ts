import { Component, OnInit } from '@angular/core';
import { UserResponse } from '../../responses/user/user.response';
import { UserService } from '../../service/user.service';
import { TokenService } from '../../service/token.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderAdminComponent } from './orders/order.admin.component';
import { CategoryAdminComponent } from './category/category.admin.component';
import { ProductAdminComponent } from './products/product.admin.component';
import { RouterModule } from '@angular/router';


@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent implements OnInit{
  adminComponent: string = 'orders'
  userResponse?: UserResponse | null;
  constructor(
    private userService: UserService,
    private tokenService: TokenService,
    private router: Router
  ){

  }
  ngOnInit() {
    this.userResponse = this.userService.getUserResponseFromLocalStorage();    
  }

  logout() {
    this.userService.removeUserFromLocalStorage();
    this.tokenService.removeToken();
    this.userResponse= this.userService.getUserResponseFromLocalStorage();
    this.router.navigate(['/login']).then(() => {
      window.location.reload();
    });
  }

  showAdminComponent(componentName: string): void {
    this.adminComponent = componentName.toLowerCase();
  }

}
