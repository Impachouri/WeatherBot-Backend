import { Module } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { AdminModule } from 'src/admin/admin.module';

@Module({
  imports:[AdminModule],
  providers: [TelegramService]
})
export class TelegramModule {}