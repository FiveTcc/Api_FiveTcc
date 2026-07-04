import { Injectable } from "@nestjs/common";
import { CreateAmbienteDto } from "./dtos/create.ambienteDto";
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
}