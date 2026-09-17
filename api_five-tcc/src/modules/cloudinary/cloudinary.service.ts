import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
} from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';
import { UploadedFileType } from '../common/types/uploaded-file.type'


@Injectable()
export class CloudinaryService {
    constructor() {
        const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
        const apiKey = process.env.CLOUDINARY_API_KEY;
        const apiSecret = process.env.CLOUDINARY_API_SECRET;

        if (!cloudName || !apiKey || !apiSecret) {
            throw new InternalServerErrorException(
                'Credenciais do Cloudinary não configuradas.',
            );
        }

        cloudinary.config({
            cloud_name: cloudName,
            api_key: apiKey,
            api_secret: apiSecret,
        });
    }

    async uploadImagem(arquivo: UploadedFileType, pasta: string) {
        try {
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

                Readable.from(arquivo.buffer).pipe(uploadStream);
            });
        } catch (error) {
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
            if (!publicId) {
                throw new BadRequestException('Public ID da imagem não informado.');
            }

            return await cloudinary.uploader.destroy(publicId);
        } catch (error) {
            if (error instanceof BadRequestException) {
                throw error;
            }

            throw new InternalServerErrorException(
                'Erro ao excluir imagem do Cloudinary',
            );
        }
    }
}