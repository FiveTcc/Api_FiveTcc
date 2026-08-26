import { PartialType, OmitType } from "@nestjs/mapped-types";
import { CreateOcorrenciaDto } from "./createocorrenciaDto";

export class UpdateOcorrenciaDto extends PartialType(CreateOcorrenciaDto) { }