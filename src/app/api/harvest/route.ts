// import { NextResponse } from 'next/server';

// // Заглушка для хранения данных (в реальном проекте это будет база данных)
// let harvestData = [
//   { crop: 'Пшеница', area: 120, yield: 300 },
//   { crop: 'Кукуруза', area: 80, yield: 200 },
// ];

// export async function GET() {
//   return NextResponse.json(harvestData);
// }

// export async function POST(request: Request) {
//   const newHarvest = await request.json();
//   harvestData.push(newHarvest);
//   return NextResponse.json({ message: 'Data saved successfully', data: newHarvest });
// }

import { NextApiRequest, NextApiResponse } from 'next';
import { NextRequest, NextResponse } from 'next/server';
// import { PrismaClient } from '@prisma/client';
import { prisma } from '@/lib/prisma';
// const prisma = new PrismaClient();

// export default async function handler(req: NextApiRequest, res: NextApiResponse) {
//   if (req.method === 'GET') {
//     const data = await prisma.harvest.findMany();
//     return res.status(200).json(data);
//   }

//   if (req.method === 'POST') {
//     const { crop, area, yield: harvestYield } = req.body;
//     const newHarvest = await prisma.harvest.create({
//       data: { crop, area, yield: harvestYield },
//     });
//     return res.status(201).json(newHarvest);
//   }

//   res.setHeader('Allow', ['GET', 'POST']);
//   res.status(405).end(`Method ${req.method} Not Allowed`);
// }

export async function GET() {
  try {
    const harvestData = await prisma.harvest.findMany();
    return NextResponse.json(harvestData);
    console.log(harvestData)
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка при получении данных' }, { status: 500 });
  }
}

// POST: Добавление новой записи об урожае
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const newHarvest = await prisma.harvest.create({
      data: {
        crop: body.crop,
        area: body.area,
        yield: body.yield,
      },
    });
    return NextResponse.json(newHarvest);
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка при добавлении данных' }, { status: 500 });
  }
}


