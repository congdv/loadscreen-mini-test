import { html } from 'htm/preact';
import { useState, useEffect } from 'preact/hooks';
import { avatarColor, initials, formatDate, formatSalary } from '../utils.js';
import { DEPT_COLORS } from '../config.js';

const PAGE_SIZE = 5;

const COLUMNS = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Employee' },
  { key: 'department', label: 'Department' },
  { key: 'position', label: 'Position' },
  { key: 'hire_date', label: 'Hire Date' },
  { key: 'salary', label: 'Salary' },
];

function EmployeeRow({ emp, onEdit, onDelete }) {
  const color = avatarColor(emp.name);
  const abbr = initials(emp.name);
  const [deptBg, deptText] = DEPT_COLORS[emp.department] || ['#e0e0e0', '#555'];

  return html`
    <tr>
      <td>#${emp.id}</td>
      <td>
        <div class="name-cell">
          <div class="avatar" style=${{ background: color }}>${abbr}</div>
          <div>
            <div class="name">${emp.name}</div>
            <div class="email">${emp.email}</div>
          </div>
        </div>
      </td>
      <td>
        <span class="badge" style=${{ background: deptBg, color: deptText }}>
          ${emp.department}
        </span>
      </td>
      <td>${emp.position}</td>
      <td>${formatDate(emp.hire_date)}</td>
      <td>${formatSalary(emp.salary)}</td>
      <td>
        <button class="btn-edit" onClick=${() => onEdit(emp)}>Edit</button>
        <button class="btn-delete" onClick=${() => {
      if (confirm(`Delete ${emp.name}? This cannot be undone.`)) onDelete(emp.id);
    }}>Delete</button>
      </td>
    </tr>
  `;
}

export function EmployeeTable({ employees, loading, sortCol, sortOrder, onSort, onEdit, onDelete }) {

  const [page, setPage] = useState(1);

  // Reset to first page whenever the employee list changes (search / filter / sort)
  useEffect(() => {
    setPage(1);
  }, [employees]);

  const totalPages = Math.max(1, Math.ceil(employees.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageEmployees = employees.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return html`
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            ${COLUMNS.map(({ key, label }) => html`
              <th
                key=${key}
                class=${sortCol === key ? 'active' : ''}
                onClick=${() => onSort(key)}
              >
                ${label}${' '}<span class="sort-icon">
                  ${sortCol === key && sortOrder === 'desc' ? '▼' : '▲'}
                </span>
              </th>
            `)}
            <th style="cursor:default">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${loading
      ? html`<tr><td colspan="7" style="text-align:center;padding:40px;color:#aaa;font-size:0.9rem">Loading employees…</td></tr>`
      : employees.length === 0
        ? html`
                  <tr><td colspan="7">
                    <div class="empty-state">
                      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
                      </svg>
                      <p>No employees match your search.</p>
                    </div>
                  </td></tr>`
        : pageEmployees.map(emp => html`<${EmployeeRow} key=${emp.id} emp=${emp} onEdit=${onEdit} onDelete=${onDelete}/>`)}
        </tbody>
      </table>
      ${!loading && employees.length > 0 && html`
        <div class="pagination">
          <button
            class="pagination-btn"
            disabled=${safePage === 1}
            onClick=${() => setPage(p => p - 1)}
          >← Previous</button>
          <span class="pagination-info">Page ${safePage} of ${totalPages}</span>
          <button
            class="pagination-btn"
            disabled=${safePage === totalPages}
            onClick=${() => setPage(p => p + 1)}
          >Next →</button>
        </div>
      `}
    </div>
  `;
}
