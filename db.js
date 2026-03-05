const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'employees.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS employees (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    department TEXT NOT NULL,
    position TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    hire_date TEXT NOT NULL,
    salary REAL NOT NULL
  )
`);

const count = db.prepare('SELECT COUNT(*) as count FROM employees').get();
if (count.count === 0) {
  const insert = db.prepare(`
    INSERT INTO employees (name, department, position, email, phone, hire_date, salary)
    VALUES (@name, @department, @position, @email, @phone, @hire_date, @salary)
  `);

  const seed = db.transaction((employees) => {
    for (const emp of employees) insert.run(emp);
  });

  seed([
    { name: 'Alice Johnson',   department: 'Engineering',  position: 'Senior Engineer',     email: 'alice@example.com',   phone: '555-0101', hire_date: '2021-03-15', salary: 95000 },
    { name: 'Bob Smith',       department: 'Engineering',  position: 'Junior Engineer',     email: 'bob@example.com',     phone: '555-0102', hire_date: '2023-07-01', salary: 65000 },
    { name: 'Carol White',     department: 'Marketing',    position: 'Marketing Manager',   email: 'carol@example.com',   phone: '555-0103', hire_date: '2020-01-20', salary: 80000 },
    { name: 'David Brown',     department: 'HR',           position: 'HR Specialist',       email: 'david@example.com',   phone: '555-0104', hire_date: '2022-09-10', salary: 58000 },
    { name: 'Eva Martinez',    department: 'Finance',      position: 'Financial Analyst',   email: 'eva@example.com',     phone: '555-0105', hire_date: '2019-11-05', salary: 72000 },
    { name: 'Frank Lee',       department: 'Engineering',  position: 'DevOps Engineer',     email: 'frank@example.com',   phone: '555-0106', hire_date: '2022-04-18', salary: 88000 },
    { name: 'Grace Kim',       department: 'Design',       position: 'UI/UX Designer',      email: 'grace@example.com',   phone: '555-0107', hire_date: '2021-08-30', salary: 75000 },
    { name: 'Henry Wilson',    department: 'Marketing',    position: 'Content Strategist',  email: 'henry@example.com',   phone: '555-0108', hire_date: '2023-02-14', salary: 60000 },
    { name: 'Iris Chen',       department: 'Finance',      position: 'Accountant',          email: 'iris@example.com',    phone: '555-0109', hire_date: '2020-06-22', salary: 62000 },
    { name: 'James Taylor',    department: 'HR',           position: 'HR Manager',          email: 'james@example.com',   phone: '555-0110', hire_date: '2018-12-01', salary: 85000 },
  ]);
}

module.exports = db;
