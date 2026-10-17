import { loadRecords, saveRecords, loadCap, savecap } from "./storage.js";
class AppState {
    constructor() {
        this.records = loadRecords();
        this.readingCap = loadCap();
        this.searchQuery = '';
        this.caseSensitive = false;
        this.sortField = null;
        this.sortDirection = 'asc';
        this.listeners = [];
    }
    subscribe(listener) {
        this.listeners.push(listener);
    }
    notify() {
        this.listeners.forEach(l => l(this));
    }
    setRecords(records) {
        this.records = records;
        saveRecords(records);
        this.notify();
    }
    addRecord(record) {
        record.id = `book_${Date.now()}`;
        record.createdAt = new Date().toISOString();
        record.updatedAt = new Date().toISOString();
        this.records.unshift(record);
        this.setRecords(this.records);
    }
    updateRecord(id, updatedFields) {
        this.records = this.records.map(r => {
            if(r.id == id) {
                return {...r, ...updatedFields, updatedAt: new Date().toISOString()};
            }
            return r;
        });
        this.setRecords(this.records);
    }
    deleteRecord(id) {
        this.records = this.records.filter(r => r.id !==id);
        this.setRecords(this.records);
    }
    setCap(cap) {
        this.readingCap = cap;
        savecap(cap);
        this.notify();
    }
    setSearch(query, caseSensitive) {
        this.searchQuery = query;
        this.caseSensitive = caseSensitive;
        this.notify();
    }
    setSort(field) {
        if (this.sortField === field) {
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        }
        else {
            this.sortField = field;
            this.sortDirection = 'asc';
        }
        this.notify();
    }
}

export const state = new AppState();