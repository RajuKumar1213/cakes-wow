import Admin from '@/models/Admin.models';
import connectDB from '@/lib/mongodb';
import bcrypt from 'bcryptjs';

async function seedAdmin() {
  try {
    await connectDB();
    
    // Check if admin already exists
    const adminExists = await Admin.adminExists();
    
    if (adminExists) {
      console.log('✅ Admin account already exists');
      return;
    }
    
    // Create the single admin account
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const adminData = {
      email: 'admin@bakingo.com',
      password: hashedPassword,
      isSuperAdmin: true
    };
    
    await Admin.createOrUpdateAdmin(adminData);
    
    console.log('✅ Admin account created successfully');
    console.log('📧 Email: admin@bakingo.com');
    console.log('🔑 Password: admin123');
    
  } catch (error) {
    console.error('❌ Error seeding admin:', error.message);
  }
}

// Run if called directly
if (require.main === module) {
  seedAdmin().then(() => {
    process.exit(0);
  });
}

export default seedAdmin;
