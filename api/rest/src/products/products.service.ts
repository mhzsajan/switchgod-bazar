import { Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { CreateProductDto } from './dto/create-product.dto';
import { GetProductsDto, ProductPaginator } from './dto/get-products.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { paginate } from 'src/common/pagination/paginate';
import productsJson from '@db/products.json';
import popularProductsJson from '@db/popular-products.json';
import bestSellingProductsJson from '@db/best-selling-products.json';
import Fuse from 'fuse.js';
import { GetPopularProductsDto } from './dto/get-popular-products.dto';
import { GetBestSellingProductsDto } from './dto/get-best-selling-products.dto';
import * as fs from 'fs';
import * as path from 'path';

const products = plainToClass(Product, productsJson);
const popularProducts = plainToClass(Product, popularProductsJson);
const bestSellingProducts = plainToClass(Product, bestSellingProductsJson);

const options = {
  keys: [
    'name',
    'type.slug',
    'categories.slug',
    'status',
    'shop_id',
    'author.slug',
    'tags',
    'manufacturer.slug',
    'visibility',
  ],
  threshold: 0.3,
};
const fuse = new Fuse(products, options);

@Injectable()
export class ProductsService {
  private products: any = products;
  private popularProducts: any = popularProducts;
  private bestSellingProducts: any = bestSellingProducts;

  create(createProductDto: CreateProductDto) {
    this.reloadFromFile();
    const dto: any = createProductDto as any;
    const newId = this.products.length > 0
      ? Math.max(...this.products.map((p) => p.id)) + 1
      : 1;

    // Resolve relations into embedded objects (seed data shape)
    let shop: any = dto.shop || null;
    if (!shop && dto.shop_id) {
      shop = this.findRelation('shops.json', dto.shop_id);
    }
    let type: any = dto.type || null;
    if (!type && dto.type_id) {
      type = this.findRelation('types.json', dto.type_id);
    }
    const categories = Array.isArray(dto.categories) && dto.categories.length
      ? dto.categories
      : this.findRelationsByIds('categories.json', dto.category_ids || []);

    const newProduct: Product = {
      ...dto,
      id: newId,
      shop_id: dto.shop_id ?? (shop ? shop.id : null),
      shop,
      type_id: dto.type_id ?? (type ? type.id : null),
      type,
      categories,
      slug:
        (dto.slug ||
          dto.name.toLowerCase().replace(/\s+/g, '-')) + '-' + newId,
      product_type: dto.product_type || 'simple',
      status: dto.status || 'draft',
      visibility: dto.visibility || 'visibility_public',
      is_active: dto.is_active ?? true,
      deleted_at: dto.deleted_at ?? null,
      translated_languages: dto.translated_languages || ['en'],
      in_stock: dto.in_stock ?? true,
      is_taxable: dto.is_taxable ?? false,
      ratings: 0,
      in_wishlist: false,
      language: dto.language || 'en',
      created_at: new Date(),
      updated_at: new Date(),
    } as unknown as Product;
    this.products.push(newProduct);
    this.saveToFile();
    return newProduct;
  }

  private findRelation(fileName: string, id: number): any {
    try {
      const list = this.readDbFile(fileName);
      return (
        list.find((item: any) => Number(item.id) === Number(id)) || null
      );
    } catch {
      return null;
    }
  }

  private findRelationsByIds(fileName: string, ids: number[]): any[] {
    if (!ids || ids.length === 0) return [];
    try {
      const list = this.readDbFile(fileName);
      return list.filter((item: any) =>
        ids.map(Number).includes(Number(item.id)),
      );
    } catch {
      return [];
    }
  }

  private readDbFile(fileName: string): any[] {
    for (const base of ['dist', 'src']) {
      try {
        const p = path.join(
          process.cwd(),
          base,
          'db',
          'pickbazar',
          fileName,
        );
        return JSON.parse(fs.readFileSync(p, 'utf8'));
      } catch {
        continue;
      }
    }
    return [];
  }

  getProducts({ limit, page, search }: GetProductsDto): ProductPaginator {
    this.reloadFromFile();
    if (!page) page = 1;
    if (!limit) limit = 30;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    let data: Product[] = this.products;

    const parseSearchParams = search ? search.split(';') : [];
    const exactFilters: { [key: string]: any } = {};
    const fuzzyFilters: any[] = [];

    for (const searchParam of parseSearchParams) {
      const [key, value] = searchParam.split(':');

      if (key === 'shop_id') {
        exactFilters.shop_id = parseInt(value, 10);
      } else if (key !== 'slug') {
        fuzzyFilters.push({ [key]: value });
      }
    }
    if (fuzzyFilters.length) {
      data = fuse
        .search({
          $and: fuzzyFilters,
        })
        ?.map(({ item }) => item);
    }

    if (exactFilters.shop_id) {
      data = data.filter(
        (product) => (product as any)?.shop?.id === exactFilters.shop_id,
      );
      // Newest first so newly created products appear on the first page
      data = [...data].sort((a: any, b: any) => Number(b.id) - Number(a.id));
    }

    const results = data.slice(startIndex, endIndex);
    const url = `/products?search=${search}&limit=${limit}`;
    return {
      data: results,
      ...paginate(data.length, page, limit, results.length, url),
    };
  }

  getProductBySlug(slug: string): Product {
    this.reloadFromFile();
    const product =
      this.products.find((p) => p.slug === slug) ||
      this.products.find((p) => String(p.id) === slug);
    if (!product) {
      return undefined;
    }
    const related_products = this.products
      .filter(
        (p) =>
          p.type?.slug === product.type?.slug &&
          String(p.id) !== String(product.id),
      )
      .slice(0, 20);
    return {
      ...product,
      related_products,
    };
  }

  getPopularProducts({ limit, type_slug }: GetPopularProductsDto): Product[] {
    let data: any = this.popularProducts;
    if (type_slug) {
      data = fuse.search(type_slug)?.map(({ item }) => item);
    }
    return data?.slice(0, limit);
  }
  getBestSellingProducts({
    limit,
    type_slug,
  }: GetBestSellingProductsDto): Product[] {
    let data: any = this.bestSellingProducts;
    if (type_slug) {
      data = fuse.search(type_slug)?.map(({ item }) => item);
    }
    return data?.slice(0, limit);
  }

  getProductsStock({ limit, page, search }: GetProductsDto): ProductPaginator {
    this.reloadFromFile();
    if (!page) page = 1;
    if (!limit) limit = 30;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    let data: Product[] = this.products.filter((item) => item.quantity <= 9);

    if (search) {
      const parseSearchParams = search.split(';');
      const searchText: any = [];
      for (const searchParam of parseSearchParams) {
        const [key, value] = searchParam.split(':');
        // TODO: Temp Solution
        if (key !== 'slug') {
          searchText.push({
            [key]: value,
          });
        }
      }

      data = fuse
        .search({
          $and: searchText,
        })
        ?.map(({ item }) => item);
    }

    const results = data.slice(startIndex, endIndex);
    const url = `/products-stock?search=${search}&limit=${limit}`;
    return {
      data: results,
      ...paginate(data.length, page, limit, results.length, url),
    };
  }

  getDraftProducts({ limit, page, search }: GetProductsDto): ProductPaginator {
    this.reloadFromFile();
    if (!page) page = 1;
    if (!limit) limit = 30;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    let data: Product[] = this.products.filter(
      (item) => item.status === 'draft',
    );

    if (search) {
      const parseSearchParams = search.split(';');
      const searchText: any = [];
      for (const searchParam of parseSearchParams) {
        const [key, value] = searchParam.split(':');
        // TODO: Temp Solution
        if (key !== 'slug') {
          searchText.push({
            [key]: value,
          });
        }
      }

      data = fuse
        .search({
          $and: searchText,
        })
        ?.map(({ item }) => item);
    }

    const results = data.slice(startIndex, endIndex);
    const url = `/draft-products?search=${search}&limit=${limit}`;
    return {
      data: results,
      ...paginate(data.length, page, limit, results.length, url),
    };
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    this.reloadFromFile();
    const dto: any = updateProductDto as any;
    if (dto.shop_id && !dto.shop) {
      dto.shop = this.findRelation('shops.json', dto.shop_id);
    }
    if (dto.type_id && !dto.type) {
      dto.type = this.findRelation('types.json', dto.type_id);
    }
    const index = this.products.findIndex((p) => p.id === Number(id));
    if (index === -1) return null;
    this.products[index] = {
      ...this.products[index],
      ...updateProductDto,
      updated_at: new Date(),
    };
    this.saveToFile();
    return this.products[index];
  }

  remove(id: number) {
    this.reloadFromFile();
    const index = this.products.findIndex((p) => p.id === Number(id));
    if (index === -1) return null;
    const removed = this.products.splice(index, 1)[0];
    this.saveToFile();
    return removed;
  }

  private reloadFromFile() {
    for (const base of ['dist', 'src']) {
      try {
        const p = path.join(
          process.cwd(),
          base,
          'db',
          'pickbazar',
          'products.json',
        );
        this.products = JSON.parse(fs.readFileSync(p, 'utf8'));
        return;
      } catch {
        continue;
      }
    }
  }

    private saveToFile() {
    const srcPath = path.join(process.cwd(), 'src', 'db', 'pickbazar', 'products.json');
    const distPath = path.join(process.cwd(), 'dist', 'db', 'pickbazar', 'products.json');
    const data = JSON.stringify(this.products, null, 2);
    fs.writeFileSync(srcPath, data);
    fs.mkdirSync(path.dirname(distPath), { recursive: true });

    fs.writeFileSync(distPath, data);
  }
}
