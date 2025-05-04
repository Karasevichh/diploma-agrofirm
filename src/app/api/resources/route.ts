import { NextResponse, NextRequest } from 'next/server';
// import { PrismaClient } from '@prisma/client';
import { prisma } from '@/lib/prisma';

// const prisma = new PrismaClient();

// POST: Добавить ресурс
export async function POST(req: Request) {
  try {
    const data = await req.json();
    const newResource = await prisma.resource.create({
      data,
    });
    return NextResponse.json(newResource);
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка при добавлении ресурса' }, { status: 500 });
  }
}

// GET: Получить все ресурсы
export async function GET() {
  try {
    const resources = await prisma.resource.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(resources);
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка при получении ресурсов' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, ...updateData } = await req.json();
    
    const updated = await prisma.resource.update({
      where: { id },
      data: updateData
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Update error:', error);
    return NextResponse.json(
      { error: 'Failed to update resource' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
  try {
    await prisma.resource.delete({
      where: { id },
    });
    return NextResponse.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete resource' }, { status: 500 });
  }
}
