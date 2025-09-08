import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { GitHubModule } from './github/github.module';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

@Module({
  imports: [GitHubModule],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}