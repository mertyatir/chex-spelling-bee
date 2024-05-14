import { random, sample } from "lodash";
import _ from "lodash";

interface Word {
  letters: string[];
  word: string;
  // include other properties if they exist
}

export async function GET(request: Request) {
  let pangrams: string[] = [];
  let possibleWords: string[] = [];
  let letters: string[] = [];
  let middleLetter: string = "";

  do {
    // Define the alphabet
    const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");

    // Generate 7 distinct random letters
    letters = _.sampleSize(alphabet, 7);

    // Select one as the middle letter
    middleLetter = letters[3];

    // Load the words from the JSON file
    const words = require("./clean_popular_words_english.json");

    // Filter the words that can be constructed from the letters and contain the middle letter
    const filteredWords = words.filter((word: Word) => {
      const wordLetters = word.letters;
      return (
        wordLetters.includes(middleLetter) &&
        wordLetters.every((letter) => letters.includes(letter))
      );
    });

    // Extract only the 'word' attribute from the filtered words
    possibleWords = filteredWords.map((word: Word) => word.word);

    // Find pangrams
    pangrams = possibleWords.filter((word: string) => {
      const wordLetters = Array.from(new Set(word.split("")));
      return letters.every((letter) => wordLetters.includes(letter));
    });
  } while (pangrams.length == 0);

  // Calculate maxScore
  let maxScore = 0;
  for (const word of possibleWords) {
    let wordScore = word.length >= 4 ? word.length : 0;
    if (pangrams.includes(word)) {
      wordScore += 7;
    }
    maxScore += wordScore;
  }

  return new Response(
    JSON.stringify({
      possible_words: possibleWords,
      letters: letters,
      center_letter: middleLetter,
      pangrams: pangrams,
      maxscore: maxScore,
    }),
    {
      headers: { "Content-Type": "application/json" },
    }
  );
}
