"use client";

import { useEffect, useState } from "react";
import "./spelling_bee.css";
import Image from "next/image";

type SpellingBeeGameProps = {
  language: string;
};

const SpellingBeeGame: React.FC<SpellingBeeGameProps> = ({ language }) => {
  const [validWords, setValidWords] = useState<string[]>([]);
  const [letters, setLetters] = useState<string[]>([]);
  const [discoveredWords, setDiscoveredWords] = useState<string[]>([]);
  const [totalScore, setTotalScore] = useState(0);
  const [pangrams, setPangrams] = useState([]);
  const [centerLetter, setCenterLetter] = useState("");
  const [numFound, setNumFound] = useState(0);
  const [maxscore, setMaxscore] = useState(0);
  const [score, setScore] = useState(0);
  const [tryWord, setTryWord] = useState("");
  const [tryWordAnimation, setTryWordAnimation] = useState("");
  const [timeLeft, setTimeLeft] = useState(60);
  const [notification, setNotification] = useState({
    message: "",
    isShown: false,
    type: "",
    animation: "",
  });

  if (timeLeft === 0) {
    alert(
      "Time's up! You have found " +
        numFound +
        " words. Your score is " +
        totalScore +
        "/" +
        maxscore +
        ". Thanks for playing!"
    );
  }

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        setTryWord((prevTryWord) => {
          handleSubmitWord(prevTryWord);
          return "";
        });
      } else if (event.key === "Backspace") {
        handleDeleteLetter();
      } else {
        if (language === "en" && /[a-zA-Z]/.test(event.key)) {
          setTryWord((prevTryWord) => prevTryWord + event.key.toLowerCase());
        } else if (language === "tr" && /[a-zA-Zğüşıöç]/.test(event.key)) {
          setTryWord((prevTryWord) => prevTryWord + event.key.toLowerCase());
        }
      }
    };

    // Add the event listener when the component mounts
    window.addEventListener("keydown", handleKeyDown);

    // Remove the event listener when the component unmounts
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
    // eslint-disable-next-line
  }, [validWords, discoveredWords]);

  // Start a countdown when the component mounts
  useEffect(() => {
    const timer = setInterval(() => {
      //setTimeLeft((prevTime) => (prevTime > 0 ? prevTime - 1 : 0));
    }, 1000);

    // Cleanup function
    return () => {
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    // Fetch valid words and letters from API
    const getValidWords = async () => {
      try {
        let response;
        if (language === "en") {
          response = await fetch("/api/findValidWords");
        } else if (language === "tr") {
          response = await fetch("/api/findValidWordsTr");
        } else {
          console.error("Invalid language");
        }
        if (!response) {
          console.error("No response received");
          return;
        }
        const data = await response.json();

        console.log(data);
        console.log(data.possible_words);

        setLetters(data.letters);
        setValidWords(data.possible_words);
        setPangrams(data.pangrams);
        setMaxscore(data.maxscore);
      } catch (error) {
        console.error("Error fetching valid words:", error);
      }
    };

    getValidWords();
  }, [language]);

  useEffect(() => {
    if (letters.length > 0) {
      initializeLetters();
    }
    // eslint-disable-next-line
  }, [letters]);

  // Create the hexagon grid of 7 letters with middle letter as special color
  const initializeLetters = () => {
    const hexgrid = document.getElementById("hexGrid");
    for (let i = 0; i < letters.length; i++) {
      const char = letters[i];

      const pElement = document.createElement("p");
      pElement.innerHTML = char;

      const aElement = document.createElement("a");
      aElement.className = "hexLink";
      aElement.href = "#";
      aElement.appendChild(pElement);
      aElement.addEventListener("click", () => clickLetter(char), false);

      const divElement = document.createElement("div");
      divElement.className = "hexIn";
      divElement.appendChild(aElement);

      const hexElement = document.createElement("li");
      hexElement.className = "hex";

      hexElement.appendChild(divElement);
      if (i === 3) {
        aElement.id = "center-letter";
        setCenterLetter(letters[i]);
      }
      if (hexgrid) {
        hexgrid.appendChild(hexElement);
      }
    }
  };

  // Click handler for letter click
  const clickLetter = (letter: string) => {
    setTryWord((prevTryWord) => prevTryWord + letter.toLowerCase());
  };

  function shuffleArray(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }

    return array;
  }

  // Shuffle letters
  const handleShuffleLetters = () => {
    setLetters(shuffleArray(letters));

    // Logic to get center letter back to letter[3]
    const centerIndex = letters.indexOf(centerLetter);
    if (letters[3] !== centerLetter) {
      const temp = letters[3];
      letters[3] = centerLetter;
      letters[centerIndex] = temp;
    }
    const hexgrid = document.getElementById("hexGrid");
    if (hexgrid)
      while (hexgrid.firstChild) {
        hexgrid.removeChild(hexgrid.firstChild);
      }
    initializeLetters();
  };

  // Delete last letter from input box
  const handleDeleteLetter = () => {
    setTryWord((prevTryWord) => prevTryWord.slice(0, -1));
  };

  const clearInput = () => {
    if (tryWord) {
      setTryWord("");
    }
  };

  // Helper function to check incorrect letters
  const checkIncorrectLetters = (input: string) => {
    let badLetterCount = 0;
    for (let i = 0; i < input.length; i++) {
      if (!letters.includes(input[i])) {
        badLetterCount++;
      }
    }
    return badLetterCount > 0;
  };

  //function to render discovered words
  const RenderDiscoveredWords = () => {
    const numFound = discoveredWords.length;
    const numCol = Math.ceil(numFound / 7);
    let w = 0;

    return (
      <div className="flex justify-center items-center flex-col">
        <div className="font-sans self-center text-sm font-bold underline">
          Words Discovered
        </div>
        <div className="flex justify-center items-center font-sans">
          <div className="flex flex-row flex-wrap ">
            {Array.from({ length: numCol }, (_, c) => (
              <ul key={c} className={"p-2 font-thin"}>
                {Array.from(
                  {
                    length:
                      c === numCol - 1 && numFound % 7 !== 0 ? numFound % 7 : 7,
                  },
                  (_, i) => {
                    const word = discoveredWords[w++];
                    return (
                      <li key={i}>
                        <p>{word}</p>
                      </li>
                    );
                  }
                )}
              </ul>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Handle submitting word
  const handleSubmitWord = (tryWord: string) => {
    let score = 0;
    let isPangram = false;

    if (tryWord.length < 4) {
      handleNotification("Word too short", "wrong");
    } else if (discoveredWords.includes(tryWord.toLowerCase())) {
      handleNotification("Word already found", "wrong");
    } else if (!tryWord.toLowerCase().includes(centerLetter.toLowerCase())) {
      handleNotification("Center letter missing", "wrong");
    } else if (validWords.includes(tryWord.toLowerCase())) {
      isPangram = checkPangram(tryWord);
      score = calculateWordScore(tryWord, isPangram);
      setScore(score);
      addToTotalScore(score);
      let newNumFound = numFound + 1;
      setNumFound(newNumFound);
      showDiscoveredWord(tryWord);

      if (newNumFound === validWords.length) {
        alert("You have found all of the possible words! Thanks for playing");
      }

      if (isPangram) {
        handleNotification("Pangram!", "right");
      } else if (tryWord.length < 5) {
        handleNotification("Good!", "right");
      } else if (tryWord.length < 7) {
        handleNotification("Great!", "right");
      } else {
        handleNotification("Amazing!", "right");
      }
    } else {
      handleNotification("Invalid Word", "wrong");
    }
  };

  // Helper function to show discovered word
  const showDiscoveredWord = (input: string) => {
    setDiscoveredWords((prevDiscoveredWords) => {
      return [...prevDiscoveredWords, input.toLowerCase()].sort();
    });
  };

  // Helper function to add to total score
  const addToTotalScore = (score: number) => {
    setTotalScore((prevTotalScore) => prevTotalScore + score);
  };

  // Helper function to calculate word score
  const calculateWordScore = (input: string, isPangram: boolean) => {
    let len = input.length;
    let returnScore = 1;
    if (len > 4) {
      if (isPangram) {
        returnScore = len + 7;
      } else {
        returnScore = len;
      }
    }
    return returnScore;
  };

  // Helper function to check if input word is a pangram
  const checkPangram = (input: string) => {
    // check if input is in pangrams list
    let pangram = pangrams.find((word) => word === input);

    return pangram !== undefined;
  };

  const handleNotification = (message: string, type: string) => {
    setNotification({
      message: message,
      isShown: true,
      type: type,
      animation: "fadeIn 1s",
    });

    if (type === "right") {
      setTimeLeft((prevTime) => prevTime + 15);
      clearInput();
    }

    if (type === "wrong") {
      setTryWordAnimation("shake");
      setTimeout(() => {
        clearInput();
      }, 500);
    }

    setTimeout(() => {
      setNotification((prevState) => ({
        ...prevState,
        animation: "fadeOut 1s",
      }));
    }, 2000);

    setTimeout(() => {
      setNotification((prevState) => ({
        ...prevState,
        isShown: false,
      }));

      if (type === "wrong") {
        setTryWordAnimation("");
      }
    }, 2400);
  };

  return (
    <div>
      <h1>Spelling Bee Game</h1>

      {/* Notifications */}
      <div className="flex justify-center items-center h-12">
        <p
          className={`notifications ${
            notification.type === "right"
              ? "right-notification"
              : "wrong-notification"
          }  ${notification.isShown ? "shown" : ""}  `}
        >
          {notification.message}
          {notification.type === "right" ? "+" + score : ""}
        </p>
      </div>

      {/* Input word */}
      <div className="cursor">
        <p id="inputword" className="flex justify-center">
          <span
            id="testword"
            className={tryWordAnimation === "shake" ? "shake" : ""}
          >
            {tryWord}
          </span>
          <span id="cursor">|</span>
        </p>
      </div>

      {/* Hexagon Grid */}
      <div className="flex flex-col items-center">
        <ul id="hexGrid"></ul>

        <div className="button_container">
          <button
            type="button"
            className="button"
            onClick={() => handleSubmitWord(tryWord)}
          >
            Enter
          </button>
          <button
            id="shuffle_button"
            type="button"
            className="button"
            onClick={handleShuffleLetters}
          >
            <Image
              width={20}
              height={20}
              src="/shuffle_icon.png"
              alt="shuffle"
            />
          </button>
          <button type="button" className="button" onClick={handleDeleteLetter}>
            Delete
          </button>
        </div>
      </div>

      <div className="flex justify-center scoreText mb-2">
        Time left: {timeLeft}
      </div>

      {/* Scoreboard */}
      <div className="flex justify-center flex-col" id="scoreboard">
        <div className="scoreText mb-2">You have found {numFound} word(s).</div>
        <div className="scoreText mb-2">
          Score: {totalScore}/{maxscore}
        </div>
      </div>
      <RenderDiscoveredWords />
    </div>
  );
};

export default SpellingBeeGame;
