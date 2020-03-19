// https://github.com/marcomelilli/nestjs-email-authentication/blob/master/src/common/dto/response.dto.ts
import { IResponse } from '@edfu/api-interfaces';

export class ResponseError implements IResponse {
  constructor(infoMessage: string, data?: any) {
    this.success = false;
    this.message = infoMessage;
    this.data = data;
    console.warn(
      new Date().toString() +
        ' - [Response]: ' +
        infoMessage +
        (data ? ' - ' + JSON.stringify(data) : '')
    );
  }
  message: string;
  data: any;
  errorMessage: any;
  error: any;
  success: boolean;
}

export class ResponseSuccess implements IResponse {
  constructor(infoMessage: string, data?: any, notLog?: boolean) {
    this.success = true;
    this.message = infoMessage;
    this.data = data;
    if (!notLog) {
      try {
        const obfuscateRequest = JSON.parse(JSON.stringify(data));
        if (obfuscateRequest && obfuscateRequest.token)
          obfuscateRequest.token = '*******';
        console.log(
          new Date().toString() +
            ' - [Response]: ' +
            JSON.stringify(obfuscateRequest)
        );
      } catch (error) {}
    }
  }
  message: string;
  data: any;
  errorMessage: any;
  error: any;
  success: boolean;
}
