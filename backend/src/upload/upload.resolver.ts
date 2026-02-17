import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { UploadService } from './upload.service';

@Resolver()
export class UploadResolver {
  constructor(private uploadService: UploadService) {}

  /** Returns URL for an uploaded file. Use POST /upload with multipart/form-data for actual file upload, then pass the returned URL here or use as attachment. */
  @Mutation(() => String)
  @UseGuards(JwtAuthGuard)
  async uploadFile(@Args('fileUrl', { nullable: true }) fileUrl?: string): Promise<string> {
    return fileUrl ?? '';
  }
}