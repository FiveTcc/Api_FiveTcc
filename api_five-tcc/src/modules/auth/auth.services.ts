import { Injectable } from "@nestjs/common";
import { LoginDto } from "./auth.dto/login.dto";
import { UserRepositorio } from "../users/userRepositorio";
import { HashingService } from "./hashing/hashing.service";

@Injectable()
export class AuthServices {

    constructor(
        private readonly userRepositorio: UserRepositorio,
        private readonly HashingService: HashingService
    ) { }


    async Login(loginDto: LoginDto) {

        let passwordisValid = false;
        let thowError = true;

        const user = await this.userRepositorio.VerificarEmailExistente(
            loginDto.user_email);

        if (user) {
            passwordisValid = await this.HashingService.compare(
                loginDto.user_senha,
                user.user_senha
            );
            console.log(loginDto.user_senha,);
            console.log(user.user_senha);
        }

        if (passwordisValid) {
            thowError = false;
        }

        if (thowError) {
            throw new Error('usuario ou senha inválidos');
        }

        // Aqui você pode gerar um token JWT ou realizar outras ações necessárias para autenticação bem-sucedida
        return {
            message: 'Login bem-sucedido',
        }
    }

}