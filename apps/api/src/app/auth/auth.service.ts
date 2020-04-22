// https://github.com/marcomelilli/nestjs-email-authentication/blob/master/src/auth/auth.service.ts
import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { EmailVerification } from './interfaces/emailverification.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  EMAIL_VERIFICATION_COLLECTION_NAME,
  EDFU_FROM_EMAIL,
  FORGOTTEN_PASSWORD_COLLECTION_NAME
} from '../constants';
import { transporter } from '../config/mail';
import * as bcrypt from 'bcryptjs';
import { ForgottenPassword } from './interfaces/forgottenpassword.interface';
import { BasicUser } from '@edfu/api-interfaces';
import { HttpErrorMessages } from '@edfu/enums';
import { UserDocument } from '../users/interfaces/user.interface';

const EMAIL_VERIFICATION_TIMEOUT_MINUTES = 1;

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(EMAIL_VERIFICATION_COLLECTION_NAME)
    private readonly emailVerificationModel: Model<EmailVerification>,
    @InjectModel(FORGOTTEN_PASSWORD_COLLECTION_NAME)
    private readonly forgottenPasswordModel: Model<ForgottenPassword>,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService
  ) {}

  async validateUserLocal(email: string, password: string): Promise<BasicUser> {
    const userFromDb = await this.usersService.findByEmail(email);
    if (!userFromDb)
      throw new HttpException(
        HttpErrorMessages.LOGIN__USER_NOT_FOUND,
        HttpStatus.NOT_FOUND
      );
    // if (!userFromDb.emailConfirmed)
    //   throw new HttpException(HttpErrorMessages.LOGIN__EMAIL_NOT_VERIFIED, HttpStatus.FORBIDDEN);
    const isValidPass = await bcrypt.compare(password, userFromDb.password);
    if (isValidPass) {
      return this.extractBasicUser(userFromDb);
    } else {
      throw new HttpException(
        HttpErrorMessages.LOGIN__GENERIC_ERROR,
        HttpStatus.UNAUTHORIZED
      );
    }
  }

  private extractBasicUser(user: UserDocument): BasicUser {
    return {
      _id: user._id,
      email: user.email,
      username: user.username,
      roles: user.roles
    };
  }

  async validateTokenAndFetchUser(token: string): Promise<BasicUser> {
    try {
      const { email } = this.jwtService.verify(token);
      const userFromDb = await this.usersService.findByEmail(email);
      return this.extractBasicUser(userFromDb);
    } catch (e) {
      return null;
    }
  }

  async loginGenerateToken(user: BasicUser): Promise<BasicUser> {
    const payload = { email: user.email, sub: user.email };
    return {
      ...user,
      ...{
        access_token: this.jwtService.sign(payload)
      }
    };
  }

  async createEmailToken(email: string): Promise<boolean> {
    const emailVerification = await this.emailVerificationModel.findOne({
      email: email
    });
    if (
      emailVerification &&
      (new Date().getTime() - emailVerification.timestamp.getTime()) / 60000 <
        EMAIL_VERIFICATION_TIMEOUT_MINUTES
    ) {
      throw new HttpException(
        HttpErrorMessages.LOGIN__EMAIL_SENT_RECENTLY,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    } else {
      await this.emailVerificationModel.findOneAndUpdate(
        { email: email },
        {
          email: email,
          token: Math.floor(Math.random() * 9000000) + 1000000, //Generate 7 digit number
          timestamp: new Date()
        },
        { upsert: true }
      );
      return true;
    }
  }

  async sendEmailVerification(host: string, email: string): Promise<boolean> {
    const model = await this.emailVerificationModel.findOne({ email: email });

    if (model && model.token) {
      const mailOptions = {
        to: email,
        from: EDFU_FROM_EMAIL,
        subject: 'Please confirm your email',
        text: `Thank you for registering.\n\n
          To confirm your email please click on the following link, or paste it into your browser to complete the process:\n\n
          http://${host}/auth/email/verify/${model.token}\n\n
          If you did not request this, please ignore this email.\n`
      };

      const sent = await new Promise<boolean>(async function(resolve, reject) {
        return transporter.sendMail(
          mailOptions,
          async (error: any, info: any) => {
            if (error) {
              console.log('Error sending message:');
              console.log(error);
              return reject(false);
            }
            console.log('sendEmailVerification message sent:');
            console.log(info);
            resolve(true);
          }
        );
      });

      return sent;
    } else {
      throw new HttpException(
        HttpErrorMessages.REGISTRATION__USER_NOT_REGISTERED,
        HttpStatus.FORBIDDEN
      );
    }
  }

  async verifyEmail(token: string): Promise<boolean> {
    const emailVerif = await this.emailVerificationModel.findOne({
      token: token
    });
    if (emailVerif && emailVerif.email) {
      const userFromDb = await this.usersService.findByEmail(emailVerif.email);
      if (userFromDb) {
        userFromDb.emailConfirmed = true;
        userFromDb.emailConfirmedAt = new Date();
        const savedUser = await userFromDb.save();
        await emailVerif.remove();
        return !!savedUser;
      }
    } else {
      throw new Error(
        `Error: emailVerificationModel not found for token: ${token}`
      );
    }
  }

  async sendEmailForgotPassword(host: string, email: string): Promise<boolean> {
    const userFromDb = await this.usersService.findByEmail(email);
    if (!userFromDb)
      throw new HttpException(
        HttpErrorMessages.LOGIN__USER_NOT_FOUND,
        HttpStatus.NOT_FOUND
      );

    const tokenModel = await this.createForgottenPasswordToken(email);

    if (tokenModel && tokenModel.newPasswordToken) {
      const mailOptions = {
        to: email,
        from: EDFU_FROM_EMAIL,
        subject: 'Reset your password',
        text: `You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n
              Please click on the following link, or paste this into your browser to complete the process:\n\n
              http://${host}/auth/email/reset-password/${tokenModel.newPasswordToken}\n\n
              If you did not request this, please ignore this email and your password will remain unchanged.\n`
      };

      const sent = await new Promise<boolean>(async function(resolve, reject) {
        return await transporter.sendMail(mailOptions, async (error, info) => {
          if (error) {
            console.log('Message sent: %s', error);
            return reject(false);
          }
          console.log('Message sent: %s', info.messageId);
          resolve(true);
        });
      });

      return sent;
    } else {
      throw new HttpException(
        HttpErrorMessages.REGISTRATION__USER_NOT_REGISTERED,
        HttpStatus.FORBIDDEN
      );
    }
  }

  async createForgottenPasswordToken(
    email: string
  ): Promise<ForgottenPassword> {
    const forgottenPassword = await this.forgottenPasswordModel.findOne({
      email: email
    });
    if (
      forgottenPassword &&
      (new Date().getTime() - forgottenPassword.timestamp.getTime()) / 60000 <
        15
    ) {
      throw new HttpException(
        HttpErrorMessages.RESET_PASSWORD__EMAIL_SENT_RECENTLY,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    } else {
      const forgottenPasswordModel = await this.forgottenPasswordModel.findOneAndUpdate(
        { email: email },
        {
          email: email,
          newPasswordToken: Math.floor(Math.random() * 9000000) + 1000000, //Generate 7 digits number,
          timestamp: new Date()
        },
        { upsert: true, new: true }
      );
      if (forgottenPasswordModel) {
        return forgottenPasswordModel;
      } else {
        throw new HttpException(
          HttpErrorMessages.LOGIN__GENERIC_ERROR,
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    }
  }
}
