// 'use client';

// import { useEffect, useState, useRef } from 'react';
// import { MapContainer, TileLayer, LayersControl, Marker, Popup, Polygon, useMap, useMapEvents } from 'react-leaflet';
// import 'leaflet/dist/leaflet.css';
// import L from 'leaflet';
// import styles from '../styles/map.module.scss';
// import { useAppSelector, useAppDispatch } from '@/store/hooks';
// import { fetchFields } from '@/store/slices/fieldsSlice';
// import { fetchHarvestData } from '@/store/slices/harvestSlice';
// import { Harvest } from '@/store/slices/harvestSlice';

// const { BaseLayer } = LayersControl;

// const defaultCenter: [number, number] = [55.751244, 37.618423];

// const CenterMap = ({ fields }) => {
//   const map = useMap();
//   useEffect(() => {
//     if (fields.length > 0) {
//       const firstFieldCoords = fields[0].coordinates[0];
//       map.setView(firstFieldCoords, 10);
//     }
//   }, [fields, map]);

//   return null;
// };

// const MapClickHandler = ({ setNewCoordinates }) => {
//   useMapEvents({
//     click: (e) => {
//       const { lat, lng } = e.latlng;
//       setNewCoordinates((prev) => [...prev, [lat, lng]]);
//     },
//   });
//   return null;
// };

// export default function MapComponent() {
//   const fields = useAppSelector((state) => state.fields.data);
//   const crops = useAppSelector((state) => state.harvest.data);
//   const [selectedField, setSelectedField] = useState<Field | null>(null);
//   const [newCoordinates, setNewCoordinates] = useState<[number, number][]>([]);
//   const [selectedCropId, setSelectedCropId] = useState<number | null>(null);
//   const dispatch = useAppDispatch();
//   const mapRef = useRef(null);
  
//   console.log(crops)
//   console.log(selectedField)
//   console.log(selectedCropId)
//   useEffect(() => {
//     dispatch(fetchFields());
//     dispatch(fetchHarvestData());
//   }, [dispatch]);

//   const customIcon = new L.Icon({
//     iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
//     shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
//     iconSize: [25, 41],
//     iconAnchor: [12, 41],
//     popupAnchor: [1, -34],
//   });

//   const handleSaveField = async () => {
//     if (newCoordinates.length < 3) {
//       alert('Для сохранения необходимо минимум 3 точки.');
//       return;
//     }
//     if (!selectedCropId) {
//       alert('Выберите культуру перед сохранением поля.');
//       return;
//     }
//     const newField = {
//       harvestId: selectedCropId,
//       coordinates: newCoordinates,
//       color: 'blue',
//     };
//     const res = await fetch('/api/fields', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(newField),
//     });
//     if (res.ok) {
//       setNewCoordinates([]);
//       setSelectedCropId(null);
//       dispatch(fetchFields());
//       console.log('Поле успешно добавлено!');
//     } else {
//       console.error('Ошибка при сохранении поля.');
//     }
//   };
//   console.log(selectedField)
//   return (
//     <div className={styles.mapWrapper}>
//       <div className={styles.controlPanel}>
//         <label className={styles.label}>
//           📋 <span>Выберите культуру для нового поля:</span>
//           <select
//             className={styles.select}
//             value={selectedCropId ?? ''}
//             onChange={(e) => setSelectedCropId(Number(e.target.value))}
//           >
//             <option value="">-- Выберите культуру --</option>
//             {crops.map((crop, index) => (
//               <option key={index} value={crop.id}>
//                 {crop.crop} ({crop.area} га, {crop.yield} т.)
//               </option>
//             ))}
//           </select>
//         </label>
//       </div>
//       <MapContainer center={defaultCenter} zoom={6} ref={mapRef} className={styles.map}>
//         <LayersControl position="topright">
//           <BaseLayer checked name="Стандартная карта">
//             <TileLayer
//               url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//               attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
//             />
//           </BaseLayer>
//           <BaseLayer name="Спутниковая карта">
//             <TileLayer
//               url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
//               attribution='Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
//             />
//           </BaseLayer>
//         </LayersControl>
//         <CenterMap fields={fields} />
//         <MapClickHandler setNewCoordinates={setNewCoordinates} />
//         {fields.map((field) => (
//           <Polygon
//             key={field.id}
//             positions={field.coordinates}
//             pathOptions={{ color: field.color }}
//             eventHandlers={{ click: () => setSelectedField(field) }}
//           />
//         ))}
//         {newCoordinates.length > 0 && (
//           <Polygon positions={newCoordinates} pathOptions={{ color: 'red' }}>
//             <Popup>Новое поле (не сохранено)</Popup>
//           </Polygon>
//         )}
//         {selectedField && (
//           <Marker position={selectedField.coordinates[0]} icon={customIcon}>
//             <Popup>
//               <div>
//                 <h3>{selectedField.harvest.crop}</h3>
//                 <p><strong>Площадь:</strong> {selectedField.harvest.area} га</p>
//                 <p><strong>Урожайность:</strong> {selectedField.harvest.yield} т.</p>
//                 <p><strong>Дата посева:</strong> {new Date(selectedField.harvest.createdAt!).toLocaleDateString()}</p>
//               </div>
//             </Popup>
//           </Marker>
//         )}
//       </MapContainer>
//       <div className={styles.buttonContainer}>
//         <button className={styles.saveButton} onClick={handleSaveField} disabled={newCoordinates.length < 3 || !selectedCropId}>
//           💾 Сохранить поле
//         </button>
//         <button className={styles.clearButton} onClick={() => setNewCoordinates([])}>
//           ❌ Очистить
//         </button>
//       </div>
//     </div>
//   );
// }


