import Category from '@/lib/db/models/category.model';
import { NextRequest, NextResponse } from 'next/server';

export default async function handler(req: NextRequest) {
  try {
    if (req.method === 'GET') {
      const categories = await Category.find()
        .select('name slug image isFeatured')
        .sort({ name: 1 })
        .lean();
      return NextResponse.json(categories, { status: 200 });
        } else if (req.method === 'POST') {
          const body = await req.json();
          const categoryData = {
            name: body.name,
            slug: body.slug,
            parent: body.parent || null,
            image: body.image,
            bannerImage: body.bannerImage || null,
            description: body.description,
            isFeatured: body.isFeatured || false
          };
          const newCategory = await Category.create(categoryData);
          return NextResponse.json(newCategory, { status: 201 });
        }
        return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
      } catch (error: unknown) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
      }
    }