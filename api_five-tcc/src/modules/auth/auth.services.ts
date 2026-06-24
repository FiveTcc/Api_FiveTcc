import { Injectable , Inject } from "@nestjs/common";
import { LoginDto } from "./auth.dto/login.dto";
import { UserRepositorio } from "../users/userRepositorio";
import type { ConfigType } from '@nestjs/config';
import { HashingService } from "./hashing/hashing.service";
import jwtConfig from "./config/jwt.config";
import { JwtService } from "@nestjs/jwt";


@Injectable()
export class AuthServices {

    constructor(
        private readonly userRepositorio: UserRepositorio,
        private readonly HashingService: HashingService ,
        @Inject(jwtConfig.KEY)
        private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
        private readonly jwtSevices: JwtService
    ) {
          console.log(jwtConfiguration)
     }

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
            // console.log(loginDto.user_senha,);
            // console.log(user.user_senha);
        }

        if (passwordisValid) {
            thowError = false;
        }

        if (thowError) {
            throw new Error('usuario ou senha inválidos');
        }

        const acceasToken = await this.jwtSevices.signAsync({
            sub: user?.id_user,
            email : user?.user_email
        },
        {
           audience:this.jwtConfiguration.audience,
           issuer: this.jwtConfiguration.issuer,
           expiresIn: this.jwtConfiguration.jWTtl
        }
    
        )
        return {
           acceasToken
        }
    }

}