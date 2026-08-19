import { Injectable } from '@nestjs/common';
import { GetFaqsDto } from './dto/get-faqs.dto';
import faqsJSON from '@db/faqs.json';
import { Faq } from './entities/faq.entity';
import { plainToClass } from 'class-transformer';
import { paginate } from 'src/common/pagination/paginate';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
import * as fs from 'fs';
import * as path from 'path';

const faqs = plainToClass(Faq, faqsJSON as any);

@Injectable()
export class FaqsService {
  private faqs: Faq[] = faqs as any;

  private reloadFromFile() {
    try {
      const distPath = path.join(
        process.cwd(),
        'dist',
        'db',
        'pickbazar',
        'faqs.json',
      );
      this.faqs = JSON.parse(fs.readFileSync(distPath, 'utf8'));
    } catch {
      const srcPath = path.join(
        process.cwd(),
        'src',
        'db',
        'pickbazar',
        'faqs.json',
      );
      this.faqs = JSON.parse(fs.readFileSync(srcPath, 'utf8'));
    }
  }

  private saveToFile() {
    const srcPath = path.join(
      process.cwd(),
      'src',
      'db',
      'pickbazar',
      'faqs.json',
    );
    const distPath = path.join(
      process.cwd(),
      'dist',
      'db',
      'pickbazar',
      'faqs.json',
    );
    const data = JSON.stringify(this.faqs, null, 2);
    fs.writeFileSync(srcPath, data);
    fs.mkdirSync(path.dirname(distPath), { recursive: true });
    fs.writeFileSync(distPath, data);
  }

  create(createFaqDto: CreateFaqDto) {
    this.reloadFromFile();
    const newId =
      this.faqs.length > 0
        ? Math.max(...this.faqs.map((f: any) => Number(f.id))) + 1
        : 1;
    const faq: any = {
      ...createFaqDto,
      id: newId,
      slug:
        (createFaqDto as any).slug ||
        `faq-${newId}-${Date.now().toString(36)}`,
      translated_languages: ['en'],
      deleted_at: null,
      created_at: new Date(),
      updated_at: new Date(),
    };
    this.faqs.push(faq);
    this.saveToFile();
    return faq;
  }

  findAllFaqs({ search, limit, page, shop_id }: GetFaqsDto) {
    this.reloadFromFile();
    if (!page) page = 1;
    if (!limit) limit = 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    let data: Faq[] = this.faqs;

    if (shop_id) {
      data = (this.faqs as any).filter(
        (p: any) => Number(p.shop_id) === Number(shop_id),
      );
    }

    if (search) {
      const parseSearchParams = search.split(';');
      for (const searchParam of parseSearchParams) {
        const [key, value] = searchParam.split(':');
        data = (this.faqs as any).filter((item: any) =>
          key.split('.').reduce((acc: any, part: string) => acc?.[part], item)
            ? key
                .split('.')
                .reduce((acc: any, part: string) => acc?.[part], item)
                ?.toString()
                ?.toLowerCase()
                ?.includes(value.toLowerCase())
            : false,
        );
      }
    }

    let results = data.slice(startIndex, endIndex);
    if (results.length == 0) {
      results = this.faqs.slice(0, limit);
    }
    const url = `/faqs?search=${search}&limit=${limit}`;
    return {
      data: results,
      ...paginate(data.length, page, limit, results.length, url),
    };
  }

  getFaq(param: string, language: string) {
    this.reloadFromFile();
    return (
      (this.faqs as any).find(
        (p: any) => p.slug === param || p.id === Number(param),
      ) || null
    );
  }

  update(id: number, updateFaqDto: UpdateFaqDto) {
    this.reloadFromFile();
    const index = (this.faqs as any).findIndex(
      (f: any) => f.id === Number(id),
    );
    if (index === -1) return null;
    this.faqs[index] = {
      ...this.faqs[index],
      ...updateFaqDto,
      id: Number(id),
      updated_at: new Date(),
    };
    this.saveToFile();
    return this.faqs[index];
  }

  remove(id: number) {
    this.reloadFromFile();
    const index = (this.faqs as any).findIndex(
      (f: any) => f.id === Number(id),
    );
    if (index === -1) return null;
    const removed = this.faqs.splice(index, 1)[0];
    this.saveToFile();
    return removed;
  }
}
