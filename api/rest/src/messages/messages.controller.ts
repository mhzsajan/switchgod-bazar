import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { GetConversationsDto } from 'src/conversations/dto/get-conversations.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { MessagesService } from './messages.service';

@Controller('messages/conversations')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post(':id')
  createMessage(
    @Body() createMessageDto: CreateMessageDto,
    @Param('id') id: string,
  ) {
    return this.messagesService.createMessage(createMessageDto, id);
  }

  @Get(':param')
  getMessages(@Query() query: GetConversationsDto) {
    return this.messagesService.getMessages(query);
  }
}
