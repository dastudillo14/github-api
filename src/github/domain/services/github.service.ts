import { Injectable, Inject, Logger } from '@nestjs/common';
import { GitHubPort } from '../ports/github.port';
import { CachePort } from '../ports/cache.port';
import { GitHubUser } from '../entities/github-user.entity';
import { GitHubRepository } from '../entities/github-repository.entity';
import { GITHUB_PORT, CACHE_PORT } from '../tokens/github.tokens';
import { GitHubMetricsResponseDto } from '../../application/dtos/github-metrics-response.dto';
@Injectable()
export class GitHubService {
  private readonly logger = new Logger(GitHubService.name);

  constructor(
    @Inject(GITHUB_PORT) private readonly githubPort: GitHubPort,
    @Inject(CACHE_PORT) private readonly cachePort: CachePort,
  ) { }

  async getUser(username: string): Promise<GitHubUser> {
    const startTime = Date.now();
    this.logger.log(`Starting getUser use case for username: ${username}`);
    
    const cacheKey = `user:${username}`;

    try {
      const cachedUser = await this.cachePort.get<GitHubUser>(cacheKey);
      if (cachedUser) {
        const duration = Date.now() - startTime;
        this.logger.log(`Cache hit for user: ${username} - Duration: ${duration}ms`);
        return cachedUser;
      }

      this.logger.log(`Cache miss for user: ${username}`);
      const user = await this.githubPort.getUser(username);

      await this.cachePort.set(cacheKey, user, 300000);

      const duration = Date.now() - startTime;
      this.logger.log(`Successfully completed getUser use case for ${username} - Duration: ${duration}ms`);
      return user;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(`Failed getUser use case for ${username} - Duration: ${duration}ms`, error.stack);
      throw error;
    }
  }


  async getUserMetrics(username: string): Promise<GitHubMetricsResponseDto> {
    const startTime = Date.now();
    this.logger.log(`Starting getUserMetrics use case for username: ${username}`);
    
    const cacheKey = `metrics:${username}`;

    try {
      const cachedMetrics = await this.cachePort.get<GitHubMetricsResponseDto>(cacheKey);
      
      if (cachedMetrics) {
        const duration = Date.now() - startTime;
        this.logger.log(`Cache hit for metrics: ${username} - Duration: ${duration}ms`);
        return cachedMetrics;
      }

      this.logger.log(`Cache miss for metrics: ${username}`);

      const [user, repositories] = await Promise.all([
        this.getUser(username),
        this.getAllUserRepositories(username)
      ]);

      this.logger.log(`Retrieved ${repositories.length} repositories for user ${username}`);

      const totalStars = repositories.reduce((sum, repo) => sum + repo.stargazers_count, 0);
      const followersToReposRatio = user.public_repos > 0
        ? Math.round((user.followers / user.public_repos) * 100) / 100
        : 0;

      const lastPushDate = repositories
        .filter(repo => repo.pushed_at)
        .map(repo => new Date(repo.pushed_at))
        .sort((a, b) => b.getTime() - a.getTime())[0];

      const lastPushDaysAgo = lastPushDate
        ? Math.floor((Date.now() - lastPushDate.getTime()) / (1000 * 60 * 60 * 24))
        : null;

      const metrics = {
        username,
        metrics: {
          totalStars,
          followersToReposRatio,
          lastPushDaysAgo
        }
      };

      await this.cachePort.set(cacheKey, metrics, 300000);

      const duration = Date.now() - startTime;
      this.logger.log(`Successfully completed getUserMetrics use case for ${username} - Duration: ${duration}ms, Total stars: ${totalStars}, Repositories: ${repositories.length}`);
      return metrics;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(`Failed getUserMetrics use case for ${username} - Duration: ${duration}ms`, error.stack);
      throw error;
    }
  }

  private async getAllUserRepositories(username: string): Promise<GitHubRepository[]> {
    const startTime = Date.now();
    this.logger.log(`Starting getAllUserRepositories for username: ${username}`);
    
    const allRepos: GitHubRepository[] = [];
    let page = 1;
    const perPage = 100; // Maximum allowed by GitHub API

    try {
      while (true) {
        const repos = await this.githubPort.getUserRepositories(username, page, perPage);
        allRepos.push(...repos);

        this.logger.log(`Fetched page ${page} with ${repos.length} repositories for user ${username}`);

        // If we got less than perPage, we've reached the end
        if (repos.length < perPage) {
          break;
        }

        page++;
      }

      const duration = Date.now() - startTime;
      this.logger.log(`Successfully retrieved all ${allRepos.length} repositories for user ${username} in ${page} pages - Duration: ${duration}ms`);
      return allRepos;
    } catch (error) {
      const duration = Date.now() - startTime;
      this.logger.error(`Failed to get all repositories for user ${username} - Duration: ${duration}ms`, error.stack);
      throw error;
    }
  }
}
