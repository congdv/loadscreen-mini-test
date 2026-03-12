import { render } from 'preact';
import { html } from 'htm/preact';
import { App } from './components/App.js';

render(html`<${App}/>`, document.getElementById('app'));
