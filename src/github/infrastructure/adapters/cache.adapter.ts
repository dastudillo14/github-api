import { Injectable, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CachePort } from '../../domain/ports/cache.port';

@Injectable()
export class CacheAdapter implements CachePort {
  private readonly logger = new Logger(CacheAdapter.name);

  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async get<T>(key: string): Promise<T | null> {
    try {
      const result = await this.cacheManager.get<T>(key);
      return result ?? null;
    } catch (error) {
      this.logger.error(`Error getting cache key ${key}:`, error);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      await this.cacheManager.set(key, value, ttl);
      this.logger.debug(`Cache set for key: ${key} with TTL: ${ttl || 'default'}ms`);
    } catch (error) {
      this.logger.error(`Error setting cache key ${key}:`, error);
      throw error; 
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.cacheManager.del(key);
      this.logger.debug(`Cache deleted for key: ${key}`);
    } catch (error) {
      this.logger.error(`Error deleting cache key ${key}:`, error);
      throw error; 
    }
  }

  async clear(): Promise<void> {
    try {
      await this.cacheManager.clear();
      this.logger.log('Cache cleared successfully');
    } catch (error) {
      this.logger.error('Error clearing cache:', error);
      throw error; 
    }
  }
}
