import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import { IStorageProvider, UploadResult, FileLike } from '../../common/interfaces/storage-provider.interface';

@Injectable()
export class LocalStorageStrategy implements IStorageProvider {
  private readonly uploadDir: string;

  constructor() {
    this.uploadDir = process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads');
  }

  async upload(file: FileLike): Promise<UploadResult> {
    await fs.mkdir(this.uploadDir, { recursive: true });
    const ext = path.extname(file.originalname) || '';
    const baseName = path.basename(file.originalname, ext);
    const fileName = `${baseName}-${Date.now()}${ext}`;
    const filePath = path.join(this.uploadDir, fileName);
    const buffer = file.buffer;
    await fs.writeFile(filePath, buffer);
    const url = `/uploads/${fileName}`;
    return { url, fileName };
  }

  async delete(fileName: string): Promise<void> {
    const filePath = path.join(this.uploadDir, fileName);
    try {
      await fs.unlink(filePath);
    } catch {
      // ignore if file not found
    }
  }

  getUrl(fileName: string): string {
    return `/uploads/${fileName}`;
  }
}