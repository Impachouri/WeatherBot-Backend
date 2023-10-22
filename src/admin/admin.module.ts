import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminController, LoginController } from './admin.controller'; 
import { AdminService, UserService } from './admin.service'; 
import { UserSchema } from './schema/user.schema'; 
import { AdminSchema } from './schema/admin.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'User', schema: UserSchema }, { name: 'Admin', schema: AdminSchema }])],
  controllers: [AdminController, LoginController],
  providers: [UserService, AdminService],
  exports: [UserService]
})
export class AdminModule {}