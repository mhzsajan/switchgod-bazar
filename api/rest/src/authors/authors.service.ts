import { Injectable } from '@nestjs/common';
import { UpdateAuthorDto } from './dto/update-author.dto';
import { plainToClass } from 'class-transformer';
import authorsJson from '@db/authors.json';
import { Author } from './entities/author.entity';
import Fuse from 'fuse.js';
import { GetAuthorDto } from './dto/get-author.dto';
import { paginate } from '../common/pagination/paginate';
import { GetTopAuthorsDto } from './dto/get-top-authors.dto';
import { CreateAuthorDto } from './dto/create-author.dto';
import * as fs from 'fs';
import * as path from 'path';

const authors = plainToClass(Author, authorsJson);

const options = {
  keys: ['name', 'slug'],
  threshold: 0.3,
};

const fuse = new Fuse(authors, options);

@Injectable()
export class AuthorsService {
  private authors: Author[] = authors;

  create(createAuthorDto: CreateAuthorDto) {
    const newId = this.authors.length > 0
      ? Math.max(...this.authors.map((a) => a.id)) + 1
      : 1;
    const newAuthor: Author = {
      ...createAuthorDto,
      id: newId,
      slug: (createAuthorDto as any).slug || 'author-' + newId,
      created_at: new Date(),
      updated_at: new Date(),
    } as unknown as Author;
    this.authors.push(newAuthor);
    this.saveToFile();
    return newAuthor;
  }

  getAuthors({ page, limit, search }: GetAuthorDto) {
    if (!page) page = 1;
    if (!limit) limit = 30;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    let data: Author[] = this.authors;
    if (search) {
      const parseSearchParams = search.split(';');
      for (const searchParam of parseSearchParams) {
        const [key, value] = searchParam.split(':');
        data = fuse.search(value)?.map(({ item }) => item);
      }
    }

    const results = data.slice(startIndex, endIndex);

    const url = `/authors?search=${search}&limit=${limit}`;
    return {
      data: results,
      ...paginate(data.length, page, limit, results.length, url),
    };
  }

  getAuthorBySlug(slug: string): Author {
    return this.authors.find((p) => p.slug === slug);
  }

  async getTopAuthors({ limit = 10 }: GetTopAuthorsDto): Promise<Author[]> {
    return this.authors.slice(0, limit);
  }

  update(id: number, updateAuthorDto: UpdateAuthorDto) {
    const index = this.authors.findIndex((a) => a.id === Number(id));
    if (index === -1) return null;
    this.authors[index] = {
      ...this.authors[index],
      ...updateAuthorDto,
      updated_at: new Date(),
    };
    this.saveToFile();
    return this.authors[index];
  }

  remove(id: number) {
    const index = this.authors.findIndex((a) => a.id === Number(id));
    if (index === -1) return null;
    const removed = this.authors.splice(index, 1)[0];
    this.saveToFile();
    return removed;
  }

    private saveToFile() {
    const srcPath = path.join(process.cwd(), 'src', 'db', 'pickbazar', 'authors.json');
    const distPath = path.join(process.cwd(), 'dist', 'db', 'pickbazar', 'authors.json');
    const data = JSON.stringify(this.authors, null, 2);
    fs.writeFileSync(srcPath, data);
    fs.writeFileSync(distPath, data);
  }
}
