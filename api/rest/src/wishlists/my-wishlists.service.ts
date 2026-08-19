import { Injectable } from '@nestjs/common';
import { paginate } from 'src/common/pagination/paginate';
import { CreateWishlistDto } from './dto/create-wishlists.dto';
import { UpdateWishlistDto } from './dto/update-wishlists.dto';
import { GetWishlistDto } from './dto/get-wishlists.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class MyWishlistService {
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

  findAMyWishlists({ limit, page, search }: GetWishlistDto) {
    if (!page) page = 1;
    if (!limit) limit = 30;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    let products: any[] = this.loadProducts().filter(
      (p) => p?.in_wishlist === true,
    );
    if (search) {
      products = products.filter((p) =>
        JSON.stringify(p).toLowerCase().includes(search.toLowerCase()),
      );
    }
    const results = products.slice(startIndex, endIndex);
    const url = `/my-wishlists?with=shop&orderBy=created_at&sortedBy=desc`;
    return {
      data: results,
      ...paginate(products.length, page, limit, results.length, url),
    };
  }

  findAMyWishlist(id: number) {
    return (
      this.loadProducts().find((p) => p.id === Number(id) && p.in_wishlist) ||
      null
    );
  }

  create(createWishlistDto: CreateWishlistDto) {
    const products = this.loadProducts();
    const product = products.find(
      (p) => p.id === Number((createWishlistDto as any).product_id),
    );
    if (!product) return null;
    product.in_wishlist = true;
    product.updated_at = new Date();
    this.saveProducts(products);
    return product;
  }

  update(id: number, updateWishlistDto: UpdateWishlistDto) {
    delete (updateWishlistDto as any)?.product_id;
    const products = this.loadProducts();
    const product = products.find((p) => p.id === Number(id));
    if (!product) return null;
    product.in_wishlist = Boolean(
      (updateWishlistDto as any)?.in_wishlist ?? false,
    );
    product.updated_at = new Date();
    this.saveProducts(products);
    return product;
  }

  delete(id: number) {
    const products = this.loadProducts();
    const product = products.find((p) => p.id === Number(id));
    if (!product) return null;
    product.in_wishlist = false;
    product.updated_at = new Date();
    this.saveProducts(products);
    return product;
  }
}