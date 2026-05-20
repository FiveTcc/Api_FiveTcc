import{ IsEmail, IsNotEmpty, IsString } from "class-validator";


export class CriarUserDto {
    id?: number;

    @IsNotEmpty()
    @IsString()
    nome!: string;


    @IsEmail()
    email!: string;

    @IsNotEmpty()
    @IsString()
    senha!: string;
}
