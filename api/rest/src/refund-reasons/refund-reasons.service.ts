import { Injectable } from '@nestjs/common';
import refundReasonJSON from '@db/refund-reasons.json';
import { plainToClass } from 'class-transformer';
import { paginate } from 'src/common/pagination/paginate';
import { RefundReason } from './entities/refund-reasons.entity';
import { UpdateRefundReasonDto } from './dto/update-refund-reasons.dto';
import { GetRefundReasonDto } from './dto/get-refund-reasons.dto';
import { CreateRefundReasonDto } from './dto/create-refund-reasons.dto';
import * as fs from 'fs';
import * as path from 'path';

const refundReason = plainToClass(RefundReason, refundReasonJSON as any);

@Injectable()
export class RefundReasonsService {
  private refundReason: RefundReason[] = refundReason as any;

  private reloadFromFile() {
    try {
      const distPath = path.join(
        process.cwd(),
        'dist',
        'db',
        'pickbazar',
        'refund-reasons.json',
      );
      this.refundReason = JSON.parse(fs.readFileSync(distPath, 'utf8'));
    } catch {
      const srcPath = path.join(
        process.cwd(),
        'src',
        'db',
        'pickbazar',
        'refund-reasons.json',
      );
      this.refundReason = JSON.parse(fs.readFileSync(srcPath, 'utf8'));
    }
  }

  private saveToFile() {
    const srcPath = path.join(
      process.cwd(),
      'src',
      'db',
      'pickbazar',
      'refund-reasons.json',
    );
    const distPath = path.join(
      process.cwd(),
      'dist',
      'db',
      'pickbazar',
      'refund-reasons.json',
    );
    const data = JSON.stringify(this.refundReason, null, 2);
    fs.writeFileSync(srcPath, data);
    fs.mkdirSync(path.dirname(distPath), { recursive: true });
    fs.writeFileSync(distPath, data);
  }

  create(createRefundReasonDto: CreateRefundReasonDto) {
    this.reloadFromFile();
    const newId =
      this.refundReason.length > 0
        ? Math.max(...this.refundReason.map((r: any) => Number(r.id))) + 1
        : 1;
    const reason: any = {
      ...createRefundReasonDto,
      id: newId,
      slug:
        (createRefundReasonDto as any).slug ||
        `refund-reason-${newId}-${Date.now().toString(36)}`,
      language: (createRefundReasonDto as any).language || 'en',
      translated_languages: ['en'],
      deleted_at: null,
      created_at: new Date(),
      updated_at: new Date(),
    };
    this.refundReason.push(reason);
    this.saveToFile();
    return reason;
  }

  findAllRefundPolicies({ search, limit, page }: GetRefundReasonDto) {
    this.reloadFromFile();
    if (!page) page = 1;
    if (!limit) limit = 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    let data: RefundReason[] = this.refundReason;

    if (search) {
      const parseSearchParams = search.split(';');
      for (const searchParam of parseSearchParams) {
        const [key, value] = searchParam.split(':');
        data = (this.refundReason as any).filter((item: any) =>
          JSON.stringify(item).toLowerCase().includes(value.toLowerCase()),
        );
      }
    }

    const results = data.slice(startIndex, endIndex);
    const url = `/refund-reasons?search=${search}&limit=${limit}`;
    return {
      data: results,
      ...paginate(data.length, page, limit, results.length, url),
    };
  }

  getRefundPolicy(param: string, language: string) {
    this.reloadFromFile();
    return (
      (this.refundReason as any).find(
        (p: any) => p.slug === param || p.id === Number(param),
      ) || null
    );
  }

  update(id: number, updateRefundDto: UpdateRefundReasonDto) {
    this.reloadFromFile();
    const index = (this.refundReason as any).findIndex(
      (r: any) => r.id === Number(id),
    );
    if (index === -1) return null;
    this.refundReason[index] = {
      ...this.refundReason[index],
      ...updateRefundDto,
      id: Number(id),
      updated_at: new Date(),
    };
    this.saveToFile();
    return this.refundReason[index];
  }

  remove(id: number) {
    this.reloadFromFile();
    const index = (this.refundReason as any).findIndex(
      (r: any) => r.id === Number(id),
    );
    if (index === -1) return null;
    const removed = this.refundReason.splice(index, 1)[0];
    this.saveToFile();
    return removed;
  }
}
