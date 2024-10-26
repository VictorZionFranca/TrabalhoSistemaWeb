"use client";

import { useEffect, useState, useCallback } from 'react';
import { collection, addDoc, deleteDoc, doc, updateDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useSession } from 'next-auth/react';

interface Task {
    id: string;
    title: string;
    userId: string | undefined;
    activities: { id: string; title: string; completed: boolean }[];
    completed: boolean;
}

const Dashboard = () => {
    const { data: session } = useSession();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [activityTitles, setActivityTitles] = useState<{ [key: string]: string }>({});
    const [editTaskId, setEditTaskId] = useState<string | null>(null);
    const [editTaskTitle, setEditTaskTitle] = useState<string>('');
    const [editActivity, setEditActivity] = useState<{ taskId: string; activityId: string; title: string } | null>(null);

    const fetchTasks = useCallback(async () => {
        if (session) {
            const q = query(collection(db, 'tasks'), where("userId", "==", session.user.id));
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
                completed: false,
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
        const newActivity = { id: Date.now().toString(), title: activityTitles[taskId], completed: false };
        const updatedActivities = [...(tasks.find(task => task.id === taskId)?.activities || []), newActivity];

        try {
            await updateDoc(taskRef, {
                activities: updatedActivities,
            });
            setTasks(tasks.map(task => (task.id === taskId ? { ...task, activities: updatedActivities } : task)));
            setActivityTitles({ ...activityTitles, [taskId]: '' });
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
            setEditActivity(null);
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
            setEditTaskId(null);
            setEditTaskTitle('');
        } catch (error) {
            console.error("Error updating task title: ", error);
        }
    };

    const completeActivity = async (taskId: string, activityId: string) => {
        const taskRef = doc(db, 'tasks', taskId);
        const updatedActivities = tasks.find(task => task.id === taskId)?.activities.map(activity =>
            activity.id === activityId ? { ...activity, completed: true } : activity
        ) || [];

        try {
            await updateDoc(taskRef, {
                activities: updatedActivities,
            });
            setTasks(tasks.map(task => (task.id === taskId ? { ...task, activities: updatedActivities } : task)));
            checkTaskCompletion(taskId, updatedActivities); // Verifica se a tarefa deve ser concluída
        } catch (error) {
            console.error("Error completing activity: ", error);
        }
    };

    const checkTaskCompletion = async (taskId: string, activities: { id: string; title: string; completed: boolean }[]) => {
        const allCompleted = activities.every(activity => activity.completed);
        const taskRef = doc(db, 'tasks', taskId);

        if (allCompleted) {
            await updateDoc(taskRef, {
                completed: true,
            });
            setTasks(tasks.map(task => (task.id === taskId ? { ...task, completed: true } : task)));
        }
    };

    const deleteActivity = async (taskId: string, activityId: string) => {
        const taskRef = doc(db, 'tasks', taskId);
        const updatedActivities = tasks.find(task => task.id === taskId)?.activities.filter(activity => activity.id !== activityId) || [];

        try {
            await updateDoc(taskRef, {
                activities: updatedActivities,
            });
            setTasks(tasks.map(task => (task.id === taskId ? { ...task, activities: updatedActivities } : task)));
        } catch (error) {
            console.error("Error deleting activity: ", error);
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
                                        value={editTaskTitle}
                                        onChange={(e) => setEditTaskTitle(e.target.value)}
                                        placeholder="Editar Tarefa"
                                        className="border rounded p-1"
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
                                        <button onClick={() => {
                                            setEditTaskId(task.id);
                                            setEditTaskTitle(task.title); // Set the current title for editing
                                        }} className="bg-yellow-500 text-white p-1 rounded mr-2">
                                            Editar
                                        </button>
                                    )}
                                    <button onClick={() => deleteTask(task.id)} className="bg-red-500 text-white p-1 rounded">
                                        Excluir
                                    </button>
                                </div>
                            </div>
                            <div>
                                <input
                                    type="text"
                                    value={activityTitles[task.id] || ''}
                                    onChange={(e) => setActivityTitles({ ...activityTitles, [task.id]: e.target.value })}
                                    placeholder="Adicionar atividade"
                                    className="border rounded p-1 mt-2"
                                />
                                <button 
                                    onClick={() => {
                                        addActivity(task.id);
                                    }} 
                                    className="bg-blue-500 text-white p-1 rounded ml-2">
                                    Adicionar Atividade
                                </button>
                            </div>
                            {task.activities.length > 0 && (
                                <div>
                                    <h3 className="text-lg mt-2">Atividades:</h3>
                                    <ul>
                                        {task.activities.map(activity => (
                                            <li key={activity.id} className="flex justify-between items-center">
                                                {editActivity && editActivity.activityId === activity.id ? (
                                                    <input
                                                        type="text"
                                                        defaultValue={editActivity.title}
                                                        onChange={(e) => setEditActivity({ ...editActivity, title: e.target.value })}
                                                        onBlur={() => updateActivity(task.id, activity.id)} // Salva ao sair do campo
                                                        className="border rounded p-1"
                                                    />
                                                ) : (
                                                    <span className={activity.completed ? 'line-through text-gray-500' : ''}>{activity.title}</span>
                                                )}
                                                <div>
                                                    <button 
                                                        onClick={() => {
                                                            if (!editActivity) {
                                                                setEditActivity({ taskId: task.id, activityId: activity.id, title: activity.title });
                                                            } else {
                                                                setEditActivity(null);
                                                            }
                                                        }} 
                                                        className="bg-yellow-500 text-white p-1 rounded mr-2">
                                                        {editActivity && editActivity.activityId === activity.id ? 'Cancelar' : 'Editar'}
                                                    </button>
                                                    <button onClick={() => completeActivity(task.id, activity.id)} className="bg-green-500 text-white p-1 rounded mr-2">
                                                        Concluir
                                                    </button>
                                                    <button onClick={() => deleteActivity(task.id, activity.id)} className="bg-red-500 text-white p-1 rounded">
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
                    <li className="text-gray-500">Nenhuma tarefa encontrada.</li>
                )}
            </ul>
        </div>
    );
};

export default Dashboard;
