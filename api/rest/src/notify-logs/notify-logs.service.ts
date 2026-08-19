import { Injectable } from '@nestjs/common';
import { NotifyLogs } from './entities/notify-logs.entity';
import { plainToClass } from 'class-transformer';
import { paginate } from 'src/common/pagination/paginate';
import { GetNotifyLogsDto } from './dto/get-notify-logs.dto';
import notifyLogsJSON from '@db/notify-logs.json';
import * as fs from 'fs';
import * as path from 'path';

const notifyLogs = plainToClass(NotifyLogs, notifyLogsJSON as any);

@Injectable()
export class NotifyLogsService {
  private notifyLogs: NotifyLogs[] = notifyLogs as any;

  private reloadFromFile() {
    try {
      const distPath = path.join(
        process.cwd(),
        'dist',
        'db',
        'pickbazar',
        'notify-logs.json',
      );
      this.notifyLogs = JSON.parse(fs.readFileSync(distPath, 'utf8'));
    } catch {
      const srcPath = path.join(
        process.cwd(),
        'src',
        'db',
        'pickbazar',
        'notify-logs.json',
      );
      this.notifyLogs = JSON.parse(fs.readFileSync(srcPath, 'utf8'));
    }
  }

  private saveToFile() {
    const srcPath = path.join(
      process.cwd(),
      'src',
      'db',
      'pickbazar',
      'notify-logs.json',
    );
    const distPath = path.join(
      process.cwd(),
      'dist',
      'db',
      'pickbazar',
      'notify-logs.json',
    );
    const data = JSON.stringify(this.notifyLogs, null, 2);
    fs.writeFileSync(srcPath, data);
    fs.mkdirSync(path.dirname(distPath), { recursive: true });
    fs.writeFileSync(distPath, data);
  }

  create(createNotifyLogDto: any) {
    this.reloadFromFile();
    const newId =
      this.notifyLogs.length > 0
        ? Math.max(...this.notifyLogs.map((n: any) => Number(n.id))) + 1
        : 1;
    const log: any = {
      ...createNotifyLogDto,
      id: newId,
      is_read: false,
      created_at: new Date(),
      updated_at: new Date(),
    };
    this.notifyLogs.push(log);
    this.saveToFile();
    return log;
  }

  findAllNotifyLogs({ search, limit, page, receiver }: GetNotifyLogsDto) {
    this.reloadFromFile();
    if (!page) page = 1;
    if (!limit) limit = 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    let data: NotifyLogs[] = this.notifyLogs;

    if (receiver) {
      data = (this.notifyLogs as any).filter(
        (n: any) => Number(n.receiver) === Number(receiver),
      );
    }

    if (search) {
      const parseSearchParams = search.split(';');
      for (const searchParam of parseSearchParams) {
        const [key, value] = searchParam.split(':');
        data = (this.notifyLogs as any).filter((item: any) =>
          JSON.stringify(item).toLowerCase().includes(value.toLowerCase()),
        );
      }
    }

    const results = data.slice(startIndex, endIndex);
    const url = `/notify-logs?search=${search}&limit=${limit}`;
    return {
      data: results,
      ...paginate(data.length, page, limit, results.length, url),
    };
  }

  getNotifyLog(param: string, language: string) {
    this.reloadFromFile();
    return (
      (this.notifyLogs as any).find(
        (n: any) => n.id === Number(param) || n.slug === param,
      ) || null
    );
  }

  readNotifyLog(id: number) {
    this.reloadFromFile();
    const index = (this.notifyLogs as any).findIndex(
      (n: any) => n.id === Number(id),
    );
    if (index === -1) return null;
    (this.notifyLogs[index] as any).is_read = true;
    (this.notifyLogs[index] as any).updated_at = new Date();
    this.saveToFile();
    return this.notifyLogs[index];
  }

  readAllNotifyLogs(receiver?: number) {
    this.reloadFromFile();
    this.notifyLogs.forEach((n: any) => {
      if (
        receiver === undefined ||
        receiver === null ||
        Number(n.receiver) === Number(receiver)
      ) {
        n.is_read = true;
      }
    });
    this.saveToFile();
    return {
      success: true,
      message: 'All notifications marked as read',
    };
  }

  remove(id: number) {
    this.reloadFromFile();
    const index = (this.notifyLogs as any).findIndex(
      (n: any) => n.id === Number(id),
    );
    if (index === -1) return null;
    const removed = this.notifyLogs.splice(index, 1)[0];
    this.saveToFile();
    return removed;
  }
}
