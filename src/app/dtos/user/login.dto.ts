import{
    IsString,
    IsNotEmpty,
    IsPhoneNumber,
    isDate,
    IsDate,
    IsNumber
} from 'class-validator'
export class LoginDTO{
    @IsPhoneNumber()
    phone_number: String

    @IsString()
    @IsNotEmpty()
    password:String



    constructor(data: any){
        this.phone_number = data.phone_number
        this.password = data.password

    }
}