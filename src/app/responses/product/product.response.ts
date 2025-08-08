import { ProductImage } from "../../models/product_image";

export interface ProductResponse {
  id: number;
  name: string;
  price: number;
  oldPrice?: number;
  thumbnail: string;
  description: string;
  category_id: number;
  brand_id: number;
  product_images: ProductImage[];
  badge?: string;
  rating?: number;
  reviews?: number;
}