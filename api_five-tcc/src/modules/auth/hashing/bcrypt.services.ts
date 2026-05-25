import { HashingService } from './hashing.service';
import * as bcrypt from 'bcrypt';


// gera um hash a partir de uma senha e compara uma senha com um hash
export class BcryptService extends HashingService {
    async hash(password: string): Promise<string> {
        const salt = await bcrypt.genSalt(10);
        return await bcrypt.hash(password, salt);
    }


    // compara a senha com o hash e retorna true ou false
    async compare(password: string, passwordHash: string): Promise<boolean> {
        return await bcrypt.compare(password, passwordHash);
    }

}