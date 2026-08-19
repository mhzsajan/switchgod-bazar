import { Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { User } from '../users/entities/user.entity';
import usersJson from '../db/pickbazar/users.json';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class AddressesService {
  private users: User[] = plainToClass(User, usersJson) as any;

  private reloadFromFile() {
    try {
      const distPath = path.join(
        process.cwd(),
        'dist',
        'db',
        'pickbazar',
        'users.json',
      );
      const raw = fs.readFileSync(distPath, 'utf8');
      this.users = plainToClass(User, JSON.parse(raw)) as any;
    } catch {
      const srcPath = path.join(
        process.cwd(),
        'src',
        'db',
        'pickbazar',
        'users.json',
      );
      const raw = fs.readFileSync(srcPath, 'utf8');
      this.users = plainToClass(User, JSON.parse(raw)) as any;
    }
  }

  private saveToFile() {
    const srcPath = path.join(
      process.cwd(),
      'src',
      'db',
      'pickbazar',
      'users.json',
    );
    const distPath = path.join(
      process.cwd(),
      'dist',
      'db',
      'pickbazar',
      'users.json',
    );
    const data = JSON.stringify(this.users, null, 2);
    fs.writeFileSync(srcPath, data);
    fs.mkdirSync(path.dirname(distPath), { recursive: true });
    fs.writeFileSync(distPath, data);
  }

  private allAddresses(): any[] {
    return (this.users || [])
      .filter((u: any) => Array.isArray(u.address) && u.address.length > 0)
      .flatMap((u: any) =>
        u.address.map((a: any) => ({ ...a, customer_id: u.id })),
      );
  }

  create(createAddressDto: CreateAddressDto) {
    this.reloadFromFile();
    const customerId = Number((createAddressDto as any).customer_id);
    const owner =
      this.users.find((u) => u.id === customerId) ||
      this.users.find((u) => u.id === Number((createAddressDto as any).user_id));
    if (!owner) {
      return null;
    }
    const list: any[] = (owner as any).address || [];
    const nextId =
      list.length > 0 ? Math.max(...list.map((a) => a.id)) + 1 : 1;
    const address: any = {
      ...createAddressDto,
      id: nextId,
      customer_id: owner.id,
      created_at: new Date(),
      updated_at: new Date(),
    };
    (owner as any).address = [...list, address];
    this.saveToFile();
    return address;
  }

  findAll() {
    this.reloadFromFile();
    return this.allAddresses();
  }

  findOne(id: number) {
    this.reloadFromFile();
    return this.allAddresses().find((a) => a.id === id) || null;
  }

  update(id: number, updateAddressDto: UpdateAddressDto) {
    this.reloadFromFile();
    for (const user of this.users) {
      const list: any[] = (user as any).address || [];
      const index = list.findIndex((a) => a.id === id);
      if (index >= 0) {
        list[index] = {
          ...list[index],
          ...updateAddressDto,
          id,
          updated_at: new Date(),
        };
        (user as any).address = list;
        this.saveToFile();
        return list[index];
      }
    }
    return null;
  }

  remove(id: number) {
    this.reloadFromFile();
    for (const user of this.users) {
      const list: any[] = (user as any).address || [];
      const index = list.findIndex((a) => a.id === id);
      if (index >= 0) {
        list.splice(index, 1);
        (user as any).address = list;
        this.saveToFile();
        return true;
      }
    }
    return false;
  }
}