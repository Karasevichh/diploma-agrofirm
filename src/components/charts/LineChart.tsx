'use client';

import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';

export default function CustomLineChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid stroke="#ccc" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip formatter={(value) => `${value} т.`}/>
        <Line type="monotone" dataKey="value" name="Урожайность" stroke="#82ca9d" />
      </LineChart>
    </ResponsiveContainer>
  );
}