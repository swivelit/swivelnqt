const dotenv = require('dotenv');
dotenv.config();

const { pool, connectDB } = require('./config/db');
const User = require('./models/User');

const demoUsers = [
  {
    name: 'Student Demo',
    email: 'student@swivel.com',
    password: 'student123',
    role: 'student',
  },
  {
    name: 'Trainer Demo',
    email: 'trainer@swivel.com',
    password: 'trainer123',
    role: 'trainer',
  },
  {
    name: 'Admin Demo',
    email: 'admin@swivel.com',
    password: 'admin123',
    role: 'admin',
  },
];

const seedDB = async () => {
  try {
    await connectDB();
    console.log('PostgreSQL connected for seeding...');

    await pool.query('DELETE FROM users');
    console.log('Existing users cleared');

    for (const u of demoUsers) {
      await User.create(u);
    }
    console.log('Demo users seeded successfully:');
    demoUsers.forEach((u) => console.log(`  [${u.role}] ${u.email}`));

    await pool.end();
    console.log('Done. PostgreSQL disconnected.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedDB();
