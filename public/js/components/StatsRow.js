import { html } from 'htm/preact';
import { formatSalary } from '../utils.js';

export function StatsRow({ allEmployees }) {
    const total = allEmployees.length;
    const deptCount = new Set(allEmployees.map(e => e.department)).size;
    const avgSalary = total
        ? formatSalary(Math.round(allEmployees.reduce((s, e) => s + e.salary, 0) / total))
        : '—';

    return html`
    <div class="stats-row">
      <div class="stat-card">
        <span class="label">Total Employees</span>
        <span class="value">${total || '—'}</span>
      </div>
      <div class="stat-card">
        <span class="label">Departments</span>
        <span class="value">${deptCount || '—'}</span>
      </div>
      <div class="stat-card">
        <span class="label">Avg. Salary</span>
        <span class="value">${total ? avgSalary : '—'}</span>
      </div>
    </div>
  `;
}
