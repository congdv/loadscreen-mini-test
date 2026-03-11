const express = require('express');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.post('/api/employees', (req, res) => {
  const { name, department, position, email, phone, hire_date, salary } = req.body;

  if (!name || !department || !position || !email || !hire_date || salary == null) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO employees (name, department, position, email, phone, hire_date, salary)
      VALUES (@name, @department, @position, @email, @phone, @hire_date, @salary)
    `);
    const result = stmt.run({ name, department, position, email, phone: phone || null, hire_date, salary: Number(salary) });
    const newEmployee = db.prepare('SELECT * FROM employees WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newEmployee);
  } catch (err) {
    if (err.message.includes('UNIQUE')) {
      return res.status(409).json({ error: 'An employee with that email already exists.' });
    }
    res.status(500).json({ error: 'Database error.' });
  }
});

app.get('/api/employees', (req, res) => {
  const { search, department, sort = 'id', order = 'asc' } = req.query;

  const allowedSort = ['id', 'name', 'department', 'position', 'hire_date', 'salary'];
  const allowedOrder = ['asc', 'desc'];
  const sortCol = allowedSort.includes(sort) ? sort : 'id';
  const sortOrder = allowedOrder.includes(order) ? order : 'asc';

  let query = 'SELECT * FROM employees WHERE 1=1';
  const params = [];

  if (search) {
    query += ' AND (name LIKE ? OR position LIKE ? OR email LIKE ?)';
    const like = `%${search}%`;
    params.push(like, like, like);
  }

  if (department && department !== 'all') {
    query += ' AND department = ?';
    params.push(department);
  }

  query += ` ORDER BY ${sortCol} ${sortOrder.toUpperCase()}`;

  const employees = db.prepare(query).all(...params);
  res.json(employees);
});

app.get('/api/departments', (req, res) => {
  const departments = db.prepare('SELECT DISTINCT department FROM employees ORDER BY department').all();
  res.json(departments.map(d => d.department));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
