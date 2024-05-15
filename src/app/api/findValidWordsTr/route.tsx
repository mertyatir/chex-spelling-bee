import _ from "lodash";

interface Word {
  letters: string[];
  word: string;
}

// Store the game data and the date it was generated
let gameData: any = null;
let gameDataDate: Date | null = null;

export async function GET() {
  // Get today's date
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if the game data was generated today
  if (gameDataDate && gameDataDate.getTime() === today.getTime()) {
    // If it was, return the stored game data
    return new Response(JSON.stringify(gameData), {
      headers: { "Content-Type": "application/json" },
    });
  }

  // If it wasn't, generate a new game data

  let pangrams: string[] = [];
  let possibleWords: string[] = [];
  let letters: string[] = [];
  let middleLetter: string = "";

  // Include Turkish specific characters
  const turkishAlphabet = "abcçdefgğhıijklmnoöprsştuüvyz".split("");

  do {
    // Generate 7 distinct random letters from the Turkish alphabet
    letters = _.sampleSize(turkishAlphabet, 7);

    // Select one as the middle letter
    middleLetter = letters[3];

    // Load the words from the Turkish JSON file
    const words = require("./clean_words_turkish.json");

    // Filter the words that can be constructed from the letters and contain the middle letter
    const filteredWords = words.filter((word: Word) => {
      const wordLetters = word.letters;
      return (
        wordLetters.includes(middleLetter) &&
        wordLetters.every((letter) => letters.includes(letter))
      );
    });

    // Extract only the 'word' attribute from the filtered words
    possibleWords = Array.from(
      new Set(filteredWords.map((word: Word) => word.word))
    );

    // Find pangrams
    pangrams = possibleWords.filter((word: string) => {
      const wordLetters = Array.from(new Set(word.split("")));
      return letters.every((letter) => wordLetters.includes(letter));
    });
  } while (pangrams.length == 0);

  // Calculate maxScore
  let maxScore = 0;
  for (const word of possibleWords) {
    let wordScore = 0;
    if (word.length < 4) {
      wordScore = 0;
    } else if (word.length == 4) {
      wordScore = 1;
    } else if (word.length > 4) {
      wordScore = word.length;
    }

    if (pangrams.includes(word)) {
      wordScore += 7;
    }
    maxScore += wordScore;
  }

  // Store the new game data and the current date
  gameData = {
    possible_words: possibleWords,
    letters: letters,
    center_letter: middleLetter,
    pangrams: pangrams,
    maxscore: maxScore,
  };
  gameDataDate = today;

  return new Response(JSON.stringify(gameData), {
    headers: { "Content-Type": "application/json" },
  });
}
