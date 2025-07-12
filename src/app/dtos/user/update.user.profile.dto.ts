export class UpdateUserProfileDTO {
    
    address: string;    
    phone_number: string
    
    constructor(data: any) {
        this.address = data.address;
        this.phone_number = data.phone_number;
    }
}