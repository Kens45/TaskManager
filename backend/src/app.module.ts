import { Module } from '@nestjs/common';

import { PrismaModule } from './prisma/prisma.module';
import { TasksModule } from './tasks/tasks.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule, TasksModule],
  controllers: [],
  providers: [PrismaModule],
})
export class AppModule {}
