// https://github.com/marcomelilli/nestjs-email-authentication/blob/master/src/auth/auth.controller.ts
import {
  Controller,
  UseGuards,
  Post,
  Request,
  Get,
  Body,
  Param,
  HttpException,
  HttpStatus
} from '@nestjs/common';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { ResponseSuccess } from '../common/dto/response.dto';
import { UsersService } from '../users/users.service';
import { IResponse, PRODUCTION_BASE_URL } from '@edfu/api-interfaces';
import { HttpErrorMessages } from '@edfu/api-interfaces';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private usersService: UsersService
  ) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return this.authService.loginGenerateToken(req.user);
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
        throw new HttpException(
          HttpErrorMessages.REGISTRATION__MAIL_NOT_SENT,
          HttpStatus.FORBIDDEN
        );
      }
    } catch (error) {
      console.error(error);
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new HttpException(
          HttpErrorMessages.REGISTRATION__GENERIC_ERROR,
          HttpStatus.FORBIDDEN
        );
      }
    }
  }

  @Get('email/verify/:token')
  public async verifyEmail(@Param() params): Promise<string> {
    try {
      await this.authService.verifyEmail(params.token);
      return `<p>Thank you for confirming your email.</p>
              <p><a href="${PRODUCTION_BASE_URL}">Continue to site</a></p>`;
    } catch (error) {
      console.error(error);
      return `<p>We were not able to confirm your email.</p>
              <p>Please contact us.</p>`;
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
        throw new HttpException(
          HttpErrorMessages.REGISTRATION__MAIL_NOT_SENT,
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    } catch (error) {
      throw new HttpException(
        HttpErrorMessages.REGISTRATION__GENERIC_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
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
        throw new HttpException(
          HttpErrorMessages.REGISTRATION__MAIL_NOT_SENT,
          HttpStatus.INTERNAL_SERVER_ERROR
        );
      }
    } catch (error) {
      throw new HttpException(
        HttpErrorMessages.REGISTRATION__GENERIC_ERROR,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
