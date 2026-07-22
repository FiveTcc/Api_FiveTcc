import { IsNotEmpty, IsString } from "class-validator";

export class LogonRefreshTokenDto {

    @IsString()
    refreshToken!: string;

}