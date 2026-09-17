export type UploadedFileType = {
  buffer: Buffer;
  originalname?: string;
  mimetype?: string;
  size?: number;
  fieldname?: string;
  encoding?: string;
  destination?: string;
  filename?: string;
  path?: string;
  stream?: NodeJS.ReadableStream;
};