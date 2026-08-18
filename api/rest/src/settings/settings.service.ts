import { Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { Setting } from './entities/setting.entity';
import settingsJson from '@db/settings.json';
import * as fs from 'fs';
import * as path from 'path';

const settings = plainToClass(Setting, settingsJson);

@Injectable()
export class SettingsService {
  private settings: Setting = settings;

  create(createSettingDto: CreateSettingDto) {
    this.settings = {
      ...this.settings,
      ...createSettingDto,
      options: {
        ...this.settings.options,
        ...createSettingDto.options,
      },
      updated_at: new Date(),
    };
    this.saveToFile();
    return this.settings;
  }

  findAll() {
    return this.settings;
  }

  findOne(id: number) {
    return `This action returns a #${id} setting`;
  }

  update(id: number, updateSettingDto: UpdateSettingDto) {
    this.settings = {
      ...this.settings,
      ...updateSettingDto,
      options: {
        ...this.settings.options,
        ...updateSettingDto.options,
      },
      updated_at: new Date(),
    };
    this.saveToFile();
    return this.settings;
  }

  remove(id: number) {
    return `This action removes a #${id} setting`;
  }

    private saveToFile() {
    const srcPath = path.join(process.cwd(), 'src', 'db', 'pickbazar', 'settings.json');
    const distPath = path.join(process.cwd(), 'dist', 'db', 'pickbazar', 'settings.json');
    const data = JSON.stringify(this.settings, null, 2);
    fs.writeFileSync(srcPath, data);
    fs.writeFileSync(distPath, data);
  }
}
