import { Injectable } from "@nestjs/common";
import { CreateAmbienteDto } from "./dtos/create.ambienteDto";
import { UpdateAmbienteDto } from "./dtos/update.ambienteDtos";
import { AmbienteRepository } from "./ambiente.repository";

@Injectable()
export class AmbienteService {


    constructor(private readonly AmbienteRepository: AmbienteRepository) { }

    async CadastrarAmbiente(CreateAmbienteDto: CreateAmbienteDto, idUser: number) {
        return this.AmbienteRepository.CadastrarAmbiente(CreateAmbienteDto, idUser);
    }
    
    async ListarAmbientes() {
        return this.AmbienteRepository.ListarAmbientes();
    }

    async FiltroPorBloco(bloco: string) {
        return this.AmbienteRepository.FiltroPorBloco(bloco);
    }

    async FiltroTipo(tipoAmb: string) {
        return this.AmbienteRepository.FiltroTipo(tipoAmb);
    }

    async EditarAmbiente( id: number, UpdateAmbienteDto: UpdateAmbienteDto ) {
        return this.AmbienteRepository.EditarAmbiente(id ,UpdateAmbienteDto);
    }

    async AtualizarStatusAmbiente(id: number) {
        return this.AmbienteRepository.AtualizarStatusAmbiente(id);
    }

    
}