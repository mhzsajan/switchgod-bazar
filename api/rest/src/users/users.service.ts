import { Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { CreateUserDto } from './dto/create-user.dto';
import { GetUsersDto, UserPaginator } from './dto/get-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import Fuse from 'fuse.js';
import * as bcrypt from 'bcryptjs';
import { User, Permission } from './entities/user.entity';
import { Profile } from './entities/profile.entity';
import usersJson from '@db/users.json';
import { paginate } from 'src/common/pagination/paginate';
import * as fs from 'fs';
import * as path from 'path';

const users = plainToClass(User, usersJson);

const options = {
  keys: ['name', 'type.slug', 'categories.slug', 'status'],
  threshold: 0.3,
};
let fuse = new Fuse(users, options);

@Injectable()
export class UsersService {
  private users: User[] = users;

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
      try {
        const srcPath = path.join(
          process.cwd(),
          'src',
          'db',
          'pickbazar',
          'users.json',
        );
        const raw = fs.readFileSync(srcPath, 'utf8');
        this.users = plainToClass(User, JSON.parse(raw)) as any;
      } catch {
        // keep in-memory state as fallback
      }
    }
    fuse = new Fuse(this.users, options);
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

  create(createUserDto: CreateUserDto) {
    this.reloadFromFile();
    const newId =
      this.users.length > 0
        ? Math.max(...this.users.map((u) => u.id)) + 1
        : 1;
    const userData: any = { ...createUserDto };
    if (userData.password) {
      const salt = bcrypt.genSaltSync(10);
      userData.password = bcrypt.hashSync(userData.password, salt);
    }
    const newUser: User = {
      ...userData,
      id: newId,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date(),
    } as unknown as User;
    this.users.push(newUser);
    this.saveToFile();
    return newUser;
  }

  async getUsers({
    text,
    limit,
    page,
    search,
  }: GetUsersDto): Promise<UserPaginator> {
    this.reloadFromFile();
    if (!page) page = 1;
    if (!limit) limit = 30;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    let data: User[] = this.users;
    if (text?.replace(/%/g, '')) {
      data = fuse.search(text)?.map(({ item }) => item);
    }

    if (search) {
      const parseSearchParams = search.split(';');
      const searchText: any = [];
      for (const searchParam of parseSearchParams) {
        const [key, value] = searchParam.split(':');
        // TODO: Temp Solution
        if (key !== 'slug') {
          searchText.push({
            [key]: value,
          });
        }
      }

      data = fuse.search({ $and: searchText })?.map(({ item }) => item);
    }

    const results = data.slice(startIndex, endIndex);
    const url = `/users?limit=${limit}`;

    return {
      data: results,
      ...paginate(data.length, page, limit, results.length, url),
    };
  }

  getUsersNotify({ limit }: GetUsersDto): User[] {
    this.reloadFromFile();
    const data: any = this.users;
    return data?.slice(0, limit);
  }

  findOne(id: number) {
    this.reloadFromFile();
    return this.users.find((user) => user.id === id);
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    this.reloadFromFile();
    const index = this.users.findIndex((u) => u.id === Number(id));
    if (index === -1) return null;
    const { profile, address, ...rest } = updateUserDto;
    const mergedProfile = {
      ...(this.users[index]?.profile || {}),
      ...(profile || {}),
    };
    if (profile?.avatar) {
      mergedProfile.avatar = Array.isArray(profile.avatar)
        ? profile.avatar[0]
        : profile.avatar;
    }
    if (address) {
      const existingList: any[] = this.users[index]?.address || [];
      const incomingList = Array.isArray(address) ? address : [address];
      const mergedAddresses = [...existingList];
      for (const incoming of incomingList) {
        const foundIndex = mergedAddresses.findIndex(
          (a: any) => a.id === (incoming as any).id,
        );
        if (foundIndex >= 0) {
          mergedAddresses[foundIndex] = {
            ...mergedAddresses[foundIndex],
            ...incoming,
          };
        } else {
          mergedAddresses.push({
            ...incoming,
            id: (incoming as any).id ?? Date.now() * 1000 + Math.floor(Math.random() * 1000),
            customer_id: this.users[index]?.id,
            created_at: new Date(),
            updated_at: new Date(),
          });
        }
      }
      (rest as any).address = mergedAddresses;
    }
    this.users[index] = {
      ...this.users[index],
      ...rest,
      profile: profile ? (mergedProfile as Profile) : this.users[index]?.profile,
      address: (rest as any).address ?? this.users[index]?.address,
      updated_at: new Date(),
    };
    this.saveToFile();
    return this.users[index];
  }

  remove(id: number) {
    this.reloadFromFile();
    const index = this.users.findIndex((u) => u.id === Number(id));
    if (index === -1) return null;
    const removed = this.users.splice(index, 1)[0];
    this.saveToFile();
    return removed;
  }

  makeAdmin(user_id: string) {
    this.reloadFromFile();
    const user = this.users.find((u) => u.id === Number(user_id));
    if (!user) return null;
    const hasSuperAdmin = (user.permissions || []).some(
      (permission: any) => permission?.name === 'super_admin',
    );
    if (!hasSuperAdmin) {
      const now = new Date();
      user.permissions = [
        ...(user.permissions || []),
        {
          id: 1,
          name: 'super_admin',
          guard_name: 'api',
          created_at: now,
          updated_at: now,
        } as Permission,
      ];
    }
    user.updated_at = new Date();
    this.saveToFile();
    return user;
  }

  revokeAdmin(user_id: string) {
    this.reloadFromFile();
    const user = this.users.find((u) => u.id === Number(user_id));
    if (!user) return null;
    user.permissions = (user.permissions || []).filter(
      (permission: any) => permission?.name !== 'super_admin',
    );
    user.updated_at = new Date();
    this.saveToFile();
    return user;
  }

  banUser(id: number) {
    this.reloadFromFile();
    const user = this.users.find((u) => u.id === Number(id));
    if (!user) return null;
    user.is_active = !user.is_active;
    user.updated_at = new Date();
    this.saveToFile();
    return user;
  }

  activeUser(id: number) {
    this.reloadFromFile();
    const user = this.users.find((u) => u.id === Number(id));
    if (!user) return null;
    user.is_active = !user.is_active;
    user.updated_at = new Date();
    this.saveToFile();
    return user;
  }

  async getAdmin({
    text,
    limit,
    page,
    search,
  }: GetUsersDto): Promise<UserPaginator> {
    this.reloadFromFile();
    if (!page) page = 1;
    if (!limit) limit = 30;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    let data: User[] = this.users.filter(function (element) {
      return element.permissions.some(function (subElement) {
        return subElement.name === 'super_admin';
      });
    });

    if (text?.replace(/%/g, '')) {
      data = fuse.search(text)?.map(({ item }) => item);
    }
    const results = data.slice(startIndex, endIndex);
    const url = `/admin/list?limit=${limit}`;

    return {
      data: results,
      ...paginate(data.length, page, limit, results.length, url),
    };
  }

  async getVendors({
    text,
    limit,
    page,
    search,
  }: GetUsersDto): Promise<UserPaginator> {
    this.reloadFromFile();
    if (!page) page = 1;
    if (!limit) limit = 30;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    let data: User[] = this.users.filter(function (element) {
      return element.permissions.some(function (subElement) {
        return subElement.name === 'store_owner';
      });
    });

    if (text?.replace(/%/g, '')) {
      data = fuse.search(text)?.map(({ item }) => item);
    }
    const results = data.slice(startIndex, endIndex);
    const url = `/vendors/list?limit=${limit}`;

    return {
      data: results,
      ...paginate(data.length, page, limit, results.length, url),
    };
  }

  async getAllCustomers({
    text,
    limit,
    page,
    search,
  }: GetUsersDto): Promise<UserPaginator> {
    this.reloadFromFile();
    if (!page) page = 1;
    if (!limit) limit = 30;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    let data: User[] = this.users.filter(function (element) {
      return element.permissions.some(function (subElement) {
        return subElement.name === 'customer';
      });
    });

    if (text?.replace(/%/g, '')) {
      data = fuse.search(text)?.map(({ item }) => item);
    }
    const results = data.slice(startIndex, endIndex);
    const url = `/customers/list?limit=${limit}`;

    return {
      data: results,
      ...paginate(data.length, page, limit, results.length, url),
    };
  }

  async getMyStaffs({
    text,
    limit,
    page,
    search,
  }: GetUsersDto): Promise<UserPaginator> {
    this.reloadFromFile();
    if (!page) page = 1;
    if (!limit) limit = 30;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    let data: User[] = [];

    if (text?.replace(/%/g, '')) {
      data = fuse.search(text)?.map(({ item }) => item);
    }
    const results = data.slice(startIndex, endIndex);
    const url = `/my-staffs/list?limit=${limit}`;

    return {
      data: results,
      ...paginate(data.length, page, limit, results.length, url),
    };
  }

  async getAllStaffs({
    text,
    limit,
    page,
    search,
  }: GetUsersDto): Promise<UserPaginator> {
    this.reloadFromFile();
    if (!page) page = 1;
    if (!limit) limit = 30;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    let data: User[] = [];

    if (text?.replace(/%/g, '')) {
      data = fuse.search(text)?.map(({ item }) => item);
    }
    const results = data.slice(startIndex, endIndex);
    const url = `/all-staffs/list?limit=${limit}`;

    return {
      data: results,
      ...paginate(data.length, page, limit, results.length, url),
    };
  }
}