import { Controller, Post , Body } from '@nestjs/common';
import { LoginDto } from './auth.dto/login.dto';
import { AuthServices } from './auth.services';


@Controller('auth')
export class AuthController {
    constructor(  private readonly AuthService: AuthServices ) {}
      
   

    @Post('/login')
    async login(@Body() loginDto: LoginDto) {
        return await this.AuthService.Login(loginDto);
    }





}

