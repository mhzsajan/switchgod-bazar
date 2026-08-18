import { Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { CreateTaxDto } from './dto/create-tax.dto';
import { UpdateTaxDto } from './dto/update-tax.dto';
import { Tax } from './entities/tax.entity';
import taxesJson from '@db/taxes.json';
import * as fs from 'fs';
import * as path from 'path';

const taxes = plainToClass(Tax, taxesJson);

@Injectable()
export class TaxesService {
  private taxes: Tax[] = taxes;

  create(createTaxDto: CreateTaxDto) {
    const newId = this.taxes.length > 0
      ? Math.max(...this.taxes.map((t) => t.id)) + 1
      : 1;
    const newTax: Tax = {
      ...createTaxDto,
      id: newId,
      created_at: new Date(),
      updated_at: new Date(),
    } as unknown as Tax;
    this.taxes.push(newTax);
    this.saveToFile();
    return newTax;
  }

  findAll() {
    return this.taxes;
  }

  findOne(id: number) {
    return this.taxes.find((tax) => tax.id === Number(id));
  }

  update(id: number, updateTaxDto: UpdateTaxDto) {
    const index = this.taxes.findIndex((t) => t.id === Number(id));
    if (index === -1) return null;
    this.taxes[index] = {
      ...this.taxes[index],
      ...updateTaxDto,
      updated_at: new Date(),
    };
    this.saveToFile();
    return this.taxes[index];
  }

  remove(id: number) {
    const index = this.taxes.findIndex((t) => t.id === Number(id));
    if (index === -1) return null;
    const removed = this.taxes.splice(index, 1)[0];
    this.saveToFile();
    return removed;
  }

    private saveToFile() {
    const srcPath = path.join(process.cwd(), 'src', 'db', 'pickbazar', 'taxes.json');
    const distPath = path.join(process.cwd(), 'dist', 'db', 'pickbazar', 'taxes.json');
    const data = JSON.stringify(this.taxes, null, 2);
    fs.writeFileSync(srcPath, data);
    fs.mkdirSync(path.dirname(distPath), { recursive: true });

    fs.writeFileSync(distPath, data);
  }
}
