import { Routes } from "@angular/router";
import { OrderAdminComponent } from "./orders/order.admin.component";
import { ProductAdminComponent } from "./products/product.admin.component";
import { CategoryAdminComponent } from "./category/category.admin.component";
import { OrderDetailAdminComponent } from "./order-detail/order.detail.admin.component";
import { BrandAdminComponent } from "./brand.admin/brand.admin.component";
import { NotificationAdminComponent } from "./notification/notification.admin.component";

export const adminRoutes: Routes = [
    {
        path: 'orders',
        component: OrderAdminComponent
    },
    {
        path: 'orders/:id',
        component: OrderDetailAdminComponent
    },
    {
        path: 'products',
        component: ProductAdminComponent
    },
    {
        path: 'categories',
        component: CategoryAdminComponent
    },
    {
        path: 'brands',
        component: BrandAdminComponent
    },
    {
        path: 'notifications',
        component: NotificationAdminComponent
    },
];