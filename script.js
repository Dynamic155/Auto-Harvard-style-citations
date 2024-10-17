document.addEventListener('DOMContentLoaded', () => {
    const addCitationBtn = document.getElementById('addCitationBtn');
    const copyAllBtn = document.getElementById('copyAllBtn');
    const deleteAllBtn = document.getElementById('deleteAllBtn');
    const popup = document.getElementById('popup');
    const closePopup = document.querySelector('.close');
    const submitUrls = document.getElementById('submitUrls');
    const urlInput = document.getElementById('urlInput');
    const citationsList = document.getElementById('citationsList');
    const modeToggle = document.getElementById('modeToggle');

    const editPopup = document.createElement('div');
    editPopup.classList.add('popup');
    editPopup.innerHTML = `
        <div class="popup-content">
            <span class="close">&times;</span>
            <h2>Edit Citation</h2>
            <div class="edit-form">
                <label for="editAuthorFirst">Author First Name:</label>
                <input type="text" id="editAuthorFirst" placeholder="First Name">
            </div>
            <div class="edit-form">
                <label for="editAuthorLast">Author Last Name:</label>
                <input type="text" id="editAuthorLast" placeholder="Last Name">
            </div>
            <div class="edit-form">
                <label for="editDate">Date:</label>
                <input type="text" id="editDate" placeholder="YYYY">
            </div>
            <div class="edit-form">
                <label for="editTitle">Title:</label>
                <input type="text" id="editTitle" placeholder="Title">
            </div>
            <div class="edit-form">
                <label for="editLink">Link:</label>
                <input type="text" id="editLink" placeholder="URL">
            </div>
            <button id="submitEditBtn">Submit</button>
            <button id="openLinkBtn">Open Link</button>
        </div>
    `;
    document.body.appendChild(editPopup);

    modeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        modeToggle.innerText = document.body.classList.contains('dark-mode') ? 'Switch to Light Mode' : 'Switch to Dark Mode';
    });

    loadCitations();

    addCitationBtn.addEventListener('click', () => {
        popup.style.display = 'flex';
        urlInput.value = '';
    });

    closePopup.addEventListener('click', () => {
        popup.style.display = 'none';
    });

    submitUrls.addEventListener('click', async () => {
        const urls = urlInput.value.split(/[, \n]+/).map(url => url.trim()).filter(url => url);
        const validUrls = urls.filter(url => validateUrl(url));

        if (validUrls.length > 0) {
            const citations = await fetchCitations(validUrls);
            citations.forEach(citation => {
                addCitationToList(citation);
            });
            saveCitations();
        }
        popup.style.display = 'none';
    });

    function validateUrl(url) {
        const pattern = /^(http|https):\/\//;
        return pattern.test(url);
    }

    async function fetchCitations(urls) {
        const response = await fetch('http://localhost:5000/generate_citations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ urls: urls })
        });
        const data = await response.json();
        return data.citations;
    }

    function addCitationToList(citation) {
        const citationDiv = document.createElement('div');
        citationDiv.classList.add('citation');

        if (citation.error) {
            citationDiv.innerHTML = `<p>Error: ${citation.error}</p>`;
        } else {
            citationDiv.innerHTML = `
                <p><strong>Author:</strong> ${citation.author}<br>
                <strong>Date:</strong> ${citation.date}<br>
                <strong>Title:</strong> ${citation.title}<br>
                <strong>Link:</strong> <a href="${citation.link}" target="_blank">${citation.link}</a><br>
                <strong>Current Date:</strong> ${citation.current_date}</p>
                <div>
                    <button class="edit-button">Edit</button>
                    <button class="copy-cite-button">Copy Cite</button>
                    <button class="delete-button">Delete</button>
                </div>
            `;

            citationDiv.querySelector('.copy-cite-button').addEventListener('click', () => {
                const citationText = `${citation.author} ${citation.date} ${citation.title}. Available at: ${citation.link} [${citation.current_date}]`;
                navigator.clipboard.writeText(citationText);
                alert('Citation copied!');
            });

            citationDiv.querySelector('.edit-button').addEventListener('click', () => {
                openEditPopup(citation, citationDiv);
            });
        }

        citationsList.appendChild(citationDiv);

        citationDiv.querySelector('.delete-button').addEventListener('click', () => {
            citationsList.removeChild(citationDiv);
            saveCitations();
        });
    }

    function openEditPopup(citation, citationDiv) {
        const authorParts = citation.author.split(" ");
        document.getElementById('editAuthorFirst').value = authorParts[0];
        document.getElementById('editAuthorLast').value = authorParts[1] || "";
        document.getElementById('editDate').value = citation.date.replace(/[()]/g, '');
        document.getElementById('editTitle').value = citation.title;
        document.getElementById('editLink').value = citation.link;

        editPopup.style.display = 'flex';

        document.getElementById('submitEditBtn').onclick = () => {
            const updatedCitation = {
                author: `${document.getElementById('editAuthorFirst').value} ${document.getElementById('editAuthorLast').value}`,
                date: document.getElementById('editDate').value,
                title: document.getElementById('editTitle').value,
                link: document.getElementById('editLink').value,
                current_date: citation.current_date
            };

            citationDiv.querySelector('p').innerHTML = `
                <strong>Author:</strong> ${updatedCitation.author}<br>
                <strong>Date:</strong> (${updatedCitation.date})<br>
                <strong>Title:</strong> ${updatedCitation.title}<br>
                <strong>Link:</strong> <a href="${updatedCitation.link}" target="_blank">${updatedCitation.link}</a><br>
                <strong>Current Date:</strong> ${updatedCitation.current_date}
            `;

            editPopup.style.display = 'none';
            saveCitations();
        };

        document.getElementById('openLinkBtn').onclick = () => {
            window.open(citation.link, '_blank');
        };
    }

    function loadCitations() {
        const citations = JSON.parse(localStorage.getItem('citations')) || [];
        citations.forEach(citation => {
            addCitationToList(citation);
        });
    }

    function saveCitations() {
        const citations = Array.from(citationsList.children)
            .map(div => {
                const citationText = div.querySelector('p').innerHTML;
                const author = citationText.match(/<strong>Author:<\/strong> (.*?)<br>/)?.[1] || 'Unknown Author';
                const date = citationText.match(/<strong>Date:<\/strong> (.*?)<br>/)?.[1] || 'Unknown Date';
                const title = citationText.match(/<strong>Title:<\/strong> (.*?)<br>/)?.[1] || 'Unknown Title';
                const link = citationText.match(/<strong>Link:<\/strong> <a href="(.*?)"/)?.[1] || 'No Link';
                const current_date = citationText.match(/<strong>Current Date:<\/strong> (.*?)<br>/)?.[1] || new Date().toISOString();
        
                return { author, date, title, link, current_date };
            });
        localStorage.setItem('citations', JSON.stringify(citations));
    }
       

    editPopup.querySelector('.close').addEventListener('click', () => {
        editPopup.style.display = 'none';
    });

    copyAllBtn.addEventListener('click', () => {
        const allCitations = Array.from(citationsList.children)
            .map(div => div.querySelector('p').innerText)
            .join('\n');
        navigator.clipboard.writeText(allCitations);
        alert('All citations copied!');
    });

    deleteAllBtn.addEventListener('click', () => {
        citationsList.innerHTML = '';
        localStorage.removeItem('citations');
        alert('All citations deleted!');
    });
});
