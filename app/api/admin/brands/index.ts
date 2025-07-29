import Brand from '@/lib/db/models/brand.model';
import { NextRequest, NextResponse } from 'next/server';

export default async function handler(req: NextRequest) {
  try {
    if (req.method === 'GET') {
      const brands = await Brand.find().sort({ name: 1 }).lean();
      // Serialize MongoDB documents to plain JavaScript objects
      return NextResponse.json(JSON.parse(JSON.stringify(brands)), { status: 200 });
    } else if (req.method === 'POST') {
      const body = await req.json();
      const newBrand = await Brand.create(body);
      // Serialize MongoDB document to plain JavaScript object
      return NextResponse.json(JSON.parse(JSON.stringify(newBrand)), { status: 201 });
    }
    return NextResponse.json(
      { error: 'Method not allowed' }, 
      { status: 405 }
    );
  } catch (error: unknown) {
    return NextResponse.json(
      { error: (error as Error).message }, 
      { status: 500 }
    );
  }
}