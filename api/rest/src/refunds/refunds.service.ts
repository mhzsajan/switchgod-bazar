import { Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { paginate } from 'src/common/pagination/paginate';
import { CreateRefundDto } from './dto/create-refund.dto';
import { UpdateRefundDto } from './dto/update-refund.dto';
import refundsJson from '../db/pickbazar/refunds.json';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class RefundsService {
  private refunds: any[] = (refundsJson as any) || [];

  private reloadFromFile() {
    try {
      const distPath = path.join(
        process.cwd(),
        'dist',
        'db',
        'pickbazar',
        'refunds.json',
      );
      const raw = fs.readFileSync(distPath, 'utf8');
      this.refunds = JSON.parse(raw);
    } catch {
      try {
        const srcPath = path.join(
          process.cwd(),
          'src',
          'db',
          'pickbazar',
          'refunds.json',
        );
        const raw = fs.readFileSync(srcPath, 'utf8');
        this.refunds = JSON.parse(raw);
      } catch {
        this.refunds = [];
      }
    }
  }

  private saveToFile() {
    const srcPath = path.join(
      process.cwd(),
      'src',
      'db',
      'pickbazar',
      'refunds.json',
    );
    const distPath = path.join(
      process.cwd(),
      'dist',
      'db',
      'pickbazar',
      'refunds.json',
    );
    const data = JSON.stringify(this.refunds, null, 2);
    fs.writeFileSync(srcPath, data);
    fs.mkdirSync(path.dirname(distPath), { recursive: true });
    fs.writeFileSync(distPath, data);
  }

  create(createRefundDto: CreateRefundDto) {
    this.reloadFromFile();
    const newId =
      this.refunds.length > 0
        ? Math.max(...this.refunds.map((r) => r.id)) + 1
        : 1;
    const refund: any = {
      ...(createRefundDto as any),
      id: newId,
      status: (createRefundDto as any)?.status || 'pending',
      created_at: new Date(),
      updated_at: new Date(),
    };
    this.refunds.push(refund);
    this.saveToFile();
    return refund;
  }

  findAll(query: any = {}) {
    let { limit, page } = query || {};
    this.reloadFromFile();
    if (!page) page = 1;
    if (!limit) limit = 30;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const data = this.refunds.slice(startIndex, endIndex);
    const url = `/refunds?limit=${limit}`;
    return {
      data,
      ...paginate(this.refunds.length, page, limit, data.length, url),
    };
  }

  findOne(id: number) {
    this.reloadFromFile();
    return this.refunds.find((r) => r.id === Number(id)) || null;
  }

  update(id: number, updateRefundDto: UpdateRefundDto) {
    this.reloadFromFile();
    const index = this.refunds.findIndex((r) => r.id === Number(id));
    if (index === -1) return null;
    this.refunds[index] = {
      ...this.refunds[index],
      ...(updateRefundDto as any),
      id: Number(id),
      updated_at: new Date(),
    };
    this.saveToFile();
    return this.refunds[index];
  }

  remove(id: number) {
    this.reloadFromFile();
    const index = this.refunds.findIndex((r) => r.id === Number(id));
    if (index === -1) return null;
    const removed = this.refunds.splice(index, 1)[0];
    this.saveToFile();
    return removed;
  }
}
