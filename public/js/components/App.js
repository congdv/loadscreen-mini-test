import { fetchDepartments, fetchEmployees, deleteEmployee, fetchSalaryByDepartment } from '../api.js';
import { renderHeader } from './Header.js';
import { renderStatsRow } from './StatsRow.js';
import { renderToolbar } from './Toolbar.js';
import { renderEmployeeTable } from './EmployeeTable.js';
import { renderChartShell, updateChart } from './SalaryPieChart.js';
import { initModal, openModal } from './Modal.js';

// ── App state ─────────────────────────────────────────────────────────────────
const state = {
    allEmployees: [],
    employees: [],
    departments: [],
    loading: true,
    search: '',
    deptFilter: 'all',
    sortCol: 'id',
    sortOrder: 'asc',
    page: 1,
};

let debounceTimer = null;

// ── Entry point ───────────────────────────────────────────────────────────────
export function init(root) {
    // Static shell — IDs used as render targets
    root.innerHTML = `
        <div id="app-header"></div>
        <div class="container">
            <div id="stats-root"></div>
            <div id="chart-root"></div>
            <div id="toolbar-root"></div>
            <div id="table-root"></div>
        </div>
        <div id="modal-root"></div>`;

    document.getElementById('app-header').innerHTML = renderHeader();
    document.getElementById('chart-root').innerHTML = renderChartShell();

    initModal(document.getElementById('modal-root'));

    // Event delegation — all interactions bubble up to root
    root.addEventListener('click', handleClick);
    root.addEventListener('input', handleInput);
    root.addEventListener('change', handleChange);

    loadAll();
    loadFiltered();
}

// ── Event handlers ────────────────────────────────────────────────────────────
function handleClick(e) {
    // Column sort (th[data-col])
    const th = e.target.closest('th[data-col]');
    if (th) {
        const col = th.dataset.col;
        if (col === state.sortCol) {
            state.sortOrder = state.sortOrder === 'asc' ? 'desc' : 'asc';
        } else {
            state.sortCol = col;
            state.sortOrder = 'asc';
        }
        state.page = 1;
        loadFiltered();
        return;
    }

    // Pagination
    if (e.target.id === 'btn-prev') { state.page--; renderTable(); return; }
    if (e.target.id === 'btn-next') { state.page++; renderTable(); return; }

    // Add employee
    if (e.target.closest('#btn-add')) {
        openModal(null, state.departments, handleSaved);
        return;
    }

    // Edit employee
    const editBtn = e.target.closest('.btn-edit');
    if (editBtn) {
        const id = Number(editBtn.dataset.id);
        const emp = state.employees.find(emp => emp.id === id);
        if (emp) openModal(emp, state.departments, handleSaved);
        return;
    }

    // Delete employee
    const delBtn = e.target.closest('.btn-delete');
    if (delBtn) {
        const id = Number(delBtn.dataset.id);
        const emp = state.employees.find(emp => emp.id === id);
        if (emp && confirm(`Delete ${emp.name}? This cannot be undone.`)) {
            deleteEmployee(id)
                .then(() => Promise.all([loadAll(), loadFiltered()]))
                .catch(console.error);
        }
        return;
    }
}

function handleInput(e) {
    if (e.target.id === 'search-input') {
        state.search = e.target.value;
        state.page = 1;
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(loadFiltered, 250);
    }
}

function handleChange(e) {
    if (e.target.id === 'dept-filter') {
        state.deptFilter = e.target.value;
        state.page = 1;
        loadFiltered();
    }
}

// ── Data loaders ──────────────────────────────────────────────────────────────

/** Reload unfiltered list, departments, stats, chart. */
async function loadAll() {
    try {
        const [all, depts, salaryData] = await Promise.all([
            fetchEmployees(),
            fetchDepartments(),
            fetchSalaryByDepartment(),
        ]);

        const deptsChanged =
            depts.length !== state.departments.length ||
            depts.some((d, i) => d !== state.departments[i]);

        state.allEmployees = all;
        state.departments = depts;

        renderStats();
        updateChart(document.getElementById('chart-root'), salaryData);

        // Re-render toolbar only when departments list actually changed
        if (deptsChanged) renderToolbarSection();
    } catch (err) {
        console.error(err);
    }
}

/** Reload the filtered/sorted employee list and refresh the table. */
async function loadFiltered() {
    state.loading = true;
    renderTable();
    try {
        const data = await fetchEmployees({
            search: state.search,
            department: state.deptFilter,
            sort: state.sortCol,
            order: state.sortOrder,
        });
        state.employees = data;
    } catch (err) {
        console.error(err);
        state.employees = [];
    } finally {
        state.loading = false;
        renderTable();
        updateResultCount();
    }
}

async function handleSaved() {
    await Promise.all([loadAll(), loadFiltered()]);
}

// ── Renderers ─────────────────────────────────────────────────────────────────
function renderStats() {
    document.getElementById('stats-root').innerHTML = renderStatsRow(state.allEmployees);
}

/** Full toolbar re-render (only when departments change or on init). */
function renderToolbarSection() {
    const resultCount = state.loading
        ? ''
        : `${state.employees.length} result${state.employees.length !== 1 ? 's' : ''}`;

    document.getElementById('toolbar-root').innerHTML = renderToolbar({
        departments: state.departments,
        search: state.search,
        deptFilter: state.deptFilter,
        resultCount,
    });
}

/** Update only the result-count span — avoids disrupting the search input focus. */
function updateResultCount() {
    // Ensure toolbar is rendered at least once
    const toolbarRoot = document.getElementById('toolbar-root');
    if (!toolbarRoot.innerHTML) { renderToolbarSection(); return; }

    const span = document.getElementById('resultCount');
    if (span) {
        span.textContent = state.loading
            ? ''
            : `${state.employees.length} result${state.employees.length !== 1 ? 's' : ''}`;
    }
}

function renderTable() {
    document.getElementById('table-root').innerHTML = renderEmployeeTable({
        employees: state.employees,
        loading: state.loading,
        sortCol: state.sortCol,
        sortOrder: state.sortOrder,
        page: state.page,
    });
}
