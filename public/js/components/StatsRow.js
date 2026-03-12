import { formatSalary } from '../utils.js';

export function renderStatsRow(allEmployees) {
  const total = allEmployees.length;
  const deptCount = new Set(allEmployees.map(e => e.department)).size;
  const avgSalary = total
    ? formatSalary(Math.round(allEmployees.reduce((s, e) => s + e.salary, 0) / total))
    : '\u2014';

  return `
    <div class="stats-row">
      <div class="stat-card">
        <span class="label">Total Employees</span>
        <span class="value">${total || '\u2014'}</span>
      </div>
      <div class="stat-card">
        <span class="label">Departments</span>
        <span class="value">${deptCount || '\u2014'}</span>
      </div>
      <div class="stat-card">
        <span class="label">Avg. Salary</span>
        <span class="value">${total ? avgSalary : '\u2014'}</span>
      </div>
    </div>
    `;
}
