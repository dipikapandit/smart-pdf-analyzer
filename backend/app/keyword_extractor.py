from collections import Counter
import re

# basic stopwords (we keep it simple for MVP)
STOPWORDS = set([
    "the", "is", "and", "a", "an", "of", "to", "in", "that", "it",
    "for", "on", "with", "as", "by", "this", "are", "was", "were",
    "be", "or", "we", "at", "from", "has", "have", "had", "but"
])

def extract_keywords(text: str, top_n: int = 10):
    # lowercase
    text = text.lower()

    # keep only words
    words = re.findall(r'\b[a-z]{2,}\b', text)

    # remove stopwords
    filtered_words = [w for w in words if w not in STOPWORDS]

    # count frequency
    counter = Counter(filtered_words)

    # return top keywords
    return counter.most_common(top_n)