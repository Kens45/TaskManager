import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Tasks (e2e) - Crear tarea', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let jwt: string;
  let userId: string;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    prisma = module.get(PrismaService);

    const res = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: 'test1@example.com',
        password: '123456',
        organization: 'TestOrg1',
      });

    jwt = res.body.access_token;

    const user = await prisma.user.findUnique({ where: { email: 'test1@example.com' } });
    userId = user.id;
  });

  afterAll(async () => {
    await prisma.task.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.organization.deleteMany({});
    await app.close();
  });

  it('debe crear una tarea', async () => {
    const res = await request(app.getHttpServer())
      .post('/tasks')
      .set('Authorization', `Bearer ${jwt}`)
      .send({
        title: 'Nueva tarea',
        description: 'Una descripción de prueba',
      });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe('Nueva tarea');
    expect(res.body.userId).toBe(userId);
  });
});
