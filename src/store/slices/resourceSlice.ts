import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

// Типы данных
export interface Resource {
  id: number;
  equipment: string;
  workers: number;
  task: string;
  fieldId: number;
  stageId: number;
  status: 'planned' | 'in_progress' | 'completed' | 'delayed';
  startTime: string | Date;
  endTime?: string | Date;
  duration: number;
  createdAt: string | Date;
}

interface ResourceState {
  data: Resource[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: ResourceState = {
  data: [],
  status: 'idle',
  error: null,
};

// Асинхронные действия
export const fetchResources = createAsyncThunk('resources/fetchResources', async () => {
  const response = await fetch('/api/resources');
  const data = await response.json();
  return data;
});

export const addResource = createAsyncThunk(
  'resources/addResource',
  async (newResource: Omit<Resource, 'id' | 'createdAt'>) => {
    const response = await fetch('/api/resources', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newResource),
    });

    if (!response.ok) {
      throw new Error('Ошибка при добавлении ресурса');
    }

    return response.json();
  }
);

export const editResource = createAsyncThunk(
  'resources/editResource',
  async (updatedResource: Partial<Resource> & { id: number }) => {
    const response = await fetch('/api/resources', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedResource),
    });
    return response.json();
  }
);

export const deleteResource = createAsyncThunk('resources/deleteResource', async (id: number) => {
  await fetch('/api/resources', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id }),
  });
  return id;
});

const resourceSlice = createSlice({
  name: 'resources',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(addResource.fulfilled, (state, action: PayloadAction<Resource>) => {
        console.log('Added resource:', action.payload); // Добавьте лог
        state.data.unshift(action.payload);
      })
      .addCase(addResource.rejected, (state, action) => {
        state.error = action.error.message || 'Ошибка при добавлении ресурса';
      })
      .addCase(fetchResources.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchResources.fulfilled, (state, action: PayloadAction<Resource[]>) => {
        state.status = 'succeeded';
        state.data = action.payload;
      })
      .addCase(fetchResources.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Ошибка при загрузке данных';
      })
      .addCase(editResource.fulfilled, (state, action: PayloadAction<Resource>) => {
        const index = state.data.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) {
          state.data[index] = action.payload;
        }
      })
      .addCase(deleteResource.fulfilled, (state, action: PayloadAction<number>) => {
        state.data = state.data.filter((item) => item.id !== action.payload);
      });
  },
});

export default resourceSlice.reducer;
