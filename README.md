Book & Notes Vault

A responsive, feature-rich web application designed to track books, articles, and personal study notes. Built with modern, modular vanilla Javascripts(ES6+), CSS custom properties, and local persistence.


*Live Demo, Demo video and Repository
 - Live GitHub Pages URL: https://te1vel.github.io/book-notes-vault/

 - Demo video: https://youtu.be/vvNSskHMITE

- Repository URL: https://github.com/te1vel/book-notes-vault

*Features

- Intarective Dashboard: Real-time statistics tracking total titles, total pages read, top genres/tags, and reading goal pacing.
- Library catalog and search: full-text search with regex and case-sensitive option, plus live keyword highlighting.
- Sorting and filtering: sort your vault seamlessly by date added, title, or page cound in ascending and descending orders.
- CRUD operations: add, edit, and delete records with instant validation feedback.
- Data Persistence and backup: Stores data securely in browser "localStorage' with JSON export and import capabilities.
- Accessibility and Responsiveness: fully mobile fiendly layout with screen reader friendly aria live regions.

*Project Structure 

book-notes-vault/
|--index.html
|--tests.html
|--seed.json
|--README.md
|--scripts/
|    |--app.js
|    |--state.js
|    |--storage.js
|    |--ui.js
|    |--search.js
|    |--validators.js
|--styles/
|    |--main.css            
|--codepause-reports/
    |--codepause-export-****.json   

*Running the unit tests
This project includes a dedicated unit test suite(tests.html) to validate input rules( titles, authors, pages, dates and tags)
    1. open the project folder in visual studio code.
    2. run the project using Live Server (or a local development server like Python's http.server).
    3 Navigate to: http://localhost:5500/tests.html (or your local server port) to view all passing test results.

*How to run locally
    1. clone the repository
        git clone https://github.com/Te1vel/book-notes-vault.git
    2. Open the directory in VScode
    3. Open index.html using Live Server to view and interact with the application.