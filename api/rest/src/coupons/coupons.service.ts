import { Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { CreateCouponDto } from './dto/create-coupon.dto';
import { UpdateCouponDto } from './dto/update-coupon.dto';
import { Coupon } from './entities/coupon.entity';
import couponsJson from '@db/coupons.json';
import Fuse from 'fuse.js';
import { GetCouponsDto } from './dto/get-coupons.dto';
import { paginate } from 'src/common/pagination/paginate';
import * as fs from 'fs';
import * as path from 'path';

const coupons = plainToClass(Coupon, couponsJson);
const options = {
  keys: ['code'],
  threshold: 0.1,
};
const fuse = new Fuse(coupons, options);

@Injectable()
export class CouponsService {
  private coupons: Coupon[] = coupons;

  create(createCouponDto: CreateCouponDto) {
    const newId = this.coupons.length > 0
      ? Math.max(...this.coupons.map((c) => c.id)) + 1
      : 1;
    const newCoupon: Coupon = {
      ...createCouponDto,
      id: newId,
      is_valid: true,
      is_approve: false,
      language: createCouponDto.language || 'en',
      created_at: new Date(),
      updated_at: new Date(),
    } as Coupon;
    this.coupons.push(newCoupon);
    this.saveToFile();
    return newCoupon;
  }

  getCoupons({ search, limit, page, shop_id }: GetCouponsDto) {
    if (!page) page = 1;
    if (!limit) limit = 12;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    let data: Coupon[] = this.coupons;
    // if (text?.replace(/%/g, '')) {
    //   data = fuse.search(text)?.map(({ item }) => item);
    // }

    if (shop_id) {
      data = data.filter((p) => p.shop_id === Number(shop_id));
    }

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
    const url = `/coupons?search=${search}&limit=${limit}`;
    return {
      data: results,
      ...paginate(data.length, page, limit, results.length, url),
    };
  }

  getCoupon(param: string, language: string): Coupon {
    return this.coupons.find((p) => p.code === param);
  }

  update(id: number, updateCouponDto: UpdateCouponDto) {
    const index = this.coupons.findIndex((c) => c.id === Number(id));
    if (index === -1) return null;
    this.coupons[index] = {
      ...this.coupons[index],
      ...updateCouponDto,
      updated_at: new Date(),
    };
    this.saveToFile();
    return this.coupons[index];
  }

  remove(id: number) {
    const index = this.coupons.findIndex((c) => c.id === Number(id));
    if (index === -1) return null;
    const removed = this.coupons.splice(index, 1)[0];
    this.saveToFile();
    return removed;
  }

  verifyCoupon(code: string) {
    return {
      is_valid: true,
      coupon: {
        id: 9,
        code: code,
        description: null,
        image: {
          id: 925,
          original:
            'https://pickbazarlaravel.s3.ap-southeast-1.amazonaws.com/925/5x2x.png',
          thumbnail:
            'https://pickbazarlaravel.s3.ap-southeast-1.amazonaws.com/925/conversions/5x2x-thumbnail.jpg',
        },
        type: 'fixed',
        amount: 5,
        active_from: '2021-03-28T05:46:42.000Z',
        expire_at: '2024-06-23T05:46:42.000Z',
        created_at: '2021-03-28T05:48:16.000000Z',
        updated_at: '2021-08-19T03:58:34.000000Z',
        deleted_at: null,
        is_valid: true,
      },
    };
  }
  approveCoupon(id: number) {
    const coupon = this.coupons.find((s) => s.id === Number(id));
    if (!coupon) return null;
    coupon.is_approve = true;
    coupon.updated_at = new Date();
    this.saveToFile();
    return coupon;
  }

  disapproveCoupon(id: number) {
    const coupon = this.coupons.find((s) => s.id === Number(id));
    if (!coupon) return null;
    coupon.is_approve = false;
    coupon.updated_at = new Date();
    this.saveToFile();
    return coupon;
  }

    private saveToFile() {
    const srcPath = path.join(process.cwd(), 'src', 'db', 'pickbazar', 'coupons.json');
    const distPath = path.join(process.cwd(), 'dist', 'db', 'pickbazar', 'coupons.json');
    const data = JSON.stringify(this.coupons, null, 2);
    fs.writeFileSync(srcPath, data);
    fs.writeFileSync(distPath, data);
  }
}
