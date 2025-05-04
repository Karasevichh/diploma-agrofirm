'use client';

import { useState, useEffect } from 'react';
import { fetchResources, deleteResource, editResource, addResource } from '@/store/slices/resourceSlice';
import { fetchFields } from '@/store/slices/fieldsSlice';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import styles from '../styles/dashboard.module.scss';

type TaskStatus = 'planned' | 'in_progress' | 'completed' | 'delayed';

const PRODUCTION_STAGES = [
  { id: 1, name: 'Подготовка почвы' },
  { id: 2, name: 'Посев' },
  { id: 3, name: 'Удобрение' },
  { id: 4, name: 'Полив' },
  { id: 5, name: 'Защита растений' },
  { id: 6, name: 'Уборка урожая' },
];

export default function ResourcesClient() {
    const [newEquipment, setNewEquipment] = useState<string>('');
    const [newWorkers, setNewWorkers] = useState<string>('');
    const [newTask, setNewTask] = useState<string>('');
    const [editingResource, setEditingResource] = useState<any>(null);
    const [filterTask, setFilterTask] = useState<string>('');
    const [selectedField, setSelectedField] = useState('');
    const [filterWorkers, setFilterWorkers] = useState<string>('');
    const [duration, setDuration] = useState<string>(''); 
    const [filterDate, setFilterDate] = useState<string>('');
    const [errors, setErrors] = useState<string[]>([]);
    const [selectedStage, setSelectedStage] = useState<string>('');
    const [status, setStatus] = useState<TaskStatus>('planned');
    const [reminders, setReminders] = useState<{taskId: number, message: string, date: string}[]>([]);
    const [yieldData, setYieldData] = useState<{fieldId: number, predictedYield: number}[]>([]);

    const MAX_WORKERS = 50;
    const dispatch = useAppDispatch();
    const resources = useAppSelector(state => state.resources.data);
    const  fields = useAppSelector((state) => state.fields.data);

    useEffect(() => {
        dispatch(fetchResources());
        dispatch(fetchFields());
    }, [dispatch]);

    useEffect(() => {
        setYieldData(calculatePredictedYield());
    }, [resources, fields]);

    useEffect(() => {
        const interval = setInterval(checkOverdueTasks, 60000);
        return () => clearInterval(interval);
    }, [resources]);

    const validateInputs = () => {
        const validationErrors: string[] = [];
        if (!newEquipment.trim()) validationErrors.push('Поле "Техника" обязательно.');
        if (!newTask.trim()) validationErrors.push('Поле "Задача" обязательно.');
        if (!selectedStage) validationErrors.push('Поле "Этап производства" обязательно.');
        const workers = parseInt(newWorkers);
        if (!newWorkers || isNaN(workers) || workers <= 0) {
          validationErrors.push('Поле "Количество работников" должно быть положительным числом.');
        } else if (workers > MAX_WORKERS) {
          validationErrors.push(`Максимальное количество работников не должно превышать ${MAX_WORKERS}.`);
        }
        setErrors(validationErrors);
        return validationErrors.length === 0;
    };

    const filteredResources = resources.filter((resource) => {
        const matchesTask = filterTask ? resource.task.includes(filterTask) : true;
        const matchesWorkers = filterWorkers
          ? resource.workers.toString().includes(filterWorkers)
          : true;
        const matchesDate = filterDate
          ? new Date(resource.createdAt!).toLocaleDateString().includes(filterDate)
          : true;
        return matchesTask && matchesWorkers && matchesDate;
    });

    const handlePlanResource = async () => {
        if (!validateInputs()) return;
      
        // Подготовка данных с явным приведением типов
        const resourceData = {
          equipment: String(newEquipment),
          workers: Number(newWorkers),
          task: String(newTask),
          fieldId: Number(selectedField),
          stageId: Number(selectedStage),
          status: String(status),
          startTime: new Date().toISOString(),
          duration: Number(duration) * 60 * 1000,
        };
      
        console.log('Submitting:', resourceData);
      
        try {
          const result = await dispatch(addResource(resourceData)).unwrap();
          console.log('Success:', result);
      
          // Сброс формы
          setNewEquipment('');
          setNewWorkers('');
          setNewTask('');
          setSelectedField('');
          setSelectedStage('');
          setDuration('');
      
        } catch (error) {
          console.error('Full error:', error);
          alert(`Ошибка: ${error?.message || 'Неизвестная ошибка'}`);
        }
      };

    const handleDeleteResource = (id: number) => {
        dispatch(deleteResource(id));
    };

    const handleEditResource = (resource: any) => {
        setEditingResource(resource);
        setNewEquipment(resource.equipment);
        setNewWorkers(resource.workers.toString());
        setNewTask(resource.task);
        setSelectedField(resource.fieldId.toString());
        setSelectedStage(resource.stageId?.toString() || '');
        setStatus(resource.status || 'planned');
    };

    const handleUpdateResource = () => {
        if (!editingResource) return;

        const updatedResource = {
            ...editingResource,
            equipment: newEquipment,
            workers: parseInt(newWorkers),
            task: newTask,
            fieldId: parseInt(selectedField),
            stageId: parseInt(selectedStage),
            status: status,
        };

        dispatch(editResource(updatedResource));
        setEditingResource(null);
        setNewEquipment('');
        setNewWorkers('');
        setNewTask('');
        setSelectedField('');
        setSelectedStage('');
    };

    const handleStatusChange = async (resourceId: number, newStatus: TaskStatus) => {
        try {
          const resourceToUpdate = resources.find(r => r.id === resourceId);
          if (!resourceToUpdate) return;
      
          const updatedResource = {
            ...resourceToUpdate,
            status: newStatus
          };
      
          // Логируем данные перед отправкой
          console.log('Updating resource:', updatedResource);
      
          const result = await dispatch(editResource(updatedResource)).unwrap();
          console.log('Update successful:', result);
          
          // Обновляем список ресурсов
          dispatch(fetchResources());
        } catch (error) {
          console.error('Update failed:', error);
          alert('Ошибка при изменении статуса');
        }
      };

    const calculateStatistics = () => {
        const totalWorkers = resources.reduce((acc, resource) => acc + resource.workers, 0);
        const uniqueEquipment = new Set(resources.map((resource) => resource.equipment)).size;
        const totalTasks = resources.length;
        const completedTasks = resources.filter(r => r.status === 'completed').length;
    
        return {
          totalWorkers,
          uniqueEquipment,
          totalTasks,
          completedTasks,
          completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
        };
    };

    const calculatePredictedYield = () => {
        // 1. Находим поля с задачами
        const fieldsWithResources = fields.filter(field => 
          resources.some(r => r.fieldId === field.id)
        );
      
        // 2. Расчет только для этих полей
        return fieldsWithResources.map(field => {
          const fieldResources = resources.filter(r => r.fieldId === field.id);
          const tasksCount = fieldResources.length;
          const workersSum = fieldResources.reduce((sum, r) => sum + r.workers, 0);
          
          const baseYield = field.harvest?.yield || 0;
          const predictedYield = baseYield * (1 + (tasksCount * 0.05) + (workersSum * 0.01));
          
          return {
            fieldId: field.id,
            predictedYield: parseFloat(predictedYield.toFixed(2)),
            area: field.area,
            totalYield: parseFloat((predictedYield * field.area).toFixed(2)) // Добавляем общий урожай
          };
        });
      };

    const checkOverdueTasks = () => {
        const now = new Date();
        const overdueTasks = resources.filter(resource => {
          const endTime = new Date(new Date(resource.startTime).getTime() + resource.duration);
          return endTime < now && resource.status !== 'completed';
        });
    
        if (overdueTasks.length > 0) {
          const newReminders = overdueTasks.map(task => ({
            taskId: task.id,
            message: `Задача "${task.task}" просрочена!`,
            date: new Date().toLocaleString()
          }));
          
          setReminders(prev => [...new Set([...prev, ...newReminders])]);
        }
    };

    const stats = calculateStatistics();

    return (
        <div className={styles.container}>
            <h1>Планирование ресурсов</h1>
            <div className={styles.formGroup}>
                <input
                    type="text"
                    placeholder="Техника"
                    value={newEquipment}
                    onChange={(e) => setNewEquipment(e.target.value)}
                />
                <input
                    type="number"
                    placeholder="Количество работников"
                    value={newWorkers}
                    onChange={(e) => setNewWorkers(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Задача"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                />
                <input
                    type="number"
                    placeholder="Длительность задачи (мин)"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                />
                <select value={selectedField} onChange={(e) => setSelectedField(e.target.value)}>
                    <option value="">-- Выберите поле --</option>
                    {fields.map((field) => (
                        <option key={field.id} value={field.id}>
                            Поле #{field.id} - {field.crop} ({field.area} га)
                        </option>
                    ))}
                </select>
                <select 
                    value={selectedStage} 
                    onChange={(e) => setSelectedStage(e.target.value)}
                >
                    <option value="">-- Выберите этап --</option>
                    {PRODUCTION_STAGES.map(stage => (
                        <option key={stage.id} value={stage.id}>
                            {stage.name}
                        </option>
                    ))}
                </select>
                <select 
                    value={status} 
                    onChange={(e) => setStatus(e.target.value as TaskStatus)}
                >
                    <option value="planned">Запланировано</option>
                    <option value="in_progress">В процессе</option>
                    <option value="completed">Завершено</option>
                </select>
                {editingResource ? (
                    <button onClick={handleUpdateResource}>Обновить</button>
                ) : (
                    <button onClick={handlePlanResource}>Запланировать</button>
                )}
            </div>
            
            <h2>Фильтры</h2>
            <div className={styles.filters}>
                <input
                    type="text"
                    placeholder="Фильтр по задаче"
                    value={filterTask}
                    onChange={(e) => setFilterTask(e.target.value)}
                />
                <input
                    type="number"
                    placeholder="Фильтр по работникам"
                    value={filterWorkers}
                    onChange={(e) => setFilterWorkers(e.target.value)}
                />
                <input
                    type="text"
                    placeholder="Фильтр по дате"
                    value={filterDate}
                    onChange={(e) => setFilterDate(e.target.value)}
                />
            </div>
            
            {errors.length > 0 && (
                <div className={styles.error}>
                    <h3>Ошибки:</h3>
                    <ul>
                        {errors.map((error, index) => (
                            <li key={index}>{error}</li>
                        ))}
                    </ul>
                </div>
            )}
            
            <div className={styles.statistics}>
                <h2>Статистика</h2>
                <p>Общее количество работников: {stats.totalWorkers}</p>
                <p>Количество уникальной техники: {stats.uniqueEquipment}</p>
                <p>Общее количество задач: {stats.totalTasks}</p>
                <p>Выполнено задач: {stats.completedTasks} ({stats.completionRate}%)</p>
            </div>
            
            <div className={styles.yieldPrediction}>
                <h2>Прогноз урожайности</h2>
                <table className={styles.table}>
                    <thead>
                        <tr>
                            <th>Поле</th>
                            <th>Культура</th>
                            <th>Прогнозируемая урожайность (т/га)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {yieldData.map((item) => {
                            const field = fields.find(f => f.id === item.fieldId);
                            const harvest = field?.harvest;
                            return (
                                <tr key={item.fieldId}>
                                    <td>Поле #{item.fieldId}</td>
                                    <td>{harvest?.crop || 'Не указано'}</td>
                                    <td>{item.predictedYield}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {reminders.length > 0 && (
                <div className={styles.reminders}>
                    <h2>Напоминания</h2>
                    <ul>
                        {reminders.map((reminder, index) => (
                            <li key={index}>
                                <span className={styles.reminderDate}>{reminder.date}</span>
                                <span className={styles.reminderMessage}>{reminder.message}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            
            <h2>Список запланированных ресурсов</h2>
            <table className={styles.table}>
                <thead>
                    <tr>
                        <th>Техника</th>
                        <th>Работники</th>
                        <th>Задача</th>
                        <th>Поле</th>
                        <th>Этап</th>
                        <th>Статус</th>
                        <th>Дата</th>
                        <th>Действия</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredResources.map((resource) => (
                        <tr key={resource.id} className={styles[resource.status]}>
                            <td>{resource.equipment}</td>
                            <td>{resource.workers}</td>
                            <td>{resource.task}</td>
                            <td>{resource.fieldId || 'Не выбрано'}</td>
                            <td>
                                {PRODUCTION_STAGES.find(s => s.id === resource.stageId)?.name || '-'}
                            </td>
                            <td>
                                <select
                                    value={resource.status}
                                    onChange={(e) => handleStatusChange(resource.id, e.target.value as TaskStatus)}
                                    disabled={!resource.id} // Отключаем если нет ID
                                    className={styles.statusSelect}
                                >
                                    <option value="planned">Запланировано</option>
                                    <option value="in_progress">В процессе</option>
                                    <option value="completed">Завершено</option>
                                </select>
                            </td>
                            <td>{new Date(resource.createdAt!).toLocaleDateString()}</td>
                            <td>
                                <button onClick={() => handleEditResource(resource)}>
                                    Редактировать
                                </button>
                                <button onClick={() => handleDeleteResource(resource.id)}>
                                    Удалить
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}


// 'use client';

// import { useState, useEffect } from 'react';
// import { fetchResources, deleteResource, editResource } from '@/store/slices/resourceSlice';
// import { useAppDispatch, useAppSelector } from '@/store/hooks';
// import styles from '../styles/dashboard.module.scss';

// export default function ResourcesClient() {
//     const [newEquipment, setNewEquipment] = useState<string>('');
//     const [newWorkers, setNewWorkers] = useState<string>('');
//     const [newTask, setNewTask] = useState<string>('');
//     const [editingResource, setEditingResource] = useState<any>(null);
//     const [filterTask, setFilterTask] = useState<string>('');
//     const [filterWorkers, setFilterWorkers] = useState<string>('');
//     const [filterDate, setFilterDate] = useState<string>('');
//     const [errors, setErrors] = useState<string[]>([]);
//     const MAX_WORKERS = 50;
//     const dispatch = useAppDispatch();
//     const resources = useAppSelector(state => state.resources.data)

//     useEffect(() => {
//         dispatch(fetchResources());
//     }, [dispatch])


//     const validateInputs = () => {
//         const validationErrors: string[] = [];
//         if (!newEquipment.trim()) validationErrors.push('Поле "Техника" обязательно.');
//         if (!newTask.trim()) validationErrors.push('Поле "Задача" обязательно.');
//         const workers = parseInt(newWorkers);
//         if (!newWorkers || isNaN(workers) || workers <= 0) {
//           validationErrors.push('Поле "Количество работников" должно быть положительным числом.');
//         } else if (workers > MAX_WORKERS) {
//           validationErrors.push(`Максимальное количество работников не должно превышать ${MAX_WORKERS}.`);
//         }
//         setErrors(validationErrors);
//         return validationErrors.length === 0;
//       };

//     const filteredResources = resources.filter((resource) => {
//         const matchesTask = filterTask ? resource.task.includes(filterTask) : true;
//         const matchesWorkers = filterWorkers
//           ? resource.workers.toString().includes(filterWorkers)
//           : true;
//         const matchesDate = filterDate
//           ? new Date(resource.createdAt!).toLocaleDateString().includes(filterDate)
//           : true;
//         return matchesTask && matchesWorkers && matchesDate;
//       });

//   // Добавление ресурса
//     const handlePlanResource = async () => {
//         if (!validateInputs()) return;

//         const newResource = { 
//             equipment: newEquipment, 
//             workers: parseInt(newWorkers), 
//             task: newTask };
//         try {
//         const res = await fetch('/api/resources', {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify(newResource),
//         });

//         dispatch(fetchResources());
//         setNewEquipment('');
//         setNewWorkers('');
//         setNewTask('');
//         } catch (error) {
//         console.error('Ошибка при добавлении ресурса:', error);
//         }
//     };

//     const handleDeleteResource = (id: number) => {
//         dispatch(deleteResource(id));
//         console.log(id)
//     };

//     // Обновление ресурса
//     const handleEditResource = (resource: any) => {
//         setEditingResource(resource);
//         setNewEquipment(resource.equipment);
//         setNewWorkers(resource.workers.toString());
//         setNewTask(resource.task);
//     };

//     const handleUpdateResource = () => {
//         if (!editingResource) return;

//         const updatedResource = {
//             ...editingResource,
//             equipment: newEquipment,
//             workers: parseInt(newWorkers),
//             task: newTask,
//         };

//         dispatch(editResource(updatedResource));
//         setEditingResource(null);
//         setNewEquipment('');
//         setNewWorkers('');
//         setNewTask('');
//     };

//     const calculateStatistics = () => {
//         const totalWorkers = resources.reduce((acc, resource) => acc + resource.workers, 0);
//         const uniqueEquipment = new Set(resources.map((resource) => resource.equipment)).size;
//         const totalTasks = resources.length;
    
//         return {
//           totalWorkers,
//           uniqueEquipment,
//           totalTasks,
//         };
//       };
    
//     const stats = calculateStatistics();

//     return (
//         <div className={styles.container}>
//             <h1>Планирование ресурсов</h1>
//             <div>
//                 <input
//                     type="text"
//                     placeholder="Техника"
//                     value={newEquipment}
//                     onChange={(e) => setNewEquipment(e.target.value)}
//                 />
//                 <input
//                     type="number"
//                     placeholder="Количество работников"
//                     value={newWorkers}
//                     onChange={(e) => setNewWorkers(e.target.value)}
//                 />
//                 <input
//                     type="text"
//                     placeholder="Задача"
//                     value={newTask}
//                     onChange={(e) => setNewTask(e.target.value)}
//                 />
//                 {editingResource ? (
//                     <button onClick={handleUpdateResource}>Обновить</button>
//                 ) : (
//                     <button onClick={handlePlanResource}>Запланировать</button>
//                 )}
//             </div>
//             <h2>Фильтры</h2>
//             <div>
//                 <input
//                 type="text"
//                 placeholder="Фильтр по задаче"
//                 value={filterTask}
//                 onChange={(e) => setFilterTask(e.target.value)}
//                 />
//                 <input
//                 type="number"
//                 placeholder="Фильтр по работникам"
//                 value={filterWorkers}
//                 onChange={(e) => setFilterWorkers(e.target.value)}
//                 />
//                 <input
//                 type="text"
//                 placeholder="Фильтр по дате"
//                 value={filterDate}
//                 onChange={(e) => setFilterDate(e.target.value)}
//                 />
//             </div>
//             {errors.length > 0 && (
//                 <div className={styles.error}>
//                     <h3>Ошибки:</h3>
//                     <ul>
//                         {errors.map((error, index) => (
//                             <li key={index}>{error}</li>
//                         ))}
//                     </ul>
//                 </div>
//             )}
//             <div className={styles.statistics}>
//                 <h2>Статистика</h2>
//                 <p>Общее количество работников: {stats.totalWorkers}</p>
//                 <p>Количество уникальной техники: {stats.uniqueEquipment}</p>
//                 <p>Общее количество задач: {stats.totalTasks}</p>
//             </div>
//             <h2>Список запланированных ресурсов</h2>
//             <table className={styles.table}>
//                 <thead>
//                     <tr>
//                         <th>Техника</th>
//                         <th>Работники</th>
//                         <th>Задача</th>
//                         <th>Дата</th>
//                         <th>Действия</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {filteredResources.map((resource) => (
//                         <tr key={resource.id}>
//                             <td>{resource.equipment}</td>
//                             <td>{resource.workers}</td>
//                             <td>{resource.task}</td>
//                             <td>{new Date(resource.createdAt!).toLocaleDateString()}</td>
//                             <td>
//                                 <button onClick={() => handleEditResource(resource)}>
//                                     Редактировать
//                                 </button>
//                                 <button onClick={() => handleDeleteResource(resource.id)}>
//                                     Удалить
//                                 </button>
//                             </td>
//                         </tr>
//                     ))}
//                 </tbody>
//             </table>
//         </div>
//     );
// }


// 'use client';

// import { useState, useEffect } from 'react';
// import { fetchResources, deleteResource, editResource, addResource } from '@/store/slices/resourceSlice';
// import { fetchFields } from '@/store/slices/fieldsSlice';
// import { useAppDispatch, useAppSelector } from '@/store/hooks';
// import styles from '../styles/dashboard.module.scss';

// export default function ResourcesClient() {
//     const [newEquipment, setNewEquipment] = useState<string>('');
//     const [newWorkers, setNewWorkers] = useState<string>('');
//     const [newTask, setNewTask] = useState<string>('');
//     const [editingResource, setEditingResource] = useState<any>(null);
//     const [filterTask, setFilterTask] = useState<string>('');
//     const [selectedField, setSelectedField] = useState('');
//     const [filterWorkers, setFilterWorkers] = useState<string>('');
//     const [duration, setDuration] = useState<string>(''); 
//     const [filterDate, setFilterDate] = useState<string>('');
//     const [errors, setErrors] = useState<string[]>([]);
//     const MAX_WORKERS = 50;
//     const dispatch = useAppDispatch();
//     const resources = useAppSelector(state => state.resources.data)
//     const fields = useAppSelector((state) => state.fields.data);

//     useEffect(() => {
//         dispatch(fetchResources());
//         dispatch(fetchFields());
//     }, [dispatch])


//     const validateInputs = () => {
//         const validationErrors: string[] = [];
//         if (!newEquipment.trim()) validationErrors.push('Поле "Техника" обязательно.');
//         if (!newTask.trim()) validationErrors.push('Поле "Задача" обязательно.');
//         const workers = parseInt(newWorkers);
//         if (!newWorkers || isNaN(workers) || workers <= 0) {
//           validationErrors.push('Поле "Количество работников" должно быть положительным числом.');
//         } else if (workers > MAX_WORKERS) {
//           validationErrors.push(`Максимальное количество работников не должно превышать ${MAX_WORKERS}.`);
//         }
//         setErrors(validationErrors);
//         return validationErrors.length === 0;
//       };

//     const filteredResources = resources.filter((resource) => {
//         const matchesTask = filterTask ? resource.task.includes(filterTask) : true;
//         const matchesWorkers = filterWorkers
//           ? resource.workers.toString().includes(filterWorkers)
//           : true;
//         const matchesDate = filterDate
//           ? new Date(resource.createdAt!).toLocaleDateString().includes(filterDate)
//           : true;
//         return matchesTask && matchesWorkers && matchesDate;
//       });

//   // Добавление ресурса
//   const handlePlanResource = async () => {
//     if (!validateInputs()) return;
  
//     const newResource = {
//       equipment: newEquipment,
//       workers: parseInt(newWorkers),
//       task: newTask,
//       fieldId: parseInt(selectedField),
//       startTime: new Date().toISOString(), // текущее время
//       duration: parseInt(duration) * 60 * 1000, // переводим из минут в миллисекунды
//     };
  
//     try {
//       await dispatch(addResource(newResource)).unwrap();
  
//       // Сброс полей формы
//       setNewEquipment('');
//       setNewWorkers('');
//       setNewTask('');
//       setSelectedField('');
//       setDuration('');
//     } catch (error) {
//       console.error('Ошибка при добавлении ресурса:', error);
//     }
//   };
//     const handleDeleteResource = (id: number) => {
//         dispatch(deleteResource(id));
//         console.log(id)
//     };

//     // Обновление ресурса
//     const handleEditResource = (resource: any) => {
//         setEditingResource(resource);
//         setNewEquipment(resource.equipment);
//         setNewWorkers(resource.workers.toString());
//         setNewTask(resource.task);
//         setSelectedField(resource.fieldId.toString());
//     };

//     const handleUpdateResource = () => {
//         if (!editingResource) return;

//         const updatedResource = {
//             ...editingResource,
//             equipment: newEquipment,
//             workers: parseInt(newWorkers),
//             task: newTask,
//             fieldId: parseInt(selectedField),
//         };

//         dispatch(editResource(updatedResource));
//         setEditingResource(null);
//         setNewEquipment('');
//         setNewWorkers('');
//         setNewTask('');
//         setSelectedField('');
//     };

//     const calculateStatistics = () => {
//         const totalWorkers = resources.reduce((acc, resource) => acc + resource.workers, 0);
//         const uniqueEquipment = new Set(resources.map((resource) => resource.equipment)).size;
//         const totalTasks = resources.length;
    
//         return {
//           totalWorkers,
//           uniqueEquipment,
//           totalTasks,
//         };
//       };
    
//     const stats = calculateStatistics();

//     return (
//         <div className={styles.container}>
//             <h1>Планирование ресурсов</h1>
//             <div>
//                 <input
//                     type="text"
//                     placeholder="Техника"
//                     value={newEquipment}
//                     onChange={(e) => setNewEquipment(e.target.value)}
//                 />
//                 <input
//                     type="number"
//                     placeholder="Количество работников"
//                     value={newWorkers}
//                     onChange={(e) => setNewWorkers(e.target.value)}
//                 />
//                 <input
//                     type="text"
//                     placeholder="Задача"
//                     value={newTask}
//                     onChange={(e) => setNewTask(e.target.value)}
//                 />
//                 <input
//                     type="number"
//                     placeholder="Длительность задачи (мин)"
//                     value={duration}
//                     onChange={(e) => setDuration(e.target.value)}
//                 />
//                 <select value={selectedField} onChange={(e) => setSelectedField(e.target.value)}>
//                     <option value="">-- Выберите поле --</option>
//                     {fields.map((field) => (
//                         <option key={field.id} value={field.id}>
//                             Поле #{field.id} - {field.crop} ({field.area} га)
//                         </option>
//                     ))}
//                 </select>
//                 {editingResource ? (
//                     <button onClick={handleUpdateResource}>Обновить</button>
//                 ) : (
//                     <button onClick={handlePlanResource}>Запланировать</button>
//                 )}
//             </div>
//             <h2>Фильтры</h2>
//             <div>
//                 <input
//                 type="text"
//                 placeholder="Фильтр по задаче"
//                 value={filterTask}
//                 onChange={(e) => setFilterTask(e.target.value)}
//                 />
//                 <input
//                 type="number"
//                 placeholder="Фильтр по работникам"
//                 value={filterWorkers}
//                 onChange={(e) => setFilterWorkers(e.target.value)}
//                 />
//                 <input
//                 type="text"
//                 placeholder="Фильтр по дате"
//                 value={filterDate}
//                 onChange={(e) => setFilterDate(e.target.value)}
//                 />
//             </div>
//             {errors.length > 0 && (
//                 <div className={styles.error}>
//                     <h3>Ошибки:</h3>
//                     <ul>
//                         {errors.map((error, index) => (
//                             <li key={index}>{error}</li>
//                         ))}
//                     </ul>
//                 </div>
//             )}
//             <div className={styles.statistics}>
//                 <h2>Статистика</h2>
//                 <p>Общее количество работников: {stats.totalWorkers}</p>
//                 <p>Количество уникальной техники: {stats.uniqueEquipment}</p>
//                 <p>Общее количество задач: {stats.totalTasks}</p>
//             </div>
//             <h2>Список запланированных ресурсов</h2>
//             <table className={styles.table}>
//                 <thead>
//                     <tr>
//                         <th>Техника</th>
//                         <th>Работники</th>
//                         <th>Задача</th>
//                         <th>Поле</th>
//                         <th>Дата</th>
//                         <th>Действия</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {filteredResources.map((resource) => (
//                         <tr key={resource.id}>
//                             <td>{resource.equipment}</td>
//                             <td>{resource.workers}</td>
//                             <td>{resource.task}</td>
//                             <td>{resource.fieldId || 'Не выбрано'}</td>
//                             <td>{new Date(resource.createdAt!).toLocaleDateString()}</td>
//                             <td>
//                                 <button onClick={() => handleEditResource(resource)}>
//                                     Редактировать
//                                 </button>
//                                 <button onClick={() => handleDeleteResource(resource.id)}>
//                                     Удалить
//                                 </button>
//                             </td>
//                         </tr>
//                     ))}
//                 </tbody>
//             </table>
//         </div>
//     );
// }
