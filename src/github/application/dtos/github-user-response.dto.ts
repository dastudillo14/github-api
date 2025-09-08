import { ApiProperty } from '@nestjs/swagger';

export class GitHubUserResponseDto {
  @ApiProperty({ 
    description: 'GitHub username',
    example: 'octocat'
  })
  username: string;

  @ApiProperty({ 
    description: 'Full name of the user',
    example: 'The Octocat'
  })
  fullName: string;

  @ApiProperty({ 
    description: 'URL of the user\'s avatar',
    example: 'https://github.com/images/error/octocat_happy.gif'
  })
  avatar: string;

  @ApiProperty({ 
    description: 'User bio',
    example: 'A mysterious octocat that lives in San Francisco'
  })
  bio: string;

  @ApiProperty({ 
    description: 'Number of public repositories',
    example: 8
  })
  publicRepos: number;

  @ApiProperty({ 
    description: 'Number of followers',
    example: 20
  })
  followers: number;

  @ApiProperty({ 
    description: 'URL to the user\'s GitHub profile',
    example: 'https://github.com/octocat'
  })
  profileUrl: string;
}
