import { Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { CreateCategoryDto } from './dto/create-category.dto';
import { GetCategoriesDto } from './dto/get-categories.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities/category.entity';
import Fuse from 'fuse.js';
import categoriesJson from '@db/categories.json';
import { paginate } from 'src/common/pagination/paginate';
import * as fs from 'fs';
import * as path from 'path';

const categories = plainToClass(Category, categoriesJson);
const options = {
  keys: ['name', 'type.slug'],
  threshold: 0.3,
};
const fuse = new Fuse(categories, options);

@Injectable()
export class CategoriesService {
  private categories: Category[] = categories;

  create(createCategoryDto: CreateCategoryDto) {
    const newId = this.categories.length > 0
      ? Math.max(...this.categories.map((c) => c.id)) + 1
      : 1;
    const newCategory: Category = {
      ...createCategoryDto,
      id: newId,
      slug: createCategoryDto.name.toLowerCase().replace(/\s+/g, '-') + '-' + newId,
      created_at: new Date(),
      updated_at: new Date(),
    } as unknown as Category;
    this.categories.push(newCategory);
    this.saveToFile();
    return newCategory;
  }

  getCategories({ limit, page, search, parent }: GetCategoriesDto) {
    if (!page) page = 1;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    let data: Category[] = this.categories;
    if (search) {
      const parseSearchParams = search.split(';');
      for (const searchParam of parseSearchParams) {
        const [key, value] = searchParam.split(':');
        // data = data.filter((item) => item[key] === value);
        data = fuse.search(value)?.map(({ item }) => item);
      }
    }
    if (parent === 'null') {
      data = data.filter((item) => item.parent === null);
    }
    // if (text?.replace(/%/g, '')) {
    //   data = fuse.search(text)?.map(({ item }) => item);
    // }
    // if (hasType) {
    //   data = fuse.search(hasType)?.map(({ item }) => item);
    // }

    const results = data.slice(startIndex, endIndex);
    const url = `/categories?search=${search}&limit=${limit}&parent=${parent}`;
    return {
      data: results,
      ...paginate(data.length, page, limit, results.length, url),
    };
  }

  getCategory(param: string, language: string): Category {
    return this.categories.find(
      (p) => p.id === Number(param) || p.slug === param,
    );
  }

  update(id: number, updateCategoryDto: UpdateCategoryDto) {
    const index = this.categories.findIndex((c) => c.id === Number(id));
    if (index === -1) return null;
    this.categories[index] = {
      ...this.categories[index],
      ...updateCategoryDto,
      updated_at: new Date(),
    };
    this.saveToFile();
    return this.categories[index];
  }

  remove(id: number) {
    const index = this.categories.findIndex((c) => c.id === Number(id));
    if (index === -1) return null;
    const removed = this.categories.splice(index, 1)[0];
    this.saveToFile();
    return removed;
  }

    private saveToFile() {
    const srcPath = path.join(process.cwd(), 'src', 'db', 'pickbazar', 'categories.json');
    const distPath = path.join(process.cwd(), 'dist', 'db', 'pickbazar', 'categories.json');
    const data = JSON.stringify(this.categories, null, 2);
    fs.writeFileSync(srcPath, data);
    fs.mkdirSync(path.dirname(distPath), { recursive: true });

    fs.writeFileSync(distPath, data);
  }
}
