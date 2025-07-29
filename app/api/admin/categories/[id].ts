import Category from '@/lib/db/models/category.model';
    import { NextRequest, NextResponse } from 'next/server';

    export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
      try {
        const category = await Category.findById(params.id).populate('parent');
        if (!category) return NextResponse.json({ error: 'Category not found' }, { status: 404 });
        return NextResponse.json(category, { status: 200 });
      } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
      }
    }

    export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
      try {
        const body = await req.json();
        const category = await Category.findByIdAndUpdate(params.id, body, { new: true });
        if (!category) return NextResponse.json({ error: 'Category not found' }, { status: 404 });
        return NextResponse.json(category, { status: 200 });
      } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
      }
    }

    export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
      try {
        const body = await req.json();
        const category = await Category.findByIdAndUpdate(params.id, body, { new: true });
        if (!category) return NextResponse.json({ error: 'Category not found' }, { status: 404 });
        return NextResponse.json(category, { status: 200 });
      } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
      }
    }

    export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
      try {
        const result = await Category.findByIdAndDelete(params.id);
        if (!result) return NextResponse.json({ error: 'Category not found' }, { status: 404 });
        return NextResponse.json({ message: 'Category deleted' }, { status: 200 });
      } catch (error) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
      }
    }