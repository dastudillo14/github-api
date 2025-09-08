import { Controller, Get, Param, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { GitHubService } from '../../domain/services/github.service';
import { GitHubUserResponseDto } from '../dtos/github-user-response.dto';
import { GitHubMetricsResponseDto } from '../dtos/github-metrics-response.dto';
import { GitHubUserMapper } from '../mappers/github-user.mapper';
import { LogExecution } from '../../../common/decorators/log-execution.decorator';

@ApiTags('github')
@Controller('github')
export class GitHubController {
  constructor(private readonly githubService: GitHubService) {}

  @Get('profiles/:username')
  @ApiOperation({ summary: 'Get GitHub user profile' })
  @ApiParam({ name: 'username', description: 'GitHub username', example: 'octocat' })
  @ApiResponse({ 
    status: 200, 
    description: 'User profile retrieved successfully',
    type: GitHubUserResponseDto
  })
  @ApiResponse({ 
    status: 404, 
    description: 'User not found' 
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Internal server error' 
  })
  @LogExecution('GitHubController')
  async getUser(@Param('username') username: string): Promise<GitHubUserResponseDto> {
    try {
      const user = await this.githubService.getUser(username);
      return GitHubUserMapper.toResponseDto(user);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('metrics/:username')
  @ApiOperation({ summary: 'Get GitHub user metrics' })
  @ApiParam({ name: 'username', description: 'GitHub username', example: 'octocat' })
  @ApiResponse({ 
    status: 200, 
    description: 'User metrics retrieved successfully',
    type: GitHubMetricsResponseDto
  })
  @ApiResponse({ 
    status: 404, 
    description: 'User not found' 
  })
  @ApiResponse({ 
    status: 500, 
    description: 'Internal server error' 
  })
  @LogExecution('GitHubController')
  async getUserMetrics(@Param('username') username: string): Promise<GitHubMetricsResponseDto> {
    try {
      return await this.githubService.getUserMetrics(username);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

}
