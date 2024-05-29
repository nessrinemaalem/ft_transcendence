import { Controller, Get } from '@nestjs/common';

@Controller('chat')
export class ChatController {
  @Get()
  index(): string {
    return 'Welcome to the Chat Page';
  }
}
