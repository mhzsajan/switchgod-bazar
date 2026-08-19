import { Injectable } from '@nestjs/common';
import refundPolicyJSON from '@db/refund-policies.json';
import { plainToClass } from 'class-transformer';
import { paginate } from 'src/common/pagination/paginate';
import { RefundPolicy } from './entities/refund-policies.entity';
import { CreateRefundPolicyDto } from './dto/create-refund-policy.dto';
import { GetRefundPolicyDto } from './dto/get-refund-policies.dto';
import { UpdateRefundPolicyDto } from './dto/update-refund-policy.dto';
import * as fs from 'fs';
import * as path from 'path';

const refundPolicy = plainToClass(RefundPolicy, refundPolicyJSON as any);

@Injectable()
export class RefundPoliciesService {
  private refundPolicy: RefundPolicy[] = refundPolicy as any;

  private reloadFromFile() {
    try {
      const distPath = path.join(
        process.cwd(),
        'dist',
        'db',
        'pickbazar',
        'refund-policies.json',
      );
      this.refundPolicy = JSON.parse(fs.readFileSync(distPath, 'utf8'));
    } catch {
      const srcPath = path.join(
        process.cwd(),
        'src',
        'db',
        'pickbazar',
        'refund-policies.json',
      );
      this.refundPolicy = JSON.parse(fs.readFileSync(srcPath, 'utf8'));
    }
  }

  private saveToFile() {
    const srcPath = path.join(
      process.cwd(),
      'src',
      'db',
      'pickbazar',
      'refund-policies.json',
    );
    const distPath = path.join(
      process.cwd(),
      'dist',
      'db',
      'pickbazar',
      'refund-policies.json',
    );
    const data = JSON.stringify(this.refundPolicy, null, 2);
    fs.writeFileSync(srcPath, data);
    fs.mkdirSync(path.dirname(distPath), { recursive: true });
    fs.writeFileSync(distPath, data);
  }

  create(createRefundPolicyDto: CreateRefundPolicyDto) {
    this.reloadFromFile();
    const newId =
      this.refundPolicy.length > 0
        ? Math.max(...this.refundPolicy.map((p: any) => Number(p.id))) + 1
        : 1;
    const title = (createRefundPolicyDto as any).title || `Policy ${newId}`;
    const policy: any = {
      ...createRefundPolicyDto,
      id: newId,
      title,
      slug:
        (createRefundPolicyDto as any).slug ||
        title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, ''),
      target: (createRefundPolicyDto as any).target || 'vendor',
      status: (createRefundPolicyDto as any).status || 'approved',
      language: (createRefundPolicyDto as any).language || 'en',
      translated_languages: ['en'],
      deleted_at: null,
      created_at: new Date(),
      updated_at: new Date(),
    };
    this.refundPolicy.push(policy);
    this.saveToFile();
    return policy;
  }

  findAllRefundPolicies({ search, limit, page }: GetRefundPolicyDto) {
    this.reloadFromFile();
    if (!page) page = 1;
    if (!limit) limit = 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    let data: RefundPolicy[] = this.refundPolicy;

    if (search) {
      const parseSearchParams = search.split(';');
      for (const searchParam of parseSearchParams) {
        const [key, value] = searchParam.split(':');
        data = (this.refundPolicy as any).filter((item: any) =>
          JSON.stringify(item).toLowerCase().includes(value.toLowerCase()),
        );
      }
    }

    let results = data.slice(startIndex, endIndex);
    if (results.length == 0) {
      results = this.refundPolicy.slice(0, limit);
    }
    const url = `/refund-policies?search=${search}&limit=${limit}`;
    return {
      data: results,
      ...paginate(data.length, page, limit, results.length, url),
    };
  }

  getRefundPolicy(param: string, language: string) {
    this.reloadFromFile();
    return (
      (this.refundPolicy as any).find(
        (p: any) => p.slug === param || p.id === Number(param),
      ) || null
    );
  }

  update(id: number, updateRefundDto: UpdateRefundPolicyDto) {
    this.reloadFromFile();
    const index = (this.refundPolicy as any).findIndex(
      (p: any) => p.id === Number(id),
    );
    if (index === -1) return null;
    this.refundPolicy[index] = {
      ...this.refundPolicy[index],
      ...updateRefundDto,
      id: Number(id),
      updated_at: new Date(),
    };
    this.saveToFile();
    return this.refundPolicy[index];
  }

  remove(id: number) {
    this.reloadFromFile();
    const index = (this.refundPolicy as any).findIndex(
      (p: any) => p.id === Number(id),
    );
    if (index === -1) return null;
    const removed = this.refundPolicy.splice(index, 1)[0];
    this.saveToFile();
    return removed;
  }
}
