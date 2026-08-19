import { Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import Fuse from 'fuse.js';
import { paginate } from 'src/common/pagination/paginate';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { GetConversationsDto } from './dto/get-conversations.dto';
import conversationsJson from '@db/conversations.json';
import * as fs from 'fs';
import * as path from 'path';

const conversations: any = conversationsJson as any;
const options = {
  keys: ['shop.name'],
  threshold: 0.3,
};
let fuse = new Fuse(conversations, options);

@Injectable()
export class ConversationsService {
  private conversations: any[] = conversations;

  private reloadFromFile() {
    try {
      const distPath = path.join(
        process.cwd(),
        'dist',
        'db',
        'pickbazar',
        'conversations.json',
      );
      const raw = fs.readFileSync(distPath, 'utf8');
      this.conversations = JSON.parse(raw);
    } catch {
      const srcPath = path.join(
        process.cwd(),
        'src',
        'db',
        'pickbazar',
        'conversations.json',
      );
      const raw = fs.readFileSync(srcPath, 'utf8');
      this.conversations = JSON.parse(raw);
    }
    fuse = new Fuse(this.conversations, options);
  }

  private saveToFile() {
    const srcPath = path.join(
      process.cwd(),
      'src',
      'db',
      'pickbazar',
      'conversations.json',
    );
    const distPath = path.join(
      process.cwd(),
      'dist',
      'db',
      'pickbazar',
      'conversations.json',
    );
    const data = JSON.stringify(this.conversations, null, 2);
    fs.writeFileSync(srcPath, data);
    fs.mkdirSync(path.dirname(distPath), { recursive: true });
    fs.writeFileSync(distPath, data);
  }

  create(createConversationDto: CreateConversationDto) {
    this.reloadFromFile();
    const payload: any = createConversationDto as any;
    const nextId =
      this.conversations.length > 0
        ? Math.max(...this.conversations.map((c) => Number(c.id))) + 1
        : 1;
    const conversation: any = {
      id: String(nextId),
      shop_id: payload.shop_id,
      user_id: payload.user_id ?? undefined,
      unseen: 0,
      created_at: new Date(),
      updated_at: new Date(),
    };
    this.conversations.push(conversation);
    this.saveToFile();
    return conversation;
  }

  getAllConversations({ search, limit, page }: GetConversationsDto) {
    this.reloadFromFile();
    if (!page) page = 1;
    if (!limit) limit = 30;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    let data: any[] = this.conversations;
    if (search) {
      data = fuse.search(search)?.map(({ item }) => item);
    }
    const results = data.slice(startIndex, endIndex);
    const url = `/conversations?limit=${limit}`;
    return {
      data: results,
      ...paginate(data.length, page, limit, results.length, url),
    };
  }

  getConversation(param: any) {
    this.reloadFromFile();
    return (
      this.conversations.find(
        (c: any) =>
          c.shop_id === param || String(c.id) === String(param),
      ) || null
    );
  }
}
