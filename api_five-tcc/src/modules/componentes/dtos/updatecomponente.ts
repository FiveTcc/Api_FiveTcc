import { PartialType } from "@nestjs/mapped-types";
import { CreateComponenteDto } from "./create.componenteDto";

export class UpdateComponenteDto extends PartialType(CreateComponenteDto) {}
