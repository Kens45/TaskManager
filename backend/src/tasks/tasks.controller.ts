import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { JwtAuthGuard } from 'src/auth/jwt.guard';

@UseGuards(JwtAuthGuard)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  create(@Request() req, @Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.create(req.user.userId, createTaskDto);
  }

  @Get()
  findAll(@Request() req,) {
    return this.tasksService.findAll(req.user.userId, req.user.organizationId);
  }

  @Get('deleted')
  findDeleted(@Request() req) {
    return this.tasksService.findDeleted(req.user.userId);
  }

  @Patch(':id')
  update(@Request() req, @Param('id') id: string, @Body() updateTaskDto: UpdateTaskDto) {
    return this.tasksService.update(id, updateTaskDto, req.user);
  }

  @Delete(':id')
  softDelete(@Request() req, @Param('id') id: string) {
    return this.tasksService.softDelete(req.user, id);
  }

  @Patch('restore/:id')
  restore(@Request() req, @Param('id') id: string) {
    return this.tasksService.restore(req.user, id);
  }

  @Get(':id/history')
  history(@Request() req, @Param('id') id: string) {
    return this.tasksService.getHistory(req.user, id);
  }
}
