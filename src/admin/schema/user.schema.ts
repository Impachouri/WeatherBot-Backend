import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export enum State {
  CITYCONFIRMED = 'City Confirmed',
  AWAITINGCITY = 'Awaiting City',
}

@Schema({
  timestamps: true,
})
export class User {
  @Prop()
  city: string;

  @Prop()
  chatId: number;

  @Prop()
  state: State;

  @Prop({ type: Boolean, default: false }) 
  isSubscribe: boolean;

  @Prop({ type: Boolean, default: false }) 
  isBlock: boolean
  
}

export const UserSchema = SchemaFactory.createForClass(User);