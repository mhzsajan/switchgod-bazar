import { Injectable } from '@nestjs/common';
import termsAndConditionsJSON from '@db/terms-and-conditions.json';
import { TermsAndConditions } from './entities/terms-and-conditions.entity';
import { plainToClass } from 'class-transformer';
import { paginate } from 'src/common/pagination/paginate';
import { GetTermsAndConditionsDto } from './dto/get-terms-and-conditions.dto';
import { CreateTermsAndConditionsDto } from './dto/create-terms-and-conditions.dto';
import { UpdateTermsAndConditionsDto } from './dto/update-terms-and-conditions.dto';
import * as fs from 'fs';
import * as path from 'path';

const termsAndConditions = plainToClass(
  TermsAndConditions,
  termsAndConditionsJSON as any,
);

@Injectable()
export class TermsAndConditionsService {
  private termsAndConditions: TermsAndConditions[] = termsAndConditions as any;

  private reloadFromFile() {
    try {
      const distPath = path.join(
        process.cwd(),
        'dist',
        'db',
        'pickbazar',
        'terms-and-conditions.json',
      );
      this.termsAndConditions = JSON.parse(
        fs.readFileSync(distPath, 'utf8'),
      );
    } catch {
      const srcPath = path.join(
        process.cwd(),
        'src',
        'db',
        'pickbazar',
        'terms-and-conditions.json',
      );
      this.termsAndConditions = JSON.parse(
        fs.readFileSync(srcPath, 'utf8'),
      );
    }
  }

  private saveToFile() {
    const srcPath = path.join(
      process.cwd(),
      'src',
      'db',
      'pickbazar',
      'terms-and-conditions.json',
    );
    const distPath = path.join(
      process.cwd(),
      'dist',
      'db',
      'pickbazar',
      'terms-and-conditions.json',
    );
    const data = JSON.stringify(this.termsAndConditions, null, 2);
    fs.writeFileSync(srcPath, data);
    fs.mkdirSync(path.dirname(distPath), { recursive: true });
    fs.writeFileSync(distPath, data);
  }

  create(createTermsAndConditionsDto: CreateTermsAndConditionsDto) {
    this.reloadFromFile();
    const newId =
      this.termsAndConditions.length > 0
        ? Math.max(
            ...this.termsAndConditions.map((t: any) => Number(t.id)),
          ) + 1
        : 1;
    const title =
      (createTermsAndConditionsDto as any).title || `Terms ${newId}`;
    const tAndC: any = {
      ...createTermsAndConditionsDto,
      id: newId,
      title,
      slug:
        (createTermsAndConditionsDto as any).slug ||
        title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, ''),
      language: (createTermsAndConditionsDto as any).language || 'en',
      translated_languages: ['en'],
      deleted_at: null,
      created_at: new Date(),
      updated_at: new Date(),
    };
    this.termsAndConditions.push(tAndC);
    this.saveToFile();
    return tAndC;
  }

  findAllTermsAndConditions({
    search,
    limit,
    page,
    is_approved,
  }: GetTermsAndConditionsDto) {
    this.reloadFromFile();
    if (!page) page = 1;
    if (!limit) limit = 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    let data: TermsAndConditions[] = this.termsAndConditions;

    if (search) {
      const parseSearchParams = search.split(';');
      for (const searchParam of parseSearchParams) {
        const [key, value] = searchParam.split(':');
        data = (this.termsAndConditions as any).filter((item: any) =>
          JSON.stringify(item).toLowerCase().includes(value.toLowerCase()),
        );
      }
    }

    let results = data.slice(startIndex, endIndex);
    if (results.length == 0) {
      results = this.termsAndConditions.slice(0, limit);
    }
    const url = `/terms-and-conditions?search=${search}&limit=${limit}`;
    return {
      data: results,
      ...paginate(data.length, page, limit, results.length, url),
    };
  }

  findOne(param: string, language: string) {
    this.reloadFromFile();
    return (
      (this.termsAndConditions as any).find(
        (p: any) => p.slug === String(param) || p.id === Number(param),
      ) || null
    );
  }

  update(id: number, updateTermsAndConditionsDto: UpdateTermsAndConditionsDto) {
    this.reloadFromFile();
    const index = (this.termsAndConditions as any).findIndex(
      (t: any) => t.id === Number(id),
    );
    if (index === -1) return null;
    this.termsAndConditions[index] = {
      ...this.termsAndConditions[index],
      ...updateTermsAndConditionsDto,
      id: Number(id),
      updated_at: new Date(),
    };
    this.saveToFile();
    return this.termsAndConditions[index];
  }

  remove(id: number) {
    this.reloadFromFile();
    const index = (this.termsAndConditions as any).findIndex(
      (t: any) => t.id === Number(id),
    );
    if (index === -1) return null;
    const removed = this.termsAndConditions.splice(index, 1)[0];
    this.saveToFile();
    return removed;
  }

  disapproveTermsAndCondition(id: number) {
    this.reloadFromFile();
    const index = (this.termsAndConditions as any).findIndex(
      (t: any) => t.id === Number(id),
    );
    if (index === -1) return null;
    (this.termsAndConditions[index] as any).is_approved = false;
    this.saveToFile();
    return this.termsAndConditions[index];
  }

  approveTermsAndCondition(id: number) {
    this.reloadFromFile();
    const index = (this.termsAndConditions as any).findIndex(
      (t: any) => t.id === Number(id),
    );
    if (index === -1) return null;
    (this.termsAndConditions[index] as any).is_approved = true;
    this.saveToFile();
    return this.termsAndConditions[index];
  }
}
