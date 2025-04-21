'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Tabs,
    Tab,
    Button,
    Chip,
} from '@mui/material';
import { useAuth } from '@/context/AuthContext';
import TaskFormModal from '@/components/TaskFormModal';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
    const { logout } = useAuth();
    const [openCreate, setOpenCreate] = useState(false);
    const [tab, setTab] = useState(0);
    const [tasks, setTasks] = useState([]);
    const [deletedTasks, setDeletedTasks] = useState([]);
    const router = useRouter();

    const fetchTasks = async () => {
        try {
            const data = await api('tasks');
            const deleted = await api('tasks/deleted');
            setTasks(data);
            setDeletedTasks(deleted);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    const handleDelete = async (id: string) => {
        await api(`tasks/${id}`, { method: 'DELETE' });
        fetchTasks();
    };

    const handleRestore = async (id: string) => {
        await api(`tasks/restore/${id}`, { method: 'PATCH' });
        fetchTasks();
    };

    const filteredTasks = (completed: boolean) =>
        tasks.filter((t: any) => t.completed === completed && !t.deleted);

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="flex justify-between items-center mb-4">
                <Typography variant="h4">Mis Tareas</Typography>
                <Button variant="outlined" onClick={logout}>
                    Cerrar sesión
                </Button>
            </div>

            <Box className="bg-white rounded-xl shadow-md p-4">
                <Button variant="contained" onClick={() => setOpenCreate(true)}>
                    Nueva Tarea
                </Button>
                <Tabs value={tab} onChange={(_, newTab) => setTab(newTab)} centered>
                    <Tab label="Pendientes" />
                    <Tab label="Completadas" />
                    <Tab label="Eliminadas" />
                </Tabs>

                {/* Pendientes */}
                {tab === 0 && (
                    <div className="grid gap-4 mt-4">
                        {filteredTasks(false).map((task: any) => (
                            <Card key={task.id} className="border-l-4 border-yellow-500">
                                <CardContent>
                                    <Typography variant="h6">{task.title}</Typography>
                                    <Typography className="text-sm text-gray-500">
                                        {task.description}
                                    </Typography>
                                    <div className="flex justify-end mt-2 gap-2">
                                        <Chip label="Pendiente" color="warning" />
                                        <Button size="small" onClick={() => handleDelete(task.id)}>
                                            Eliminar
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Completadas */}
                {tab === 1 && (
                    <div className="grid gap-4 mt-4">
                        {filteredTasks(true).map((task: any) => (
                            <Card key={task.id} className="border-l-4 border-green-500">
                                <CardContent>
                                    <Typography variant="h6">{task.title}</Typography>
                                    <Typography className="text-sm text-gray-500">
                                        {task.description}
                                    </Typography>
                                    <div className="flex justify-end mt-2 gap-2">
                                        <Chip label="Completada" color="success" />
                                        <Button size="small" onClick={() => handleDelete(task.id)}>
                                            Eliminar
                                        </Button>
                                        <Button size="small" onClick={() => router.push(`/dashboard/${task.id}/edit`)}
                                        >
                                            Editar
                                        </Button>

                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Eliminadas */}
                {tab === 2 && (
                    <div className="grid gap-4 mt-4">
                        {deletedTasks.map((task: any) => (
                            <Card key={task.id} className="border-l-4 border-gray-400">
                                <CardContent>
                                    <Typography variant="h6">{task.title}</Typography>
                                    <Typography className="text-sm text-gray-500">
                                        {task.description}
                                    </Typography>
                                    <div className="flex justify-end mt-2 gap-2">
                                        <Chip label="Eliminada" color="default" />
                                        <Button size="small" onClick={() => handleRestore(task.id)}>
                                            Restaurar
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </Box>
            <TaskFormModal
                open={openCreate}
                onClose={() => setOpenCreate(false)}
                onCreated={fetchTasks}
            />
        </div>
    );
}
