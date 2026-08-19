import { Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import reportsJson from '../db/pickbazar/reports.json';
import * as fs from 'fs';
import * as path from 'path';

const reports: any = reportsJson as any;

@Injectable()
export class AbusiveReportService {
  private reports: any[] = reports;

  private reloadFromFile() {
    try {
      const distPath = path.join(
        process.cwd(),
        'dist',
        'db',
        'pickbazar',
        'reports.json',
      );
      const raw = fs.readFileSync(distPath, 'utf8');
      this.reports = JSON.parse(raw);
    } catch {
      const srcPath = path.join(
        process.cwd(),
        'src',
        'db',
        'pickbazar',
        'reports.json',
      );
      const raw = fs.readFileSync(srcPath, 'utf8');
      this.reports = JSON.parse(raw);
    }
  }

  private saveToFile() {
    const srcPath = path.join(
      process.cwd(),
      'src',
      'db',
      'pickbazar',
      'reports.json',
    );
    const distPath = path.join(
      process.cwd(),
      'dist',
      'db',
      'pickbazar',
      'reports.json',
    );
    const data = JSON.stringify(this.reports, null, 2);
    fs.writeFileSync(srcPath, data);
    fs.mkdirSync(path.dirname(distPath), { recursive: true });
    fs.writeFileSync(distPath, data);
  }

  findAllReports() {
    this.reloadFromFile();
    return {
      data: this.reports,
    };
  }

  findReport(id: number) {
    this.reloadFromFile();
    return this.reports.find((r) => r.id === Number(id)) || null;
  }

  create(createReportDto: CreateReportDto) {
    this.reloadFromFile();
    const newId =
      this.reports.length > 0
        ? Math.max(...this.reports.map((r) => Number(r.id))) + 1
        : 1;
    const report: any = {
      ...(createReportDto as any),
      id: newId,
      created_at: new Date(),
      updated_at: new Date(),
    };
    this.reports.push(report);
    this.saveToFile();
    return report;
  }

  update(id: number, updateReportDto: UpdateReportDto) {
    this.reloadFromFile();
    const index = this.reports.findIndex((r) => r.id === Number(id));
    if (index === -1) return null;
    this.reports[index] = {
      ...this.reports[index],
      ...(updateReportDto as any),
      id: Number(id),
      updated_at: new Date(),
    };
    this.saveToFile();
    return this.reports[index];
  }

  delete(id: number) {
    this.reloadFromFile();
    const index = this.reports.findIndex((r) => r.id === Number(id));
    if (index === -1) return null;
    const removed = this.reports.splice(index, 1)[0];
    this.saveToFile();
    return removed;
  }
}
