# 🌟 AutoCiteV2 🌟

Welcome to **AutoCiteV2** – the next generation of automatic citation generation, now with a sleek WebUI Interface! 🎉

Gone are the days of constantly needing to open a text editor, paste in your websites, save it, run the Python script, and then open the references file just to get your references. Now, you can have everything in one place. 🚀

## ✨ Features

- **WebUI Interface**: User-friendly and intuitive interface for seamless citation generation.
- **Automatic Citations**: Generate Harvard-style citations with ease.
- **Copy All**: Quickly copy all generated citations to your clipboard.
- **Edit and Save**: Easily edit and save your citations directly from the interface.

## 🚀 Getting Started

### Prerequisites

- Python 3.x
- Flask
- BeautifulSoup4
- Requests

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/AutoCiteV2.git
   cd AutoCiteV2
   ```

2. Install the required packages:
   ```bash
   pip install -r requirements.txt
   ```

3. Run the Flask server:
   ```bash
   python flaskapp.py
   ```

4. Open the index.html in your browser.

## 🛠 Usage

1. Enter the URLs of the websites you want to cite, one per line.
2. Click "Generate Citations".
3. Edit and save your citations as needed.
4. Click "Copy All" to copy all citations to your clipboard.

## Flaskapp Documentation (API Endpoints):

#### `POST /generate_citations`
**Description:**  
Generates Harvard references for a list of URLs.

**Request Parameters:**
- `urls`: A JSON array of strings, each being a URL to be processed.

**Example Request:**
```json
{
    "urls": [
        "https://example.com/article1",
        "https://example.com/article2"
    ]
}
```

**Response:**  
Returns a JSON object with the Harvard references formatted according to the following pattern:
```
[Author] ([Year]) [Title of the page]. Available at: [Link] [Current Date].
```

**Example Response:**
```json
{
    "citations": [
        "Doe, J. (2020) Example Title. Available at: https://example.com/article1 [02 September 2024]",
        "Smith, A. (2022) Another Example. Available at: https://example.com/article2 [02 September 2024]"
    ]
}
```

### Example Request:
```py
import requests

url = "http://127.0.0.1:5000/generate_citations"
data = {
    "urls": [
        "https://www.example.com/article"
    ]
}

response = requests.post(url, json=data)
print(response.json())
```

## 🤝 Contributing

Contributions are welcome! Please fork this repository and submit a pull request for any improvements or bug fixes.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Made with ❤️ by [shiro](https://github.com/Dynamic155)
