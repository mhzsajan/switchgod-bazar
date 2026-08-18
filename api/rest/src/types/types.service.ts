import { Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { CreateTypeDto } from './dto/create-type.dto';
import { UpdateTypeDto } from './dto/update-type.dto';
import { Type } from './entities/type.entity';

import typesJson from '@db/types.json';
import Fuse from 'fuse.js';
import { GetTypesDto } from './dto/get-types.dto';
import * as fs from 'fs';
import * as path from 'path';

const types = plainToClass(Type, typesJson);
const options = {
  keys: ['name'],
  threshold: 0.3,
};
const fuse = new Fuse(types, options);

@Injectable()
export class TypesService {
  private types: Type[] = types;

  getTypes({ text, search }: GetTypesDto) {
    let data: Type[] = this.types;
    if (text?.replace(/%/g, '')) {
      data = fuse.search(text)?.map(({ item }) => item);
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

    return data;
  }

  getTypeBySlug(slug: string): Type {
    return this.types.find((p) => p.slug === slug);
  }

  create(createTypeDto: CreateTypeDto) {
    const newId = this.types.length > 0
      ? Math.max(...this.types.map((t) => t.id)) + 1
      : 1;
    const newType: Type = {
      ...createTypeDto,
      id: newId,
      slug: 'type-' + newId,
      created_at: new Date(),
      updated_at: new Date(),
    } as unknown as Type;
    this.types.push(newType);
    this.saveToFile();
    return newType;
  }

  findAll() {
    return `This action returns all types`;
  }

  findOne(id: number) {
    return `This action returns a #${id} type`;
  }

  update(id: number, updateTypeDto: UpdateTypeDto) {
    const index = this.types.findIndex((t) => t.id === Number(id));
    if (index === -1) return null;
    this.types[index] = {
      ...this.types[index],
      ...updateTypeDto,
      updated_at: new Date(),
    };
    this.saveToFile();
    return this.types[index];
  }

  remove(id: number) {
    const index = this.types.findIndex((t) => t.id === Number(id));
    if (index === -1) return null;
    const removed = this.types.splice(index, 1)[0];
    this.saveToFile();
    return removed;
  }

    private saveToFile() {
    const srcPath = path.join(process.cwd(), 'src', 'db', 'pickbazar', 'types.json');
    const distPath = path.join(process.cwd(), 'dist', 'db', 'pickbazar', 'types.json');
    const data = JSON.stringify(this.types, null, 2);
    fs.writeFileSync(srcPath, data);
    fs.writeFileSync(distPath, data);
  }
}
