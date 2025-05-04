import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const fields = await prisma.field.findMany({
      include: { harvest: true }, // Загружаем данные из Harvest
    });
    return NextResponse.json(fields);
  } catch (error) {
    console.error("Ошибка при получении полей:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { harvestId, coordinates, color } = body;

    if (!harvestId || !coordinates || !color) {
      return NextResponse.json({ error: "Некорректные данные" }, { status: 400 });
    }

    const newField = await prisma.field.create({
      data: {
        harvestId,
        coordinates,
        color,
      },
    });

    return NextResponse.json(newField, { status: 201 });
  } catch (error) {
    console.error("Ошибка при добавлении поля:", error);
    return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
  }
}

// export async function GET() {
//   try {
//     const fields = await prisma.field.findMany();
//     return NextResponse.json(fields);
//   } catch (error) {
//     console.error("Ошибка при получении полей:", error);
//     return NextResponse.json({ error: "Ошибка сервера" }, { status: 500 });
//   }
// }