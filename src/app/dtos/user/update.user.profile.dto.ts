export class UpdateUserProfileDTO {
    fullname: string;
    date_of_birth: string;
    address: string;    
    zip_code: string;
    prefecture: string;
    city: string;
    address_line1: string;
    address_line2: string;
    phone_number: string
    email: string;
    constructor(data: any) {
        this.fullname = data.fullname;
        this.date_of_birth = data.date_of_birth
        this.address = data.address;
        this.zip_code = data.zip_code;
        this.prefecture = data.prefecture;
        this.city = data.city;
        this.address_line1 = data.address_line1;
        this.address_line2 = data.address_line2;
        this.phone_number = data.phone_number;
        this.email = data.email;
    }
}