import { Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { paginate } from 'src/common/pagination/paginate';
import { CreateOwnershipTransferDto } from './dto/create-ownership-transfer.dto';
import { UpdateOwnershipTransferDto } from './dto/update-ownership-transfer.dto';
import { GetOwnershipTransferDto } from './dto/get-ownership-transfer.dto';
import ownershipTransferJSON from '@db/ownership-transfer.json';
import * as fs from 'fs';
import * as path from 'path';

const ownershipTransfer: any = ownershipTransferJSON as any;

@Injectable()
export class OwnershipTransferService {
  private ownershipTransfer: any[] = ownershipTransfer;

  private reloadFromFile() {
    try {
      const distPath = path.join(
        process.cwd(),
        'dist',
        'db',
        'pickbazar',
        'ownership-transfer.json',
      );
      const raw = fs.readFileSync(distPath, 'utf8');
      this.ownershipTransfer = JSON.parse(raw);
    } catch {
      const srcPath = path.join(
        process.cwd(),
        'src',
        'db',
        'pickbazar',
        'ownership-transfer.json',
      );
      const raw = fs.readFileSync(srcPath, 'utf8');
      this.ownershipTransfer = JSON.parse(raw);
    }
  }

  private saveToFile() {
    const srcPath = path.join(
      process.cwd(),
      'src',
      'db',
      'pickbazar',
      'ownership-transfer.json',
    );
    const distPath = path.join(
      process.cwd(),
      'dist',
      'db',
      'pickbazar',
      'ownership-transfer.json',
    );
    const data = JSON.stringify(this.ownershipTransfer, null, 2);
    fs.writeFileSync(srcPath, data);
    fs.mkdirSync(path.dirname(distPath), { recursive: true });
    fs.writeFileSync(distPath, data);
  }

  create(createOwnershipTransferDto: CreateOwnershipTransferDto) {
    this.reloadFromFile();
    const payload: any = createOwnershipTransferDto as any;
    const nextId =
      this.ownershipTransfer.length > 0
        ? Math.max(...this.ownershipTransfer.map((o) => Number(o.id))) + 1
        : 1;
    const now = new Date();
    const entry: any = {
      ...payload,
      id: nextId,
      transaction_identifier: `${now.toISOString().slice(0, 10)}-${String(
        nextId,
      ).padStart(4, '0')}`,
      created_at: now,
      updated_at: now,
    };
    this.ownershipTransfer.push(entry);
    this.saveToFile();
    return entry;
  }

  findAll({ search, limit, page }: GetOwnershipTransferDto) {
    this.reloadFromFile();
    if (!page) page = 1;
    if (!limit) limit = 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    let data: any[] = this.ownershipTransfer;
    if (search) {
      data = data.filter((o) =>
        JSON.stringify(o).toLowerCase().includes(search.toLowerCase()),
      );
    }
    let results = data.slice(startIndex, endIndex);
    if (results.length == 0) {
      results = this.ownershipTransfer.slice(startIndex, endIndex);
    }
    const url = `/ownership-transfer?search=${search}&limit=${limit}`;
    return {
      data: results,
      ...paginate(data.length, page, limit, results.length, url),
    };
  }

  getOwnershipTransfer(param: string, language?: string) {
    this.reloadFromFile();
    return (
      this.ownershipTransfer.find(
        (p) => p.name === param || String(p.id) === String(param),
      ) || null
    );
  }

  update(id: number, updateOwnershipTransferDto: UpdateOwnershipTransferDto) {
    this.reloadFromFile();
    const index = this.ownershipTransfer.findIndex(
      (o) => Number(o.id) === Number(id),
    );
    if (index === -1) return null;
    this.ownershipTransfer[index] = {
      ...this.ownershipTransfer[index],
      ...(updateOwnershipTransferDto as any),
      id: Number(id),
      updated_at: new Date(),
    };
    this.saveToFile();
    return this.ownershipTransfer[index];
  }

  remove(id: number) {
    this.reloadFromFile();
    const index = this.ownershipTransfer.findIndex(
      (o) => Number(o.id) === Number(id),
    );
    if (index === -1) return null;
    const removed = this.ownershipTransfer.splice(index, 1)[0];
    this.saveToFile();
    return removed;
  }
}
