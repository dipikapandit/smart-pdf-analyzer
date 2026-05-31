import re

def search_text(text: str, query: str):
    query = query.lower()
    
    # split into sentences (simple approach)
    sentences = re.split(r'(?<=[.!?])\s+', text)

    # find matching sentences
    results = [
        sentence.strip()
        for sentence in sentences
        if query in sentence.lower()
    ]

    return results[:10]