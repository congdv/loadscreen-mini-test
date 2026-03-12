import { html } from 'htm/preact';
import { useState, useEffect, useRef } from 'preact/hooks';
import { createEmployee, updateEmployee } from '../api.js';

const EMPTY_FIELDS = { name: '', email: '', phone: '', department: '', position: '', hire_date: '', salary: '' };
const EMPTY_ERRORS = { name: '', email: '', department: '', position: '', hire_date: '', salary: '' };

function validate(fields) {
    const errors = { ...EMPTY_ERRORS };
    let ok = true;
    if (!fields.name.trim()) { errors.name = 'Full name is required.'; ok = false; }
    if (!fields.email.trim()) { errors.email = 'Email is required.'; ok = false; }
    else if (!/\S+@\S+\.\S+/.test(fields.email)) { errors.email = 'Enter a valid email.'; ok = false; }
    if (!fields.department) { errors.department = 'Department is required.'; ok = false; }
    if (!fields.position.trim()) { errors.position = 'Position is required.'; ok = false; }
    if (!fields.hire_date) { errors.hire_date = 'Hire date is required.'; ok = false; }
    if (fields.salary === '' || isNaN(Number(fields.salary)) || Number(fields.salary) < 0) { errors.salary = 'Enter a valid salary.'; ok = false; }
    return { ok, errors };
}

export function Modal({ open, employee, departments, onClose, onSaved }) {
    const isEdit = employee != null && employee !== false;
    const title = isEdit ? 'Edit Employee' : 'Add New Employee';
    const btnText = isEdit ? 'Save Changes' : 'Add Employee';

    const [fields, setFields] = useState(EMPTY_FIELDS);
    const [errors, setErrors] = useState(EMPTY_ERRORS);
    const [alert, setAlert] = useState({ msg: '', type: '' }); // type: 'success'|'error'|''
    const [submitting, setSubmitting] = useState(false);
    const timerRef = useRef(null);

    // Reset form whenever modal opens/switches mode
    useEffect(() => {
        if (!open) return;
        clearTimeout(timerRef.current);
        setErrors(EMPTY_ERRORS);
        setAlert({ msg: '', type: '' });
        setSubmitting(false);
        if (isEdit) {
            setFields({
                name: employee.name ?? '',
                email: employee.email ?? '',
                phone: employee.phone ?? '',
                department: employee.department ?? '',
                position: employee.position ?? '',
                hire_date: employee.hire_date ?? '',
                salary: employee.salary ?? '',
            });
        } else {
            setFields(EMPTY_FIELDS);
        }
    }, [open, employee]);

    // Close on Escape
    useEffect(() => {
        if (!open) return;
        const handler = e => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [open, onClose]);

    function setField(key, value) {
        setFields(f => ({ ...f, [key]: value }));
        if (errors[key]) setErrors(e => ({ ...e, [key]: '' }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        const { ok, errors: errs } = validate(fields);
        if (!ok) { setErrors(errs); return; }

        setSubmitting(true);
        setAlert({ msg: '', type: '' });

        const payload = { ...fields, salary: Number(fields.salary) };
        const result = isEdit
            ? await updateEmployee(employee.id, payload)
            : await createEmployee(payload);

        setSubmitting(false);

        if (result.ok) {
            setAlert({ msg: isEdit ? 'Employee updated successfully!' : 'Employee added successfully!', type: 'success' });
            timerRef.current = setTimeout(() => {
                onClose();
                onSaved();
            }, 900);
        } else {
            setAlert({ msg: result.data?.error || 'Something went wrong.', type: 'error' });
        }
    }

    function handleBackdropClick(e) {
        if (e.target === e.currentTarget) onClose();
    }

    const Field = ({ id, label, required, children }) => html`
    <div class=${`form-group${id === 'name' ? ' full' : ''}`}>
      <label for=${`field-${id}`}>
        ${label}${required && html` <span style="color:#e63946">*</span>`}
      </label>
      ${children}
      <span class="form-error">${errors[id] || ''}</span>
    </div>
  `;

    return html`
    <div
      class=${`modal-overlay${open ? ' open' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modalTitle"
      onClick=${handleBackdropClick}
    >
      <div class="modal">
        <div class="modal-header">
          <h2 id="modalTitle">${title}</h2>
          <button class="modal-close" aria-label="Close" onClick=${onClose}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <form onSubmit=${handleSubmit} novalidate>
          <div class="form-grid">

            <${Field} id="name" label="Full Name" required>
              <input
                id="field-name"
                type="text"
                class=${errors.name ? 'error' : ''}
                placeholder="e.g. Jane Doe"
                value=${fields.name}
                onInput=${e => setField('name', e.target.value)}
              />
            <//>

            <${Field} id="email" label="Email" required>
              <input
                id="field-email"
                type="email"
                class=${errors.email ? 'error' : ''}
                placeholder="jane@example.com"
                value=${fields.email}
                onInput=${e => setField('email', e.target.value)}
              />
            <//>

            <${Field} id="phone" label="Phone">
              <input
                id="field-phone"
                type="text"
                placeholder="555-0123"
                value=${fields.phone}
                onInput=${e => setField('phone', e.target.value)}
              />
            <//>

            <${Field} id="department" label="Department" required>
              <select
                id="field-department"
                class=${errors.department ? 'error' : ''}
                value=${fields.department}
                onChange=${e => setField('department', e.target.value)}
              >
                <option value="">Select department…</option>
                ${departments.map(d => html`<option key=${d} value=${d}>${d}</option>`)}
              </select>
            <//>

            <${Field} id="position" label="Position" required>
              <input
                id="field-position"
                type="text"
                class=${errors.position ? 'error' : ''}
                placeholder="e.g. Senior Engineer"
                value=${fields.position}
                onInput=${e => setField('position', e.target.value)}
              />
            <//>

            <${Field} id="hire_date" label="Hire Date" required>
              <input
                id="field-hire_date"
                type="date"
                class=${errors.hire_date ? 'error' : ''}
                value=${fields.hire_date}
                onInput=${e => setField('hire_date', e.target.value)}
              />
            <//>

            <${Field} id="salary" label="Salary (USD)" required>
              <input
                id="field-salary"
                type="number"
                class=${errors.salary ? 'error' : ''}
                min="0"
                step="1000"
                placeholder="e.g. 75000"
                value=${fields.salary}
                onInput=${e => setField('salary', e.target.value)}
              />
            <//>

          </div>

          ${alert.type && html`
            <div class=${`submit-alert ${alert.type}`}>${alert.msg}</div>
          `}

          <div class="modal-footer">
            <button type="button" class="btn-cancel" onClick=${onClose}>Cancel</button>
            <button type="submit" class="btn-submit" disabled=${submitting}>
              ${submitting ? 'Saving…' : btnText}
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
}
