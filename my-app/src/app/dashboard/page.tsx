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
    const [editActivityId, setEditActivityId] = useState<{ taskId: string; activityId: string } | null>(null);
    const [editActivityTitle, setEditActivityTitle] = useState<string>('');

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

        // Define the task as not completed when adding a new activity
        await updateDoc(taskRef, {
            activities: updatedActivities,
            completed: false,
        });

        setTasks(tasks.map(task => (task.id === taskId ? { ...task, activities: updatedActivities, completed: false } : task)));
        setActivityTitles({ ...activityTitles, [taskId]: '' });
    };

    const updateActivity = async (taskId: string, activityId: string) => {
        if (!editActivityTitle) return;

        const taskRef = doc(db, 'tasks', taskId);
        const updatedActivities = tasks.find(task => task.id === taskId)?.activities.map(activity =>
            activity.id === activityId ? { ...activity, title: editActivityTitle } : activity
        ) || [];

        try {
            await updateDoc(taskRef, {
                activities: updatedActivities,
            });
            setTasks(tasks.map(task => (task.id === taskId ? { ...task, activities: updatedActivities } : task)));
            setEditActivityId(null);
            setEditActivityTitle('');
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
            checkTaskCompletion(taskId, updatedActivities);
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
            window.location.reload();
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

    const calculateCompletionPercentage = (activities: { completed: boolean }[]) => {
        const completedCount = activities.filter(activity => activity.completed).length;
        return Math.floor((completedCount / activities.length) * 100) || 0;
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
                    className="border rounded p-2 w-full"
                />
                <button type="submit" className="bg-blue-500 text-white p-2 rounded mt-2">
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
                                        className="border rounded p-1 flex-grow mr-2"
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
                                            setEditTaskTitle(task.title);
                                        }} className="bg-yellow-500 text-white p-1 rounded mr-2">
                                            Editar
                                        </button>
                                    )}
                                    <button onClick={() => deleteTask(task.id)} className="bg-red-500 text-white p-1 rounded">
                                        Excluir
                                    </button>
                                </div>
                            </div>
                            {/* Porcentagem de conclusão abaixo do título da tarefa */}
                            <div className="text-sm text-gray-600 mt-1">
                                {calculateCompletionPercentage(task.activities)}% concluído
                            </div>
                            <div className="mt-2">
                                <input
                                    type="text"
                                    value={activityTitles[task.id] || ''}
                                    onChange={(e) => setActivityTitles({ ...activityTitles, [task.id]: e.target.value })}
                                    placeholder="Nova Atividade"
                                    className="border rounded p-2 w-full mt-2"
                                />
                                <button onClick={() => addActivity(task.id)} className="bg-blue-500 text-white p-2 rounded mt-2">
                                    Adicionar Atividade
                                </button>
                            </div>
                            <ul>
                                {task.activities.map(activity => (
                                    <li key={activity.id} className="flex justify-between mt-2">
                                        <span className={`${activity.completed ? 'line-through text-gray-500' : ''}`}>
                                            {editActivityId && editActivityId.taskId === task.id && editActivityId.activityId === activity.id ? (
                                                <input
                                                    type="text"
                                                    value={editActivityTitle}
                                                    onChange={(e) => setEditActivityTitle(e.target.value)}
                                                    className="border rounded p-1 mr-2"
                                                />
                                            ) : (
                                                activity.title
                                            )}
                                        </span>
                                        <div>
                                            {editActivityId && editActivityId.taskId === task.id && editActivityId.activityId === activity.id ? (
                                                <button onClick={() => updateActivity(task.id, activity.id)} className="bg-green-500 text-white p-1 rounded mr-2">
                                                    Salvar
                                                </button>
                                            ) : (
                                                <>
                                                    <button onClick={() => {
                                                        setEditActivityId({ taskId: task.id, activityId: activity.id });
                                                        setEditActivityTitle(activity.title);
                                                    }} className="bg-yellow-500 text-white p-1 rounded mr-2">
                                                        Editar
                                                    </button>
                                                    <button onClick={() => deleteActivity(task.id, activity.id)} className="bg-red-500 text-white p-1 rounded mr-2">
                                                        Excluir
                                                    </button>
                                                    {!activity.completed && (
                                                        <button onClick={() => completeActivity(task.id, activity.id)} className="bg-blue-500 text-white p-1 rounded">
                                                            Concluir
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </li>
                    ))
                ) : (
                    <p>Nenhuma tarefa encontrada.</p>
                )}
            </ul>
        </div>
    );
};

export default Dashboard;
