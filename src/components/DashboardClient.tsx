// "use client"; // Директива для клиентского компонента

// import { useAppDispatch, useAppSelector } from '../store/hooks';
// import { addHarvest } from '../store/slices/harvestSlice';
// import { useState } from 'react';
// import styles from '../styles/dashboard.module.scss';

// export default function DashboardClient() {
//   const harvestData = useAppSelector((state) => state.harvest.data);
//   const dispatch = useAppDispatch();

//   const [newCrop, setNewCrop] = useState<string>('');
//   const [newArea, setNewArea] = useState<string>('');
//   const [newYield, setNewYield] = useState<string>('');

//   const handleAddHarvest = () => {
//     dispatch(
//       addHarvest({
//         crop: newCrop,
//         area: parseFloat(newArea),
//         yield: parseFloat(newYield),
//       })
//     );
//     setNewCrop('');
//     setNewArea('');
//     setNewYield('');
//   };

//   return (
//     <div className={styles.container}>
//       <h1>Панель управления</h1>
//       <table className={styles.table}>
//         <thead>
//           <tr>
//             <th>Культура</th>
//             <th>Площадь (га)</th>
//             <th>Урожай (тонн)</th>
//           </tr>
//         </thead>
//         <tbody>
//           {harvestData.map((item, index) => (
//             <tr key={index}>
//               <td>{item.crop}</td>
//               <td>{item.area}</td>
//               <td>{item.yield}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       <h2>Добавить данные об урожае</h2>
//       <input
//         type="text"
//         placeholder="Культура"
//         value={newCrop}
//         onChange={(e) => setNewCrop(e.target.value)}
//       />
//       <input
//         type="number"
//         placeholder="Площадь (га)"
//         value={newArea}
//         onChange={(e) => setNewArea(e.target.value)}
//       />
//       <input
//         type="number"
//         placeholder="Урожай (тонн)"
//         value={newYield}
//         onChange={(e) => setNewYield(e.target.value)}
//       />
//       <button onClick={handleAddHarvest}>Добавить</button>
//     </div>
//   );
// }

"use client"

import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchHarvestData, saveHarvestData } from '../store/slices/harvestSlice';
import { useEffect, useState } from 'react';
import styles from '../styles/dashboard.module.scss';

export default function DashboardClient() {
  const dispatch = useAppDispatch();
  const harvestData = useAppSelector((state) => state.harvest.data);

  const [newCrop, setNewCrop] = useState<string>('');
  const [newArea, setNewArea] = useState<string>('');
  const [newYield, setNewYield] = useState<string>('');
  const [filter, setFilter] = useState<string>(''); // Новое состояние для фильтра

  // Загрузка данных при монтировании компонента
  useEffect(() => {
    dispatch(fetchHarvestData());
  }, [dispatch]);

  const handleAddHarvest = async () => {
    try {
      const newHarvest = {
        crop: newCrop,
        area: parseFloat(newArea),
        yield: parseFloat(newYield),
        createdAt: new Date().toISOString()
      };

      const response = await fetch('/api/harvest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newHarvest),
      });

      if (!response.ok) {
        throw new Error('Ошибка при добавлении данных');
      }

      const savedHarvest = await response.json();

        // Теперь создаём поле с привязкой к этому crop
      await fetch('/api/fields', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          harvestId: savedHarvest.id, // Привязываем поле к культуре
          coordinates: [[45.2568258567107, 40.56718841028718]], // Демо-координаты
          color: "green",
        }),
      });

      // После успешного POST-запроса обновляем данные
      dispatch(fetchHarvestData());

      // Очищаем поля ввода
      setNewCrop('');
      setNewArea('');
      setNewYield('');

    } catch (error) {
      console.error('Ошибка:', error);
    }
  };
  console.log(harvestData)
  // Фильтрация данных
  const filteredData = harvestData.filter((item) =>
    filter ? item.crop.toLowerCase().includes(filter.toLowerCase()) : true
  );

  return (
    <div className={styles.container}>
      <h1>Панель управления</h1>

      {/* Фильтр */}
      <div className={styles.filter}>
        <input
          type="text"
          placeholder="Фильтр по культуре"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      {/* Таблица с данными */}
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Культура</th>
            <th>Площадь (га)</th>
            <th>Урожай (тонн)</th>
            <th>Дата</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.map((item, index) => (
            <tr key={index}>
              <td>{item.crop}</td>
              <td>{item.area}</td>
              <td>{item.yield}</td>
              <td>{new Date(item.createdAt!).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Форма добавления */}
      <h2>Добавить данные об урожае</h2>
      <div className={styles.inputButtonWrapper}>
        <input
          type="text"
          placeholder="Культура"
          value={newCrop}
          onChange={(e) => setNewCrop(e.target.value)}
        />
        <input
          type="number"
          placeholder="Площадь (га)"
          value={newArea}
          onChange={(e) => setNewArea(e.target.value)}
        />
        <input
          type="number"
          placeholder="Урожай (тонн)"
          value={newYield}
          onChange={(e) => setNewYield(e.target.value)}
        />
        <button onClick={handleAddHarvest}>Добавить</button>
      </div>
    </div>
  );
}
