import { Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { CreateFeedBackDto } from './dto/create-feedback.dto';
import { UpdateFeedBackDto } from './dto/update-feedback.dto';
import feedbacksJson from '../db/pickbazar/feedbacks.json';
import * as fs from 'fs';
import * as path from 'path';

const feedbacks: any = feedbacksJson as any;

@Injectable()
export class FeedbackService {
  private feedbacks: any[] = feedbacks;

  private reloadFromFile() {
    try {
      const distPath = path.join(
        process.cwd(),
        'dist',
        'db',
        'pickbazar',
        'feedbacks.json',
      );
      const raw = fs.readFileSync(distPath, 'utf8');
      this.feedbacks = JSON.parse(raw);
    } catch {
      try {
        const srcPath = path.join(
          process.cwd(),
          'src',
          'db',
          'pickbazar',
          'feedbacks.json',
        );
        const raw = fs.readFileSync(srcPath, 'utf8');
        this.feedbacks = JSON.parse(raw);
      } catch {
        this.feedbacks = [];
      }
    }
  }

  private saveToFile() {
    const srcPath = path.join(
      process.cwd(),
      'src',
      'db',
      'pickbazar',
      'feedbacks.json',
    );
    const distPath = path.join(
      process.cwd(),
      'dist',
      'db',
      'pickbazar',
      'feedbacks.json',
    );
    const data = JSON.stringify(this.feedbacks, null, 2);
    fs.writeFileSync(srcPath, data);
    fs.mkdirSync(path.dirname(distPath), { recursive: true });
    fs.writeFileSync(distPath, data);
  }

  findAllFeedBacks() {
    this.reloadFromFile();
    return {
      data: this.feedbacks,
    };
  }

  findFeedBack(id: number) {
    this.reloadFromFile();
    return this.feedbacks.find((f) => f.id === Number(id)) || null;
  }

  create(createFeedBackDto: CreateFeedBackDto) {
    this.reloadFromFile();
    const newId =
      this.feedbacks.length > 0
        ? Math.max(...this.feedbacks.map((f) => Number(f.id))) + 1
        : 1;
    const feedback: any = {
      ...(createFeedBackDto as any),
      id: newId,
      created_at: new Date(),
      updated_at: new Date(),
    };
    this.feedbacks.push(feedback);
    this.saveToFile();
    return feedback;
  }

  update(id: number, updateFeedbackDto: UpdateFeedBackDto) {
    this.reloadFromFile();
    const index = this.feedbacks.findIndex((f) => f.id === Number(id));
    if (index === -1) return null;
    this.feedbacks[index] = {
      ...this.feedbacks[index],
      ...(updateFeedbackDto as any),
      id: Number(id),
      updated_at: new Date(),
    };
    this.saveToFile();
    return this.feedbacks[index];
  }

  delete(id: number) {
    this.reloadFromFile();
    const index = this.feedbacks.findIndex((f) => f.id === Number(id));
    if (index === -1) return null;
    const removed = this.feedbacks.splice(index, 1)[0];
    this.saveToFile();
    return removed;
  }
}
