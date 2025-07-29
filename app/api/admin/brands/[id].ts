import Brand from '@/lib/db/models/brand.model';
import { NextRequest, NextResponse } from 'next/server';

export default async function handler(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (req.method === 'GET') {
      const brand = await Brand.findById(id).lean();
      if (!brand) {
        return NextResponse.json(
          { error: 'Brand not found' },
          { status: 404 }
        );
      }
      // Serialize MongoDB document to plain JavaScript object
      return NextResponse.json(JSON.parse(JSON.stringify(brand)), { status: 200 });
    } else if (req.method === 'PUT') {
      const body = await req.json();
      const updatedBrand = await Brand.findByIdAndUpdate(id, body, { new: true }).lean();
      if (!updatedBrand) {
        return NextResponse.json(
          { error: 'Brand not found' },
          { status: 404 }
        );
      }
      // Serialize MongoDB document to plain JavaScript object
      return NextResponse.json(JSON.parse(JSON.stringify(updatedBrand)), { status: 200 });
    } else if (req.method === 'DELETE') {
      const deletedBrand = await Brand.findByIdAndDelete(id);
      if (!deletedBrand) {
        return NextResponse.json(
          { error: 'Brand not found' },
          { status: 404 }
        );
      }
      return new NextResponse(null, { status: 204 });
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