import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFiles,
  Req,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { UploadsService } from './uploads.service';
import * as fs from 'fs';
import * as path from 'path';

const uploadsDir = path.join(process.cwd(), 'uploads');

@Controller('attachments')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post()
  @UseInterceptors(
    FilesInterceptor('attachment[]', 20, {
      storage: diskStorage({
        destination: (req, file, cb) => {
          fs.mkdirSync(uploadsDir, { recursive: true });
          cb(null, uploadsDir);
        },
        filename: (req, file, cb) => {
          const ext = path.extname(file.originalname) || '.png';
          cb(
            null,
            `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`,
          );
        },
      }),
    }),
  )
  uploadFile(
    @UploadedFiles() attachments: Array<Express.Multer.File>,
    @Req() req,
  ) {
    const protocol = req.secure || req.get('x-forwarded-proto') === 'https'
      ? 'https'
      : req.protocol;
    const host = req.get('host');
    return (attachments || []).map((file, index) => ({
      id: String(file.filename.replace(path.extname(file.filename), '')),
      original: `${protocol}://${host}/uploads/${file.filename}`,
      thumbnail: `${protocol}://${host}/uploads/${file.filename}`,
    }));
  }
}