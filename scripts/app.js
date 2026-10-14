import { state } from './state.js';
import { setupUI } from './ui.js';
import { loadRecords, saveRecords } from './storage.js';

document.addEventListener('DOMContentLoaded', async() => {
    if (loadRecords().length === 0) {
        try {
            const response = await fetch('seed.json');
            if (response.ok) {
                const seedData = await response.json();
                saveRecords(seedData);
                state.records = seedData;
            }
        }
        catch {
            
        }
    }
    setupUI(state);
});