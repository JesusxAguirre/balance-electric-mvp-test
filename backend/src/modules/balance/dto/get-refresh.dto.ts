import { IsISO8601 } from 'class-validator';

export class GetRefreshDto {
  @IsISO8601()
  start_date: string;

  @IsISO8601()
  end_date: string;
}
