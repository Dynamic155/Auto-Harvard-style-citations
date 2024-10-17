from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from bs4 import BeautifulSoup
from datetime import datetime
import json
import re
import time
import random

app = Flask(__name__)
CORS(app)

class AuthorFinder:
    def __init__(self, soup, deserialized_json):
        self.soup = soup
        self.deserialized_json = deserialized_json

    def find(self):
        all_link_tags = self.soup.find_all("link")
        for link_tag in all_link_tags:
            if link_tag.get("content"):
                return link_tag.get("content")

        if self.deserialized_json:
            author = self.extract_author_from_json(self.deserialized_json)
            if author:
                return author

        author_tag = self.soup.find(class_="blog-entry__date--full fine-print")
        if author_tag:
            author_text = author_tag.get_text()
            match = re.search(r"(?<=By ).*(?= published)", author_text)
            if match:
                return self.format_author_name(match.group(0))

        return "No author available"

    def extract_author_from_json(self, json_data):
        try:
            if isinstance(json_data, list):
                for item in json_data:
                    if isinstance(item, dict) and "author" in item:
                        return self.extract_author(item["author"])
            elif isinstance(json_data, dict) and "author" in json_data:
                return self.extract_author(json_data["author"])
        except Exception as e:
            print(f"Error extracting author from JSON-LD: {e}")

        try:
            if isinstance(json_data, dict):
                return json_data["page"]["pageInfo"]["publisher"]
            else:
                for item in json_data:
                    if "page" in item and "pageInfo" in item["page"]:
                        return item["page"]["pageInfo"]["publisher"]
        except KeyError:
            pass

        return None

    def extract_author(self, author_data):
        if isinstance(author_data, list):
            author_data = author_data[0]
        author = author_data["name"]
        return self.format_author_name(author)

    def format_author_name(self, author):
        author_parts = author.split(" ")
        if len(author_parts) == 3:
            return f"{author_parts[2]}, {author_parts[1][0]}."
        if len(author_parts) == 2:
            return f"{author_parts[1]}, {author_parts[0][0]}."
        return author

def get_meta_content(soup, meta_names):
    for meta_name in meta_names:
        meta_tag = soup.find('meta', attrs={'name': meta_name}) or soup.find('meta', attrs={'property': meta_name})
        if meta_tag and 'content' in meta_tag.attrs:
            return meta_tag['content']
    return ''

def get_publication_date(soup):
    date_names = ['article:published_time', 'og:updated_time', 'date', 'article:modified_time', 'lastmod']
    date = get_meta_content(soup, date_names)
    if date:
        try:
            date_obj = datetime.fromisoformat(date)
            return date_obj.strftime('%Y')
        except ValueError:
            try:
                date_obj = datetime.strptime(date, '%Y-%m-%dT%H:%M:%S')
                return date_obj.strftime('%Y')
            except ValueError:
                pass
    return "No date available"

def generate_reference(url):
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
        "Connection": "keep-alive"
    }

    time.sleep(random.uniform(1, 5))

    try:
        response = requests.get(url, headers=headers, verify=True)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')

        json_ld = soup.find('script', type='application/ld+json')
        deserialized_json = json.loads(json_ld.string) if json_ld else None
        
        author_finder = AuthorFinder(soup, deserialized_json)
        author = author_finder.find() or ""
        
        publication_date = get_publication_date(soup)
        page_title = soup.title.string if soup.title else ""
        
        current_date = datetime.now().strftime('%d %B %Y')

        return {
            "author": author,
            "date": publication_date,
            "title": page_title,
            "link": url,
            "current_date": current_date
        }
    except Exception as e:
        return {"error": f"Error generating reference: {e}"}

def validate_url(url):
    pattern = re.compile(r'^(http|https)://')
    return pattern.match(url)

@app.route('/generate_citations', methods=['POST'])
def generate_citations():
    data = request.json
    urls = [url for url in data.get('urls', []) if validate_url(url)]
    
    citations = [generate_reference(url) for url in urls]
    
    return jsonify({"citations": citations})

if __name__ == '__main__':
    app.run(debug=True)