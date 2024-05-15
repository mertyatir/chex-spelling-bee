import json
import re
from safetext import SafeText

# Create a SafeText object
st = SafeText(language='tr')

# Load the data
with open('words.json', 'r') as f:
    data = json.load(f)

# Define a regex pattern for Turkish letters
pattern = re.compile(r'^[abcçdefgğhıijklmnoöprsştuüvyz]*$', re.IGNORECASE)

# Filter out words with whitespaces, less than 4 letters, profanity, and non-Turkish letters
filtered_words = [item['word'] for item in data if ' ' not in item['word'] and len(item['word']) >= 4 and not st.check_profanity(text=item['word']) and pattern.match(item['word'])]

# Create an array with 'words' and 'letters' properties
output = [{'word': word, 'letters': sorted(list(set(word)))} for word in filtered_words]

# Write the dictionary into a JSON file
with open('clean_words_turkish.json', 'w') as f:
    json.dump(output, f, ensure_ascii=False)