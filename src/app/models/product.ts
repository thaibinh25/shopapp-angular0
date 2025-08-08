import { ProductImage } from "./product_image";

export interface Product {
    id: number;
    name: string;
    price: number;
    oldPrice?: number;
    thumbnail: string;
    description: string;
    category_id: number;
    url: string;
    brand_id: number;
    product_images: ProductImage[];

    badge?: string;
    rating?: number;
    reviews?: number;
}