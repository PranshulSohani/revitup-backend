const mongoose = require('mongoose');
const User = require("../../src/models/User");
const Role = require('../../src/models/Role');
const bcrypt = require('bcrypt');

const createAdminUser = async () => {
  try {

    await mongoose.connect("mongodb://localhost:27017");

    // Check for existing admin user
    const existingAdmin = await User.findOne({ role_id : 1 });
    if (existingAdmin) {
      console.log('Admin user already exists. Skipping creation.');
      return;
    }

     // Find role_id for the Admin role
     const adminRole = await Role.findOne({ role_name: 'Admin' });
     if (!adminRole) {
       console.error('Admin role not found. Cannot create admin user.');
       return;
     }

    // Create new admin user  

    const adminUser = new User({
        full_name: 'admin',
        email: 'admin_rev@mailinator.com',
        mobile_number : "+918785478595",
        designation : "Super Admin",
        role_id : 1,
        password: 'Admin@123'
      });

    await adminUser.save();

    console.log('Admin user created successfully.');

  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await mongoose.disconnect();
  }
};

createAdminUser();
