import { Injectable } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { CreateMessageDto } from './dto/create-message.dto';
import messagesJson from '@db/messages.json';
import * as fs from 'fs';
import * as path from 'path';

const messages: any = messagesJson as any;

@Injectable()
export class MessagesService {
  private messages: any[] = messages;

  private reloadFromFile() {
    try {
      const distPath = path.join(
        process.cwd(),
        'dist',
        'db',
        'pickbazar',
        'messages.json',
      );
      const raw = fs.readFileSync(distPath, 'utf8');
      this.messages = JSON.parse(raw);
    } catch {
      const srcPath = path.join(
        process.cwd(),
        'src',
        'db',
        'pickbazar',
        'messages.json',
      );
      const raw = fs.readFileSync(srcPath, 'utf8');
      this.messages = JSON.parse(raw);
    }
  }

  private saveToFile() {
    const srcPath = path.join(
      process.cwd(),
      'src',
      'db',
      'pickbazar',
      'messages.json',
    );
    const distPath = path.join(
      process.cwd(),
      'dist',
      'db',
      'pickbazar',
      'messages.json',
    );
    const data = JSON.stringify(this.messages, null, 2);
    fs.writeFileSync(srcPath, data);
    fs.mkdirSync(path.dirname(distPath), { recursive: true });
    fs.writeFileSync(distPath, data);
  }

  createMessage(createMessageDto: CreateMessageDto, conversationId?: string) {
    this.reloadFromFile();
    const payload: any = createMessageDto as any;
    if (conversationId) {
      payload.conversation_id = conversationId;
    }
    const nextId =
      this.messages.length > 0
        ? Math.max(...this.messages.map((m) => Number(m.id))) + 1
        : 1;
    const message: any = {
      id: nextId,
      conversation_id: payload.conversation_id,
      user_id: payload.user_id ?? null,
      body: payload.body,
      created_at: new Date(),
      updated_at: new Date(),
    };
    this.messages.push(message);
    this.saveToFile();
    return message;
  }

  getMessages(query: any = {}) {
    let { search, limit, page } = query || {};
    this.reloadFromFile();
    if (!page) page = 1;
    if (!limit) limit = 30;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    let data: any[] = this.messages;
    if (search) {
      data = data.filter((m) =>
        JSON.stringify(m).toLowerCase().includes(search.toLowerCase()),
      );
    }
    const results = data.slice(startIndex, endIndex);
    return {
      data: results,
    };
  }
}
