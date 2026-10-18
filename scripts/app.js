import { state } from './state.js';
import { setupUI } from './ui.js';
import { loadRecords, saveRecords } from './storage.js';

document.addEventListener('DOMContentLoaded', async() => {
    setupUI(state);
});