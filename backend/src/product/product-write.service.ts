import { Injectable, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { ProductRepository } from './product.repository';
import { CreateProductInput } from './dto/create-product.input';
import { UpdateProductInput } from './dto/update-product.input';

@Injectable()
export class ProductWriteService {
  constructor(private productRepo: ProductRepository) {}

  async create(input: CreateProductInput) {
    const parent = await this.productRepo.findById(input.parentId);
    if (!parent) throw new NotFoundException('محصول والد یافت نشد');
    const id = `p-${uuidv4().slice(0, 8)}`;
    return this.productRepo.create({
      id,
      title: input.title,
      description: input.description ?? '',
      parentId: input.parentId,
    });
  }

  async update(id: string, input: UpdateProductInput) {
    await this.productRepo.findById(id);
    return this.productRepo.update(id, {
      title: input.title,
      description: input.description,
    });
  }

  async delete(id: string) {
    await this.productRepo.findById(id);
    return this.productRepo.delete(id);
  }
}