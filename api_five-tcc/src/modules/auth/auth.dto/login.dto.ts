import {
    IsEmail,
    IsString,
    MaxLength,
    MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';


export class LoginDto {
    @IsEmail({}, {
        message: 'Credenciais inválidas',
    })
    @Transform(({ value }) => value?.trim().toLowerCase())
    user_email!: string;

    @IsString({
        message: 'Credenciais inválidas',
    })
    @MinLength(6, {
        message: 'Credenciais inválidas',
    })
    @MaxLength(40, {
        message: 'Credenciais inválidas',
    })
    user_senha!: string;


}