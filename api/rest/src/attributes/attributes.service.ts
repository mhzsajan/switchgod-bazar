import { Injectable } from '@nestjs/common';
import { CreateAttributeDto } from './dto/create-attribute.dto';
import { UpdateAttributeDto } from './dto/update-attribute.dto';
import attributesJson from '@db/attributes.json';
import { Attribute } from './entities/attribute.entity';
import { plainToClass } from 'class-transformer';
import * as fs from 'fs';
import * as path from 'path';

const attributes = plainToClass(Attribute, attributesJson);

@Injectable()
export class AttributesService {
  private attributes: Attribute[] = attributes;

  create(createAttributeDto: CreateAttributeDto) {
    const newId = this.attributes.length > 0
      ? Math.max(...this.attributes.map((a) => a.id)) + 1
      : 1;
    const newAttr: Attribute = {
      ...createAttributeDto,
      id: newId,
      slug: (createAttributeDto as any).slug || 'attr-' + newId,
      created_at: new Date(),
      updated_at: new Date(),
    } as unknown as Attribute;
    this.attributes.push(newAttr);
    this.saveToFile();
    return newAttr;
  }

  findAll() {
    return this.attributes;
  }

  findOne(param: string) {
    return this.attributes.find(
      (p) => p.id === Number(param) || p.slug === param,
    );
  }

  update(id: number, updateAttributeDto: UpdateAttributeDto) {
    const index = this.attributes.findIndex((a) => a.id === Number(id));
    if (index === -1) return null;
    const { values, ...rest } = updateAttributeDto as any;
    this.attributes[index] = {
      ...this.attributes[index],
      ...rest,
      updated_at: new Date(),
    };
    this.saveToFile();
    return this.attributes[index];
  }

  remove(id: number) {
    const index = this.attributes.findIndex((a) => a.id === Number(id));
    if (index === -1) return null;
    const removed = this.attributes.splice(index, 1)[0];
    this.saveToFile();
    return removed;
  }

    private saveToFile() {
    const srcPath = path.join(process.cwd(), 'src', 'db', 'pickbazar', 'attributes.json');
    const distPath = path.join(process.cwd(), 'dist', 'db', 'pickbazar', 'attributes.json');
    const data = JSON.stringify(this.attributes, null, 2);
    fs.writeFileSync(srcPath, data);
    fs.writeFileSync(distPath, data);
  }
}
