import { Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import Fuse from 'fuse.js';
import { paginate } from 'src/common/pagination/paginate';
import { CreateWishlistDto } from './dto/create-wishlists.dto';
import { GetWishlistDto } from './dto/get-wishlists.dto';
import { UpdateWishlistDto } from './dto/update-wishlists.dto';
import { Wishlist } from './entities/wishlist.entity';
import { Product } from 'src/products/entities/product.entity';
import wishlistsJSON from '@db/wishlists.json';
import * as fs from 'fs';
import * as path from 'path';

const wishlists = plainToClass(Wishlist, wishlistsJSON as any);

@Injectable()
export class WishlistsService {
  private wishlist: Wishlist[] = (wishlists as any) || [];

  private productsFilePath() {
    const distPath = path.join(
      process.cwd(),
      'dist',
      'db',
      'pickbazar',
      'products.json',
    );
    if (fs.existsSync(distPath)) return distPath;
    return path.join(process.cwd(), 'src', 'db', 'pickbazar', 'products.json');
  }

  private loadProducts(): any[] {
    const raw = fs.readFileSync(this.productsFilePath(), 'utf8');
    return JSON.parse(raw);
  }

  private saveProducts(products: any[]) {
    const srcPath = path.join(
      process.cwd(),
      'src',
      'db',
      'pickbazar',
      'products.json',
    );
    const distPath = path.join(
      process.cwd(),
      'dist',
      'db',
      'pickbazar',
      'products.json',
    );
    const data = JSON.stringify(products, null, 2);
    fs.writeFileSync(srcPath, data);
    fs.mkdirSync(path.dirname(distPath), { recursive: true });
    fs.writeFileSync(distPath, data);
  }

  private reloadWishlist() {
    try {
      const distPath = path.join(
        process.cwd(),
        'dist',
        'db',
        'pickbazar',
        'wishlists.json',
      );
      const raw = fs.readFileSync(distPath, 'utf8');
      this.wishlist = plainToClass(Wishlist, JSON.parse(raw)) as any;
    } catch {
      const srcPath = path.join(
        process.cwd(),
        'src',
        'db',
        'pickbazar',
        'wishlists.json',
      );
      const raw = fs.readFileSync(srcPath, 'utf8');
      this.wishlist = plainToClass(Wishlist, JSON.parse(raw)) as any;
    }
  }

  private saveToFile() {
    const srcPath = path.join(
      process.cwd(),
      'src',
      'db',
      'pickbazar',
      'wishlists.json',
    );
    const distPath = path.join(
      process.cwd(),
      'dist',
      'db',
      'pickbazar',
      'wishlists.json',
    );
    const data = JSON.stringify(this.wishlist, null, 2);
    fs.writeFileSync(srcPath, data);
    fs.mkdirSync(path.dirname(distPath), { recursive: true });
    fs.writeFileSync(distPath, data);
  }

  findAllWishlists({ limit, page, search }: GetWishlistDto) {
    this.reloadWishlist();
    if (!page) page = 1;
    if (!limit) limit = 30;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    let data: Wishlist[] = this.wishlist;
    if (search) {
      data = data.filter((w) =>
        JSON.stringify(w).toLowerCase().includes(search.toLowerCase()),
      );
    }
    const results = data.slice(startIndex, endIndex);
    const url = `/wishlists?with=shop&orderBy=created_at&sortedBy=desc`;
    return {
      data: results,
      ...paginate(data.length, page, limit, results.length, url),
    };
  }

  findWishlist(id: number) {
    this.reloadWishlist();
    return this.wishlist.find((w) => w.id === id) || null;
  }

  create(createWishlistDto: CreateWishlistDto) {
    this.reloadWishlist();
    const newId =
      this.wishlist.length > 0
        ? Math.max(...this.wishlist.map((w) => w.id)) + 1
        : 1;
    const newWishlist: Wishlist = {
      ...(createWishlistDto as any),
      id: newId,
      created_at: new Date(),
      updated_at: new Date(),
    } as unknown as Wishlist;
    this.wishlist.push(newWishlist);
    this.saveToFile();
    return newWishlist;
  }

  update(id: number, updateWishlistDto: UpdateWishlistDto) {
    this.reloadWishlist();
    const index = this.wishlist.findIndex((w) => w.id === Number(id));
    if (index === -1) return null;
    this.wishlist[index] = {
      ...this.wishlist[index],
      ...(updateWishlistDto as any),
      updated_at: new Date(),
    };
    this.saveToFile();
    return this.wishlist[index];
  }

  delete(id: number) {
    this.reloadWishlist();
    const index = this.wishlist.findIndex((w) => w.id === Number(id));
    if (index === -1) return null;
    const removed = this.wishlist.splice(index, 1)[0];
    this.saveToFile();
    return removed;
  }

  isInWishlist(product_id: number) {
    const product = this.loadProducts().find(
      (p) => p.id === Number(product_id),
    );
    return Boolean(product?.in_wishlist);
  }

  toggle({ product_id }: CreateWishlistDto) {
    const products = this.loadProducts();
    const product = products.find((p) => p.id === Number(product_id));
    if (!product) return null;
    product.in_wishlist = !product.in_wishlist;
    product.updated_at = new Date();
    this.saveProducts(products);
    return product.in_wishlist;
  }
}