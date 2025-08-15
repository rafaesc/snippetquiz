import { Catch, RpcExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { RpcException } from '@nestjs/microservices';
import {
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';

@Catch()
export class AllRpcExceptionsFilter implements RpcExceptionFilter<any> {
  catch(exception: any, host: ArgumentsHost): Observable<any> {
    let status = 500;
    let message = 'Internal server error';

    if (exception instanceof NotFoundException) {
      status = 404;
      message = exception.message;
    } else if (exception instanceof ConflictException) {
      status = 409;
      message = exception.message;
    } else if (exception instanceof BadRequestException) {
      status = 400;
      message = exception.message;
    } else if (exception.message) {
      message = exception.message;
    }

    return throwError(
      () =>
        new RpcException({
          status,
          message,
        }),
    );
  }
}
