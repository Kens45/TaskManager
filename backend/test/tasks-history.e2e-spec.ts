import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Tasks (e2e) - Historial de cambios', () => {
    let app: INestApplication;
    let prisma: PrismaService;
    let jwt: string;
    let taskId: string;

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
                email: 'historyuser@example.com',
                password: '123456',
                organization: 'HistoryOrg',
            });

        jwt = res.body.access_token;

        const task = await request(app.getHttpServer())
            .post('/tasks')
            .set('Authorization', `Bearer ${jwt}`)
            .send({
                title: 'Original',
                description: 'Antes',
            });

        taskId = task.body.id;

        // Modificar para generar historial
        await request(app.getHttpServer())
            .patch(`/tasks/${taskId}`)
            .set('Authorization', `Bearer ${jwt}`)
            .send({
                title: 'Modificada',
            });
    });

    afterAll(async () => {
        await prisma.taskHistory.deleteMany({});
        await prisma.task.deleteMany({});
        await prisma.user.deleteMany({});
        await prisma.organization.deleteMany({});
        await app.close();
    });

    it('debe registrar un cambio en el historial', async () => {
        const res = await request(app.getHttpServer())
            .get(`/tasks/${taskId}/history`)
            .set('Authorization', `Bearer ${jwt}`);

        expect(res.status).toBe(200);
        expect(res.body.length).toBeGreaterThan(0);
        expect(res.body[0].field).toBe('title');
        expect(res.body[0].oldValue).toBe('Original');
        expect(res.body[0].newValue).toBe('Modificada');
    });
});
