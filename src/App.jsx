import { useEffect, useState } from "react";
import "./App.css";
import { generateCrossword } from "./utils/crossWords";

function App() {
  const [wordsCount, setWordsCount] = useState(1);
  const [words, setWords] = useState(Array(wordsCount).fill(""));
  const [tips, setTips] = useState(Array(wordsCount).fill(""));
  const [matrix, setMatrix] = useState([]);
  const [inputValues, setInputValues] = useState([]);
  const [checkMatrix, setCheckMatrix] = useState([]);

  const [linkValue, setLinkValue] = useState("");

  const handleInputChange = (index, value) => {
    const newWords = [...words];
    newWords[index] = value;
    setWords(newWords);
  };

  useEffect(() => {
    if (words.length !== wordsCount) {
      setWords((prevWords) => {
        if (wordsCount > prevWords.length) {
          return [
            ...prevWords,
            ...Array(wordsCount - prevWords.length).fill(""),
          ];
        } else {
          return prevWords.slice(0, wordsCount);
        }
      });
    }
    if (tips.length !== wordsCount) {
      setTips((prevTips) => {
        if (wordsCount > prevTips.length) {
          return [...prevTips, ...Array(wordsCount - prevTips.length).fill("")];
        } else {
          return prevTips.slice(0, wordsCount);
        }
      });
    }
  }, [wordsCount, words, tips]);

  useEffect(() => {
    setInputValues(matrix.map((row) => row.map((cell) => "")));
  }, [matrix]);

  const encodeData = (data) => {
    return btoa(JSON.stringify(data));
  };

  const decodeData = (encodedData) => {
    return JSON.parse(atob(encodedData));
  };

  const handleGenerate = () => {
    const newMatrix = generateCrossword(words);
    setMatrix(newMatrix);
    setInputValues(newMatrix.map((row) => row.map((cell) => "")));
    setCheckMatrix(newMatrix.map((row) => row.map((cell) => "")));
    const encodedMatrix = encodeData(newMatrix);
    const encodedWordsCount = encodeData(wordsCount);
    const encodedTips = encodeData(tips);
    setLinkValue(
      window.location.href +
        `?matrix=${encodedMatrix}&wordsCount=${encodedWordsCount}&tips=${encodedTips}`
    );
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const encodedMatrix = urlParams.get("matrix");
    const encodedWordsCount = urlParams.get("wordsCount");
    const encodedTips = urlParams.get("tips");
    if (encodedMatrix && encodedWordsCount && encodedTips) {
      const decodedMatrix = decodeData(encodedMatrix);
      const decodedWordsCount = decodeData(encodedWordsCount);
      const decodedTips = decodeData(encodedTips);
      setMatrix(decodedMatrix);
      setWordsCount(decodedWordsCount);
      setTips(decodedTips);
      setInputValues(decodedMatrix.map((row) => row.map((cell) => "")));
      setCheckMatrix(decodedMatrix.map((row) => row.map((cell) => "")));
    }
  }, []);

  const handleCheck = () => {
    setCheckMatrix((prevCheckMatrix) =>
      prevCheckMatrix.map((row, rowIndex) =>
        row.map((_, colIndex) => {
          const value = inputValues[rowIndex][colIndex];
          if (value === "") return "";
          return value === matrix[rowIndex][colIndex].letter
            ? "correct"
            : "incorrect";
        })
      )
    );
  };

  const handleClearCheck = () => {
    setCheckMatrix(matrix.map((row) => row.map(() => "")));
  };

  const handleCellChange = (rowIndex, colIndex, value) => {
    setInputValues((prevInputValues) => {
      const newInputValues = [...prevInputValues];
      newInputValues[rowIndex] = [...newInputValues[rowIndex]];
      newInputValues[rowIndex][colIndex] = value;
      return newInputValues;
    });
  };

  const handleClearGame = () => {
    setInputValues(matrix.map((row) => row.map(() => "")));
  };

  return (
    <>
      <div className="w-full bg-blue-500 text-white p-5">
        <h2>Cross Words Generator</h2>
      </div>

      <div className="flex">
        <div className="flex-column">
          <div className="m-5 p-4 border border-gray-400 rounded-md max-w-md">
            <h2 className="text-xl">Instructions</h2>
            <ul className="list-disc list-inside ml-3">
              <li>Enter the number of words you want to add.</li>
              <li>Enter the words and their tips.</li>
              <li>Click on Generate button.</li>
              <li>Click on Check button to check your answers.</li>
            </ul>
          </div>
          <div className="m-5 p-4 border border-gray-400 rounded-md max-w-md flex items-center justify-between">
            <h2 className="text-xl">Number of Words:</h2>
            <div className="border-2 border-grey  text-grey rounded mr-3">
              <button
                className={`px-10 py-1 text-grey 
           hover:bg-blue-500 cursor-pointer`}
                onClick={() =>
                  wordsCount > 1 ? setWordsCount(wordsCount - 1) : {}
                }
              >
                -
              </button>
              <span className="mx-3 text-grey">{wordsCount}</span>
              <button
                className={`px-10 py-1 text-grey 
           hover:bg-blue-500 cursor-pointer`}
                onClick={() =>
                  wordsCount <= 30 ? setWordsCount(wordsCount + 1) : {}
                }
              >
                +
              </button>
            </div>
          </div>
          <div className="m-5 p-4 border border-gray-400 rounded-md max-w-md flex-column items-center justify-between h-full overflow-auto max-h-64">
            <h2 className="text-xl">Words and Tips:</h2>
            {Array.from({ length: wordsCount }).map((_, index) => (
              <div key={index} className="flex space-x-2">
                <input
                  type="text"
                  className="block w-full p-2 my-2 border border-gray-300 rounded flex-2"
                  placeholder={`Word ${index + 1}`}
                  value={words[index] || ""}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                />
                <input
                  type="text"
                  className="block w-full p-2 my-2 border border-gray-300 rounded flex-4"
                  placeholder={`Tip ${index + 1}`}
                  value={tips[index] || ""}
                  onChange={(e) => {
                    const newTips = [...tips];
                    newTips[index] = e.target.value;
                    setTips(newTips);
                  }}
                />
              </div>
            ))}
          </div>
          <button
            onClick={handleGenerate}
            className="m-5 cursor-pointer p-4 border border-gray-400 rounded-md w-md flex items-center justify-center bg-blue-200 hover:bg-blue-300"
          >
            Generate
          </button>
        </div>

        <div className="m-5 flex-1 p-4 border border-gray-400 rounded-md overflow-auto flex justify-between">
          <div>
            {matrix.length > 0 &&
              matrix.map((row, rowIndex) => (
                <div key={rowIndex} className="flex">
                  {row.map((cell, colIndex) => (
                    <div key={colIndex} className="relative">
                      {cell?.letter !== " " ? (
                        <input
                          type="text"
                          className="w-10 h-10 border border-gray-400 text-center rounded"
                          style={{
                            borderColor:
                              checkMatrix[rowIndex][colIndex] === "correct"
                                ? "#0f0"
                                : checkMatrix[rowIndex][colIndex] ===
                                  "incorrect"
                                ? "#f00"
                                : "",
                          }}
                          value={inputValues[rowIndex][colIndex]}
                          maxLength={1}
                          onChange={(e) =>
                            handleCellChange(rowIndex, colIndex, e.target.value)
                          }
                        />
                      ) : (
                        <div className="w-10 h-10 border border-gray-400 rounded bg-[#ddd]"></div>
                      )}
                      {cell.clue !== null && (
                        <div className="absolute top-0.25 left-0.75 text-xs ">
                          {Array.isArray(cell.clue)
                            ? cell.clue.map((clue) => clue + 1).join(" / ")
                            : cell.clue + 1}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))}

            <button
              className="cursor-pointer bg-[#ff0] px-2 py-2 rounded mt-2"
              onClick={handleCheck}
            >
              Check
            </button>
            <button
              className="cursor-pointer bg-[#ff0] px-2 py-2 rounded mt-2 ml-2"
              onClick={handleClearCheck}
            >
              Clear Check
            </button>
            <button
              className="cursor-pointer bg-[#ff0] px-2 py-2 rounded mt-2 ml-2"
              onClick={handleClearGame}
            >
              Clear Game
            </button>
          </div>
          <div className="ml-5 min-w-90 p-5 rounded border-gray-400 border">
            <h3 className="text-black">Tips</h3>
            <div className="text-black">
              {tips.map((tip, index) => (
                <p className="ml-5" key={index}>
                  {index + 1} - {tip}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* <div className="p-5 bg-blue-800">
        <div>
          <button
            className={`border-2 border-white px-3 py-1 text-white 
          rounded hover:bg-blue-500 cursor-pointer`}
            onClick={() =>
              wordsCount > 1 ? setWordsCount(wordsCount - 1) : {}
            }
          >
            -
          </button>
          <span className="mx-3 text-white">{wordsCount}</span>
          <button
            className={`border-2 border-white px-3 py-1 text-white 
          rounded hover:bg-blue-500 cursor-pointer`}
            onClick={() =>
              wordsCount <= 30 ? setWordsCount(wordsCount + 1) : {}
            }
          >
            +
          </button>
        </div>

        {Array.from({ length: wordsCount }).map((_, index) => (
          <div key={index} className="flex space-x-2">
            <input
              type="text"
              className="block w-full p-2 my-2 border border-gray-300 rounded"
              placeholder={`Word ${index + 1}`}
              value={words[index] || ""}
              onChange={(e) => handleInputChange(index, e.target.value)}
            />
            <input
              type="text"
              className="block w-full p-2 my-2 border border-gray-300 rounded"
              placeholder={`Tip ${index + 1}`}
              value={tips[index] || ""}
              onChange={(e) => {
                const newTips = [...tips];
                newTips[index] = e.target.value;
                setTips(newTips);
              }}
            />
          </div>
        ))}
      </div>
      <div className="p-5 bg-blue-500">
        <button
          className="cursor-pointer bg-[#ff0] px-2 py-2 rounded"
          onClick={handleGenerate}
        >
          Generate
        </button>
      </div>
      <div className="p-5 flex">
        <div>
          {matrix.length > 0 &&
            matrix.map((row, rowIndex) => (
              <div key={rowIndex} className="flex">
                {row.map((cell, colIndex) => (
                  <div key={colIndex} className="relative">
                    {cell?.letter !== " " ? (
                      <input
                        type="text"
                        className="w-10 h-10 border border-gray-400 text-center rounded"
                        style={{
                          borderColor:
                            checkMatrix[rowIndex][colIndex] === "correct"
                              ? "#0f0"
                              : checkMatrix[rowIndex][colIndex] === "incorrect"
                              ? "#f00"
                              : "",
                        }}
                        value={inputValues[rowIndex][colIndex]}
                        maxLength={1}
                        onChange={(e) =>
                          handleCellChange(rowIndex, colIndex, e.target.value)
                        }
                      />
                    ) : (
                      <div className="w-10 h-10 border border-gray-400 rounded bg-[#ddd]"></div>
                    )}
                    {cell.clue !== null && (
                      <div className="absolute top-0.25 left-0.75 text-xs bg-white">
                        {Array.isArray(cell.clue)
                          ? cell.clue.join(" / ")
                          : cell.clue}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ))}

          <button
            className="cursor-pointer bg-[#ff0] px-2 py-2 rounded mt-2"
            onClick={handleCheck}
          >
            Check
          </button>
          <button
            className="cursor-pointer bg-[#ff0] px-2 py-2 rounded mt-2 ml-2"
            onClick={handleClearCheck}
          >
            Clear Check
          </button>
          <button
            className="cursor-pointer bg-[#ff0] px-2 py-2 rounded mt-2 ml-2"
            onClick={handleClearGame}
          >
            Clear Game
          </button>
        </div>
        <div className="ml-5">
          <h3 className="text-white">Tips</h3>
          <ul className="list-disc list-inside text-black">
            {tips.map((tip, index) => (
              <li key={index}>
                {index + 1}: {tip}
              </li>
            ))}
          </ul>
        </div>
      </div> */}
    </>
  );
}

export default App;
