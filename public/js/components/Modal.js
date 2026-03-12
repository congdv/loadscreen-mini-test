import { createEmployee, updateEmployee } from '../api.js';
import { esc } from '../utils.js';

// ── Module-level state ────────────────────────────────────────────────────────
let _overlay = null;   // the .modal-overlay element (persistent in DOM)
let _employee = null;   // null = add mode | object = edit mode
let _onSaved = null;   // callback after successful save
let _timer = null;

// Field / error state (avoids re-rendering the whole form on every keystroke)
const fields = { name: '', email: '', phone: '', department: '', position: '', hire_date: '', salary: '' };
const errors = { name: '', email: '', department: '', position: '', hire_date: '', salary: '' };

// ── Validation ────────────────────────────────────────────────────────────────
function validate() {
    let ok = true;
    Object.keys(errors).forEach(k => errors[k] = '');
    if (!fields.name.trim()) { errors.name = 'Full name is required.'; ok = false; }
    if (!fields.email.trim()) { errors.email = 'Email is required.'; ok = false; }
    else if (!/\S+@\S+\.\S+/.test(fields.email)) { errors.email = 'Enter a valid email.'; ok = false; }
    if (!fields.department) { errors.department = 'Department is required.'; ok = false; }
    if (!fields.position.trim()) { errors.position = 'Position is required.'; ok = false; }
    if (!fields.hire_date) { errors.hire_date = 'Hire date is required.'; ok = false; }
    if (fields.salary === '' || isNaN(Number(fields.salary)) || Number(fields.salary) < 0) {
        errors.salary = 'Enter a valid salary.'; ok = false;
    }
    return ok;
}

// ── DOM helpers ───────────────────────────────────────────────────────────────
function $(sel) { return _overlay.querySelector(sel); }

function showError(key, msg) {
    const el = _overlay.querySelector(`[data-err="${key}"]`);
    if (el) el.textContent = msg || '';
}

function clearErrors() {
    _overlay.querySelectorAll('[data-err]').forEach(el => el.textContent = '');
    _overlay.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
}

function setAlert(msg, type) {
    const el = $('#submit-alert');
    el.className = `submit-alert${type ? ' ' + type : ''}`;
    el.textContent = msg;
}

function syncFieldError(key) {
    const el = $('#field-' + key);
    if (el) el.classList.toggle('error', !!errors[key]);
    showError(key, errors[key]);
}

// ── Init: inject HTML once, wire all listeners ────────────────────────────────
export function initModal(container) {
    container.innerHTML = `
    <div
      class="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modalTitle"
    >
      <div class="modal">
        <div class="modal-header">
          <h2 id="modalTitle">Add New Employee</h2>
          <button class="modal-close" id="modal-close-btn" aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <form id="employee-form" novalidate>
          <div class="form-grid">

            <div class="form-group full">
              <label for="field-name">Full Name <span style="color:#e63946">*</span></label>
              <input id="field-name" type="text" placeholder="e.g. Jane Doe" />
              <span class="form-error" data-err="name"></span>
            </div>

            <div class="form-group">
              <label for="field-email">Email <span style="color:#e63946">*</span></label>
              <input id="field-email" type="email" placeholder="jane@example.com" />
              <span class="form-error" data-err="email"></span>
            </div>

            <div class="form-group">
              <label for="field-phone">Phone</label>
              <input id="field-phone" type="text" placeholder="555-0123" />
              <span class="form-error" data-err="phone"></span>
            </div>

            <div class="form-group">
              <label for="field-department">Department <span style="color:#e63946">*</span></label>
              <select id="field-department">
                <option value="">Select department&hellip;</option>
              </select>
              <span class="form-error" data-err="department"></span>
            </div>

            <div class="form-group">
              <label for="field-position">Position <span style="color:#e63946">*</span></label>
              <input id="field-position" type="text" placeholder="e.g. Senior Engineer" />
              <span class="form-error" data-err="position"></span>
            </div>

            <div class="form-group">
              <label for="field-hire_date">Hire Date <span style="color:#e63946">*</span></label>
              <input id="field-hire_date" type="date" />
              <span class="form-error" data-err="hire_date"></span>
            </div>

            <div class="form-group">
              <label for="field-salary">Salary (USD) <span style="color:#e63946">*</span></label>
              <input id="field-salary" type="number" min="0" step="1000" placeholder="e.g. 75000" />
              <span class="form-error" data-err="salary"></span>
            </div>

          </div>

          <div id="submit-alert" class="submit-alert"></div>

          <div class="modal-footer">
            <button type="button" id="modal-cancel-btn" class="btn-cancel">Cancel</button>
            <button type="submit" id="modal-submit-btn" class="btn-submit">Add Employee</button>
          </div>
        </form>
      </div>
    </div>`;

    _overlay = container.querySelector('.modal-overlay');

    // Close handlers
    const close = () => closeModal();
    $('#modal-close-btn').addEventListener('click', close);
    $('#modal-cancel-btn').addEventListener('click', close);
    _overlay.addEventListener('click', e => { if (e.target === _overlay) close(); });
    window.addEventListener('keydown', e => { if (e.key === 'Escape' && _overlay.classList.contains('open')) close(); });

    // Live field sync — update `fields` object and clear per-field error
    ['name', 'email', 'phone', 'position', 'hire_date', 'salary'].forEach(key => {
        $('#field-' + key).addEventListener('input', e => {
            fields[key] = e.target.value;
            if (errors[key]) { errors[key] = ''; syncFieldError(key); }
        });
    });
    $('#field-department').addEventListener('change', e => {
        fields.department = e.target.value;
        if (errors.department) { errors.department = ''; syncFieldError('department'); }
    });

    // Submit
    $('#employee-form').addEventListener('submit', handleSubmit);
}

