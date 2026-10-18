import {
    compileRegex, highlight
} from './search.js'
import {
    validateTitle, validateAuthor, validatePages, validateDate, validateTag, hasDuplicateWords
} from './validators.js'

export function setupUI(state) {
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
    const saveBtn = document.getElementById('save-btn');
    const cancelBtn = document.getElementById('cancel-btn');

    const SearchInput = document.getElementById('search-input');
    const caseToggle = document.getElementById('case-sensitive-toggle');
    const searchError = document.getElementById('search-error');

    const readingCapInput = document.getElementById('reading-cap');
    const hoursEst = document.getElementById('hours-est');
    const settingsMsg = document.getElementById('search-msg');

    function updateHoursest(pages) {
        if (!hoursEst) return;
        const hours = (Number(pages) / 30).toFixed(1);
        hoursEst.textContent = isNaN(hours) ? '0.0' :hours;
    }
    if (readingCapInput && state.readingCap){
        readingCapInput.value = state.readingCap;
        updateHoursest(state.readingCap);
    }
    function getTagCategoryClass(tag) {
        const normalized = (tag || '').toLowerCase().trim();
        if (normalized.includes('philosophy')) return 'philosophy';
        if (normalized.includes('fiction')) return 'fiction';
        if (normalized.includes('programming'))return'programming';
        if (normalized.includes('architecture'))return'architecture';
        if (normalized.includes('science'))return'science';
        return 'general';
    }
    
    function render() {
        let filtered = [...state.records];
        const query = (state.searchQuery || '').trim();
        const flags = state.caseSensitive ? 'g' : 'gi';
        const regex = compileRegex(query, flags);

        if (query) {
            if (!regex) {
                if (searchError) searchError.textContent = "Invalid term.";
            }
            else {
                if (searchError) searchError.textContent = "";
                filtered = filtered.filter(r => {
                    const titleMatch = regex.test(r.title || '');
                    const authorMatch = regex.test (r.author || '');
                    const tagMatch = regex.test (r.tag || '');
                    const pagesMatch = regex.test (String(r.pages) || '');
                    return titleMatch || authorMatch || tagMatch || pagesMatch;
                
                });
            }
        }
        else {
            if (searchError) searchError.textContent = "";
        }

        if(state.sortField) {
            filtered.sort((a, b) => {
                let valA = a[state.sortField];
                let valB = b[state.sortField];
                if (state.sortField === 'pages') {
                    valA = Number(valA) || 0;
                    valB = Number(valB) || 0;
                } else {
                    valA = String(valA || '').toLowerCase();
                    valB = String(valB || '').toLowerCase();
                }
                if (valA < valB) return state.sortDirection === 'asc' ? -1 : 1;
                if (valA > valB) return state.sortDirection === 'asc' ? 1 : -1;
                return 0;
            });
        }
        if (tbody) {
            tbody.innerHTML = '';
            if (filtered.length === 0) {
                tbody.innerHTML = `
                   <tr>
                        <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 3rem 1rem;">
                            No records found in vault. Click "Add New Book/Note" below to add an entry!
                        </td>
                    </tr>
                `;
            } else {
                filtered.forEach(record => {
                    const tr = document.createElement('tr');
                    const categoryClass = getTagCategoryClass(record.tag);
                    const tagLabel = record.tag || 'General';

                    tr.innerHTML = `
                        <td><strong>${highlight(record.title, regex)}</strong></td>
                        <td style="color: var(--text-secondary);">${highlight(record.author, regex)}</td>
                        <td><span style="font-variant-numeric: tabular-nums; font-weight: 500;">${Number(record.pages).toLocaleString()}</span> <span style="color: var(--text-muted); font-size: 0.85rem;">pages</span></td>
                        <td><span class="tag-badge ${categoryClass}" data-category="${tagLabel}">${highlight(tagLabel, regex)}</span></td>
                        <td style="color: var(--text-muted); font-size: 0.85rem; font-variant-numeric: tabular-nums;">${record.dateAdded || '—'}</td>
                        <td>
                            <button type="button" class="btn secondary edit-btn" data-id="${record.id}" aria-label="Edit ${record.title}">Edit</button>
                            <button type="button" class="btn danger delete-btn" data-id="${record.id}" aria-label="Delete ${record.title}">Delete</button>
                        </td>                    
                    `;
                    tbody.appendChild(tr);
                });
            }
        }
        const totalCount = state.records.length;
        const totalPages = state.records.reduce((acc, curr) => acc + Number(curr.pages), 0);

        if (statCount) statCount.textContent = totalCount;
        if (statSum) statSum.textContent = totalPages.toLocaleString();

        if (statTopTag) {
            if (totalCount === 0) {
                statTopTag.textContent = 'None';
            } else {
                const tagCounts = {};
                state.records.forEach(r => {
                    const tag = r.tag || 'General';
                    tagCounts[tag] = (tagCounts[tag] || 0) +1;
                });
                let topTag = 'None';
                let maxCount = 0;
                for (const [tag, count] of Object.entries(tagCounts)) {
                    if (count > maxCount) {
                        maxCount = count;
                        topTag = tag;
                    }
                }
                statTopTag.textContent = topTag;
            }
        }

        const targetGoal = Number(state.readingCap) || 1500;
        const remainingPages = targetGoal - totalPages;

        if (statCapstatus) {
            if(totalPages >= targetGoal) {
                const overpages = totalPages - targetGoal;
                statCapstatus.textContent = overpages > 0 ? `Goal exceeded by ${overpages.toLocaleString()}p!` : 'Goal reached!';
                statCapstatus.style.color = `var(--accent-emerald)`;
                if (liveRegion) {
                    liveRegion.setAttribute('aria-live', 'polite');
                    liveRegion.textContent = `Reading target achieved: ${totalPages} pages read.`
                }
            } else {
                statCapstatus.textContent = `${remainingPages.toLocaleString()} pages to goal`;
                statCapstatus.style.color = 'var(--text-secondary)';
                if (liveRegion) {
                    liveRegion.setAttribute('aria-live', 'polite');
                    liveRegion.textContent = `Reading target status: ${remainingPages} pages remaining.`;
                }
            }
        }
        if(trendChart) {
            trendChart.innerHTML = '';
            const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            const sampleHeights = [45, 25, 70, 30, 55, 85, 95];
            const samplePages = [38, 22, 64, 28, 48, 76, 85];

            dayLabels.forEach((day, index) => {
                const isWeeked = index === 5;
                const isPeak = index === 6;
                const heightVal = sampleHeights[index];
                const pageCount = samplePages[index];

                const barWrap = document.createElement('div');
                barWrap.className = 'chart-bar-wrap';

                const badge = document.createElement ('span');
                badge.className = `bar-val-badge ${isPeak ? 'peak' : ''}`;
                badge.textContent = `${pageCount}p`;

                const barFill = document.createElement('div');
                barFill.className = `bar-fill ${isWeeked ? 'highlight' : ''}`;
                barFill.style.height = `${heightVal}%`;
                barFill.title = `${day}: ${pageCount} pages read`;

                const label = document.createElement('span');
                label.className = `bar-day ${isWeeked ? 'highlight': ''}`;
                label.textContent = day;

                barWrap.appendChild(badge);
                barWrap.appendChild(barFill);
                barWrap.appendChild(label);
                trendChart.appendChild(barWrap);
            });
        }
    }

    if (typeof state.subscribe === 'function') {
        state.subscribe(render);
    }
    render();

    if (SearchInput) {
        SearchInput.addEventListener('input', (e) => {
            state.setSearch(e.target.value, caseToggle ? caseToggle.checked : false);
        });
    }
    if (caseToggle) {
        caseToggle.addEventListener('change', () => {
            state.setSearch(SearchInput ? SearchInput.value : '', caseToggle.checked);
        });
    }

    const sortButtons = [
        { id: 'sort-date', field: 'dateAdded'},
        { id: 'sort-title', field: 'title'},
        { id: 'sort-pages', field: 'pages'}
    ];

    sortButtons.forEach(({ id, field }) => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.addEventListener('click', () => {
                state.setSort(field);

                sortButtons.forEach(b => {
                    const otherBtn = document.getElementById(b.id);
                    if (otherBtn) otherBtn.setAttribute('aria-sort', 'none');
                });
                const currentDir = state.sortDirection === 'asc' ? 'ascending' : 'descending';
                btn.setAttribute('aria-sort', currentDir);
            });
        }
    });

    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const title = (titleInput.value || '').trim();
            const author = (authorInput.value || '').trim();
            const pages = (pagesInput.value || '').trim();
            const tag = tagInput ? tagInput.value : 'Programming';
            const dateAdded = dateInput ? dateInput.value : '';

            document.querySelectorAll('.error-message').forEach(el => el.textContent = '');

            let isValid = true;

            if (typeof validateTitle === 'function' && !validateTitle(title)) {
                const titleErr = document.getElementById('title-error');
                if (titleErr) titleErr.textContent = "Please enter a valid title (no trailing spaces).";
                isValid = false;
            } else if (typeof hasDuplicateWords === 'function' && hasDuplicateWords(title)){
                const titleErr = document.getElementById('title-error');
                if(titleErr) titleErr.textContent = "Notice: Repeated adjacent words found in title.";
            }

            if (typeof validateAuthor === 'function' && !validateTitle(author)) {
                const authorErr = document.getElementById('author-error');
                if (authorErr) authorErr.textContent = "Please enter a valid author name.";
                isValid = false;
            }
            if (typeof validatePages === 'function' && !validatePages(pages)) {
                const pagesErr = document.getElementById('pages-error');
                if (pagesErr) pagesErr.textContent = "Please enter a positive number of pages.";
                isValid = false;
            }
            if (typeof validateDate === 'function' && !validateDate(dateAdded)) {
                const dateErr = document.getElementById('date-error');
                if (dateErr) dateErr.textContent = "Please select a valid date.";
                isValid = false;
            }
            if (!isValid) return;

            const recordData = {
                title,
                author,
                pages: parseInt(pages, 10),
                tag,
                dateAdded
            };

            const editingId = recordIdInput ? recordIdInput.value : '';

            if (editingId) {
                state.updateRecord(editingId, recordData);
                resetForm();
            } else {
                state.addRecord(recordData);
                resetForm();
            }
        });
    }

    function resetForm() {
        if (!form) return;
        form.reset();
        if (recordIdInput) recordIdInput.value = '';
        if (formTitle) formTitle.textContent = "Add New Book/Note";
        if (saveBtn) saveBtn.textContent = "Save Record";
        if (cancelBtn) cancelBtn.style.display = 'none';
        document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
    }

    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            resetForm();
        });
    }

    if (tbody) {
        tbody.addEventListener('click', (e) => {
            const target = e.target;
            const id = target.getAttribute('data-id');
            if (!id) return;

            if (target.classList.contains('delete-btn')) {
                const confirmed = window.confirm("Are you sure you want to delete this record from your vault?");
                if (confirmed) {
                    state.deleteRecord(id);
                }
            }

            if (target.classList.contains('edit-btn')) {
                const record = state.records.find(r => String(r.id) === String(id));
                if (record) {
                    if (recordIdInput) recordIdInput.value = record.id;
                    if (titleInput) titleInput.value = record.title || '';
                    if (authorInput) authorInput.value = record.author || '';
                    if (pagesInput) pagesInput.value = record.pages || '';
                    if (tagInput) tagInput.value = record.tag || 'Programming';
                    if (dateInput) dateInput.value = record.dateAdded || '';

                    if (formTitle) formTitle.textContent = "Edit Book / Note";
                    if (saveBtn) saveBtn.textContent = "Update Record";
                    if (cancelBtn) cancelBtn.style.display = 'inline-flex';

                    const formSection = document.getElementById('form-section');
                    if (formSection) {
                        formSection.scrollIntoView({ behavior: 'smooth'});
                    }
                }
            }
        });
    }

    if (readingCapInput) {
        readingCapInput.addEventListener('input', (e) => {
            const val = parseInt(e.target.value, 10);
            if (!isNaN(val) && val > 0) {
                state.setCap(val);
                updateHoursEstimate(val);
            }
        });
    }

    const exportBtn = document.getElementById('export-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state.records, null, 2));
            const downloadAnchor = document.createElement('a');
            downloadAnchor.setAttribute("href", dataStr);
            downloadAnchor.setAttribute("download", `vault_backup_${new Date().toISOString().slice(0, 10)}.json`);
            document.body.appendChild(downloadAnchor);
            downloadAnchor.click();
            downloadAnchor.remove();

            if(settingsMsg) {
                settingsMsg.textContent = "Backup exported successfully!";
                setTimeout(() => {settingsMsg.textContent = ""; }, 4000);
            }
        });
    }

    const importInput = document.getElementById('import-file');
    if (importInput) {
        importInput.addEventListener('change', (e) => {
            const file = e.target.files && e.target.files[0];
            if(!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const parsed = JSON.parse(event.target.result);
                    if (Array.isArray(parsed)) {
                        state.setRecords(parsed);
                        if (settingsMsg) {
                            settingsMsg.textContent =  `Successfully imported ${parsed.length} records into your vault!`;
                            setTimeout(() => {settingsMsg.textContent = "";}, 4000);
                        }
                    } else {
                        alert("Invalid file: The imported JSON file must contain records.");
                    }      
                } catch (err) {
                    alert("Failed to parse JSON file. Please ensure it is a valid JSON file.");
                }    
                importInput.value = '';
            };
            reader.readAsText(file);
        });
    }
}