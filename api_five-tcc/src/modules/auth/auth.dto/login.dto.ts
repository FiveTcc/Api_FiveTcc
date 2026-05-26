import {
    IsEmail,
    IsString,
    IsNotEmpty,
} from 'class-validator';
import { Transform } from 'class-transformer';


export class LoginDto {
    @IsEmail({}, {
        message: 'Credenciais inválidas',
    })
    @Transform(({ value }) => value?.trim().toLowerCase())
    user_email!: string;

    @IsNotEmpty({
        message: 'Senha é obrigatória',
    })
    @IsString({
        message: 'Credenciais inválidas',
    })
    user_senha!: string;


}