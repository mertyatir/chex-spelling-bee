import re
from safetext import SafeText
import json

# Create a SafeText object
st = SafeText(language='en')

# Load the data
with open('popular.txt', 'r') as f:
    data = f.read().splitlines()

# Define a regex pattern for English letters
pattern = re.compile(r'^[a-z]*$', re.IGNORECASE)

# Filter out words with whitespaces, less than 4 letters, profanity, and non-English letters
filtered_words = [word for word in data if ' ' not in word and len(word) >= 4 and not st.check_profanity(text=word) and pattern.match(word)]

# Create an array with 'words' and 'letters' properties
output = [{'word': word, 'letters': sorted(list(set(word)))} for word in filtered_words]

# Write the dictionary into a JSON file
with open('clean_popular_words_english.json', 'w') as f:
    json.dump(output, f, ensure_ascii=False)