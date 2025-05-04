// import { NextResponse } from 'next/server';
// import { prisma } from '@/lib/prisma';

// // Получение списка затрат
// export async function GET() {
//   const expenses = await prisma.expense.findMany();
//   return NextResponse.json(expenses);
// }

// // Добавление новой записи о затратах
// export async function POST(req: Request) {
//   const data = await req.json();
//   const newExpense = await prisma.expense.create({
//     data: {
//       category: data.category,
//       amount: data.amount,
//     },
//   });
//   return NextResponse.json(newExpense);
// }

import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

// GET: Получить все затраты
export async function GET() {
  try {
    const expenses = await prisma.expense.findMany({
      include: {
        transport: true,
        field: true
      },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(expenses);
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка при получении расходов' }, { status: 500 });
  }
}

// POST: Добавить новую затрату
export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    const newExpense = await prisma.expense.create({
      data: {
        type: data.type,
        description: data.description,
        amount: data.amount,
        transportId: data.transportId || null,
        fieldId: data.fieldId || null
      }
    });

    return NextResponse.json(newExpense);
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка при добавлении расхода' }, { status: 500 });
  }
}

// DELETE: Удалить затрату
export async function DELETE(req: NextRequest) {
  const { id } = await req.json();

  try {
    await prisma.expense.delete({
      where: { id }
    });
    return NextResponse.json({ message: 'Расход успешно удалён' });
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка при удалении расхода' }, { status: 500 });
  }
}

