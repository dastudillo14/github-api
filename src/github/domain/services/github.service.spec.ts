import { Test, TestingModule } from '@nestjs/testing';
import { GitHubService } from './github.service';
import { GitHubPort } from '../ports/github.port';
import { CachePort } from '../ports/cache.port';
import { GitHubMetricsResponseDto } from '../../application/dtos/github-metrics-response.dto';
import { GITHUB_PORT, CACHE_PORT } from '../tokens/github.tokens';
import { mockRepositories, mockUser } from './mocks/github.mock';

describe('GitHubService', () => {
  let service: GitHubService;
  let githubPort: jest.Mocked<GitHubPort>;
  let cachePort: jest.Mocked<CachePort>;



  beforeEach(async () => {
    const mockGitHubPort = {
      getUser: jest.fn(),
      getUserRepositories: jest.fn()
    };

    const mockCachePort = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
      clear: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GitHubService,
        {
          provide: GITHUB_PORT,
          useValue: mockGitHubPort,
        },
        {
          provide: CACHE_PORT,
          useValue: mockCachePort,
        },
      ],
    }).compile();

    service = module.get<GitHubService>(GitHubService);
    githubPort = module.get(GITHUB_PORT);
    cachePort = module.get(CACHE_PORT);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUser', () => {
    const username = 'testuser';
    it('should return cached user when available', async () => {
      cachePort.get.mockResolvedValue(mockUser);

      const result = await service.getUser(username);

      expect(result).toEqual(mockUser);
      expect(cachePort.get).toHaveBeenCalledWith(`user:${username}`);
      expect(githubPort.getUser).not.toHaveBeenCalled();
    });

    it('should fetch user from API and cache it when not in cache', async () => {
      const username = 'testuser';
      cachePort.get.mockResolvedValue(null);
      githubPort.getUser.mockResolvedValue(mockUser);

      const result = await service.getUser(username);

      expect(result).toEqual(mockUser);
      expect(cachePort.get).toHaveBeenCalledWith(`user:${username}`);
      expect(githubPort.getUser).toHaveBeenCalledWith(username);
      expect(cachePort.set).toHaveBeenCalledWith(`user:${username}`, mockUser, 300000);
    });
  });

  describe('getUserMetrics', () => {
    it('should return cached metrics when available', async () => {
      const username = 'testuser';
      const cachedMetrics: GitHubMetricsResponseDto = {
        username: 'testuser',
        metrics: {
          totalStars: 80,
          followersToReposRatio: 10,
          lastPushDaysAgo: 5,
        },
      };
      cachePort.get.mockResolvedValue(cachedMetrics);

      const result = await service.getUserMetrics(username);

      expect(result).toEqual(cachedMetrics);
      expect(cachePort.get).toHaveBeenCalledWith(`metrics:${username}`);
      expect(githubPort.getUser).not.toHaveBeenCalled();
      expect(githubPort.getUserRepositories).not.toHaveBeenCalled();
    });

    it('should calculate metrics from user and repositories when not in cache', async () => {
      const username = 'testuser';
      cachePort.get.mockResolvedValue(null);
      
      // Mock getUser to return cached user
      jest.spyOn(service, 'getUser').mockResolvedValue(mockUser);
      
      // Mock getUserRepositories to return repositories
      githubPort.getUserRepositories.mockResolvedValue(mockRepositories);

      const result = await service.getUserMetrics(username);

      expect(result).toEqual({
        username: 'testuser',
        metrics: {
          totalStars: 80, // 50 + 30
          followersToReposRatio: 10, // 100 / 10
          lastPushDaysAgo: expect.any(Number), // Will be calculated based on current date
        },
      });

      expect(cachePort.get).toHaveBeenCalledWith(`metrics:${username}`);
      expect(service.getUser).toHaveBeenCalledWith(username);
      expect(githubPort.getUserRepositories).toHaveBeenCalledWith(username, 1, 100);
      expect(cachePort.set).toHaveBeenCalledWith(
        `metrics:${username}`,
        expect.objectContaining({
          username: 'testuser',
          metrics: expect.objectContaining({
            totalStars: 80,
            followersToReposRatio: 10,
            lastPushDaysAgo: expect.any(Number),
          }),
        }),
        300000
      );
    });

    it('should handle user with no repositories', async () => {
      const username = 'testuser';
      const userWithNoRepos = { ...mockUser, public_repos: 0 };
      
      cachePort.get.mockResolvedValue(null);
      jest.spyOn(service, 'getUser').mockResolvedValue(userWithNoRepos);
      githubPort.getUserRepositories.mockResolvedValue([]);

      const result = await service.getUserMetrics(username);

      expect(result).toEqual({
        username: 'testuser',
        metrics: {
          totalStars: 0,
          followersToReposRatio: 0, // 100 / 0 = 0 (handled in service)
          lastPushDaysAgo: null,
        },
      });
    });

    it('should handle repositories with no push dates', async () => {
      const username = 'testuser';
      const reposWithoutPushDate = mockRepositories.map(repo => ({
        ...repo,
        pushed_at: null,
      }));
      
      cachePort.get.mockResolvedValue(null);
      jest.spyOn(service, 'getUser').mockResolvedValue(mockUser);
      githubPort.getUserRepositories.mockResolvedValue(reposWithoutPushDate);

      const result = await service.getUserMetrics(username);

      expect(result.metrics.lastPushDaysAgo).toBeNull();
    });
  });
});
