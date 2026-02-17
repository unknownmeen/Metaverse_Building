import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductRepository } from './product.repository';
import { BreadcrumbItem } from '../common/types';

@Injectable()
export class ProductReadService {
  constructor(private productRepo: ProductRepository) {}

  async getProduct(id: string) {
    const product = await this.productRepo.findById(id);
    if (!product) throw new NotFoundException('محصول یافت نشد');
    return product;
  }

  async getProductTree(rootId?: string) {
    const root = rootId
      ? await this.productRepo.findByIdWithChildrenRecursive(rootId)
      : await this.productRepo.findRoot().then((r) => r && this.productRepo.findByIdWithChildrenRecursive(r.id));
    if (!root) throw new NotFoundException('درخت محصول یافت نشد');
    return root;
  }

  async getBreadcrumb(productId: string): Promise<BreadcrumbItem[]> {
    return this.productRepo.buildBreadcrumb(productId);
  }
}