'use client';

import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, LayersControl, Marker, Popup, Polygon, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import styles from '../styles/map.module.scss';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { fetchFields } from '@/store/slices/fieldsSlice';
import { fetchHarvestData } from '@/store/slices/harvestSlice';
import { fetchResources } from '@/store/slices/resourceSlice';
import { Harvest } from '@/store/slices/harvestSlice';

const { BaseLayer } = LayersControl;

const defaultCenter: [number, number] = [55.751244, 37.618423];

const CenterMap = ({ fields }) => {
  const map = useMap();
  useEffect(() => {
    if (fields.length > 0) {
      const firstFieldCoords = fields[0].coordinates[0];
      map.setView(firstFieldCoords, 10);
    }
  }, [fields, map]);

  return null;
};

const MapClickHandler = ({ setNewCoordinates }) => {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      setNewCoordinates((prev) => [...prev, [lat, lng]]);
    },
  });
  return null;
};

export default function MapComponent() {
  const fields = useAppSelector((state) => state.fields.data);
  const crops = useAppSelector((state) => state.harvest.data);
  const resources = useAppSelector((state) => state.resources.data);
  const [selectedField, setSelectedField] = useState<Field | null>(null);
  const [newCoordinates, setNewCoordinates] = useState<[number, number][]>([]);
  const [selectedCropId, setSelectedCropId] = useState<number | null>(null);
  const [machinePositions, setMachinePositions] = useState<Record<number, [number, number]>>({});  
  const dispatch = useAppDispatch();
  const mapRef = useRef(null);

  useEffect(() => {
    dispatch(fetchFields());
    dispatch(fetchHarvestData());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchFields());
    dispatch(fetchHarvestData());
    dispatch(fetchResources());
  }, [dispatch]);

  const customIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const updatedPositions: Record<number, [number, number]> = {};
      
      resources.forEach((machine) => {
        // Пропускаем машины со статусом "planned"
        if (machine.status === 'planned') return;
        
        const field = fields.find((f) => f.id === machine.fieldId);
        if (!field || !machine.startTime || !machine.duration) return;
  
        const now = Date.now();
        const startTime = new Date(machine.startTime).getTime();
        const elapsed = now - startTime;
  
        const progress = Math.min(elapsed / machine.duration, 1);
        const startPoint = field.coordinates[0];
        const endPoint = field.coordinates[field.coordinates.length - 1];
  
        const lat = startPoint[0] + (endPoint[0] - startPoint[0]) * progress;
        const lng = startPoint[1] + (endPoint[1] - startPoint[1]) * progress;
  
        updatedPositions[machine.id] = [lat, lng];
      });
  
      setMachinePositions(updatedPositions);
    }, 1000);
  
    return () => clearInterval(interval);
  }, [resources, fields]);

  const machineIcon = new L.Icon({
    iconUrl: '/icons/tractor-icon.png',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  });

  const handleSaveField = async () => {
    if (newCoordinates.length < 3) {
      alert('Для сохранения необходимо минимум 3 точки.');
      return;
    }
    if (!selectedCropId) {
      alert('Выберите культуру перед сохранением поля.');
      return;
    }
    const newField = {
      harvestId: selectedCropId,
      coordinates: newCoordinates,
      color: 'blue',
    };
    const res = await fetch('/api/fields', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newField),
    });
    if (res.ok) {
      setNewCoordinates([]);
      setSelectedCropId(null);
      dispatch(fetchFields());
      console.log('Поле успешно добавлено!');
    } else {
      console.error('Ошибка при сохранении поля.');
    }
  };

  return (
    <div className={styles.mapWrapper}>
      {/* Панель выбора культуры */}
      <div className={styles.controlPanel}>
        <label className={styles.label}>
          📋 <span>Выберите культуру для нового поля:</span>
          <select
            className={styles.select}
            value={selectedCropId ?? ''}
            onChange={(e) => setSelectedCropId(Number(e.target.value))}
          >
            <option value="">-- Выберите культуру --</option>
            {crops.map((crop, index) => (
              <option key={index} value={crop.id}>
                {crop.crop} ({crop.area} га, {crop.yield} т.)
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* КАРТА */}
      <MapContainer center={defaultCenter} zoom={6} ref={mapRef} className={styles.map}>
        <LayersControl position="topright">
          <BaseLayer checked name="Стандартная карта">
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
          </BaseLayer>
          <BaseLayer name="Спутниковая карта">
            <TileLayer
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
              attribution="&copy; Esri, USGS, NASA"
            />
          </BaseLayer>
        </LayersControl>

        {/* Центровка и клики */}
        <CenterMap fields={fields} />
        <MapClickHandler setNewCoordinates={setNewCoordinates} />

        {/* Полигоны полей */}
        {fields.map((field) => (
          <Polygon
            key={field.id}
            positions={field.coordinates}
            pathOptions={{ color: field.color, weight: 3 }}
            eventHandlers={{ click: () => setSelectedField(field) }}
          />
        ))}

        {/* 🚜 Маркеры машин + прогресс выполнения */}
        {resources.map((machine) => {
          if (!machinePositions[machine.id]) return null;

          const now = Date.now();
          const startTime = new Date(machine.startTime).getTime();
          const progress = Math.min((now - startTime) / machine.duration, 1);
          const progressPercent = (progress * 100).toFixed(0);

          return (
            <Marker
              key={machine.id}
              position={machinePositions[machine.id]}
              icon={machineIcon}
            >
              <Popup className={styles.machinePopup}>
                🚜 <strong>{machine.equipment}</strong>
                <p>Задача: {machine.task}</p>
                <p>Работники: {machine.workers}</p>
                <p>Прогресс выполнения: {progressPercent}%</p>
                <span className={`${styles.machineStatus} ${progress < 1 ? 'active' : 'completed'}`}>
                  {progress < 1 ? 'Выполняется' : 'Завершено'}
                </span>
              </Popup>
            </Marker>
          );
        })}

        {/* Новое поле (если рисуется) */}
        {newCoordinates.length > 0 && (
          <Polygon positions={newCoordinates} pathOptions={{ color: 'red' }}>
            <Popup>Новое поле (не сохранено)</Popup>
          </Polygon>
        )}

        {/* Маркер выбранного поля */}
        {selectedField && (
          <Marker position={selectedField.coordinates[0]} icon={customIcon}>
            <Popup>
              <div>
                <h3>{selectedField.harvest.crop}</h3>
                <p><strong>Площадь:</strong> {selectedField.harvest.area} га</p>
                <p><strong>Урожайность:</strong> {selectedField.harvest.yield} т.</p>
                <p><strong>Дата посева:</strong> {new Date(selectedField.harvest.createdAt!).toLocaleDateString()}</p>
              </div>
            </Popup>
          </Marker>
        )}
      </MapContainer>

      {/* Кнопки */}
      <div className={styles.buttonContainer}>
        <button
          className={styles.saveButton}
          onClick={handleSaveField}
          disabled={newCoordinates.length < 3 || !selectedCropId}
        >
          💾 Сохранить поле
        </button>
        <button
          className={styles.clearButton}
          onClick={() => setNewCoordinates([])}
        >
          ❌ Очистить
        </button>
      </div>

      {/* 📝 Панель со статусами всех ресурсов */}
      <div className={styles.statusPanel}>
        <h2>Статус техники</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Техника</th>
              <th>Задача</th>
              <th>Работники</th>
              <th>Поле</th>
              <th>Прогресс</th>
              <th>Статус</th>
            </tr>
          </thead>
          <tbody>
            {resources.map((machine) => {
              const now = Date.now();
              const startTime = new Date(machine.startTime).getTime();
              const progress = Math.min((now - startTime) / machine.duration, 1);
              const progressPercent = (progress * 100).toFixed(0);
              const field = fields.find((f) => f.id === machine.fieldId);

              return (
                <tr key={machine.id}>
                  <td>{machine.equipment}</td>
                  <td>{machine.task}</td>
                  <td>{machine.workers}</td>
                  <td>{field ? `${field.crop} (Поле #${field.id})` : 'Не выбрано'}</td>
                  <td>{progressPercent}%</td>
                  <td>{progress < 1 ? 'Выполняется' : 'Завершено'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
