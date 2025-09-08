import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    const startTime = Date.now();

    this.logger.log(`Starting ${method} ${url} request`);

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - startTime;
        this.logger.log(`Successfully completed ${method} ${url} - Duration: ${duration}ms`);
      }),
      catchError((error) => {
        const duration = Date.now() - startTime;
        
        if (error.status) {
          this.logger.warn(`${method} ${url} failed with HttpException - Status: ${error.status}, Duration: ${duration}ms`);
        } else {
          this.logger.error(`${method} ${url} failed with unexpected error - Duration: ${duration}ms`, error.stack);
        }
        
        return throwError(() => error);
      }),
    );
  }
}
