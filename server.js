const express = require('express');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, 'public')));

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
