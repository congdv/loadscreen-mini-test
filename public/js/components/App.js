import { html } from 'htm/preact';
import { useState, useEffect, useRef } from 'preact/hooks';
import { fetchDepartments, fetchEmployees, deleteEmployee } from '../api.js';
import { Header } from './Header.js';
import { StatsRow } from './StatsRow.js';
import { Toolbar } from './Toolbar.js';
import { EmployeeTable } from './EmployeeTable.js';
import { Modal } from './Modal.js';

export function App() {
    // ── Data ──────────────────────────────────────────────────────────────────
    const [allEmployees, setAllEmployees] = useState([]); // unfiltered, for stats
    const [employees, setEmployees] = useState([]); // currently displayed (filtered/sorted)
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);

    // ── Filter / sort state ───────────────────────────────────────────────────
    const [search, setSearch] = useState('');
    const [deptFilter, setDeptFilter] = useState('all');
    const [sortCol, setSortCol] = useState('id');
    const [sortOrder, setSortOrder] = useState('asc');

    // ── Modal state ───────────────────────────────────────────────────────────
    // null = closed | false = open (add mode) | emp object = open (edit mode)
    const [modalEmployee, setModalEmployee] = useState(null);

    const debounceRef = useRef(null);

    // ── Load departments once on mount ────────────────────────────────────────
    useEffect(() => {
        fetchDepartments().then(setDepartments).catch(console.error);
    }, []);

    // ── Reload all employees (for stats) when a save happens ─────────────────
    async function reloadAll() {
        try {
            const [all, depts] = await Promise.all([
                fetchEmployees(),
                fetchDepartments(),
            ]);
            setAllEmployees(all);
            setDepartments(depts);
        } catch (err) {
            console.error(err);
        }
    }

    useEffect(() => {
        reloadAll();
    }, []);

    // ── Reload filtered/sorted table whenever filter/sort state changes ───────
    useEffect(() => {
        clearTimeout(debounceRef.current);
        const delay = search !== '' ? 250 : 0;

        debounceRef.current = setTimeout(async () => {
            setLoading(true);
            try {
                const data = await fetchEmployees({ search, department: deptFilter, sort: sortCol, order: sortOrder });
                setEmployees(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }, delay);

        return () => clearTimeout(debounceRef.current);
    }, [search, deptFilter, sortCol, sortOrder]);

    // ── Sort toggle ───────────────────────────────────────────────────────────
    function handleSort(col) {
        if (col === sortCol) {
            setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
        } else {
            setSortCol(col);
            setSortOrder('asc');
        }
    }

    // ── Delete an employee ─────────────────────────────────────────────────────
    async function handleDelete(id) {
        await deleteEmployee(id);
        await reloadAll();
        const data = await fetchEmployees({ search, department: deptFilter, sort: sortCol, order: sortOrder });
        setEmployees(data);
    }

    // ── After a save: reload data + close modal ───────────────────────────────
    async function handleSaved() {
        await reloadAll();
        // Also refresh the current filtered view
        const data = await fetchEmployees({ search, department: deptFilter, sort: sortCol, order: sortOrder });
        setEmployees(data);
    }

    // ── Result count for toolbar ──────────────────────────────────────────────
    const resultCount = loading
        ? ''
        : `${employees.length} result${employees.length !== 1 ? 's' : ''}`;

    return html`
    <${Header}/>

    <div class="container">
      <${StatsRow} allEmployees=${allEmployees}/>

      <${Toolbar}
        departments=${departments}
        search=${search}
        deptFilter=${deptFilter}
        resultCount=${resultCount}
        onSearch=${setSearch}
        onDeptChange=${setDeptFilter}
        onAddClick=${() => setModalEmployee(false)}
      />

      <${EmployeeTable}
        employees=${employees}
        loading=${loading}
        sortCol=${sortCol}
        sortOrder=${sortOrder}
        onSort=${handleSort}
        onEdit=${emp => setModalEmployee(emp)}
        onDelete=${handleDelete}
      />
    </div>

    <${Modal}
      open=${modalEmployee !== null}
      employee=${modalEmployee === false ? null : modalEmployee}
      departments=${departments}
      onClose=${() => setModalEmployee(null)}
      onSaved=${handleSaved}
    />
  `;
}
