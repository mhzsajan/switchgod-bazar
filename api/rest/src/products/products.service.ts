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
    const newId = this.products.length > 0
      ? Math.max(...this.products.map((p) => p.id)) + 1
      : 1;
    const newProduct: Product = {
      ...createProductDto,
      id: newId,
      slug: createProductDto.name.toLowerCase().replace(/\s+/g, '-') + '-' + newId,
      product_type: createProductDto.product_type || 'simple',
      status: createProductDto.status || 'draft',
      in_stock: createProductDto.in_stock ?? true,
      is_taxable: createProductDto.is_taxable ?? false,
      ratings: 0,
      in_wishlist: false,
      language: 'en',
      created_at: new Date(),
      updated_at: new Date(),
    } as unknown as Product;
    this.products.push(newProduct);
    this.saveToFile();
    return newProduct;
  }

  getProducts({ limit, page, search }: GetProductsDto): ProductPaginator {
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
      data = data.filter((product) => product.shop.id === exactFilters.shop_id);
    }

    const results = data.slice(startIndex, endIndex);
    const url = `/products?search=${search}&limit=${limit}`;
    return {
      data: results,
      ...paginate(data.length, page, limit, results.length, url),
    };
  }

  getProductBySlug(slug: string): Product {
    const product = this.products.find((p) => p.slug === slug);
    const related_products = this.products
      .filter((p) => p.type.slug === product.type.slug)
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
    const index = this.products.findIndex((p) => p.id === Number(id));
    if (index === -1) return null;
    const removed = this.products.splice(index, 1)[0];
    this.saveToFile();
    return removed;
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
