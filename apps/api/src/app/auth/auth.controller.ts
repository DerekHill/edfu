// https://github.com/marcomelilli/nestjs-email-authentication/blob/master/src/auth/auth.controller.ts
import {
  Controller,
  UseGuards,
  Post,
  Request,
  Get,
  Body,
  Param
} from '@nestjs/common';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { ResponseSuccess, ResponseError } from '../common/dto/response.dto';
import { UsersService } from '../users/users.service';
import { IResponse } from '@edfu/api-interfaces';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private usersService: UsersService
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @Post('register')
  async register(
    @Request() req,
    @Body() createUserDto: CreateUserDto
  ): Promise<IResponse> {
    try {
      const newUser = await this.usersService.createNewUser(createUserDto);

      await this.authService.createEmailToken(newUser.email);
      const sent = await this.authService.sendEmailVerification(
        req.headers.host,
        newUser.email
      );
      if (sent) {
        return new ResponseSuccess('REGISTRATION.USER_REGISTERED_SUCCESSFULLY');
      } else {
        return new ResponseError('REGISTRATION.ERROR.MAIL_NOT_SENT');
      }
    } catch (error) {
      return new ResponseError('REGISTRATION.ERROR.GENERIC_ERROR', error);
    }
  }

  @Get('email/verify/:token')
  public async verifyEmail(@Param() params): Promise<IResponse> {
    try {
      const isEmailVerified = await this.authService.verifyEmail(params.token);
      return new ResponseSuccess('LOGIN.EMAIL_VERIFIED', isEmailVerified);
    } catch (error) {
      return new ResponseError('LOGIN.ERROR', error);
    }
  }

  @Get('email/resend-verification/:email')
  public async sendEmailVerification(
    @Request() req,
    @Param() params
  ): Promise<IResponse> {
    try {
      await this.authService.createEmailToken(params.email);
      const isEmailSent = await this.authService.sendEmailVerification(
        req.headers.host,
        params.email
      );
      if (isEmailSent) {
        return new ResponseSuccess('LOGIN.EMAIL_RESENT', null);
      } else {
        return new ResponseError('REGISTRATION.ERROR.MAIL_NOT_SENT');
      }
    } catch (error) {
      return new ResponseError('LOGIN.ERROR.SEND_EMAIL', error);
    }
  }

  @Get('email/forgot-password/:email')
  public async sendEmailForgotPassword(
    @Request() req,
    @Param() params
  ): Promise<IResponse> {
    try {
      const isEmailSent = await this.authService.sendEmailForgotPassword(
        req.headers.host,
        params.email
      );
      if (isEmailSent) {
        return new ResponseSuccess('LOGIN.EMAIL_RESENT', null);
      } else {
        return new ResponseError('REGISTRATION.ERROR.MAIL_NOT_SENT');
      }
    } catch (error) {
      return new ResponseError('LOGIN.ERROR.SEND_EMAIL', error);
    }
  }
}
