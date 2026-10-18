const KEY = 'app:vault_data';
const CAP_KEY = 'app:reading_cap';

export const loadRecords = () => {
    try {
        const data = localStorage.getItem(KEY);
        return data ? JSON.parse(data) : [];
    } catch (err) {
        console.error("Failed to load from storage:", err);
        return [];
    }
};

export const saveRecords = (data) => {
    try {
        localStorage.setItem(KEY, JSON.stringify(data));
    } catch (err) {
        console.error("Failed to save to storage:", err);
    }
};

export const loadCap = () => parseInt(localStorage.getItem(CAP_KEY), 10) || 1500;
export const savecap = (cap) => localStorage.setItem(CAP_KEY, cap);