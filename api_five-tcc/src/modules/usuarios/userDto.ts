import {
    IsEmail,
    IsEnum,
    IsNotEmpty,
    IsPhoneNumber,
    IsString,
    Matches,
    MaxLength,
    MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export enum UserTipo {
    ADMIN = 'admin',
    TECNICO = 'tecnico',
    FUNCIONARIO = 'funcionario',
}

export class CreateUserDto {

    @IsString({ message: 'O nome deve ser um texto', })
    @IsNotEmpty({ message: 'O nome é obrigatório', })
    @MinLength(3, { message: 'O nome deve ter no mínimo 3 caracteres', })
    @MaxLength(100, { message: 'O nome deve ter no máximo 100 caracteres', })
    @Transform(({ value }) => {
        if (typeof value === 'string') {
            return value.trim();
        }
        return value;
    })
    user_nome!: string;

    @IsEmail({}, {message: 'E-mail inválido', })
    @MaxLength(255, { message: 'O e-mail deve ter no máximo 255 caracteres', })
     @Transform(({ value }) => {
        if (typeof value === 'string') {
            return value.trim();
        }
        return value;
    })
    user_email!: string;

    
    @IsString({message: 'A senha deve ser um texto',})
    @MinLength(8, {message: 'A senha deve ter no mínimo 8 caracteres', })
    @MaxLength(50, { message: 'A senha deve ter no máximo 50 caracteres',  })
    @Matches(
        /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&])/,
        {
            message:
                'A senha deve conter letra maiúscula, minúscula, número e caractere especial',
        },
    )
     @Transform(({ value }) => {
        if (typeof value === 'string') {
            return value.trim();
        }
        return value;
    })
    user_senha!: string;


    @IsPhoneNumber('BR', { message: 'Telefone inválido', })
     @Transform(({ value }) => {
        if (typeof value === 'string') {
            return value.trim();
        }
        return value;
    })
    user_tel!: string;

    @IsEnum(UserTipo, { message: 'Tipo de usuário inválido', })
     @Transform(({ value }) => {
        if (typeof value === 'string') {
            return value.trim();
        }
        return value;
    })
    user_tipo!: UserTipo;
}


