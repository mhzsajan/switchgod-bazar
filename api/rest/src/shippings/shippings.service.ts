import { Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { CreateShippingDto } from './dto/create-shipping.dto';
import { GetShippingsDto } from './dto/get-shippings.dto';
import { UpdateShippingDto } from './dto/update-shipping.dto';
import { Shipping } from './entities/shipping.entity';
import shippingsJson from '@db/shippings.json';
import * as fs from 'fs';
import * as path from 'path';

const shippings = plainToClass(Shipping, shippingsJson);

@Injectable()
export class ShippingsService {
  private shippings: Shipping[] = shippings;

  create(createShippingDto: CreateShippingDto) {
    const newId = this.shippings.length > 0
      ? Math.max(...this.shippings.map((s) => s.id)) + 1
      : 1;
    const newShipping: Shipping = {
      ...createShippingDto,
      id: newId,
      created_at: new Date(),
      updated_at: new Date(),
    } as unknown as Shipping;
    this.shippings.push(newShipping);
    this.saveToFile();
    return newShipping;
  }

  getShippings({}: GetShippingsDto) {
    return this.shippings;
  }

  findOne(id: number) {
    return this.shippings.find((shipping) => shipping.id === Number(id));
  }

  update(id: number, updateShippingDto: UpdateShippingDto) {
    const index = this.shippings.findIndex((s) => s.id === Number(id));
    if (index === -1) return null;
    this.shippings[index] = {
      ...this.shippings[index],
      ...updateShippingDto,
      updated_at: new Date(),
    };
    this.saveToFile();
    return this.shippings[index];
  }

  remove(id: number) {
    const index = this.shippings.findIndex((s) => s.id === Number(id));
    if (index === -1) return null;
    const removed = this.shippings.splice(index, 1)[0];
    this.saveToFile();
    return removed;
  }

    private saveToFile() {
    const srcPath = path.join(process.cwd(), 'src', 'db', 'pickbazar', 'shippings.json');
    const distPath = path.join(process.cwd(), 'dist', 'db', 'pickbazar', 'shippings.json');
    const data = JSON.stringify(this.shippings, null, 2);
    fs.writeFileSync(srcPath, data);
    fs.writeFileSync(distPath, data);
  }
}
