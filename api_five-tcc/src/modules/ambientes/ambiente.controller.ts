import { Controller ,  Post , Get ,Patch} from "@nestjs/common";


@Controller('ambientes')
export class AmbientesController {


    @Post('cadastra')
    async CadastarAmbiente(){
    
        return 'ambiente cadastrado'
    }   
    
    @Get('ListarAmbinete')
    async lisatraAmbientes(){
       return 'ambiente criado'
    }
    
    @Get('/bloco/:bloco')
    async buscarPorBloco(){
        return 'bloco encontrado'
    }

    @Get('/tipo/:tipo')
    async buscarPorTipo(){
        return 'tipo encontrado'
    }

    @Patch(':id')
    async atualizar(){
        return 'atualizado'
    }

    @Patch(':id/status')
    async alterarStatus(){
        return 'atualizado ?'
    }

    @Patch(':id')
    async inativarAmbiente(){
        return 'ambiente inativado'
    }


}

