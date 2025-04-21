'use client';

import {
    Box,
    Button,
    Checkbox,
    Container,
    FormControlLabel,
    Paper,
    TextField,
    Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import TaskHistoryModal from '@/components/TaskHistoryModal';

interface TaskForm {
    title: string;
    description: string;
    dueDate: Date | null;
    completed: boolean;
}

export default function EditTaskPage() {
    const router = useRouter();
    const { taskId } = useParams<{ taskId: string }>();
    const [openHistory, setOpenHistory] = useState(false);
    const [form, setForm] = useState<TaskForm>({
        title: '',
        description: '',
        dueDate: null as Date | null,
        completed: false,
    });

    useEffect(() => {
        const fetchTask = async () => {
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks/${taskId}`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                });

                if (!res.ok) {
                    throw new Error('Task not found');
                }

                const task = await res.json();
                setForm({
                    title: task.title,
                    description: task.description,
                    dueDate: task.dueDate?.slice(0, 10) || '',
                    completed: task.completed,
                });
            } catch (error) {
                alert('Tarea no encontrada');
                router.push('/dashboard');
            }
        };

        if (taskId) {
            fetchTask();
        }
    }, [taskId, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type, checked } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };


    const handleDateChange = (newValue: Date | null) => {
        setForm({ ...form, dueDate: newValue });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks/${taskId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                },
                body: JSON.stringify(form),
            });

            if (!res.ok) {
                throw new Error('Failed to update task');
            }

            router.push('/dashboard');
        } catch (error) {
            alert('Error al actualizar tarea');
        }
    };

    return (
        <Box
            sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                bgcolor: 'background.default',
                p: 2,
            }}
        >
            <Container maxWidth="sm">
                <Paper
                    sx={{
                        p: 4,
                        borderRadius: 2,
                        boxShadow: 3,
                    }}
                >
                    <Typography variant="h5" component="h1" align="center" gutterBottom>
                        Editar Tarea
                    </Typography>

                    <Box
                        component="form"
                        onSubmit={handleSubmit}
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 3,
                        }}
                    >
                        <TextField
                            label="Título"
                            name="title"
                            fullWidth
                            required
                            value={form.title}
                            onChange={handleChange}
                            variant="outlined"
                        />

                        <TextField
                            label="Descripción"
                            name="description"
                            fullWidth
                            multiline
                            rows={4}
                            value={form.description}
                            onChange={handleChange}
                            variant="outlined"
                        />

                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <DatePicker
                                label="Fecha límite"
                                value={form.dueDate}
                                onChange={handleDateChange}
                                slotProps={{
                                    textField: {
                                        fullWidth: true,
                                        variant: 'outlined',
                                    },
                                }}
                            />
                        </LocalizationProvider>

                        <FormControlLabel
                            control={
                                <Checkbox
                                    name="completed"
                                    checked={form.completed}
                                    onChange={handleChange}
                                    color="primary"
                                />
                            }
                            label="Marcar como completada"
                        />
                        <Button
                            variant="outlined"
                            fullWidth
                            onClick={() => setOpenHistory(true)}
                        >
                            Ver historial de cambios
                        </Button>

                        <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            size="large"
                            sx={{ mt: 2 }}
                        >
                            Guardar cambios
                        </Button>
                    </Box>
                </Paper>
            </Container>
            <TaskHistoryModal
                open={openHistory}
                onClose={() => setOpenHistory(false)}
                taskId={taskId}
            />
        </Box>
    );
}