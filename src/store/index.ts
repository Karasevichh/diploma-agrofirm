import { configureStore } from '@reduxjs/toolkit';
import harvestReducer from './slices/harvestSlice';
import resourceSlice from './slices/resourceSlice';
import expensesSlice from './slices/expensesSlice';
import fieldsReducer from './slices/fieldsSlice';

export const store = configureStore({
  reducer: {
    harvest: harvestReducer,
    resources: resourceSlice,
    expenses: expensesSlice,
    fields: fieldsReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
