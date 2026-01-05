import { Injectable } from '@nestjs/common';
import { CreateUserDto, RegisterUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import mongoose, { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import bcrypt from 'bcryptjs';
import type { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from './users.interface';
import aqp from 'api-query-params';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: SoftDeleteModel<UserDocument>,
  ) {}

  getHashPassword = (password: string) => {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(password, salt);
    return hash;
  };

  async create(createUserDto: CreateUserDto, user: IUser) {
    const hashedPassword = this.getHashPassword(createUserDto.password);
    const newUser = await this.userModel.create({
      name: createUserDto.name,
      email: createUserDto.email,
      password: hashedPassword,
      age: createUserDto.age,
      gender: createUserDto.gender,
      address: createUserDto.address,
      role: createUserDto.role,
      company: createUserDto.company,
      createdBy: { _id: user._id, email: user.email },
    });

    return {
      _id: newUser._id,
      createdAt: newUser.createdAt,
    };
  }

  async findAll(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population } = aqp(qs);
    delete filter.page;
    delete filter.limit;
    let offset = (+currentPage - 1) * +limit;
    let defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.userModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.userModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .populate(population)
      .select('-password')
      .exec();

    return {
      meta: {
        current: currentPage, //trang hiện tại
        pageSize: limit, //số lượng bản ghi đã lấy
        pages: totalPages, //tổng số trang với điều kiện query
        total: totalItems, // tổng số phần tử (số bản ghi)
      },
      result, //kết quả query
    };
  }

  findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) return 'Not found user';
    const user = this.userModel.findOne({ _id: id }).select('-password'); // Exclude password field
    return user;
  }

  findOneByUserName(username: string) {
    return this.userModel.findOne({ email: username });
  }

  isValidPassword(password: string, hashPassword: string) {
    return bcrypt.compareSync(password, hashPassword);
  }

  async update(updateUserDto: UpdateUserDto, user: IUser) {
    return await this.userModel.updateOne(
      { _id: updateUserDto._id },
      { ...updateUserDto, updatedBy: { _id: user._id, email: user.email } },
    );
  }

  async remove(id: string, user: IUser) {
    await this.userModel.updateOne(
      { _id: id },
      { deletedBy: { _id: user._id, email: user.email } },
    );

    return this.userModel.softDelete({ _id: id });
  }

  async register(user: RegisterUserDto) {
    const hashedPassword = this.getHashPassword(user.password);
    const newUser = await this.userModel.create({
      name: user.name,
      email: user.email,
      password: hashedPassword,
      age: user.age,
      gender: user.gender,
      address: user.address,
      role: 'USER',
    });
    return newUser;
  }

  updateUserToken = async (refreshToken: string, _id: string) => {
    return await this.userModel.updateOne({ _id }, { refreshToken });
  };
}