// ── Open ──────────────────────────────────────────────────────────────────────
export function openModal(employee, departments, onSaved) {
    _employee = employee;   // null → add, object → edit
    _onSaved = onSaved;
    clearTimeout(_timer);

    const isEdit = employee != null;
    $('#modalTitle').textContent = isEdit ? 'Edit Employee' : 'Add New Employee';
    $('#modal-submit-btn').textContent = isEdit ? 'Save Changes' : 'Add Employee';
    $('#modal-submit-btn').disabled = false;

    // Populate fields object
    Object.assign(fields, isEdit
        ? {
            name: employee.name ?? '', email: employee.email ?? '', phone: employee.phone ?? '',
            department: employee.department ?? '', position: employee.position ?? '',
            hire_date: employee.hire_date ?? '', salary: String(employee.salary ?? '')
        }
        : { name: '', email: '', phone: '', department: '', position: '', hire_date: '', salary: '' }
    );

    // Sync DOM inputs
    ['name', 'email', 'phone', 'position', 'hire_date', 'salary'].forEach(key => {
        const el = $('#field-' + key);
        if (el) el.value = fields[key];
    });

    // Department options
    const sel = $('#field-department');
    sel.innerHTML = `<option value="">Select department&hellip;</option>` +
        departments.map(d => `<option value="${esc(d)}"${fields.department === d ? ' selected' : ''}>${esc(d)}</option>`).join('');

    clearErrors();
    setAlert('', '');

    _overlay.classList.add('open');
}

export function closeModal() {
    _overlay.classList.remove('open');
}

// ── Submit ────────────────────────────────────────────────────────────────────
async function handleSubmit(e) {
    e.preventDefault();

    if (!validate()) {
        Object.keys(errors).forEach(key => syncFieldError(key));
        return;
    }

    const submitBtn = $('#modal-submit-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving\u2026';
    setAlert('', '');

    const payload = { ...fields, salary: Number(fields.salary) };
    const result = _employee != null
        ? await updateEmployee(_employee.id, payload)
        : await createEmployee(payload);

    if (result.ok) {
        setAlert(_employee != null ? 'Employee updated successfully!' : 'Employee added successfully!', 'success');
        _timer = setTimeout(() => {
            closeModal();
            if (_onSaved) _onSaved();
        }, 900);
    } else {
        submitBtn.disabled = false;
        submitBtn.textContent = _employee != null ? 'Save Changes' : 'Add Employee';
        setAlert(result.data?.error || 'Something went wrong.', 'error');
    }
}
