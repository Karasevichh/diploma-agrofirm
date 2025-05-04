// 'use client';

// import { useState, useEffect } from 'react';
// import { useAppDispatch, useAppSelector } from '@/store/hooks';
// import { fetchExpenses, addExpenseToDB } from '@/store/slices/expensesSlice';
// import styles from '../styles/dashboard.module.scss';

// export default function ExpensesClient() {
//   const dispatch = useAppDispatch();
//   const expenses = useAppSelector((state) => state.expenses.data);
//   const [category, setCategory] = useState('');
//   const [amount, setAmount] = useState('');

//   useEffect(() => {
//     dispatch(fetchExpenses());
//   }, [dispatch]);
  
//   const handleAddExpense = async () => {
//     if (category && amount) {
//       console.log("Отправка данных:", { category, amount: parseFloat(amount) });
  
//       try {
//         await dispatch(
//           addExpenseToDB({ category, amount: parseFloat(amount) })
//         ).unwrap();
//         console.log("Расход успешно добавлен");
//         setCategory('');
//         setAmount('');
//       } catch (error) {
//         console.error("Ошибка при добавлении расхода:", error);
//       }
//     }
//   };


  
//   return (
//     <div className={styles.container}>
//       <h1>Учёт затрат</h1>
//       <div>
//         <input
//           type="text"
//           placeholder="Категория"
//           value={category}
//           onChange={(e) => setCategory(e.target.value)}
//         />
//         <input
//           type="number"
//           placeholder="Сумма"
//           value={amount}
//           onChange={(e) => setAmount(e.target.value)}
//         />
//         <button onClick={handleAddExpense}>Добавить расход</button>
//       </div>

//       <h2>Список затрат</h2>
//       <table className={styles.table}>
//         <thead>
//           <tr>
//             <th>Категория</th>
//             <th>Сумма (руб)</th>
//             <th>Дата</th>
//           </tr>
//         </thead>
//         <tbody>
//           {expenses.map((expense) => (
//             <tr key={expense.id}>
//               <td>{expense.category}</td>
//               <td>{expense.amount}</td>
//               <td>{expense.createdAt ? new Date(expense.createdAt).toLocaleDateString() : 'Нет даты'}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }

'use client';

import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchExpenses, addExpense, deleteExpense } from '@/store/slices/expensesSlice';
import { fetchResources } from '@/store/slices/resourceSlice';
import { fetchFields } from '@/store/slices/fieldsSlice';
import { Expense } from '@/store/slices/expensesSlice';
import { Resource } from '@/store/slices/resourceSlice';
import { Field } from '@/store/slices/fieldsSlice';

import styles from '../styles/expenses.module.scss';

export default function ExpensesClient() {
  const dispatch = useAppDispatch();
  const expenses: Expense[] = useAppSelector(state => state.expenses.data);
  const resources: Resource[] = useAppSelector(state => state.resources.data);
  const fields: Field[] = useAppSelector(state => state.fields.data);

  const [type, setType] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [transportId, setTransportId] = useState<string>('');
  const [fieldId, setFieldId] = useState<string>('');

  useEffect(() => {
    dispatch(fetchExpenses());
    dispatch(fetchResources());
    dispatch(fetchFields());
  }, [dispatch]);

  const handleAddExpense = () => {
    if (!type || !amount) {
      alert('Заполните категорию и сумму!');
      return;
    }

    dispatch(addExpense({
      type,
      amount: parseFloat(amount),
      description,
      transportId: transportId ? parseInt(transportId) : undefined,
      fieldId: fieldId ? parseInt(fieldId) : undefined
    }));

    setType('');
    setAmount('');
    setDescription('');
    setTransportId('');
    setFieldId('');
  };

  const handleDeleteExpense = (id: number) => {
    dispatch(deleteExpense(id));
  };

  return (
    <div className={styles.container}>
      <h1>Учёт затрат</h1>
      <div className={styles.form}>
        <select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">Выберите категорию</option>
          <option value="Топливо">Топливо</option>
          <option value="Семена">Семена</option>
          <option value="Удобрения">Удобрения</option>
          <option value="Ремонт">Ремонт техники</option>
          <option value="Зарплата">Заработная плата</option>
        </select>

        <input
          type="number"
          placeholder="Сумма"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />

        <select value={transportId} onChange={(e) => setTransportId(e.target.value)}>
          <option value="">Выберите технику</option>
          {resources.map((resource) => (
            <option key={resource.id} value={resource.id}>{resource.equipment}</option>
          ))}
        </select>

        <select value={fieldId} onChange={(e) => setFieldId(e.target.value)}>
          <option value="">Выберите поле</option>
          {fields.map((field) => (
            <option key={field.id} value={field.id}>{field.crop} (Поле #{field.id})</option>
          ))}
        </select>

        <textarea
          placeholder="Описание"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <button onClick={handleAddExpense}>Добавить затрату</button>
      </div>

      <h2>Список затрат</h2>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Категория</th>
            <th>Сумма</th>
            <th>Техника</th>
            <th>Поле</th>
            <th>Описание</th>
            <th>Дата</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense) => (
            <tr key={expense.id}>
              <td>{expense.type}</td>
              <td>{expense.amount} ₽</td>
              <td>{expense.transport ? expense.transport.equipment : '-'}</td>
              <td>{expense.field ? `Поле #${expense.field.id}` : '-'}</td>
              <td>{expense.description || '-'}</td>
              <td>{new Date(expense.createdAt).toLocaleDateString()}</td>
              <td>
                <button onClick={() => handleDeleteExpense(expense.id)}>Удалить</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}