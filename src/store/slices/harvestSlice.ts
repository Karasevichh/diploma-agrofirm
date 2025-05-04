import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export interface Harvest {
  crop: string;
  area: number;
  yield: number;
  id: number;
}

interface HarvestState {
  data: Harvest[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: HarvestState = {
  data: [],
  status: 'idle',
};

// Асинхронное действие для получения данных
export const fetchHarvestData = createAsyncThunk('harvest/fetchData', async () => {
  const response = await fetch('/api/harvest');
  return response.json();
});

// Асинхронное действие для добавления данных
// export const saveHarvestData = createAsyncThunk('harvest/saveData', async (newHarvest: Harvest) => {
//   const response = await fetch('/api/harvest', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify(newHarvest),
//   });
//   return response.json();
// });

const harvestSlice = createSlice({
  name: 'harvest',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchHarvestData.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchHarvestData.fulfilled, (state, action) => {
        state.data = action.payload;
        state.status = 'succeeded';
      })
      // .addCase(saveHarvestData.fulfilled, (state, action: PayloadAction<{ data: Harvest }>) => {
      //   state.data.push(action.payload.data);
      //   console.log(action.payload.data)
      // });
  },
});

export default harvestSlice.reducer;
