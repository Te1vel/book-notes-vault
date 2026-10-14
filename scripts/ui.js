import {
    compileRegex, highlight
} from './search.js'
import {
    validateTitle, validateAuthor, validatePages, validateDate, validateTag, hasDuplicateWords
} from './validators.js'

export function setupUi(state) {
    const tbody = document.getElementById('records-tbody');
    const statCount = document.getElementById('stat-count');
    const statSum = document.getElementById('stat-sum');
    const statTopTag = document.getElementById('stat-top-tag');
    const statCapstatus = document.getElementById('stat-cap-status');
    const trendChart = document.getElementById('trend-chart');
    const liveRegion = document.getElementById('live-region');

    const form = document.getElementById('record-form');
    const formTitle = document.getElementById('form-title');
    const titleInput = document.getElementById('title');
    const recordIdInput = document.getElementById('record-id');
    const authorInput = document.getElementById('author');
    const pagesInput = document.getElementById('pages');
    const tagInput = document.getElementById('tag');
    const dateInput = document.getElementById('dateAdded');
    const cancelBtn = document.getElementById('cancel-btn');

    const SearchInput = document.getElementById('search-input');
    const caseToggle = document.getElementById('case-sensitive-toggle');
    const searchError = document.getElementById('search-error');

    const readingCapInput = document.getElementById('reading-cap');
    const hoursEst = document.getElementById('hours-est');
    readingCapInput.value = state.readingCap;

    function updateHoursest(pages) {
        hoursEst.textContent = (pages / 30).toFixed(1);
    }
    updateHoursest(state.readingCap);

    function render() {
        let filtered = [...state.records];
        const flags = state.caseSensitive ? 'g' : 'gi';
        const re = compileRegex(state.searchQuery, flags);

        if (state.searchQuery) {
            if (!re) {
                searchError.textContent = "Invalid Regular Expression";
            }
            else {
                searchError.textContent = "";
                filtered = filtered.filter(r =>
                    re.test(r.title) || re.test(r.author) || re.test(r.tag) || re.test(String(r.pages))
                );
            }
        }
        else {
            searchError.textContent = "";
        }
        if(state.sortField) {
            filtered.sort((a, b) => {
                let valA = a[state.sortField];
                let valB = b[state.sortField];
                if (typeof valA === 'string') valA = valA.toLowerCase();
                if (typeof valB === 'string') valB = valB.toLowerCase();

                if (valA < valB) return state.sortDirection === 'asc' ? -1 : 1;
                if (valA > valB) return state.sortDirection === 'asc' ? 1 : -1;
                return 0;
            });
        }
        tbody.innerHTML = '';
        if (filtered.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No records found in vault.</td></tr>';
        }
        else {
            filtered.forEach(r => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${highlight(r.title, re)}</td>
                    <td>${highlight(r.author, re)}</td>
                    <td>${r.pages}</td>
                    <td>${highlight(r.tag, re)}</td>
                    <td>${r.dateAdded}</td>
                    <td>
                        <button class="btn secondary edit-btn" data-id="${r.id}">Edit</button>
                        <button class="btn danger delete-btn" data-id="${r.id}">Delete</button>
                    </td>
                `;
                tbody.appendChild(tr);
            });
        }
        const totalCount = state.records.length;
        const totalPages = state.records.reduce((acc, curr) => acc + Number(curr.pages), 0);

        statCount.textContent = totalCount;
        statSum.textContent = totalPages;

        const tagCounts = state.records.reduced((acc, curr) => {
            acc[curr.tag] = (acc[curr.tag] || 0) + 1;
            return acc;
        }, {});
        const topTag = Object.keys(tagCounts).reduce((a, b) => tagCounts[a] > tagCounts[b] ? a : b, 'None');
        statTopTag.textContent = topTag !== 'undefined' ? topTag : 'None';

        const remainingPages = state.readingCap - totalPages;
        if (totalPages > state.readingCap) {
            statCapstatus.textContent = 'Goal exceeded by ${Math.abs(remainingPages)} pages.';
            statCapstatus.style.color = 'var(--error)';
            liveRegion.setAttribute('aria-live', 'assertive');
            liveRegion.textContent = 'You have surpassed your reading goal target by ${Math.abs(remainingPages)} pages.';
        }
        else {
            statCapstatus.textContent = '${remainingPages} pages to goal';
            statCapstatus.style.color = 'var(--success)';
            liveRegion.setAttribute('aria-live', 'polite');
            liveRegion.textContent = 'Reading target status: ${remainingPages} pages remaining to reach your goal.';
        }
        trendChart.innerHTML = '';
        for (let i = 0; i<7; i++) {
            const bar = document.createElement('div');
            bar.className = 'chart-bar';
            const randmHeight = Math.floor(Math.random() * 80) + 20;
            bar.style.height = '${randomHeight}%';
            trendChart.appendChild(bar);
        }
    }
    state.subscribe(render);
    render();

    SearchInput.addEventListener('input', (e) => {
        state.setSearch(e.target.value, caseToggle.checked);
    });
    caseToggle.addEventListener('change', () => {
        state.setSearch(SearchInput.value, caseToggle.checked);
    });

    document.getElementById('sort-date').addEventListener('click', () => state.setSort('dateAdded'));
    document.getElementById('sort-title').addEventListener('click', () => state.setSort('title'));
    document.getElementById('sort-pages').addEventListener('click', () => state.setSort('pages'));

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = titleInput.value.trim();
        const author = authorInput.value.trim();
        const pages = pagesInput.value.trim();
        const tag = tagInput.value;
        const dateAdded = dateInput.value;
        
        let valid = true;
        document.querySelectorAll('.error-message').forEach(el => el.textContent = '');

        if (!validateTitle(title)) {
            document.getElementById('title-error').textContent = "Invalid title format (no leading/trailing spaces).";
            valid = false;
        }
        else if (hasDuplicateWords(title)) {
            document.getElementById('title-error').textContent = "Warning: Duplicate adjacent words found in title.";
        }
        if (!validateAuthor(author)) {
            document.getElementById('author-error').textContent = "enter a valid author name.";
            valid = false;
        }
        if(!validatePages(pages)) {
            document.getElementById('pages-error').textContent = "Enter a valid positive number for pages.";
            valid = false;
        }
        if (!validateDate(dateAdded)) {
            document.getElementById('date-error').textContent = "Enter a valid date.";
            valid = false;
        }

        if (!valid) return;

        const recordData = {title, author, pages: parseInt(pages, 10), tag, dateAdded};
        const editingId = recordIdInput.value;

        if (editingId) {
            state.updateRecord(editingId, recordData);
            formTitle.textContent = "Add New Book/Note";
            cancelBtn.style.display = 'none';
        }
        else {
            state.addRecord(recordData);
        }
        
        form.reset();
        recordIdInput.value = '';
    });
    cancelBtn.addEventListener('click', () => {
        form.reset();
        recordIdInput.value = '';
        formTitle.textContent = "Add New Book/Note";
        cancelBtn.style.display = 'none';
    });
    tbody.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        if (!id) return;

        if (e.target.classList.contains('delete-btn')) {
            if (confirm("Are you sure you want to delete this record?")) {
                state.deleteRecord(id);
            }
        }
        else if (e.target.classList.contains('edit-btn')) {
            const record = state.records.find(r => r.id === id);
            if (record) {
                recordIdInput.value = record.id;
                titleInput.value = record.title;
                authorInput.value = record.author;
                pagesInput.value = record.pages;
                tagInput.value = record.tag;
                dateInput.value = record.dateAdded;
                formTitle.textContent = "Edit record";
                cancelBtn.style.display = 'inline-block';
                document.getElementById('form-section').scrollIntoView({ behavior: 'smooth'});
            }
        }
    });
    readingCapInput.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        if (!isNaN(val)) {
            state.setCap(val);
            updateHoursest(val);
        }
    });
    document.getElementById('export-btn').addEventListener('click', () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state.records, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", "vault_backup.json");
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
    });
    document.getElementById('import-file').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try{
                const parsed = JSON.parse(event.target.result);
                if (Array.isArray(parsed)) {
                    state.setRecords(parsed);
                    document.getElementById('settings-msg').textContent = "Vault data imported successfully.";
                }
                else {
                    alert("Invalid JSON format: Rott must be an array.");
                }
            }
            catch {
                alert("Failed to parse JSON file.");
            }
        };
        reader.readAsText(file);
    });
}
