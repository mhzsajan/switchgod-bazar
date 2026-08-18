import { Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import Fuse from 'fuse.js';
import { paginate } from 'src/common/pagination/paginate';
import { Question } from './entities/question.entity';
import { GetQuestionDto } from './dto/get-questions.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import questionsJSON from '@db/questions.json';
import * as fs from 'fs';
import * as path from 'path';

const questions = plainToClass(Question, questionsJSON);
const options = {
  keys: [],
  threshold: 0.3,
};
const fuse = new Fuse(questions, options);

@Injectable()
export class QuestionService {
  private question: Question[] = questions;

  findAllQuestions({
    limit,
    page,
    search,
    answer,
    product_id,
  }: GetQuestionDto) {
    if (!page) page = 1;
    if (!limit) limit = 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    let data: Question[] = this.question;

    if (search) {
      const parseSearchParams = search.split(';');
      for (const searchParam of parseSearchParams) {
        const [key, value] = searchParam.split(':');
        data = fuse.search(value)?.map(({ item }) => item);
      }
    }

    if (product_id) {
      data = data.filter((p) => p.product_id === Number(product_id));
    }

    const results = data.slice(startIndex, endIndex);
    const url = `/questions?search=${search}&answer=${answer}&limit=${limit}`;
    return {
      data: results,
      ...paginate(data.length, page, limit, results.length, url),
    };
  }

  findQuestion(id: number) {
    return this.question.find((p) => p.id === id);
  }

  create(createQuestionDto: CreateQuestionDto) {
    const newId = this.question.length > 0
      ? Math.max(...this.question.map((q) => q.id)) + 1
      : 1;
    const newQuestion: Question = {
      ...createQuestionDto,
      id: newId,
      created_at: new Date(),
      updated_at: new Date(),
    } as unknown as Question;
    this.question.push(newQuestion);
    this.saveToFile();
    return newQuestion;
  }

  update(id: number, updateQuestionDto: UpdateQuestionDto) {
    const index = this.question.findIndex((q) => q.id === Number(id));
    if (index === -1) return null;
    this.question[index] = {
      ...this.question[index],
      ...updateQuestionDto,
      updated_at: new Date(),
    };
    this.saveToFile();
    return this.question[index];
  }

  delete(id: number) {
    const index = this.question.findIndex((q) => q.id === Number(id));
    if (index === -1) return null;
    const removed = this.question.splice(index, 1)[0];
    this.saveToFile();
    return removed;
  }

    private saveToFile() {
    const srcPath = path.join(process.cwd(), 'src', 'db', 'pickbazar', 'questions.json');
    const distPath = path.join(process.cwd(), 'dist', 'db', 'pickbazar', 'questions.json');
    const data = JSON.stringify(this.question, null, 2);
    fs.writeFileSync(srcPath, data);
    fs.writeFileSync(distPath, data);
  }
}
