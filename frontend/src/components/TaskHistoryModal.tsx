'use client';

import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    List,
    ListItem,
    ListItemText,
    Typography,
    CircularProgress,
    Divider,
    Chip,
    Box,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface HistoryItem {
    id: string;
    field: string;
    oldValue: string | null;
    newValue: string | null;
    changedAt: string;
    changedBy?: string;
}

type Props = {
    open: boolean;
    onClose: () => void;
    taskId: string;
};

export default function TaskHistoryModal({ open, onClose, taskId }: Props) {
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!open) return;

        const fetchHistory = async () => {
            try {
                setLoading(true);
                setError(null);

                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/tasks/${taskId}/history`,
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('token')}`,
                        },
                    }
                );

                if (!res.ok) {
                    throw new Error('Failed to fetch history');
                }

                const data = await res.json();
                setHistory(data);
            } catch (err) {
                setError('Error al cargar el historial');
                console.error('Fetch history error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, [open, taskId]);

    const formatFieldName = (field: string) => {
        const fieldNames: Record<string, string> = {
            title: 'Título',
            description: 'Descripción',
            dueDate: 'Fecha límite',
            completed: 'Estado',
        };
        return fieldNames[field] || field;
    };

    const formatValue = (value: string | null, field: string) => {
        if (value === null) return 'N/A';

        if (field === 'dueDate') {
            return format(new Date(value), 'PPP', { locale: es });
        }

        if (field === 'completed') {
            return value === 'true' ? 'Completada' : 'Pendiente';
        }

        return value;
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: { borderRadius: 3 }
            }}
        >
            <DialogTitle sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
                Historial de Cambios
                {history.length > 0 && (
                    <Chip
                        label={`${history.length} cambios`}
                        size="small"
                        sx={{ ml: 2, bgcolor: 'primary.light', color: 'white' }}
                    />
                )}
            </DialogTitle>

            <DialogContent dividers sx={{ p: 0 }}>
                {loading ? (
                    <Box display="flex" justifyContent="center" p={4}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Typography color="error" sx={{ p: 3 }}>
                        {error}
                    </Typography>
                ) : history.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ p: 3 }}>
                        No hay historial de cambios registrado.
                    </Typography>
                ) : (
                    <List disablePadding>
                        {history.map((h, index) => (
                            <div key={h.id}>
                                <ListItem alignItems="flex-start" sx={{ py: 2 }}>
                                    <ListItemText
                                        primary={
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <Typography fontWeight="bold">
                                                    {formatFieldName(h.field)}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {format(new Date(h.changedAt), 'PPpp', { locale: es })}
                                                </Typography>
                                            </Box>
                                        }
                                        secondary={
                                            <>
                                                <Box mt={1} display="flex" flexDirection="column" gap={0.5}>
                                                    <Typography variant="body2">
                                                        <strong>Antes:</strong> {formatValue(h.oldValue, h.field)}
                                                    </Typography>
                                                    <Typography variant="body2">
                                                        <strong>Después:</strong> {formatValue(h.newValue, h.field)}
                                                    </Typography>
                                                </Box>
                                                {h.changedBy && (
                                                    <Typography variant="caption" color="text.secondary" mt={1}>
                                                        Modificado por: {h.changedBy}
                                                    </Typography>
                                                )}
                                            </>
                                        }
                                    />
                                </ListItem>
                                {index < history.length - 1 && <Divider />}
                            </div>
                        ))}
                    </List>
                )}
            </DialogContent>

            <DialogActions sx={{ bgcolor: 'background.paper', borderTop: 1, borderColor: 'divider' }}>
                <Button
                    onClick={onClose}
                    variant="outlined"
                    sx={{ borderRadius: 2 }}
                >
                    Cerrar
                </Button>
            </DialogActions>
        </Dialog>
    );
}