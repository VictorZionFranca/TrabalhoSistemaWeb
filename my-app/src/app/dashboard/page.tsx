"use client";

import { useEffect, useState, useCallback } from 'react';
import { collection, addDoc, deleteDoc, doc, updateDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase'; // ajuste o caminho conforme necessário
import { useSession } from 'next-auth/react';

interface Task {
    id: string;
    title: string;
    userId: string | undefined;
    activities: { id: string; title: string }[]; // Modificado para incluir um id na atividade
    completed: boolean; // Adiciona uma propriedade para verificar se a tarefa está concluída
}

const Dashboard = () => {
    const { data: session } = useSession();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [activityTitles, setActivityTitles] = useState<{ [key: string]: string }>({}); // Estado para atividades
    const [editTaskId, setEditTaskId] = useState<string | null>(null); // Para identificar qual tarefa está sendo editada
    const [editTaskTitle, setEditTaskTitle] = useState<string>(''); // Título da tarefa a ser editada
    const [editActivity, setEditActivity] = useState<{ taskId: string; activityId: string; title: string } | null>(null); // Para identificar qual atividade está sendo editada

    const fetchTasks = useCallback(async () => {
        if (session) {
            const q = query(collection(db, 'tasks'), where("userId", "==", session.user.id)); // Filtra tarefas pelo userId
            const querySnapshot = await getDocs(q);
            const tasksData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Task[];
            setTasks(tasksData);
        }
    }, [session]);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    const addTask = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!newTaskTitle) return;

        try {
            const docRef = await addDoc(collection(db, 'tasks'), {
                title: newTaskTitle,
                userId: session?.user?.id,
                activities: [],
                completed: false, // Inicializa como não concluída
            });
            setTasks([...tasks, { id: docRef.id, title: newTaskTitle, userId: session?.user?.id, activities: [], completed: false }]);
            setNewTaskTitle('');
        } catch (error) {
            console.error("Error adding task: ", error);
        }
    };

    const deleteTask = async (taskId: string) => {
        try {
            await deleteDoc(doc(db, 'tasks', taskId));
            setTasks(tasks.filter(task => task.id !== taskId));
        } catch (error) {
            console.error("Error deleting task: ", error);
        }
    };

    const addActivity = async (taskId: string) => {
        if (!taskId || !activityTitles[taskId]) return;

        const taskRef = doc(db, 'tasks', taskId);
        const newActivity = { id: Date.now().toString(), title: activityTitles[taskId] }; // Gera um ID único para a nova atividade
        const updatedActivities = [...(tasks.find(task => task.id === taskId)?.activities || []), newActivity];

        try {
            await updateDoc(taskRef, {
                activities: updatedActivities,
            });
            setTasks(tasks.map(task => (task.id === taskId ? { ...task, activities: updatedActivities } : task)));
            setActivityTitles({ ...activityTitles, [taskId]: '' }); // Limpa o campo de entrada para essa tarefa
        } catch (error) {
            console.error("Error adding activity: ", error);
        }
    };

    const updateActivity = async (taskId: string, activityId: string) => {
        if (!editActivity?.title) return;

        const taskRef = doc(db, 'tasks', taskId);
        const updatedActivities = tasks.find(task => task.id === taskId)?.activities.map(activity =>
            activity.id === activityId ? { ...activity, title: editActivity.title } : activity
        ) || [];

        try {
            await updateDoc(taskRef, {
                activities: updatedActivities,
            });
            setTasks(tasks.map(task => (task.id === taskId ? { ...task, activities: updatedActivities } : task)));
            setEditActivity(null); // Limpa o campo de edição
        } catch (error) {
            console.error("Error updating activity: ", error);
        }
    };

    const updateTaskTitle = async (taskId: string) => {
        if (!editTaskTitle) return;

        const taskRef = doc(db, 'tasks', taskId);
        try {
            await updateDoc(taskRef, {
                title: editTaskTitle,
            });
            setTasks(tasks.map(task => (task.id === taskId ? { ...task, title: editTaskTitle } : task)));
            setEditTaskId(null); // Limpa o campo de edição
            setEditTaskTitle(''); // Limpa o título de edição
        } catch (error) {
            console.error("Error updating task title: ", error);
        }
    };

    // Função para concluir uma tarefa
    const completeTask = async (taskId: string) => {
        const taskRef = doc(db, 'tasks', taskId);
        try {
            await updateDoc(taskRef, {
                completed: true,
            });
            setTasks(tasks.map(task => (task.id === taskId ? { ...task, completed: true } : task)));
        } catch (error) {
            console.error("Error completing task: ", error);
        }
    };

    return (
        <div className="container mx-auto p-5">
            <h1 className="text-2xl mb-4">Dashboard</h1>
            <form onSubmit={addTask} className="mb-4">
                <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="Nova Tarefa"
                    className="border rounded p-2"
                />
                <button type="submit" className="bg-blue-500 text-white p-2 rounded">
                    Adicionar
                </button>
            </form>

            <h2 className="text-xl mb-2">Tarefas:</h2>
            <ul>
                {tasks.length > 0 ? (
                    tasks.map(task => (
                        <li key={task.id} className={`border p-2 rounded mb-2 ${task.completed ? 'bg-green-200' : ''}`}>
                            <div className="flex justify-between">
                                {editTaskId === task.id ? (
                                    <input
                                        type="text"
                                        defaultValue={task.title}
                                        onChange={(e) => setEditTaskTitle(e.target.value)}
                                        className="border rounded p-1"
                                        onBlur={() => updateTaskTitle(task.id)} // Salva ao sair do campo
                                    />
                                ) : (
                                    <span>{task.title}</span>
                                )}
                                <div>
                                    {editTaskId === task.id ? (
                                        <button onClick={() => updateTaskTitle(task.id)} className="bg-green-500 text-white p-1 rounded mr-2">
                                            Salvar
                                        </button>
                                    ) : (
                                        <>
                                            <button onClick={() => setEditTaskId(task.id)} className="bg-yellow-500 text-white p-1 rounded mr-2">
                                                Editar
                                            </button>
                                            <button onClick={() => completeTask(task.id)} className="bg-green-500 text-white p-1 rounded mr-2">
                                                Concluir
                                            </button>
                                        </>
                                    )}
                                    <button onClick={() => deleteTask(task.id)} className="bg-red-500 text-white p-1 rounded">
                                        Excluir
                                    </button>
                                </div>
                            </div>
                            <div>
                                <input
                                    type="text"
                                    value={activityTitles[task.id] || ''} // Controla o valor da atividade para cada tarefa
                                    onChange={(e) => setActivityTitles({ ...activityTitles, [task.id]: e.target.value })} // Atualiza apenas a atividade da tarefa específica
                                    placeholder="Adicionar atividade"
                                    className="border rounded p-1 mt-2"
                                />
                                <button 
                                    onClick={() => {
                                        addActivity(task.id); // Passa o id da tarefa para adicionar a atividade
                                    }} 
                                    className="bg-blue-500 text-white p-1 rounded ml-2">
                                    Adicionar Atividade
                                </button>
                            </div>
                            {task.activities.length > 0 && (
                                <div className="mt-2">
                                    <h3 className="text-lg">Atividades:</h3>
                                    <ul>
                                        {task.activities.map(activity => (
                                            <li key={activity.id} className="flex justify-between items-center border p-2 rounded mb-1">
                                                {editActivity?.activityId === activity.id && editActivity?.taskId === task.id ? (
                                                    <input
                                                        type="text"
                                                        value={editActivity.title}
                                                        onChange={(e) => setEditActivity({ ...editActivity, title: e.target.value })} // Atualiza o título da atividade em edição
                                                        className="border rounded p-1"
                                                        onBlur={() => updateActivity(task.id, activity.id)} // Salva ao sair do campo
                                                    />
                                                ) : (
                                                    <span>{activity.title}</span>
                                                )}
                                                <div>
                                                    {editActivity?.activityId === activity.id && editActivity?.taskId === task.id ? (
                                                        <button onClick={() => updateActivity(task.id, activity.id)} className="bg-green-500 text-white p-1 rounded mr-2">
                                                            Salvar
                                                        </button>
                                                    ) : (
                                                        <button onClick={() => setEditActivity({ taskId: task.id, activityId: activity.id, title: activity.title })} className="bg-yellow-500 text-white p-1 rounded mr-2">
                                                            Editar
                                                        </button>
                                                    )}
                                                    <button onClick={() => {
                                                        const updatedActivities = task.activities.filter(a => a.id !== activity.id);
                                                        updateDoc(doc(db, 'tasks', task.id), { activities: updatedActivities }); // Atualiza o Firestore
                                                        setTasks(tasks.map(t => t.id === task.id ? { ...t, activities: updatedActivities } : t)); // Atualiza o estado local
                                                    }} className="bg-red-500 text-white p-1 rounded">
                                                        Excluir
                                                    </button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </li>
                    ))
                ) : (
                    <li>Sem tarefas disponíveis</li>
                )}
            </ul>
        </div>
    );
};

export default Dashboard;
