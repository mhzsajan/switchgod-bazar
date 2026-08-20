import { Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { CreateShopDto } from './dto/create-shop.dto';
import { UpdateShopDto } from './dto/update-shop.dto';
import { Shop } from './entities/shop.entity';
import shopsJson from '@db/shops.json';
import nearShopJson from '@db/near-shop.json';
import Fuse from 'fuse.js';
import { GetShopsDto } from './dto/get-shops.dto';
import { paginate } from 'src/common/pagination/paginate';
import { GetStaffsDto } from './dto/get-staffs.dto';
import { MailService } from 'src/mail/mail.service';
import * as fs from 'fs';
import * as path from 'path';

const shops = plainToClass(Shop, shopsJson);
const nearShops = plainToClass(Shop, nearShopJson);
const options = {
  keys: ['name', 'type.slug', 'is_active'],
  threshold: 0.3,
};
const fuse = new Fuse(shops, options);

@Injectable()
export class ShopsService {
  private shops: Shop[] = shops;
  private nearShops: Shop[] = shops;

  constructor(private mailService: MailService) {}

  private adminEmail(): string {
    return process.env.ADMIN_EMAIL || 'mhzsajan@gmail.com';
  }

  create(createShopDto: CreateShopDto) {
    this.reloadFromFile();
    const newId = this.shops.length > 0
      ? Math.max(...this.shops.map((s) => s.id)) + 1
      : 1;
    const newShop: Shop = {
      ...createShopDto,
      id: newId,
      slug: createShopDto.name.toLowerCase().replace(/\s+/g, '-'),
      is_active: false,
      orders_count: 0,
      products_count: 0,
      owner: null,
      owner_id: 1,
      created_at: new Date(),
      updated_at: new Date(),
    } as Shop;
    this.shops.push(newShop);
    this.saveToFile();
    this.mailService.sendShopCreatedEmail(
      this.adminEmail(),
      newShop.name,
      false,
    );
    return newShop;
  }

  getShops({ search, limit, page, is_active }: GetShopsDto) {
    this.reloadFromFile();
    if (!page) page = 1;

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    let data: Shop[] = this.shops;

    if (search) {
      const parseSearchParams = search.split(';');
      const fuzzyFilters: any[] = [];
      for (const searchParam of parseSearchParams) {
        const [key, value] = searchParam.split(':');
        if (key === 'is_active') {
          data = data.filter((item) => Boolean(item.is_active) === (value === '1'));
        } else {
          fuzzyFilters.push({ [key]: value });
        }
      }
      if (fuzzyFilters.length) {
        data = fuse.search({ $and: fuzzyFilters })?.map(({ item }) => item);
      }
    } else if (is_active !== undefined && is_active !== null) {
      // is_active arrives as string "1"/"0" from query params
      const raw: any = is_active;
      const wanted =
        raw === true || raw === 'true' || raw === '1' || raw === 1;
      data = data.filter((item) => Boolean(item.is_active) === wanted);
    }

    const results = data
      .slice(startIndex, endIndex)
      .map((shop) => this.withCounts(shop));
    const url = `/shops?search=${search}&limit=${limit}`;

    return {
      data: results,
      ...paginate(data.length, page, limit, results.length, url),
    };
  }

  getNewShops({ search, limit, page }: GetShopsDto) {
    if (!page) page = 1;

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    let data: Shop[] = this.shops.filter(
      (shopItem) => Boolean(shopItem.is_active) === false,
    );

    if (search) {
      const parseSearchParams = search.split(';');
      const fuzzyFilters: any[] = [];
      for (const searchParam of parseSearchParams) {
        const [key, value] = searchParam.split(':');
        if (key === 'is_active') {
          data = data.filter((item) => Boolean(item.is_active) === (value === '1'));
        } else {
          fuzzyFilters.push({ [key]: value });
        }
      }
      if (fuzzyFilters.length) {
        data = fuse.search({ $and: fuzzyFilters })?.map(({ item }) => item);
      }
    }
    const results = data.slice(startIndex, endIndex);
    const url = `/new-shops?search=${search}&limit=${limit}`;

    return {
      data: results,
      ...paginate(data.length, page, limit, results.length, url),
    };
  }

  getStaffs({ shop_id, limit, page }: GetStaffsDto) {
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    let staffs: Shop['staffs'] = [];
    if (shop_id) {
      staffs = this.shops.find((p) => p.id === Number(shop_id))?.staffs ?? [];
    }
    const results = staffs?.slice(startIndex, endIndex);
    const url = `/staffs?limit=${limit}`;

    return {
      data: results,
      ...paginate(staffs?.length, page, limit, results?.length, url),
    };
  }

  getShop(slug: string): Shop {
    this.reloadFromFile();
    const shop = this.shops.find((p) => p.slug === slug);
    return this.withCounts(shop) as Shop;
  }

  getNearByShop(lat: string, lng: string) {
    return nearShops;
  }

  update(id: number, updateShopDto: UpdateShopDto) {
    this.reloadFromFile();
    const index = this.shops.findIndex((s) => s.id === Number(id));
    if (index === -1) return null;
    this.shops[index] = {
      ...this.shops[index],
      ...updateShopDto,
      updated_at: new Date(),
    };
    this.saveToFile();
    return this.shops[index];
  }

  approve(id: number) {
    const shop = this.shops.find((s) => s.id === Number(id));
    if (!shop) return null;
    shop.is_active = true;
    shop.updated_at = new Date();
    this.saveToFile();
    return shop;
  }

  remove(id: number) {
    this.reloadFromFile();
    const index = this.shops.findIndex((s) => s.id === Number(id));
    if (index === -1) return null;
    const removed = this.shops.splice(index, 1)[0];
    this.saveToFile();
    return removed;
  }

  disapproveShop(id: number) {
    const shop = this.shops.find((s) => s.id === Number(id));
    if (!shop) return null;
    shop.is_active = false;
    shop.updated_at = new Date();
    this.saveToFile();
    return shop;
  }

  approveShop(id: number) {
    const shop = this.shops.find((s) => s.id === Number(id));
    if (!shop) return null;
    shop.is_active = true;
    shop.updated_at = new Date();
    this.saveToFile();
    const ownerEmail =
      (shop as any).owner?.email || (shop as any).settings?.notifications?.email;
    this.mailService.sendShopCreatedEmail(
      ownerEmail || this.adminEmail(),
      shop.name,
      true,
    );
    return shop;
  }

  private reloadFromFile() {
    for (const base of ['dist', 'src']) {
      try {
        const p = path.join(
          process.cwd(),
          base,
          'db',
          'pickbazar',
          'shops.json',
        );
        this.shops = JSON.parse(fs.readFileSync(p, 'utf8'));
        this.nearShops = this.shops;
        return;
      } catch {
        continue;
      }
    }
  }

  private countProducts(shopId: number): number {
    for (const base of ['dist', 'src']) {
      try {
        const p = path.join(
          process.cwd(),
          base,
          'db',
          'pickbazar',
          'products.json',
        );
        const products = JSON.parse(fs.readFileSync(p, 'utf8'));
        return products.filter(
          (prod: any) =>
            Number(prod.shop_id) === Number(shopId) ||
            Number((prod.shop || {}).id) === Number(shopId),
        ).length;
      } catch {
        continue;
      }
    }
    return 0;
  }

  private withCounts(shop: any): any {
    if (!shop) return shop;
    return {
      ...shop,
      products_count: this.countProducts(shop.id),
    };
  }

    private saveToFile() {
    const srcPath = path.join(process.cwd(), 'src', 'db', 'pickbazar', 'shops.json');
    const distPath = path.join(process.cwd(), 'dist', 'db', 'pickbazar', 'shops.json');
    const data = JSON.stringify(this.shops, null, 2);
    fs.writeFileSync(srcPath, data);
    fs.mkdirSync(path.dirname(distPath), { recursive: true });
    fs.mkdirSync(path.dirname(distPath), { recursive: true });

    fs.writeFileSync(distPath, data);
  }
}
