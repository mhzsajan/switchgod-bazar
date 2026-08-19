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
    this.reloadFromFile();
    return this.settings;
  }

  findOne(id: number) {
    this.reloadFromFile();
    return this.settings;
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
    // Settings are a singleton — removing is not supported.
    return null;
  }

    private reloadFromFile() {
    try {
      const distPath = path.join(
        process.cwd(),
        'dist',
        'db',
        'pickbazar',
        'settings.json',
      );
      this.settings = JSON.parse(fs.readFileSync(distPath, 'utf8'));
    } catch {
      const srcPath = path.join(
        process.cwd(),
        'src',
        'db',
        'pickbazar',
        'settings.json',
      );
      this.settings = JSON.parse(fs.readFileSync(srcPath, 'utf8'));
    }
  }

  private saveToFile() {
    const srcPath = path.join(process.cwd(), 'src', 'db', 'pickbazar', 'settings.json');
    const distPath = path.join(process.cwd(), 'dist', 'db', 'pickbazar', 'settings.json');
    const data = JSON.stringify(this.settings, null, 2);
    fs.writeFileSync(srcPath, data);
    fs.mkdirSync(path.dirname(distPath), { recursive: true });

    fs.writeFileSync(distPath, data);
  }
}
