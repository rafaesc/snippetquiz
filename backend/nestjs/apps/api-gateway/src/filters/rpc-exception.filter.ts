import { Catch, ExceptionFilter, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { FastifyReply } from 'fastify';

@Catch()
export class RpcExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    
    // Handle RpcException directly
    if (exception instanceof RpcException) {
      const error = exception.getError();
      if (typeof error === 'object' && error !== null) {
        status = (error as any).status || HttpStatus.INTERNAL_SERVER_ERROR;
        message = (error as any).message || message;
      } else if (typeof error === 'string') {
        message = error;
      }
    }
    // Handle errors that contain RPC error information (from firstValueFrom)
    else if (exception && typeof exception === 'object') {
      // Check if it's an error with RPC structure
      if (exception.error && typeof exception.error === 'object') {
        status = exception.error.status || HttpStatus.INTERNAL_SERVER_ERROR;
        message = exception.error.message || exception.message || message;
      }
      // Check if it has status and message directly
      else if (exception.status && exception.message) {
        status = exception.status;
        message = exception.message;
      }
      // Fallback to message if available
      else if (exception.message) {
        message = exception.message;
      }
    }
    
    response.status(status).send({
      statusCode: status,
      message: message,
      error: HttpStatus[status] || 'Internal Server Error'
    });
  }
}