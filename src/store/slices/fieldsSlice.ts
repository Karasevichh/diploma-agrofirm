import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Harvest } from './harvestSlice';

export interface Field {
  id: number;
  crop: string;
  area: number;
  yield: number;
  harvest: Harvest;
  plantedAt: string;
  coordinates: [number, number][];
  color: string;
}


interface FieldsState {
  data: Field[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: FieldsState = {
  data: [],
  status: 'idle',
};

// Асинхронный запрос на сервер
export const fetchFields = createAsyncThunk('fields/fetchFields', async () => {
  const response = await fetch('/api/fields');
  return response.json();
});

const fieldsSlice = createSlice({
  name: 'fields',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFields.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchFields.fulfilled, (state, action: PayloadAction<Field[]>) => {
        console.log("Данные полей в Redux:", action.payload);
        state.data = action.payload; // Должны приходить все поля, а не одно
        state.status = 'succeeded';
      })
      .addCase(fetchFields.rejected, (state) => {
        state.status = 'failed';
      });
  },
});

export default fieldsSlice.reducer;