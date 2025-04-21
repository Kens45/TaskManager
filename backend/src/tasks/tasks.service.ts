import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TasksService {
  constructor(private readonly prismaClient: PrismaService) { }

  async create(userId:string, createTaskDto: CreateTaskDto) {
    return this.prismaClient.task.create({
      data: {
        ...createTaskDto,
        userId,
      }
    });
  }

  async findAll(userId: string, organizationId: string) { 
    return this.prismaClient.task.findMany({
      where: {
        deleted: false,
        user:{
          id: userId,
          organizationId: organizationId,
        }
      },
      orderBy:{
        createdAt: 'desc'
      }
    });
  }

  async findDeleted(userId: string){
    return this.prismaClient.task.findMany({
      where: {
        deleted: true,
        userId,
      },
    })
  }

  async update(taskId: string, updateTaskDto: UpdateTaskDto, user:any ) {
    const task = await this.prismaClient.task.findUnique({
      where: {
        id: taskId,
      },
      include: {
        user: true,
      },
    });
    if (!task || task.user.organizationId !== user.organizationId) {
      throw new ForbiddenException('Access denied');
    }

    const updatedTask = {
      ...updateTaskDto,
      updatedAt: new Date(),
    };

    const history = [];
    if (updateTaskDto.title && updateTaskDto.title !== task.title) {
      history.push({
        field: 'title',
        oldValue: task.title,
        newValue: updateTaskDto.title,
      });
    }

    if (updateTaskDto.description && updateTaskDto.description !== task.description) {
      history.push({
        field: 'description',
        oldValue: task.description,
        newValue: updateTaskDto.description,
      });
    }

    if (typeof updateTaskDto.completed === 'boolean' && updateTaskDto.completed !== task.completed) {
      history.push({
        field: 'completed',
        oldValue: String(task.completed),
        newValue: String(updateTaskDto.completed),
      });
    }

    await this.prismaClient.task.update({
      where: {
        id: taskId,
      },
      data: {
        ...updatedTask,
      },
    });

    await Promise.all(
      history.map((h) => {
        this.prismaClient.taskHistory.create({
          data: {
            taskId: taskId,
            field: h.field,
            oldValue: h.oldValue,
            newValue: h.newValue,
          },
        });
      }),
    )

    return {message: 'Task updated successfully'};
  }

  async softDelete(taskId: string, user: any) {
    const task = await this.prismaClient.task.findUnique({
      where: {
        id: taskId,
      },
      include: {
        user: true,
      },
    });

    if (!task || task.user.organizationId !== user.organizationId) {
      throw new ForbiddenException('Access denied');
    }

    return await this.prismaClient.task.update({
      where: {
        id: taskId,
      },
      data: {
        deleted: true,
      },
    });
  }

  async restore(user: any, taskId: string) {
    const task = await this.prismaClient.task.findUnique({
      where: { id: taskId },
      include: { user: true },
    });

    if (!task || task.user.organizationId !== user.organizationId)
      throw new ForbiddenException('Access denied');

    return this.prismaClient.task.update({
      where: { id: taskId },
      data: { deleted: false },
    });
  }

  async getHistory(taskId: string, user:any ) {
    const task = await this.prismaClient.task.findUnique({
      where: {
        id: taskId,
      },
      include: {
        user: true,
      },
    });

    if (!task || task.user.organizationId !== user.organizationId) {
      throw new ForbiddenException('Access denied');
    }

    return await this.prismaClient.taskHistory.findMany({
      where: {
        taskId,
      },
      orderBy: {
        changedAt: 'desc',
      },
    });
  }

}
