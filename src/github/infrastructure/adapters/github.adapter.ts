import { Injectable, HttpException, HttpStatus, Logger, HttpCode } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { GitHubPort } from '../../domain/ports/github.port';
import { GitHubUser } from '../../domain/entities/github-user.entity';
import { GitHubRepository } from '../../domain/entities/github-repository.entity';

@Injectable()
export class GitHubAdapter implements GitHubPort {
  private readonly logger = new Logger(GitHubAdapter.name);
  private readonly baseUrl: string;
  private readonly token: string;
  private readonly userAgent: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl = this.configService.get<string>('GITHUB_API_URL', 'https://api.github.com');
    this.token = this.configService.get<string>('GITHUB_TOKEN', '');
    this.userAgent = this.configService.get<string>('USER_AGENT', 'GitHub-API-Client/1.0');
  }

  private getHeaders() {
    const headers: Record<string, string> = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': this.userAgent,
    };

    if (this.token) {
      headers['Authorization'] = `token ${this.token}`;
    }

    return headers;
  }

  async getUser(username: string): Promise<GitHubUser> {
    const startTime = Date.now();
    this.logger.log(`Starting getUser for username: ${username}`);

    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/users/${username}`, {
          headers: this.getHeaders(),
        })
      );
      
      const duration = Date.now() - startTime;
      this.logger.log(`Successfully fetched user ${username} in ${duration}ms`);
      return response.data;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      if (error.response?.status === HttpStatus.NOT_FOUND) {
        this.logger.warn(`User '${username}' not found (404) - Duration: ${duration}ms`);
        throw new HttpException(`User '${username}' not found`, HttpStatus.NOT_FOUND);
      }
      
      if (error.response?.status === HttpStatus.TOO_MANY_REQUESTS && error.response?.data?.message?.includes('rate limit')) {
        this.logger.error(`Rate limit exceeded for user ${username} (429) - Duration: ${duration}ms`);
        throw new HttpException('GitHub API rate limit exceeded', HttpStatus.TOO_MANY_REQUESTS);
      }
      
      if (error.response?.status >= HttpStatus.INTERNAL_SERVER_ERROR) {
        this.logger.error(`GitHub API server error for user ${username} (${error.response?.status}) - Duration: ${duration}ms`);
        throw new HttpException('GitHub API is currently unavailable', HttpStatus.SERVICE_UNAVAILABLE);
      }
      
      this.logger.error(`Failed to fetch user ${username} - Status: ${error.response?.status}, Duration: ${duration}ms`, error.stack);
      throw new HttpException(
        'Failed to fetch user from GitHub API',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getUserRepositories(username: string, page: number = 1, perPage: number = 10): Promise<GitHubRepository[]> {
    const startTime = Date.now();
    this.logger.log(`Starting getUserRepositories for username: ${username}, page: ${page}, perPage: ${perPage}`);

    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/users/${username}/repos`, {
          headers: this.getHeaders(),
          params: {
            page,
            per_page: perPage,
            sort: 'updated',
            direction: 'desc',
          },
        })
      );
      
      const duration = Date.now() - startTime;
      this.logger.log(`Successfully fetched ${response.data.length} repositories for user ${username} (page ${page}) in ${duration}ms`);
      return response.data;
    } catch (error) {
      const duration = Date.now() - startTime;
      
      if (error.response?.status === HttpStatus.NOT_FOUND) {
        this.logger.warn(`User '${username}' not found (404) - Duration: ${duration}ms`);
        throw new HttpException(`User '${username}' not found`, HttpStatus.NOT_FOUND);
      }
      
      if (error.response?.status === HttpStatus.TOO_MANY_REQUESTS && error.response?.data?.message?.includes('rate limit')) {
        this.logger.error(`Rate limit exceeded for user ${username} repositories (429) - Duration: ${duration}ms`);
        throw new HttpException('GitHub API rate limit exceeded', HttpStatus.TOO_MANY_REQUESTS);
      }
      
      if (error.response?.status >= HttpStatus.INTERNAL_SERVER_ERROR) {
        this.logger.error(`GitHub API server error for user ${username} repositories (${error.response?.status}) - Duration: ${duration}ms`);
        throw new HttpException('GitHub API is currently unavailable', HttpStatus.SERVICE_UNAVAILABLE);
      }
      
      this.logger.error(`Failed to fetch repositories for user ${username} - Status: ${error.response?.status}, Duration: ${duration}ms`, error.stack);
      throw new HttpException(
        'Failed to fetch user repositories from GitHub API',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
