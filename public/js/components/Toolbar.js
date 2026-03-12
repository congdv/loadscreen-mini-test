import { html } from 'htm/preact';

export function Toolbar({ departments, search, deptFilter, resultCount, onSearch, onDeptChange, onAddClick }) {
    return html`
    <div class="toolbar">
      <div class="search-wrap">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
        </svg>
        <input
          type="text"
          placeholder="Search by name, position, or email…"
          value=${search}
          onInput=${e => onSearch(e.target.value)}
        />
      </div>

      <select value=${deptFilter} onChange=${e => onDeptChange(e.target.value)}>
        <option value="all">All Departments</option>
        ${departments.map(d => html`<option key=${d} value=${d}>${d}</option>`)}
      </select>

      <span id="resultCount">${resultCount}</span>

      <button class="btn-add" onClick=${onAddClick}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <path d="M12 5v14M5 12h14"/>
        </svg>
        Add Employee
      </button>
    </div>
  `;
}
