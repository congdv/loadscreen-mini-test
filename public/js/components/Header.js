export function renderHeader() {
  return `
    <header>
      <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
        <circle cx="18" cy="18" r="18" fill="rgba(255,255,255,0.1)"/>
        <circle cx="18" cy="14" r="5" fill="white" opacity="0.9"/>
        <path d="M8 28c0-5.523 4.477-10 10-10s10 4.477 10 10" stroke="white" stroke-width="2" stroke-linecap="round" opacity="0.9"/>
      </svg>
      <div>
        <h1>Employee Directory</h1>
        <p>Manage and view all company employees</p>
      </div>
    </header>
    `;
}
