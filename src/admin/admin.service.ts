import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { User } from './schema/user.schema'; 
import { Admin } from './schema/admin.schema';


@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name)
    private userModel: mongoose.Model<User>,
  ) {}

  async findAll(): Promise<User[]> {
    const users = await this.userModel.find();
    return users;
  }

  async create(user: User): Promise<User> {
    const res = await this.userModel.create(user);
    return res;
  }

  async updateByChatId(chatId: number, city: string, user: User): Promise<User> {
    return await this.userModel.findOneAndUpdate({chatId, city}, user, {
      new: true,
      runValidators: true,
    });
  }

  // async updateById(chatId: number, user: User): Promise<User> {
  //   return await this.userModel.updateMany({chatId}, user, {
  //     new: true,
  //     runValidators: true,
  //   });
  // }

  async updateUserById(chatId: number, user: User): Promise<any> {
    return await this.userModel.updateMany({chatId}, user, {
      new: true,
      runValidators: true,
    });
  }

  async updateById(id: string, user: User): Promise<User> {
    return await this.userModel.findByIdAndUpdate( id , user, {
      new: true,
      runValidators: true,
    });
  }

  async deleteById(id: string): Promise<User> {
    return await this.userModel.findByIdAndDelete(id);
  }
}

@Injectable()
export class AdminService {
 constructor(@InjectModel(Admin.name) private adminModel: mongoose.Model<Admin>) {}
 async login({
   email,
   name,
 }: {
   email: string;
   name: string;
 }): Promise<any> {
    const admin = await this.adminModel.findOne({ email: email });
    if (admin) {
      console.log(admin);
      return admin;
    }else{
      console.log("you are not an admin");
      return admin;
    }
  }
}