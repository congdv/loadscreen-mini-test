import { avatarColor, initials, formatDate, formatSalary, esc } from '../utils.js';
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

function renderRow(emp) {
  const color = avatarColor(emp.name);
  const abbr = initials(emp.name);
  const [deptBg, deptText] = DEPT_COLORS[emp.department] || ['#e0e0e0', '#555'];

  return `
    <tr>
      <td>#${esc(emp.id)}</td>
      <td>
        <div class="name-cell">
          <div class="avatar" style="background:${esc(color)}">${esc(abbr)}</div>
          <div>
            <div class="name">${esc(emp.name)}</div>
            <div class="email">${esc(emp.email)}</div>
          </div>
        </div>
      </td>
      <td>
        <span class="badge" style="background:${esc(deptBg)};color:${esc(deptText)}">
          ${esc(emp.department)}
        </span>
      </td>
      <td>${esc(emp.position)}</td>
      <td>${esc(formatDate(emp.hire_date))}</td>
      <td>${esc(formatSalary(emp.salary))}</td>
      <td>
        <button class="btn-edit"   data-id="${emp.id}">Edit</button>
        <button class="btn-delete" data-id="${emp.id}">Delete</button>
      </td>
    </tr>`;
}

export function renderEmployeeTable({ employees, loading, sortCol, sortOrder, page }) {
  const totalPages = Math.max(1, Math.ceil(employees.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageEmployees = employees.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const headers = COLUMNS.map(({ key, label }) => `
      <th data-col="${key}" class="${sortCol === key ? 'active' : ''}">
        ${label} <span class="sort-icon">${sortCol === key && sortOrder === 'desc' ? '▼' : '▲'}</span>
      </th>`).join('');

  let tbody;
  if (loading) {
    tbody = `<tr><td colspan="7" style="text-align:center;padding:40px;color:#aaa;font-size:0.9rem">Loading employees\u2026</td></tr>`;
  } else if (employees.length === 0) {
    tbody = `
        <tr><td colspan="7">
          <div class="empty-state">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <p>No employees match your search.</p>
          </div>
        </td></tr>`;
  } else {
    tbody = pageEmployees.map(renderRow).join('');
  }

  const pagination = (!loading && employees.length > 0) ? `
    <div class="pagination">
      <button id="btn-prev" class="pagination-btn" ${safePage === 1 ? 'disabled' : ''}>&#8592; Previous</button>
      <span class="pagination-info">Page ${safePage} of ${totalPages}</span>
      <button id="btn-next" class="pagination-btn" ${safePage === totalPages ? 'disabled' : ''}>Next &#8594;</button>
    </div>` : '';

  return `
    <div class="table-wrap">
      <table>
        <thead><tr>${headers}<th style="cursor:default">Actions</th></tr></thead>
        <tbody>${tbody}</tbody>
      </table>
      ${pagination}
    </div>`;
}
