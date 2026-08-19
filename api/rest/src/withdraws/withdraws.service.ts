import { Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import Fuse from 'fuse.js';
import { paginate } from 'src/common/pagination/paginate';
import { CreateWithdrawDto } from './dto/create-withdraw.dto';
import { ApproveWithdrawDto } from './dto/approve-withdraw.dto';
import { GetWithdrawsDto, WithdrawPaginator } from './dto/get-withdraw.dto';
import { Withdraw } from './entities/withdraw.entity';
import withdrawsJson from '@db/withdraws.json';
import * as fs from 'fs';
import * as path from 'path';

const withdraws = plainToClass(Withdraw, withdrawsJson as any);

@Injectable()
export class WithdrawsService {
  private withdraws: Withdraw[] = withdraws as any;

  private reloadFromFile() {
    try {
      const distPath = path.join(
        process.cwd(),
        'dist',
        'db',
        'pickbazar',
        'withdraws.json',
      );
      const raw = fs.readFileSync(distPath, 'utf8');
      this.withdraws = JSON.parse(raw);
    } catch {
      const srcPath = path.join(
        process.cwd(),
        'src',
        'db',
        'pickbazar',
        'withdraws.json',
      );
      const raw = fs.readFileSync(srcPath, 'utf8');
      this.withdraws = JSON.parse(raw);
    }
  }

  private saveToFile() {
    const srcPath = path.join(
      process.cwd(),
      'src',
      'db',
      'pickbazar',
      'withdraws.json',
    );
    const distPath = path.join(
      process.cwd(),
      'dist',
      'db',
      'pickbazar',
      'withdraws.json',
    );
    const data = JSON.stringify(this.withdraws, null, 2);
    fs.writeFileSync(srcPath, data);
    fs.mkdirSync(path.dirname(distPath), { recursive: true });
    fs.writeFileSync(distPath, data);
  }

  create(createWithdrawDto: CreateWithdrawDto) {
    this.reloadFromFile();
    const newId =
      this.withdraws.length > 0
        ? Math.max(...this.withdraws.map((w) => Number(w.id))) + 1
        : 1;
    const withdraw: any = {
      ...(createWithdrawDto as any),
      id: newId,
      status: 'pending',
      created_at: new Date(),
      updated_at: new Date(),
    };
    this.withdraws.push(withdraw);
    this.saveToFile();
    return withdraw;
  }

  getWithdraws({ limit, page, status, shop_id }: GetWithdrawsDto): WithdrawPaginator {
    this.reloadFromFile();
    if (!page) page = 1;
    if (!limit) limit = 30;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    let data: Withdraw[] = this.withdraws;
    if (status) {
      data = this.withdraws.filter((p: any) => p.status === status);
    }
    if (shop_id) {
      data = (this.withdraws as any).filter((p: any) => Number(p.shop_id) === Number(shop_id));
    }
    const results = data.slice(startIndex, endIndex);
    const url = `/withdraws?limit=${limit}`;
    return {
      data: results,
      ...paginate(data.length, page, limit, results.length, url),
    };
  }

  findOne(id: number) {
    this.reloadFromFile();
    return this.withdraws.find((w) => Number(w.id) === Number(id)) || null;
  }

  update(id: number, updateWithdrawDto: ApproveWithdrawDto) {
    this.reloadFromFile();
    const index = this.withdraws.findIndex((w) => Number(w.id) === Number(id));
    if (index === -1) return null;
    this.withdraws[index] = {
      ...this.withdraws[index],
      ...(updateWithdrawDto as any),
      id: Number(id),
      updated_at: new Date(),
    };
    this.saveToFile();
    return this.withdraws[index];
  }

  remove(id: number) {
    this.reloadFromFile();
    const index = this.withdraws.findIndex((w) => Number(w.id) === Number(id));
    if (index === -1) return null;
    const removed = this.withdraws.splice(index, 1)[0];
    this.saveToFile();
    return removed;
  }
}