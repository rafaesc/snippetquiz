import { IsOptional, IsString, IsNumber, Min, IsNumberString } from 'class-validator';
import { Type } from 'class-transformer';

export class PaginationDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  limit?: number = 10;
}

export class SearchDto extends PaginationDto {
  @IsOptional()
  @IsString()
  name?: string;
}

export class ParamIdDto {
  @IsNumberString()
  id: string;
}

export interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
  };
}