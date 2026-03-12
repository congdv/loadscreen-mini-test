import { AVATAR_COLORS } from './config.js';

export function avatarColor(name) {
    let h = 0;
    for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
    return AVATAR_COLORS[h % AVATAR_COLORS.length];
}

export function initials(name) {
    return name.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase();
}

export function formatDate(d) {
    const [y, m, day] = d.split('-');
    return `${day}/${m}/${y}`;
}

export function formatSalary(n) {
    return '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 0 });
}

/** Escape HTML special chars to prevent XSS in innerHTML templates. */
export function esc(str) {
    return String(str ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
