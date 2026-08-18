import { Injectable } from '@nestjs/common';
import flashSaleJSON from '@db/flash-sale.json';
import ProductsByFlashSaleJSON from '@db/products-by-flash-sale.json';
import { plainToClass } from 'class-transformer';
import Fuse from 'fuse.js';
import { paginate } from 'src/common/pagination/paginate';
import { FlashSale } from './entities/flash-sale.entity';
import { GetFlashSaleDto } from './dto/get-flash-sales.dto';
import { CreateFlashSaleDto } from './dto/create-flash-sale.dto';
import { UpdateFlashSaleDto } from './dto/update-flash-sale.dto';
import { Product } from 'src/products/entities/product.entity';
import * as fs from 'fs';
import * as path from 'path';

const flashSale = plainToClass(FlashSale, flashSaleJSON);
const options = {
  keys: ['title'],
  threshold: 0.3,
};
const fuse = new Fuse(flashSale, options);

const productsByFlashSale = plainToClass(Product, ProductsByFlashSaleJSON);
const productsByFlashSaleOptions = {
  keys: ['name'],
  threshold: 0.3,
};
const productsByFlashSaleFuse = new Fuse(
  productsByFlashSale,
  productsByFlashSaleOptions,
);

@Injectable()
export class FlashSaleService {
  private flashSale: FlashSale[] = flashSale;
  private productsByFlashSale: Product[] = productsByFlashSale;

  create(createFlashSaleDto: CreateFlashSaleDto) {
    const newId = this.flashSale.length > 0
      ? Math.max(...this.flashSale.map((f) => f.id)) + 1
      : 1;
    const newFlashSale: FlashSale = {
      ...createFlashSaleDto,
      id: newId,
      slug: (createFlashSaleDto as any).slug || 'flash-sale-' + newId,
      created_at: new Date(),
      updated_at: new Date(),
    } as unknown as FlashSale;
    this.flashSale.push(newFlashSale);
    this.saveToFile();
    return newFlashSale;
  }

  findAllFlashSale({ search, limit, page }: GetFlashSaleDto) {
    if (!page) page = 1;
    if (!limit) limit = 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    let data: FlashSale[] = this.flashSale;

    if (search) {
      const parseSearchParams = search.split(';');
      for (const searchParam of parseSearchParams) {
        const [key, value] = searchParam.split(':');
        data = fuse.search(value)?.map(({ item }) => item);
      }
    }

    const results = data.slice(startIndex, endIndex);
    const url = `/flash-sale?search=${search}&limit=${limit}`;
    return {
      data: results,
      ...paginate(data.length, page, limit, results.length, url),
    };
  }

  getFlashSale(param: string, language: string) {
    return this.flashSale.find((p) => p.slug === param);
  }

  update(id: number, updateFlashSaleDto: UpdateFlashSaleDto) {
    const index = this.flashSale.findIndex((f) => f.id === Number(id));
    if (index === -1) return null;
    this.flashSale[index] = {
      ...this.flashSale[index],
      ...updateFlashSaleDto,
      updated_at: new Date(),
    };
    this.saveToFile();
    return this.flashSale[index];
  }

  remove(id: number) {
    const index = this.flashSale.findIndex((f) => f.id === Number(id));
    if (index === -1) return null;
    const removed = this.flashSale.splice(index, 1)[0];
    this.saveToFile();
    return removed;
  }

    private saveToFile() {
    const srcPath = path.join(process.cwd(), 'src', 'db', 'pickbazar', 'flash-sale.json');
    const distPath = path.join(process.cwd(), 'dist', 'db', 'pickbazar', 'flash-sale.json');
    const data = JSON.stringify(this.flashSale, null, 2);
    fs.writeFileSync(srcPath, data);
    fs.mkdirSync(path.dirname(distPath), { recursive: true });

    fs.writeFileSync(distPath, data);
  }

  findAllProductsByFlashSale({ search, limit, page }: GetFlashSaleDto) {
    if (!page) page = 1;
    if (!limit) limit = 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    let productsByData: Product[] = this.productsByFlashSale;

    if (search) {
      const parseSearchParams = search.split(';');
      for (const searchParam of parseSearchParams) {
        const [key, value] = searchParam.split(':');
        productsByData = productsByFlashSaleFuse
          .search(value)
          ?.map(({ item }) => item);
      }
    }

    const results = productsByData.slice(startIndex, endIndex);
    const url = `/products-by-flash-sale?search=${search}&limit=${limit}`;
    return {
      data: results,
      ...paginate(productsByData.length, page, limit, results.length, url),
    };
  }
}
