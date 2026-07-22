import { Controller, Post, Body } from '@nestjs/common';
import { LoginDto } from './auth.dto/login.dto';
import { AuthServices } from './auth.services';
import { LogonRefreshTokenDto } from './auth.dto/logon.dto';


@Controller('auth')
export class AuthController {
    constructor(private readonly AuthService: AuthServices,) { }


    // Rota de login
    @Post('/login')
    async login(@Body() loginDto: LoginDto) {
        return await this.AuthService.Login(loginDto);
    }

    // Rota de Logon
    @Post('/refresh')
    refresh( @Body() logonRefreshTokenDto: LogonRefreshTokenDto){
        return this.AuthService.refreshTokens(logonRefreshTokenDto);
    }
   


}

