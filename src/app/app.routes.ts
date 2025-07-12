import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { DetailProductComponent } from './components/detail-product/detail-product.component';
import { OrderComponent } from './components/order/order.component';
import { OrderDetailComponent } from './components/order.details/order.detail.component';
import { AuthGuardFn } from './guards/auth.guard';
import { UserProfileComponent } from './components/user-profile/user.profile.component';
import { AdminComponent } from './components/admin/admin.component';
import { AdminGuardFn } from './guards/admin.guard';
import { adminRoutes } from './components/admin/admin.routing';
import { OrderHistoryComponent } from './components/order.history/order.history.component';
import { NotificationDetailComponent } from './components/notification-detail/notification-detail.component';
import { OauthCallbackComponent } from './components/oauth.callback/oauth.callback.component';




export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'products/:id', component: DetailProductComponent },
    { path: 'orders', component: OrderComponent, canActivate: [AuthGuardFn] },
    { path: 'user-profile', component: UserProfileComponent, canActivate: [AuthGuardFn] },
    { path: 'orders/users:id', component: OrderHistoryComponent, canActivate: [AuthGuardFn] },
    { path: 'orders/:id', component: OrderDetailComponent },
    {
      path: 'notifications/:id',component: NotificationDetailComponent,canActivate: [AuthGuardFn]},
    { path: 'admin', 
      component: AdminComponent, 
      canActivate: [AdminGuardFn],
      children: adminRoutes, 
    },
    {path: 'oauth2/callback' ,component: OauthCallbackComponent}
    
  ];

