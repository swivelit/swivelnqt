const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');

const User = {
  // Find a single user by a field — pass { email } or { id }
  async findOne({ email, id } = {}) {
    let result;
    if (email !== undefined) {
      result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    } else if (id !== undefined) {
      result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    } else {
      return null;
    }
    return result.rows[0] || null;
  },

  // Find by id, optionally excluding password
  async findById(id, { excludePassword = true } = {}) {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    const user = result.rows[0] || null;
    if (user && excludePassword) {
      delete user.password;
    }
    return user;
  },

  // Find all users, with optional role filter, always excluding password
  async find({ role } = {}) {
    let result;
    if (role) {
      result = await pool.query(
        'SELECT id, name, email, role, is_active, created_at, updated_at FROM users WHERE role = $1',
        [role]
      );
    } else {
      result = await pool.query(
        'SELECT id, name, email, role, is_active, created_at, updated_at FROM users'
      );
    }
    return result.rows;
  },

  // Create a user — hashes password automatically
  async create({ name, email, password, role = 'student' }) {
    // Validate
    if (!name || !name.trim()) throw new Error('Name is required');
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) throw new Error('Please enter a valid email');
    if (!password || password.length < 6) throw new Error('Password must be at least 6 characters');
    if (!['student', 'trainer', 'admin'].includes(role)) throw new Error('Invalid role');

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await pool.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, is_active, created_at, updated_at`,
      [name.trim(), email.toLowerCase().trim(), hashedPassword, role]
    );
    return result.rows[0];
  },

  // Update user by id, returns updated user without password
  async findByIdAndUpdate(id, { name, email, role, isActive }) {
    // Build dynamic SET clause for only provided fields
    const fields = [];
    const values = [];
    let idx = 1;

    if (name !== undefined)     { fields.push(`name = $${idx++}`);      values.push(name); }
    if (email !== undefined)    { fields.push(`email = $${idx++}`);     values.push(email); }
    if (role !== undefined)     { fields.push(`role = $${idx++}`);      values.push(role); }
    if (isActive !== undefined) { fields.push(`is_active = $${idx++}`); values.push(isActive); }

    if (fields.length === 0) {
      return await User.findById(id);
    }

    fields.push(`updated_at = NOW()`);
    values.push(id);

    const result = await pool.query(
      `UPDATE users SET ${fields.join(', ')}
       WHERE id = $${idx}
       RETURNING id, name, email, role, is_active, created_at, updated_at`,
      values
    );
    return result.rows[0] || null;
  },

  // Delete user by id, returns deleted user row
  async findByIdAndDelete(id) {
    const result = await pool.query(
      'DELETE FROM users WHERE id = $1 RETURNING id, name, email, role',
      [id]
    );
    return result.rows[0] || null;
  },

  // Compare plain-text password to stored hash
  async matchPassword(enteredPassword, storedHash) {
    return await bcrypt.compare(enteredPassword, storedHash);
  },
};

module.exports = User;
