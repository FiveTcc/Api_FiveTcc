import { PartialType } from "@nestjs/mapped-types";
import { CreateComponenteTipoDto } from "./create.componenteTipoDto";

export class UpdateComponenteTipoDto extends PartialType(CreateComponenteTipoDto) { }