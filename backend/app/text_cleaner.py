import re

def clean_text(text: str) -> str:
    text = re.sub(r'\n+', ' ', text)
    text = re.sub(r'\s+', ' ', text)
    text = re.sub(r'-\s+', '', text)
    return text.strip()