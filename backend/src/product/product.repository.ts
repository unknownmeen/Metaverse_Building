import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    return this.prisma.product.findUnique({
      where: { id },
      include: {
        children: true,
        missions: {
          include: {
            assignee: { select: { id: true, name: true, phone: true, avatarId: true, role: true } },
            judgingSteps: { include: { judge: { select: { id: true, name: true, phone: true, avatarId: true, role: true } } }, orderBy: { order: 'asc' } },
          },
        },
      },
    });
  }

  private readonly missionInclude = {
    assignee: { select: { id: true, name: true, phone: true, avatarId: true, role: true } },
    judgingSteps: {
      include: {
        judge: { select: { id: true, name: true, phone: true, avatarId: true, role: true } },
      },
      orderBy: { order: 'asc' as const },
    },
  } as const;

  async findByIdWithChildrenRecursive(id: string) {
    const allProducts = await this.prisma.product.findMany({
      include: {
        missions: { include: this.missionInclude },
      },
    });

    const byId = new Map(allProducts.map((p) => [p.id, { ...p, children: [] as typeof allProducts }]));

    const root = byId.get(id);
    if (!root) return null;

    const descendantIds = new Set<string>();
    const collectIds = (pid: string) => {
      for (const p of allProducts) {
        if (p.parentId === pid) {
          descendantIds.add(p.id);
          collectIds(p.id);
        }
      }
    };
    collectIds(id);

    for (const p of allProducts) {
      if (p.id === id || !descendantIds.has(p.id)) continue;
      const node = byId.get(p.id)!;
      const parent = p.parentId ? byId.get(p.parentId) : null;
      if (parent) parent.children.push(node);
    }

    return root;
  }

  async findRoot() {
    return this.prisma.product.findFirst({
      where: { parentId: null },
    });
  }

  async buildBreadcrumb(productId: string): Promise<{ id: string; title: string }[]> {
    const path: { id: string; title: string }[] = [];
    let current = await this.prisma.product.findUnique({ where: { id: productId } });
    while (current) {
      path.unshift({ id: current.id, title: current.title });
      if (!current.parentId) break;
      current = await this.prisma.product.findUnique({ where: { id: current.parentId } });
    }
    return path;
  }

  async create(data: { id: string; title: string; description?: string; parentId: string }) {
    return this.prisma.product.create({
      data: {
        id: data.id,
        title: data.title,
        description: data.description ?? '',
        parentId: data.parentId,
      },
    });
  }

  async update(id: string, data: { title?: string; description?: string }) {
    return this.prisma.product.update({
      where: { id },
      data,
    });
  }

  async delete(id: string) {
    return this.prisma.product.delete({
      where: { id },
    });
  }
}
