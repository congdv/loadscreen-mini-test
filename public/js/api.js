/**
 * Fetch all departments.
 * @returns {Promise<string[]>}
 */
export async function fetchDepartments() {
    const res = await fetch('/api/departments');
    if (!res.ok) throw new Error('Failed to load departments.');
    return res.json();
}

/**
 * Fetch employees with optional filtering / sorting.
 * @param {{ search?: string, department?: string, sort?: string, order?: string }} opts
 * @returns {Promise<object[]>}
 */
export async function fetchEmployees({ search = '', department = 'all', sort = 'id', order = 'asc' } = {}) {
    const params = new URLSearchParams({ search, department, sort, order });
    const res = await fetch(`/api/employees?${params}`);
    if (!res.ok) throw new Error('Failed to load employees.');
    return res.json();
}

/**
 * Create a new employee (POST).
 * @param {object} payload
 * @returns {Promise<{ ok: boolean, status: number, data: object }>}
 */
export async function createEmployee(payload) {
    const res = await fetch('/api/employees', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    const data = await res.json();
    return { ok: res.ok, status: res.status, data };
}

/**
 * Update an existing employee (PUT).
 * @param {number} id
 * @param {object} payload
 * @returns {Promise<{ ok: boolean, status: number, data: object }>}
 */
export async function updateEmployee(id, payload) {
    const res = await fetch(`/api/employees/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    const data = await res.json();
    return { ok: res.ok, status: res.status, data };
}

/**
 * Delete an employee (DELETE).
 * @param {number} id
 * @returns {Promise<{ ok: boolean, status: number }>}
 */
export async function deleteEmployee(id) {
    const res = await fetch(`/api/employees/${id}`, { method: 'DELETE' });
    return { ok: res.ok, status: res.status };
}
