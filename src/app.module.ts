import { Module } from '@nestjs/common';
import { AppController, ApiController } from './app.controller';
import { AppService } from './app.service';
import { TelegramModule } from './telegram/telegram.module';
import { AdminModule } from './admin/admin.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule.forRoot({isGlobal:true}), TelegramModule, AdminModule, MongooseModule.forRoot(process.env.DB_URI,),],
  controllers: [AppController, ApiController],
  providers: [AppService],
})
export class AppModule {}