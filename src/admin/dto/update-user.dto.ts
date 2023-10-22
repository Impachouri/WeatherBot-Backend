import { State } from "../schema/user.schema"; 

export class UpdateUserDto {
  readonly city: string;
  readonly chatId: number;
  readonly state: State;
  readonly isSubscribe: boolean;
  readonly isBlock: boolean;
}