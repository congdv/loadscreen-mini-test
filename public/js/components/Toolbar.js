import { esc } from '../utils.js';

export function renderToolbar({ departments, search, deptFilter, resultCount }) {
  const deptOptions = departments
    .map(d => `<option value="${esc(d)}"${deptFilter === d ? ' selected' : ''}>${esc(d)}</option>`)
    .join('');

  return `
    <div class="toolbar">
      <div class="search-wrap">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
        </svg>
        <input
          id="search-input"
          type="text"
          placeholder="Search by name, position, or email\u2026"
          value="${esc(search)}"
        />
      </div>

      <select id="dept-filter">
        <option value="all"${deptFilter === 'all' ? ' selected' : ''}>All Departments</option>
        ${deptOptions}
      </select>

      <span id="resultCount">${esc(resultCount)}</span>

      <button id="btn-add" class="btn-add">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <path d="M12 5v14M5 12h14"/>
        </svg>
        Add Employee
      </button>
    </div>
    `;
}
