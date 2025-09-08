import { ApiProperty } from '@nestjs/swagger';

class MetricsDto {
  @ApiProperty({ 
    description: 'Total number of stars across all repositories',
    example: 150
  })
  totalStars: number;

  @ApiProperty({ 
    description: 'Ratio of followers to repositories',
    example: 2.5
  })
  followersToReposRatio: number;

  @ApiProperty({ 
    description: 'Days since last push to any repository',
    example: 5,
    nullable: true
  })
  lastPushDaysAgo: number | null;
}

export class GitHubMetricsResponseDto {
  @ApiProperty({ 
    description: 'GitHub username',
    example: 'octocat'
  })
  username: string;

  @ApiProperty({ 
    description: 'User metrics',
    type: MetricsDto
  })
  metrics: MetricsDto;
}
