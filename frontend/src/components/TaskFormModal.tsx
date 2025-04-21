'use client';

import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
} from '@mui/material';
import { useState } from 'react';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

type Props = {
    open: boolean;
    onClose: () => void;
    onCreated: () => void;
};

export default function TaskFormModal({ open, onClose, onCreated }: Props) {
    const [form, setForm] = useState({
        title: '',
        description: '',
        dueDate: null as Date | null,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleDateChange = (newValue: Date | null) => {
        setForm({ ...form, dueDate: newValue });
    };

    const handleSubmit = async () => {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tasks`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify(form),
        });

        if (res.ok) {
            onCreated();
            onClose();
            setForm({ title: '', description: '', dueDate: null });
        } else {
            alert('Error al crear tarea');
        }
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Crear nueva tarea</DialogTitle>
            <DialogContent className="flex flex-col gap-4 w-100">
                <TextField
                    autoFocus
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
                    rows={3}
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
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancelar</Button>
                <Button onClick={handleSubmit} variant="contained">
                    Crear
                </Button>
            </DialogActions>
        </Dialog>
    );
}