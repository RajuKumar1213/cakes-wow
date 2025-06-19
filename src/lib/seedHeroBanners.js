import dbConnect from "@/lib/mongodb";
import HeroBanner from "@/models/HeroBanner.models";

const seedHeroBanners = async () => {
  try {
    await dbConnect();
    
    // Clear existing banners
    await HeroBanner.deleteMany({});
    
    // Create default banners
    const defaultBanners = [
      {
        title: "Every Kid Deserves a Cake that Wows!",
        image: "/images/kid.webp",
        alt: "Jungle Cakes",
        href: "/jungle-cakes",
        sortOrder: 0,
        isActive: true,
      },
      {
        title: "Engaged in Love Celebrated in Cake",
        image: "/images/engagement1.webp",
        alt: "Engagement Cakes",
        href: "/engagement-cakes",
        sortOrder: 1,
        isActive: true,
      },
      {
        title: "Anniversary Cakes",
        image: "/images/aniversary5.webp",
        alt: "Anniversary Cakes",
        href: "/anniversary-cakes",
        sortOrder: 2,
        isActive: true,
      },
      {
        title: "Make Every Birthday Special",
        image: "/images/birthday1.webp",
        alt: "Birthday Cakes",
        href: "/birthday-cakes",
        sortOrder: 3,
        isActive: true,
      },
      {
        title: "Bride to Be Cake",
        image: "/images/bridetobe.webp",
        alt: "Bride to Be Cakes",
        href: "/bride-to-be-cakes",
        sortOrder: 4,
        isActive: true,
      },
    ];
    
    await HeroBanner.insertMany(defaultBanners);
    
    console.log("✅ Hero banners seeded successfully!");
    console.log(`Created ${defaultBanners.length} hero banners`);
    
  } catch (error) {
    console.error("❌ Error seeding hero banners:", error);
  }
};

export default seedHeroBanners;
