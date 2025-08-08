import {
    IsString,
    IsNotEmpty,
    IsPhoneNumber,
    isDate,
    IsDate
} from 'class-validator'
export class RegisterDTO {
    @IsString()
    fullname: String

    @IsString()
    email: String

    @IsPhoneNumber()
    phone_number: String

    @IsString()
    @IsNotEmpty()
    address: String

    @IsString()
    @IsNotEmpty()
    zip_code: string;

    @IsString()
    @IsNotEmpty()
    prefecture: string;

    @IsString()
    @IsNotEmpty()
    city: string;

    @IsString()
    @IsNotEmpty()
    address_line1: string;

    @IsString()
    @IsNotEmpty()
    address_line2: string;

    @IsString()
    @IsNotEmpty()
    password: String

    @IsString()
    @IsNotEmpty()
    retype_password: String

    @IsDate()
    date_of_birth: string

    facebook_account_id: string | null
    google_account_id: string | null
    role_id: number = 1

    constructor(data: any) {
        this.fullname = data.fullName
        this.phone_number = data.phone_number
        this.email = data.email
        this.address = data.address
        this.zip_code = data.zip_code;
        this.prefecture = data.prefecture;
        this.city = data.city;
        this.address_line1 = data.address_line1;
        this.address_line2 = data.address_line2;
        this.password = data.password
        this.retype_password = data.retype_password
        this.date_of_birth = data.date_of_birth
        this.facebook_account_id = data.facebook_account_id || 0
        this.google_account_id = data.google_account_id || 0
        this.role_id = data.role_id || 1
    }
}