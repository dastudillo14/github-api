import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { GitHubController } from './application/controllers/github.controller';
import { GitHubService } from './domain/services/github.service';
import { GitHubAdapter } from './infrastructure/adapters/github.adapter';
import { CacheAdapter } from './infrastructure/adapters/cache.adapter';

import { GITHUB_PORT, CACHE_PORT } from './domain/tokens/github.tokens';

@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: 'config.env',
    }),
    CacheModule.register({
      ttl: 300000, // 5 minutes default TTL in milliseconds
      max: 100, // Maximum number of items in cache
    }),
  ],
  controllers: [GitHubController],
  providers: [
    GitHubService,
    {
      provide: GITHUB_PORT,
      useClass: GitHubAdapter,
    },
    {
      provide: CACHE_PORT,
      useClass: CacheAdapter,
    },
  ],
  exports: [GitHubService],
})
export class GitHubModule {}
