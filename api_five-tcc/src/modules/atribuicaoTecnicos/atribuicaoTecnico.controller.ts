// import {
//   Body,
//   Controller,
//   Delete,
//   Get,
//   Param,
//   ParseIntPipe,
//   Patch,
//   Post,
// } from '@nestjs/common';

// import { AtribuicaoTecnicoService } from './atribuicaoTecnico.service';
// import { AtribuirTecnicoDto } from './dtos/atribuirTecnicoDtos';
// import { AtualizarAtribuicaoDto } from './dtos/AtualizarAtribuicaoDto ';

// @Controller('ocorrencias')
// export class AtribuicaoController {
//   constructor(
//     private readonly atribuicaoService: AtribuicaoTecnicoService,
//   ) {}

//   // Vincular técnico
//   @Post(':id/tecnicos')
//   async vincularTecnico(
//     @Param('id', ParseIntPipe) id_ocor: number,
//     @Body() dto: AtribuirTecnicoDto,
//   ) {
//     return this.atribuicaoService.vincularTecnico(
//       id_ocor,
//       dto,
//     );
//   }

//   // Atualizar atribuição
//   @Patch(':id/tecnicos/:id_user')
//   async atualizarAtribuicao(
//     @Param('id', ParseIntPipe) id_ocor: number,
//     @Param('id_user', ParseIntPipe) id_user: number,
//     @Body() dto: AtualizarAtribuicaoDto,
//   ) {
//     return this.atribuicaoService.atualizarAtribuicao(
//       id_ocor,
//       id_user,
//       dto,
//     );
//   }

//   // Remover técnico
//   @Delete(':id/tecnicos/:id_user')
//   async removerTecnico(
//     @Param('id', ParseIntPipe) id_ocor: number,
//     @Param('id_user', ParseIntPipe) id_user: number,
//   ) {
//     return this.atribuicaoService.removerTecnico(
//       id_ocor,
//       id_user,
//     );
//   }

//   // Listar técnicos
//   @Get(':id/tecnicos')
//   async listarTecnicos(
//     @Param('id', ParseIntPipe) id_ocor: number,
//   ) {
//     return this.atribuicaoService.listarTecnicos(id_ocor);
//   }
// }