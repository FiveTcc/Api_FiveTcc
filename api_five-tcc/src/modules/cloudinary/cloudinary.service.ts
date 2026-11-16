import { BadRequestException, Injectable, InternalServerErrorException, Logger, } from '@nestjs/common';

import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

import { UploadedFileType } from '../common/types/uploaded-file.type';

@Injectable()
export class CloudinaryService {
  private enabled = true;
  private logger = new Logger(CloudinaryService.name);

  constructor() {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    console.log('========== CLOUDINARY ==========');
    console.log('Cloud Name:', cloudName);
    console.log('API Key:', apiKey);
    console.log('Secret:', apiSecret ? 'CONFIGURADO' : 'NÃO CONFIGURADO');
    console.log('================================');

    if (!cloudName || !apiKey || !apiSecret) {
      this.enabled = false;
      this.logger.warn(
        'Credenciais do Cloudinary não configuradas. Uploads desabilitados.',
      );
      return;
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });
  }

  async uploadImagem(arquivo: UploadedFileType, pasta: string) {
    try {
      if (!this.enabled) {
        throw new InternalServerErrorException(
          'Cloudinary não configurado. Defina CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY e CLOUDINARY_API_SECRET.',
        );
      }

      if (!arquivo || !arquivo.buffer || arquivo.buffer.length === 0) {
        throw new BadRequestException('Arquivo de imagem inválido ou vazio.');
      }

      return await new Promise<any>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: pasta,
            resource_type: 'image',
          },
          (error, result) => {
            if (error) {
              reject(error);
              return;
            }

            resolve(result);
          },
        );

        Readable.from([arquivo.buffer]).pipe(uploadStream);
      });
    } catch (error) {
      console.error('========== ERRO CLOUDINARY ==========');
      console.error(error);

      if (error instanceof Error) {
        console.error('Mensagem:', error.message);
        console.error('Stack:', error.stack);
      }

      console.error('=====================================');

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Erro ao enviar imagem para o Cloudinary',
      );
    }
  }

  async excluirImagem(publicId: string) {
    try {
      if (!this.enabled) {
        throw new InternalServerErrorException(
          'Cloudinary não configurado. Defina CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY e CLOUDINARY_API_SECRET.',
        );
      }

      if (!publicId) {
        throw new BadRequestException('Public ID da imagem não informado.');
      }

      return await cloudinary.uploader.destroy(publicId);
    } catch (error) {
      console.error('Erro ao excluir imagem do Cloudinary:', error);

      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Erro ao excluir imagem do Cloudinary',
      );
    }
  }
}
