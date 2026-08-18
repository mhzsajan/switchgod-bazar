import { Injectable } from '@nestjs/common';
import { paginate } from 'src/common/pagination/paginate';
import { CreateTagDto } from './dto/create-tag.dto';
import { GetTagsDto } from './dto/get-tags.dto';
import { UpdateTagDto } from './dto/update-tag.dto';
import { Tag } from './entities/tag.entity';
import tagsJson from '@db/tags.json';
import { plainToClass } from 'class-transformer';
import Fuse from 'fuse.js';
import * as fs from 'fs';
import * as path from 'path';

const tags = plainToClass(Tag, tagsJson);

const options = {
  keys: ['name'],
  threshold: 0.3,
};
const fuse = new Fuse(tags, options);

@Injectable()
export class TagsService {
  private tags: Tag[] = tags;

  create(createTagDto: CreateTagDto) {
    const newId = this.tags.length > 0
      ? Math.max(...this.tags.map((t) => t.id)) + 1
      : 1;
    const newTag: Tag = {
      ...createTagDto,
      id: newId,
      slug: createTagDto.name.toLowerCase().replace(/\s+/g, '-') + '-' + newId,
      created_at: new Date(),
      updated_at: new Date(),
    } as unknown as Tag;
    this.tags.push(newTag);
    this.saveToFile();
    return newTag;
  }

  findAll({ page, limit, search }: GetTagsDto) {
    if (!page) page = 1;
    let data: Tag[] = this.tags;
    if (search) {
      const parseSearchParams = search.split(';');
      const searchText: any = [];
      for (const searchParam of parseSearchParams) {
        const [key, value] = searchParam.split(':');
        console.log(value, 'value');
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

    const url = `/tags?limit=${limit}`;
    return {
      data,
      ...paginate(this.tags.length, page, limit, this.tags.length, url),
    };
  }

  findOne(param: string, language: string) {
    return this.tags.find((p) => p.id === Number(param) || p.slug === param);
  }

  update(id: number, updateTagDto: UpdateTagDto) {
    const index = this.tags.findIndex((t) => t.id === Number(id));
    if (index === -1) return null;
    this.tags[index] = {
      ...this.tags[index],
      ...updateTagDto,
      updated_at: new Date(),
    };
    this.saveToFile();
    return this.tags[index];
  }

  remove(id: number) {
    const index = this.tags.findIndex((t) => t.id === Number(id));
    if (index === -1) return null;
    const removed = this.tags.splice(index, 1)[0];
    this.saveToFile();
    return removed;
  }

    private saveToFile() {
    const srcPath = path.join(process.cwd(), 'src', 'db', 'pickbazar', 'tags.json');
    const distPath = path.join(process.cwd(), 'dist', 'db', 'pickbazar', 'tags.json');
    const data = JSON.stringify(this.tags, null, 2);
    fs.writeFileSync(srcPath, data);
    fs.mkdirSync(path.dirname(distPath), { recursive: true });

    fs.writeFileSync(distPath, data);
  }
}
