import { PartialType, OmitType } from "@nestjs/mapped-types";
import { CreateOcorrenciaDto } from "./createocorrenciaDto";

export class UpdateOcorrenciaDto extends PartialType(
    OmitType(CreateOcorrenciaDto, ['ocor_status'] as const),
) { }