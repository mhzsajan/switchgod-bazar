import { Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { GetStoreNoticesDto } from './dto/get-store-notices.dto';
import { StoreNotice } from './entities/store-notices.entity';
import storeNoticesJson from '@db/store-notices.json';
import Fuse from 'fuse.js';
import { paginate } from 'src/common/pagination/paginate';
import { CreateStoreNoticeDto } from './dto/create-store-notice.dto';
import { UpdateStoreNoticeDto } from './dto/update-store-notice.dto';
import * as fs from 'fs';
import * as path from 'path';

const storeNotices = plainToClass(StoreNotice, storeNoticesJson);
const options = {
  keys: ['notice'],
  threshold: 0.3,
};
const fuse = new Fuse(storeNotices, options);

@Injectable()
export class StoreNoticesService {
  private storeNotices: StoreNotice[] = storeNotices;

  create(createStoreNoticeDto: CreateStoreNoticeDto) {
    const newId = this.storeNotices.length > 0
      ? Math.max(...this.storeNotices.map((n) => n.id)) + 1
      : 1;
    const newNotice: StoreNotice = {
      ...createStoreNoticeDto,
      id: newId,
      created_at: new Date(),
      updated_at: new Date(),
    } as unknown as StoreNotice;
    this.storeNotices.push(newNotice);
    this.saveToFile();
    return newNotice;
  }

  getStoreNotices({ search, limit, page }: GetStoreNoticesDto) {
    if (!page) page = 1;
    if (!limit) limit = 12;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    let data: StoreNotice[] = this.storeNotices;

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
    const url = `/store-notices?search=${search}&limit=${limit}`;
    return {
      data: results,
      ...paginate(data.length, page, limit, results.length, url),
    };
  }

  getStoreNotice(param: string, language: string) {
    return this.storeNotices.find((p) => p.id === Number(param));
  }

  update(id: number, updateStoreNoticeDto: UpdateStoreNoticeDto) {
    const index = this.storeNotices.findIndex((n) => n.id === Number(id));
    if (index === -1) return null;
    this.storeNotices[index] = {
      ...this.storeNotices[index],
      ...updateStoreNoticeDto,
      updated_at: new Date(),
    };
    this.saveToFile();
    return this.storeNotices[index];
  }

  remove(id: number) {
    const index = this.storeNotices.findIndex((n) => n.id === Number(id));
    if (index === -1) return null;
    const removed = this.storeNotices.splice(index, 1)[0];
    this.saveToFile();
    return removed;
  }

    private saveToFile() {
    const srcPath = path.join(process.cwd(), 'src', 'db', 'pickbazar', 'store-notices.json');
    const distPath = path.join(process.cwd(), 'dist', 'db', 'pickbazar', 'store-notices.json');
    const data = JSON.stringify(this.storeNotices, null, 2);
    fs.writeFileSync(srcPath, data);
    fs.mkdirSync(path.dirname(distPath), { recursive: true });

    fs.writeFileSync(distPath, data);
  }
}
