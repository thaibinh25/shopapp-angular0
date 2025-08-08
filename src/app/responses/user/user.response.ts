import { Role } from "../../models/role";

export interface UserResponse{
    id: number,
    fullname: string,
    phone_number: string,
    address: string,
    zip_code: string,
    prefecture: string,
    city: string,
    address_line1: string,
    address_line2: string,
    is_active: boolean,
    date_of_birth: Date,
    facebook_account_id: number,
    google_account_id: number ,
    role: Role

}