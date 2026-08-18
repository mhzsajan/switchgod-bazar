import { Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import Fuse from 'fuse.js';
import { paginate } from 'src/common/pagination/paginate';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { GetReviewsDto, ReviewPaginator } from './dto/get-reviews.dto';
import reviewJSON from '@db/reviews.json';
import { Review } from './entities/review.entity';
import * as fs from 'fs';
import * as path from 'path';

const reviews = plainToClass(Review, reviewJSON);
const options = {
  keys: ['product_id'],
  threshold: 0.3,
};
const fuse = new Fuse(reviews, options);

@Injectable()
export class ReviewService {
  private reviews: Review[] = reviews;

  findAllReviews({ limit, page, search, product_id }: GetReviewsDto) {
    if (!page) page = 1;
    if (!limit) limit = 30;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    let data: Review[] = this.reviews;

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
    const url = `/reviews?search=${search}&limit=${limit}`;
    return {
      data: results,
      ...paginate(data.length, page, limit, results.length, url),
    };
  }

  findReview(id: number) {
    return this.reviews.find((p) => p.id === id);
  }

  create(createReviewDto: CreateReviewDto) {
    const newId = this.reviews.length > 0
      ? Math.max(...this.reviews.map((r) => r.id)) + 1
      : 1;
    const newReview: Review = {
      ...createReviewDto,
      id: newId,
      created_at: new Date(),
      updated_at: new Date(),
    } as unknown as Review;
    this.reviews.push(newReview);
    this.saveToFile();
    return newReview;
  }

  update(id: number, updateReviewDto: UpdateReviewDto) {
    const index = this.reviews.findIndex((r) => r.id === Number(id));
    if (index === -1) return null;
    const { product_id, ...rest } = updateReviewDto as any;
    this.reviews[index] = {
      ...this.reviews[index],
      ...rest,
      updated_at: new Date(),
    };
    this.saveToFile();
    return this.reviews[index];
  }

  delete(id: number) {
    const index = this.reviews.findIndex((r) => r.id === Number(id));
    if (index === -1) return null;
    const removed = this.reviews.splice(index, 1)[0];
    this.saveToFile();
    return removed;
  }

    private saveToFile() {
    const srcPath = path.join(process.cwd(), 'src', 'db', 'pickbazar', 'reviews.json');
    const distPath = path.join(process.cwd(), 'dist', 'db', 'pickbazar', 'reviews.json');
    const data = JSON.stringify(this.reviews, null, 2);
    fs.writeFileSync(srcPath, data);
    fs.mkdirSync(path.dirname(distPath), { recursive: true });

    fs.writeFileSync(distPath, data);
  }
}
