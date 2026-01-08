import mongoose from 'mongoose';
import {
  IsDate,
  IsNotEmpty,
  IsNotEmptyObject,
  IsObject,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

class Company {
  @IsNotEmpty()
  _id: mongoose.Schema.Types.ObjectId;

  @IsNotEmpty()
  name: string;
}

export class CreateJobDto {
  @IsNotEmpty({ message: 'name không được để trống' })
  name: string;

  @IsNotEmpty({ message: 'skills không được để trống' })
  skills: string;

  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => Company)
  company: Company;

  @IsNotEmpty({ message: 'salary không được để trống' })
  salary: number;

  @IsNotEmpty({ message: 'quantity không được để trống' })
  quantity: number;

  @IsNotEmpty({ message: 'level không được để trống' })
  level: string;

  @IsNotEmpty({ message: 'description không được để trống' })
  description: string;

  @IsNotEmpty({ message: 'startDate không được để trống' })
  @Transform(({ value }) => new Date(value))
  @IsDate({ message: 'startDate phải là một ngày hợp lệ' })
  startDate: Date;

  @IsNotEmpty({ message: 'endDate không được để trống' })
  @Transform(({ value }) => new Date(value))
  @IsDate({ message: 'endDate phải là một ngày hợp lệ' })
  endDate: Date;
}
