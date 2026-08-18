import { Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import Fuse from 'fuse.js';
import { paginate } from 'src/common/pagination/paginate';
import { Wishlist } from './entities/wishlist.entity';
import { GetWishlistDto } from './dto/get-wishlists.dto';
import { CreateWishlistDto } from './dto/create-wishlists.dto';
import { UpdateWishlistDto } from './dto/update-wishlists.dto';
import wishlistsJSON from '@db/wishlists.json';
import productsJson from '@db/products.json';
import { Product } from '../products/entities/product.entity';
import * as fs from 'fs';
import * as path from 'path';

const wishlists = plainToClass(Wishlist, wishlistsJSON);
const products = plainToClass(Product, productsJson);
const options = {
  keys: ['answer'],
  threshold: 0.3,
};
const fuse = new Fuse(wishlists, options);

@Injectable()
export class WishlistsService {
  private wishlist: Wishlist[] = wishlists;
  private products: any = products;

  findAllWishlists({ limit, page, search }: GetWishlistDto) {
    if (!page) page = 1;
    if (!limit) limit = 30;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    let data: Wishlist[] = this.wishlist;

    if (search) {
      const parseSearchParams = search.split(';');
      for (const searchParam of parseSearchParams) {
        const [key, value] = searchParam.split(':');
        data = fuse.search(value)?.map(({ item }) => item);
      }
    }

    const results = data.slice(startIndex, endIndex);
    const url = `/wishlists?with=shop&orderBy=created_at&sortedBy=desc`;
    return {
      data: results,
      ...paginate(data.length, page, limit, results.length, url),
    };
  }

  findWishlist(id: number) {
    return this.wishlist.find((p) => p.id === id);
  }

  create(createWishlistDto: CreateWishlistDto) {
    const newId = this.wishlist.length > 0
      ? Math.max(...this.wishlist.map((w) => w.id)) + 1
      : 1;
    const newWishlist: Wishlist = {
      ...createWishlistDto,
      id: newId,
      created_at: new Date(),
      updated_at: new Date(),
    } as unknown as Wishlist;
    this.wishlist.push(newWishlist);
    this.saveToFile();
    return newWishlist;
  }

  update(id: number, updateWishlistDto: UpdateWishlistDto) {
    const index = this.wishlist.findIndex((w) => w.id === Number(id));
    if (index === -1) return null;
    this.wishlist[index] = {
      ...this.wishlist[index],
      ...updateWishlistDto,
      updated_at: new Date(),
    };
    this.saveToFile();
    return this.wishlist[index];
  }

  delete(id: number) {
    const index = this.wishlist.findIndex((w) => w.id === Number(id));
    if (index === -1) return null;
    const removed = this.wishlist.splice(index, 1)[0];
    this.saveToFile();
    return removed;
  }

  isInWishlist(product_id: number) {
    const product = this.products.find((p) => p.id === Number(product_id));

    return product?.in_wishlist;
  }

  toggle({ product_id }: CreateWishlistDto) {
    const product = this.products.find((p) => p.id === Number(product_id));
    if (!product) return null;
    product.in_wishlist = !product?.in_wishlist;
    product.updated_at = new Date();
    this.saveProductsFile();
    return product.in_wishlist;
  }

    private saveToFile() {
    const srcPath = path.join(process.cwd(), 'src', 'db', 'pickbazar', 'wishlists.json');
    const distPath = path.join(process.cwd(), 'dist', 'db', 'pickbazar', 'wishlists.json');
    const data = JSON.stringify(this.wishlist, null, 2);
    fs.writeFileSync(srcPath, data);
    fs.mkdirSync(path.dirname(distPath), { recursive: true });

    fs.writeFileSync(distPath, data);
  }

  private saveProductsFile() {
    const filePath = path.join(process.cwd(), 'src', 'db', 'pickbazar', 'products.json');
    fs.writeFileSync(filePath, JSON.stringify(this.products, null, 2));
  }
}
