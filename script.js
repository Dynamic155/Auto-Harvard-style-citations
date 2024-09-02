document.getElementById("citationForm").addEventListener("submit", function (event) {
    event.preventDefault();
    const urls = document.getElementById("urls").value.split("\n").filter(url => url.trim());
    generateCitations(urls);
});

function generateCitations(urls) {
    fetch("http://localhost:5000/generate_citations", { // Use your server URL here
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ urls })
    })
    .then(response => response.json())
    .then(data => {
        const citationsList = document.getElementById("citations");
        citationsList.innerHTML = "";
        data.citations.forEach(citation => {
            const listItem = document.createElement("li");
            const textArea = document.createElement("textarea");
            textArea.value = citation;
            const editButton = document.createElement("button");
            editButton.textContent = "Edit";
            editButton.addEventListener("click", () => {
                textArea.disabled = !textArea.disabled;
                editButton.textContent = textArea.disabled ? "Edit" : "Save";
            });
            listItem.appendChild(textArea);
            listItem.appendChild(editButton);
            citationsList.appendChild(listItem);
        });
    })
    .catch(error => console.error("Error:", error));
}

document.getElementById("copyAll").addEventListener("click", function () {
    const allCitations = document.querySelectorAll("#citations textarea");
    let textToCopy = "";
    allCitations.forEach(citation => textToCopy += citation.value + "\n\n");
    
    navigator.clipboard.writeText(textToCopy).then(() => {
        alert("Citations copied to clipboard!");
    }).catch(err => console.error("Could not copy text: ", err));
});
