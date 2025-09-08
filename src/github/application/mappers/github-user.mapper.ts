import { GitHubUser } from '../../domain/entities/github-user.entity';
import { GitHubUserResponseDto } from '../dtos/github-user-response.dto';

export class GitHubUserMapper {
  static toResponseDto(user: GitHubUser): GitHubUserResponseDto {
    return {
      username: user.login,
      fullName: user.name || user.login,
      avatar: user.avatar_url,
      bio: user.bio || '',
      publicRepos: user.public_repos,
      followers: user.followers,
      profileUrl: user.html_url,
    };
  }
}
