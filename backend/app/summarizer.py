import re
from collections import Counter

def summarize_text(text: str, top_n: int = 5):
    # split into sentences
    sentences = re.split(r'(?<=[.!?])\s+', text)

    # tokenize words
    words = re.findall(r'\b[a-z]{2,}\b', text.lower())

    # simple stopwords
    stopwords = set([
        "the","is","and","a","an","of","to","in","that","it",
        "for","on","with","as","by","this","are","was","were",
        "be","or","we","at","from","has","have","had"
    ])

    words = [w for w in words if w not in stopwords]

    freq = Counter(words)

    # score sentences
    sentence_scores = []

    for sentence in sentences:
        sentence_words = re.findall(r'\b[a-z]{2,}\b', sentence.lower())
        score = sum(freq[w] for w in sentence_words if w in freq)
        sentence_scores.append((sentence, score))

    # sort by score
    ranked = sorted(sentence_scores, key=lambda x: x[1], reverse=True)

    # take top sentences
    summary = " ".join([s[0] for s in ranked[:top_n]])

    return summary