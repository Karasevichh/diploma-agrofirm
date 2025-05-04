// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// interface Expense {
//     id: string;
//     category: string;
//     amount: number;
//     date: string;
//   }
  
//   interface ExpensesState {
//     data: Expense[];
//   }
  
//   const initialState: ExpensesState = {
//     data: [],
//   };

// export const fetchExpenses = createAsyncThunk('expenses/fetchExpenses', async () => {
//   const response = await fetch('/api/expense');
//   return response.json();
// });

// export const addExpenseToDB = createAsyncThunk('expenses/addExpense', async (expense: { category: string; amount: number }) => {
//   const response = await fetch('/api/expense', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify(expense),
//   });
//   return response.json();
// });

// const expensesSlice = createSlice({
//   name: 'expenses',
//   initialState,
//   reducers: {},
//   extraReducers: (builder) => {
//     builder.addCase(fetchExpenses.fulfilled, (state, action) => {
//       state.data = action.payload;
//     });
//     builder.addCase(addExpenseToDB.fulfilled, (state, action) => {
//       state.data.push(action.payload);
//     });
//   },
// });

// export default expensesSlice.reducer;

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Resource } from './resourceSlice';
import { Field } from './fieldsSlice';

export interface Expense {
  id: number;
  type: string;
  description?: string;
  amount: number;
  createdAt: string;

  transportId?: number;
  transport?: Resource;

  fieldId?: number;
  field?: Field;
}

interface ExpensesState {
  data: Expense[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
}

const initialState: ExpensesState = {
  data: [],
  status: 'idle'
};


export const fetchExpenses = createAsyncThunk<Expense[]>('expenses/fetch', async () => {
  const res = await fetch('/api/expense');
  return res.json();
});

export const addExpense = createAsyncThunk<Expense, Partial<Expense>>('expenses/add', async (expense) => {
  const res = await fetch('/api/expense', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(expense)
  });
  return res.json();
});

export const deleteExpense = createAsyncThunk<{ message: string }, number>('expenses/delete', async (id) => {
  const res = await fetch('/api/expense', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id })
  });
  return res.json();
});

const expensesSlice = createSlice({
  name: 'expenses',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchExpenses.fulfilled, (state, action: PayloadAction<Expense[]>) => {
        state.data = action.payload;
        state.status = 'succeeded';
      })
      .addCase(addExpense.fulfilled, (state, action: PayloadAction<Expense>) => {
        state.data.unshift(action.payload);
      })
      .addCase(deleteExpense.fulfilled, (state, action) => {
        const idToDelete = action.meta.arg;
        state.data = state.data.filter((expense) => expense.id !== idToDelete);
      });
  }
});

export default expensesSlice.reducer;