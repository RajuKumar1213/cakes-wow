import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import AddOn from '@/models/AddOn.models';

// Sample add-ons data
const sampleAddOns = [
  {
    name: "Personalized Message Card",
    price: 50,
    image: "/images/message-card.jpg",
    rating: 4.8
  },
  {
    name: "Premium Gift Wrapping",
    price: 100,
    image: "/images/gift-wrap.jpg",
    rating: 4.9
  },
  {
    name: "Surprise Balloon Bouquet",
    price: 150,
    image: "/images/balloons.jpg",
    rating: 4.7
  },
  {
    name: "Midnight Delivery",
    price: 200,
    image: "/images/midnight-delivery.jpg",
    rating: 4.6
  },
  {
    name: "Scented Candles",
    price: 75,
    image: "/images/candles.jpg",
    rating: 4.5
  },
  {
    name: "Fresh Flower Bouquet",
    price: 300,
    image: "/images/flowers.jpg",
    rating: 4.9
  },
  {
    name: "Premium Chocolate Box",
    price: 250,
    image: "/images/chocolate-box.jpg",
    rating: 4.8
  },
  {
    name: "Celebration Photo Frame",
    price: 120,
    image: "/images/photo-frame.jpg",
    rating: 4.4
  }
];

// POST - Seed add-ons data
export async function POST() {
  try {
    await connectDB();

    // Clear existing add-ons
    await AddOn.deleteMany({});

    // Insert sample add-ons
    const addOns = await AddOn.insertMany(sampleAddOns);

    return NextResponse.json({
      success: true,
      message: `Successfully seeded ${addOns.length} add-ons`,
      data: addOns
    });

  } catch (error) {
    console.error('Error seeding add-ons:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to seed add-ons',
        error: error.message 
      },
      { status: 500 }
    );
  }
}

// GET - Check if add-ons are seeded
export async function GET() {
  try {
    await connectDB();

    const count = await AddOn.countDocuments();

    return NextResponse.json({
      success: true,
      message: `Found ${count} add-ons in database`,
      count
    });

  } catch (error) {
    console.error('Error checking add-ons:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to check add-ons',
        error: error.message 
      },
      { status: 500 }
    );
  }
}
