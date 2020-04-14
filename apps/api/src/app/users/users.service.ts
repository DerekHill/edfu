// https://github.com/marcomelilli/nestjs-email-authentication/blob/master/src/users/users.service.ts
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcryptjs';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDocument } from './interfaces/user.interface';
import { USER_COLLECTION_NAME } from '../constants';
import { HttpErrorMessages } from '@edfu/enums';

const SALT_ROUNDS = 10;

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(USER_COLLECTION_NAME)
    private readonly userModel: Model<UserDocument>
  ) {}

  findByEmail(email: string): Promise<UserDocument> {
    return this.userModel.findOne({ email: email }).exec();
  }

  async createNewUser(newUser: CreateUserDto): Promise<UserDocument> {
    if (this.isValidEmail(newUser.email) && newUser.password) {
      const userRegistered = await this.findByEmail(newUser.email);
      if (!userRegistered) {
        newUser.password = await bcrypt.hash(newUser.password, SALT_ROUNDS);
        const createdUser = new this.userModel(newUser);
        createdUser.roles = ['User'];
        return await createdUser.save();
      } else if (!userRegistered.emailConfirmed) {
        return userRegistered;
      } else {
        throw new HttpException(
          HttpErrorMessages.REGISTRATION__USER_ALREADY_REGISTERED,
          HttpStatus.FORBIDDEN
        );
      }
    } else {
      throw new HttpException(
        HttpErrorMessages.REGISTRATION__MISSING_MANDATORY_PARAMETERS,
        HttpStatus.FORBIDDEN
      );
    }
  }

  private isValidEmail(email: string) {
    if (email) {
      const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(email);
    } else return false;
  }
}
