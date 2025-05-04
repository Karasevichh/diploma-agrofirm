// Новый компонент StatisticsClient
'use client';

import { useEffect, useState } from 'react';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import dynamic from 'next/dynamic';
import { fetchExpenses } from '@/store/slices/expensesSlice';
import { fetchResources } from '@/store/slices/resourceSlice';
import { fetchHarvestData } from '@/store/slices/harvestSlice';
import styles from '../styles/statistics.module.scss';

// Динамические импорты графиков
const LineChart = dynamic(() => import('@/components/charts/LineChart'), { ssr: false });
const PieChart = dynamic(() => import('@/components/charts/PieChart'), { ssr: false });
const BarChart = dynamic(() => import('@/components/charts/BarChart'), { ssr: false });
const ExpenseChart = dynamic(() => import('@/components/charts/ExpenseChart'), { ssr: false });

interface LineChartData {
  date: string;
  value: number;
}

interface PieChartData {
  name: string;
  value: number;
}

interface BarChartData {
  crop?: string;
  yield?: number;
  category?: string;
  value?: number;
}

export default function StatisticsClient() {
  const dispatch = useAppDispatch();
  const resources = useAppSelector((state) => state.resources.data);
  const crops = useAppSelector((state) => state.harvest.data);
  const expenses = useAppSelector((state) => state.expenses.data);

  // Состояния графиков
  const [lineChartData, setLineChartData] = useState<LineChartData[]>([]);
  const [pieChartData, setPieChartData] = useState<PieChartData[]>([]);
  const [barChartData, setBarChartData] = useState<BarChartData[]>([]);
  const [cropYieldData, setCropYieldData] = useState<BarChartData[]>([]);
  const [yieldPerAreaData, setYieldPerAreaData] = useState<LineChartData[]>([]);
  const [expensesChartData, setExpensesChartData] = useState<BarChartData[]>([]);

  // Новые состояния по затратам
  const [expensesByCategory, setExpensesByCategory] = useState<PieChartData[]>([]);
  const [expensesByField, setExpensesByField] = useState<BarChartData[]>([]);
  const [expensesByTransport, setExpensesByTransport] = useState<BarChartData[]>([]);

  const [averageYield, setAverageYield] = useState<number>(0);
  const [totalHarvest, setTotalHarvest] = useState<number>(0);
  const [totalArea, setTotalArea] = useState<number>(0);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  useEffect(() => {
    dispatch(fetchExpenses());
    dispatch(fetchResources());
    dispatch(fetchHarvestData());
  }, [dispatch]);
  console.log('Expenses:', expenses);
  useEffect(() => {
    let filteredCrops = crops;
    if (startDate && endDate) {
      filteredCrops = crops.filter(crop => {
        const cropDate = new Date(crop.createdAt);
        return cropDate >= new Date(startDate) && cropDate <= new Date(endDate);
      });
    }

    // Прогресс урожая
    const cropProgress = filteredCrops.map((crop) => ({
      date: crop.createdAt ? new Date(crop.createdAt).toLocaleDateString() : 'Нет даты',
      value: crop.yield,
    }));
    setLineChartData(cropProgress);

    // Распределение техники
    const resourceDistribution = resources.reduce((acc, resource) => {
      acc[resource.equipment] = (acc[resource.equipment] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const pieData = Object.entries(resourceDistribution).map(([key, value]) => ({
      name: key,
      value,
    }));
    setPieChartData(pieData);

    // Учёт затрат
    const expenseData = expenses.map((expense) => ({
      category: expense.type,
      value: expense.amount,
    }));
    setExpensesChartData(expenseData);

    // Урожайность по культурам
    const yieldByCrop = filteredCrops.reduce((acc: Record<string, number>, crop) => {
      acc[crop.crop] = (acc[crop.crop] || 0) + crop.yield;
      return acc;
    }, {});
    const formattedCropYield = Object.entries(yieldByCrop).map(([crop, yieldValue]) => ({
      crop,
      yield: yieldValue,
    }));
    setCropYieldData(formattedCropYield);

    // Урожайность на гектар
    const yieldPerHectare = filteredCrops.map(crop => ({
      date: crop.createdAt ? new Date(crop.createdAt).toLocaleDateString() : 'Нет даты',
      value: crop.area > 0 ? crop.yield / crop.area : 0,
    }));
    setYieldPerAreaData(yieldPerHectare);

    // Итоговые расчёты по урожаю
    if (filteredCrops.length > 0) {
      const totalYield = filteredCrops.reduce((sum, crop) => sum + crop.yield, 0);
      const avgYield = totalYield / filteredCrops.length;
      const totalFieldArea = filteredCrops.reduce((sum, crop) => sum + crop.area, 0);
      setTotalHarvest(totalYield);
      setAverageYield(avgYield);
      setTotalArea(totalFieldArea);
    }

    // 🔥 Новые данные по затратам 🔥
    const categoryMap: Record<string, number> = {};
    const fieldMap: Record<string, number> = {};
    const transportMap: Record<string, number> = {};
    expenses.forEach(exp => {
      // Затраты по категориям
      categoryMap[exp.type] = (categoryMap[exp.type] || 0) + exp.amount;
    
      // Затраты по полям
      if (exp.field) {
        const fieldName = `Поле #${exp.field.id}`; // так как crop нет!
        fieldMap[fieldName] = (fieldMap[fieldName] || 0) + exp.amount;
      }
    
      // Затраты по технике
      if (exp.transport) {
        const transportName = exp.transport.equipment || `Техника #${exp.transport.id}`;
        transportMap[transportName] = (transportMap[transportName] || 0) + exp.amount;
      }
    });

    const categoryData = Object.entries(categoryMap).map(([name, value]) => ({ name, value }));
    const fieldData = Object.entries(fieldMap).map(([name, value]) => ({ name, value }));
    const transportData = Object.entries(transportMap).map(([name, value]) => ({ name, value }));

    setExpensesByCategory(categoryData);
    setExpensesByField(fieldData);
    setExpensesByTransport(transportData);

  }, [resources, crops, expenses, startDate, endDate]);

  return (
    <div className={styles.container}>
      <h1>Статистика</h1>

      <div className={styles.filters}>
        <label>
          Начальная дата:
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </label>
        <label>
          Конечная дата:
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </label>
      </div>

      <div className={styles.summary}>
        <p><strong>Общий урожай:</strong> {totalHarvest.toFixed(2)} т.</p>
        <p><strong>Средняя урожайность:</strong> {averageYield.toFixed(2)} т./га</p>
        <p><strong>Общая площадь полей:</strong> {totalArea.toFixed(2)} га</p>
      </div>

      <div className={styles.chartsGrid}>
        {/* Прогресс урожая */}
        <div className={styles.chartSection}>
          <h2>Прогресс урожая</h2>
          {lineChartData.length > 0 ? (
            <LineChart data={lineChartData} />
          ) : (
            <p>Нет данных для отображения прогресса урожая</p>
          )}
        </div>

        {/* Распределение техники */}
        <div className={styles.chartSection}>
          <h2>Распределение техники</h2>
          {pieChartData.length > 0 ? (
            <PieChart data={pieChartData} />
          ) : (
            <p>Нет данных для отображения распределения техники</p>
          )}
        </div>

        {/* Урожайность по культурам */}
        <div className={styles.chartSection}>
          <h2>Урожайность по культурам</h2>
          {cropYieldData.length > 0 ? (
            <BarChart data={cropYieldData} />
          ) : (
            <p>Нет данных для отображения урожайности по культурам</p>
          )}
        </div>

        {/* Урожайность на гектар */}
        <div className={styles.chartSection}>
          <h2>Урожайность на гектар</h2>
          {yieldPerAreaData.length > 0 ? (
            <LineChart data={yieldPerAreaData} />
          ) : (
            <p>Нет данных для отображения урожайности на гектар</p>
          )}
        </div>

        {/* Учёт затрат (старый) */}
        <div className={styles.chartSection}>
          <h2>Учёт затрат</h2>
          {expensesChartData.length > 0 ? (
            <ExpenseChart data={expensesChartData} />
          ) : (
            <p>Нет данных для отображения затрат</p>
          )}
        </div>

        {/* 🔥 Новый график: Распределение затрат по категориям */}
        <div className={styles.chartSection}>
          <h2>Затраты по категориям</h2>
          {expensesByCategory.length > 0 ? (
            <PieChart data={expensesByCategory} />
          ) : (
            <p>Нет данных по категориям затрат</p>
          )}
        </div>

        {/* 🔥 Новый график: Затраты по полям */}
        <div className={styles.chartSection}>
          <h2>Затраты по полям</h2>
          {expensesByField.length > 0 ? (
            <BarChart data={expensesByField} />
          ) : (
            <p>Нет данных по полям</p>
          )}
        </div>

        {/* 🔥 Новый график: Затраты по технике */}
        <div className={styles.chartSection}>
          <h2>Затраты по технике</h2>
          {expensesByTransport.length > 0 ? (
            <BarChart data={expensesByTransport} />
          ) : (
            <p>Нет данных по технике</p>
          )}
        </div>
      </div>
    </div>
  );
}



// 'use client';

// import { useEffect, useState } from 'react';
// import { useAppSelector, useAppDispatch } from '@/store/hooks';
// import dynamic from 'next/dynamic'; // Для динамического импорта графиков
// import { fetchResources } from '@/store/slices/resourceSlice';
// import { fetchHarvestData } from '@/store/slices/harvestSlice';
// import { fetchExpenses } from '@/store/slices/expensesSlice';
// import styles from '../styles/statistics.module.scss';

// // Динамические импорты графиков
// const LineChart = dynamic(() => import('@/components/charts/LineChart'), { ssr: false });
// const PieChart = dynamic(() => import('@/components/charts/PieChart'), { ssr: false });
// const BarChart = dynamic(() => import('@/components/charts/BarChart'), { ssr: false });
// const ExpenseChart = dynamic(() => import('@/components/charts/ExpenseChart'), { ssr: false });

// interface LineChartData {
//   date: string;
//   value: number;
// }

// interface PieChartData {
//   name: string;
//   value: number;
// }

// interface BarChartData {
//   crop?: string;
//   yield?: number;
//   category?: string;
//   value?: number; 
// }

// export default function StatisticsClient() {
//   const dispatch = useAppDispatch();
//   const resources = useAppSelector((state) => state.resources.data);
//   const crops = useAppSelector((state) => state.harvest.data); // Исправлено для использования harvestSlice
//   const expenses = useAppSelector((state) => state.expenses.data);
//   console.log(expenses)

//   const [lineChartData, setLineChartData] = useState<LineChartData[]>([]);
//   const [yieldPerAreaData, setYieldPerAreaData] = useState<LineChartData[]>([]);
//   const [pieChartData, setPieChartData] = useState<PieChartData[]>([]);
//   const [barChartData, setBarChartData] = useState<BarChartData[]>([]);
//   const [expensesChartData, setExpensesChartData] = useState<BarChartData[]>([])
//   const [averageYield, setAverageYield] = useState<number>(0);
//   const [totalHarvest, setTotalHarvest] = useState<number>(0);
//   const [totalArea, setTotalArea] = useState<number>(0);

//   useEffect(() => {
//     dispatch(fetchResources());
//     dispatch(fetchHarvestData());
//     dispatch(fetchExpenses());
//   }, [dispatch]);


//   useEffect(() => {
//     // Подготовка данных для линейного графика (например, прогресс урожая по культурам)
//     const cropProgress = crops.map((crop) => ({
//       date: crop.createdAt ? new Date(crop.createdAt).toLocaleDateString() : 'Нет даты', // Защита от отсутствия даты
//       value: crop.yield,
//     }));

//     setLineChartData(cropProgress);

//     const yieldByCrop = crops.reduce((acc: Record<string, number>, crop) => {
//       acc[crop.crop] = (acc[crop.crop] || 0) + crop.yield;
//       return acc;
//     }, {});
  
//     const formattedData = Object.entries(yieldByCrop).map(([crop, yieldValue]) => ({
//       crop,
//       yield: yieldValue,
//     }));
  
//     setBarChartData(formattedData);

//     const expenseData = expenses.map((expense) => ({
//       category: expense.category,
//       value: expense.amount,
//     }));
//     setExpensesChartData(expenseData);
    
//     // Подготовка данных для круговой диаграммы (распределение техники)
//     const resourceDistribution = resources.reduce((acc, resource) => {
//       acc[resource.equipment] = (acc[resource.equipment] || 0) + 1;
//       return acc;
//     }, {} as Record<string, number>);
    
//     const pieData = Object.entries(resourceDistribution).map(([key, value]) => ({
//       name: key,
//       value,
//     }));
    
//     setPieChartData(pieData);
    
//     const data = crops.map((crop) => ({
//       date: crop.createdAt ? new Date(crop.createdAt).toLocaleDateString() : 'Нет даты',
//       value: crop.area > 0 ? crop.yield / crop.area : 0,
//     }));
//     setYieldPerAreaData(data);
    
//     // Расчет общей и средней урожайности и общей площади полей
//     if (crops.length > 0) {
//       const totalYield = crops.reduce((sum, crop) => sum + crop.yield, 0);
//       const avgYield = totalYield / crops.length;
//       const totalFieldArea = crops.reduce((sum, crop) => sum + crop.area, 0);
//       setTotalHarvest(totalYield);
//       setAverageYield(avgYield);
//       setTotalArea(totalFieldArea);
//     }
//   }, [resources, crops, expenses]);
//   console.log(expensesChartData)
  
//   return (
//     <div className={styles.container}>
//       <h1>Статистика</h1>
//       <div className={styles.summary}>
//         <p><strong>Общий урожай:</strong> {totalHarvest.toFixed(2)} т.</p>
//         <p><strong>Средняя урожайность:</strong> {averageYield.toFixed(2)} т./га</p>
//         <p><strong>Общая площадь полей:</strong> {totalArea.toFixed(2)} га</p>
//       </div>
//       <div className={styles.chartsGrid}>
//         <div className={styles.chartSection}>
//           <h2>Прогресс урожая</h2>
//           {lineChartData.length > 0 ? (
//             <LineChart data={lineChartData} />
//           ) : (
//             <p>Нет данных для отображения прогресса урожая</p>
//           )}
//         </div>

//         <div className={styles.chartSection}>
//           <h2>Распределение техники</h2>
//           {pieChartData.length > 0 ? (
//             <PieChart data={pieChartData} />
//           ) : (
//             <p>Нет данных для отображения распределения техники</p>
//           )}
//         </div>

//         <div className={styles.chartSection}>
//           <h2>Урожайность по культурам</h2>
//           {barChartData.length > 0 ? (
//             <BarChart data={barChartData} />
//           ) : (
//             <p>Нет данных для отображения урожайности по культурам</p>
//           )}
//         </div>
//         <div className={styles.chartSection}>
//           <h2>Урожайность на гектар</h2>
//           {yieldPerAreaData.length > 0 ? (
//             <LineChart data={yieldPerAreaData} />
//           ) : (
//             <p>Нет данных для отображения урожайности на гектар</p>
//           )}
//         </div>
//         <div className={styles.chartSection}>
//           <h2>Учёт затрат</h2>
//           {expensesChartData.length > 0 ? (
//             <ExpenseChart data={expensesChartData} />
//           ) : (
//             <p>Нет данных для отображения затрат</p>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }