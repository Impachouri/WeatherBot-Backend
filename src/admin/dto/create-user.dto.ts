import { State } from "../schema/user.schema"; 

export class CreateUserDto {
  readonly chatId: number;
  readonly city: string;
  readonly state: State;
  readonly isSubscribe: boolean;
  readonly isBlock: boolean;
}