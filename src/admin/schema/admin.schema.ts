import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({
  timestamps: true,
})
export class Admin {

  @Prop()
  name: string;

  @Prop()
  email: string;
  
}

export const AdminSchema = SchemaFactory.createForClass(Admin);