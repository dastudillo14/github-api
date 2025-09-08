import { GitHubUser } from '../entities/github-user.entity';
import { GitHubRepository } from '../entities/github-repository.entity';

export interface GitHubPort {
  getUser(username: string): Promise<GitHubUser>;
  getUserRepositories(username: string, page?: number, perPage?: number): Promise<GitHubRepository[]>;
}
