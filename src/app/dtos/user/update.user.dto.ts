export class UpdateUserDTO {
    fullname: string;    
    address: string;    
    zip_code: string;
    prefecture: string;
    city: string;
    address_line1: string;
    address_line2: string;
    password: string;    
    retype_password: string;    
    date_of_birth: Date;    
    
    constructor(data: any) {
        this.fullname = data.fullname;
        this.address = data.address;
        this.zip_code = data.zip_code;
        this.prefecture = data.prefecture;
        this.city = data.city;
        this.address_line1 = data.address_line1;
        this.address_line2 = data.address_line2;
        this.password = data.password;
        this.retype_password = data.retype_password;
        this.date_of_birth = data.date_of_birth;        
    }
}