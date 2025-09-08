import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/github/users/octocat (GET)', () => {
    return request(app.getHttpServer())
      .get('/github/users/octocat')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('login', 'octocat');
        expect(res.body).toHaveProperty('id');
        expect(res.body).toHaveProperty('avatar_url');
      });
  });

  it('/github/users/octocat/repositories (GET)', () => {
    return request(app.getHttpServer())
      .get('/github/users/octocat/repositories?page=1&per_page=5')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
        if (res.body.length > 0) {
          expect(res.body[0]).toHaveProperty('name');
          expect(res.body[0]).toHaveProperty('full_name');
        }
      });
  });

  it('/github/search/repositories (GET)', () => {
    return request(app.getHttpServer())
      .get('/github/search/repositories?q=nestjs&page=1&per_page=5')
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('total_count');
        expect(res.body).toHaveProperty('items');
        expect(Array.isArray(res.body.items)).toBe(true);
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
