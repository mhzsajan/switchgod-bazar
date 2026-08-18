import { Injectable } from '@nestjs/common';
import { Manufacturer } from './entities/manufacturer.entity';
import manufacturersJson from '@db/manufacturers.json';
import { plainToClass } from 'class-transformer';
import Fuse from 'fuse.js';
import { GetTopManufacturersDto } from './dto/get-top-manufacturers.dto';
import {
  GetManufacturersDto,
  ManufacturerPaginator,
} from './dto/get-manufactures.dto';
import { paginate } from '../common/pagination/paginate';
import { CreateManufacturerDto } from './dto/create-manufacturer.dto';
import { UpdateManufacturerDto } from './dto/update-manufacturer.dto';
import * as fs from 'fs';
import * as path from 'path';

const manufacturers = plainToClass(Manufacturer, manufacturersJson);

const options = {
  keys: ['name'],
  threshold: 0.3,
};

const fuse = new Fuse(manufacturers, options);

@Injectable()
export class ManufacturersService {
  private manufacturers: Manufacturer[] = manufacturers;

  create(createManufactureDto: CreateManufacturerDto) {
    const newId = this.manufacturers.length > 0
      ? Math.max(...this.manufacturers.map((m) => m.id)) + 1
      : 1;
    const newManufacturer: Manufacturer = {
      ...createManufactureDto,
      id: newId,
      slug: (createManufactureDto as any).slug || 'manufacturer-' + newId,
      created_at: new Date(),
      updated_at: new Date(),
    } as unknown as Manufacturer;
    this.manufacturers.push(newManufacturer);
    this.saveToFile();
    return newManufacturer;
  }

  async getManufactures({
    limit,
    page,
    search,
  }: GetManufacturersDto): Promise<ManufacturerPaginator> {
    if (!page) page = 1;
    if (!limit) limit = 30;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    let data: Manufacturer[] = this.manufacturers;
    if (search) {
      console.log('search', search);
      const parseSearchParams = search.split(';');
      for (const searchParam of parseSearchParams) {
        const [key, value] = searchParam.split(':');
        data = fuse.search(value)?.map(({ item }) => item);
      }
    }

    const results = data.slice(startIndex, endIndex);
    const url = `/manufacturers?search=${search}&limit=${limit}`;
    return {
      data: results,
      ...paginate(data.length, page, limit, results.length, url),
    };
  }

  async getTopManufactures({
    limit = 10,
  }: GetTopManufacturersDto): Promise<Manufacturer[]> {
    return manufacturers.slice(0, limit);
  }

  async getManufacturesBySlug(slug: string): Promise<Manufacturer> {
    return this.manufacturers.find(
      (singleManufacture) => singleManufacture.slug === slug,
    );
  }

  update(id: number, updateManufacturesDto: UpdateManufacturerDto) {
    const index = this.manufacturers.findIndex((m) => m.id === Number(id));
    if (index === -1) return null;
    this.manufacturers[index] = {
      ...this.manufacturers[index],
      ...updateManufacturesDto,
      updated_at: new Date(),
    };
    this.saveToFile();
    return this.manufacturers[index];
  }

  remove(id: number) {
    const index = this.manufacturers.findIndex((m) => m.id === Number(id));
    if (index === -1) return null;
    const removed = this.manufacturers.splice(index, 1)[0];
    this.saveToFile();
    return removed;
  }

    private saveToFile() {
    const srcPath = path.join(process.cwd(), 'src', 'db', 'pickbazar', 'manufacturers.json');
    const distPath = path.join(process.cwd(), 'dist', 'db', 'pickbazar', 'manufacturers.json');
    const data = JSON.stringify(this.manufacturers, null, 2);
    fs.writeFileSync(srcPath, data);
    fs.mkdirSync(path.dirname(distPath), { recursive: true });

    fs.writeFileSync(distPath, data);
  }
}
