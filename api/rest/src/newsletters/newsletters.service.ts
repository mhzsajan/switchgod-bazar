import { Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { CreateNewSubscriberDto } from './dto/create-new-subscriber.dto';
import newsletterJson from '../db/pickbazar/newsletter.json';
import * as fs from 'fs';
import * as path from 'path';

const subscribers: any = newsletterJson as any;

@Injectable()
export class NewslettersService {
  private subscribers: any[] = subscribers;

  private reloadFromFile() {
    try {
      const distPath = path.join(
        process.cwd(),
        'dist',
        'db',
        'pickbazar',
        'newsletter.json',
      );
      const raw = fs.readFileSync(distPath, 'utf8');
      this.subscribers = JSON.parse(raw);
    } catch {
      try {
        const srcPath = path.join(
          process.cwd(),
          'src',
          'db',
          'pickbazar',
          'newsletter.json',
        );
        const raw = fs.readFileSync(srcPath, 'utf8');
        this.subscribers = JSON.parse(raw);
      } catch {
        this.subscribers = [];
      }
    }
  }

  private saveToFile() {
    const srcPath = path.join(
      process.cwd(),
      'src',
      'db',
      'pickbazar',
      'newsletter.json',
    );
    const distPath = path.join(
      process.cwd(),
      'dist',
      'db',
      'pickbazar',
      'newsletter.json',
    );
    const data = JSON.stringify(this.subscribers, null, 2);
    fs.writeFileSync(srcPath, data);
    fs.mkdirSync(path.dirname(distPath), { recursive: true });
    fs.writeFileSync(distPath, data);
  }

  async subscribeToNewsletter({ email }: CreateNewSubscriberDto) {
    this.reloadFromFile();
    const normalized = (email || '').trim().toLowerCase();
    const existing = this.subscribers.find(
      (s) => s.email === normalized,
    );
    if (!existing) {
      this.subscribers.push({
        id:
          this.subscribers.length > 0
            ? Math.max(...this.subscribers.map((s) => Number(s.id))) + 1
            : 1,
        email: normalized,
        created_at: new Date(),
      });
      this.saveToFile();
    }
    return { message: 'You have been successfully subscribed.' };
  }
}
