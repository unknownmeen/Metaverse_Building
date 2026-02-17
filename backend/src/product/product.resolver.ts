import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { ProductEntity } from './entities/product.entity';
import { ProductReadService } from './product-read.service';
import { ProductWriteService } from './product-write.service';
import { CreateProductInput } from './dto/create-product.input';
import { UpdateProductInput } from './dto/update-product.input';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { BreadcrumbItemType } from '../common/types';

@Resolver(() => ProductEntity)
export class ProductResolver {
  constructor(
    private productRead: ProductReadService,
    private productWrite: ProductWriteService,
  ) {}

  @Query(() => ProductEntity, { nullable: true })
  @UseGuards(JwtAuthGuard)
  async product(@Args('id') id: string) {
    return this.productRead.getProduct(id);
  }

  @Query(() => ProductEntity, { nullable: true })
  @UseGuards(JwtAuthGuard)
  async productTree(@Args('rootId', { nullable: true }) rootId?: string) {
    return this.productRead.getProductTree(rootId);
  }

  @Query(() => [BreadcrumbItemType])
  @UseGuards(JwtAuthGuard)
  async productBreadcrumb(@Args('id') id: string) {
    return this.productRead.getBreadcrumb(id);
  }

  @Mutation(() => ProductEntity)
  @UseGuards(JwtAuthGuard)
  async createProduct(@Args('input') input: CreateProductInput) {
    return this.productWrite.create(input);
  }

  @Mutation(() => ProductEntity)
  @UseGuards(JwtAuthGuard)
  async updateProduct(@Args('id') id: string, @Args('input') input: UpdateProductInput) {
    return this.productWrite.update(id, input);
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async deleteProduct(@Args('id') id: string) {
    await this.productWrite.delete(id);
    return true;
  }
}