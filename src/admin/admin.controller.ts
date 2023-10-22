import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { UserService, AdminService } from './admin.service'; 
import { CreateUserDto } from './dto/create-user.dto'; 
import { UpdateUserDto } from './dto/update-user.dto'; 
import { User } from './schema/user.schema';
import { OAuth2Client } from 'google-auth-library';


const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
 );
  
  @Controller('users')
  export class AdminController {
    constructor(private userService: UserService) {}
  
    @Get()
    async getAllUsers(): Promise<User[]> {
      return this.userService.findAll();
    }
  
    @Post()
    async createUser(
      @Body()
      user: CreateUserDto,
    ): Promise<User> {
      return this.userService.create(user);
    }
  
    @Put(':chatId, :city')
    async updateUserByChatId(
      @Param('chatId, city')
      chatId: number,
      city: string,
      @Body()
      user: UpdateUserDto,
    ): Promise<User> {
      return this.userService.updateByChatId(chatId, city, user);
    }
  
    @Put(':id')
    async updateUser(
      @Param('id')
      id:string,
      @Body()
      user: UpdateUserDto,
    ): Promise<User> {
      return this.userService.updateById(id, user);
    }

    @Delete(':id')
    async deleteUser(
      @Param('id')
      id: string,
    ): Promise<User> {
      return this.userService.deleteById(id);
    }
  }


  @Controller('login')
export class LoginController {
  constructor(private readonly adminService: AdminService) {}

  @Post()
  async login(@Body('token') token): Promise<any> {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    console.log(ticket.getPayload(), 'ticket');
    const { email, name } = ticket.getPayload();
    const data = await this.adminService.login({ email, name });
    if(!data){
      return {
        data,
        message: 'failed',
      }
    }
    return {
      data,
      message: 'success',
    };
  }
}

  