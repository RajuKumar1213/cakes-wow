import { NextResponse } from 'next/server';
import seedDatabase from '@/lib/seedData';

export async function POST() {
  try {
    console.log('Starting database seeding...');
    await seedDatabase();
    
    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully with sample categories and products!'
    });
  } catch (error) {
    console.error('Error seeding database:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to seed database',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// For safety, only allow seeding in development
export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'Seeding is only allowed in development mode' },
      { status: 403 }
    );
  }

  return NextResponse.json({
    message: 'Use POST request to seed the database with sample data',
    endpoint: '/api/seed',
    note: 'This will create sample categories and products'
  });
}
