// Função auxiliar para adicionar um clue à célula (armazenado como array)
function addClue(state, key, clueNumber) {
  if (!state.clues[key]) {
    state.clues[key] = [];
  }
  if (!state.clues[key].includes(clueNumber)) {
    state.clues[key].push(clueNumber);
  }
}

// Cria o estado inicial para o crossword
function createState(words) {
  return {
    words: words, // Array de palavras
    placedWords: [], // Palavras posicionadas: { word, x, y, direction, clue }
    grid: {}, // Grid: chaves "y_x" com a letra correspondente
    clues: {}, // Mapeia a célula inicial com um array de números de dica
    unplacedWords: [], // Palavras que não conseguiram conexão via interseção
  };
}

// Posiciona a primeira palavra (índice 0) no grid, iniciando em (0,0) na horizontal
function placeFirstWord(state) {
  const word = state.words[0];
  const x = 0;
  const y = 0;
  const direction = "across";
  state.placedWords.push({ word, x, y, direction, clue: [0] });
  const key = `${y}_${x}`;
  addClue(state, key, 0);
  for (let i = 0; i < word.length; i++) {
    state.grid[`${y}_${x + i}`] = word[i];
  }
}

// Verifica se a palavra pode ser posicionada em (x, y) na direção dada sem conflito
function isValidPlacement(state, word, x, y, direction) {
  for (let i = 0; i < word.length; i++) {
    let posX = x;
    let posY = y;
    if (direction === "across") {
      posX = x + i;
    } else if (direction === "down") {
      posY = y + i;
    }
    const key = `${posY}_${posX}`;
    if (state.grid[key] && state.grid[key] !== word[i]) {
      return false;
    }
    // Possíveis validações extras podem ser adicionadas aqui (por exemplo, células adjacentes)
  }
  return true;
}

// Procura uma posição válida para encaixar a palavra via interseção
function findPlacement(state, word) {
  for (const placed of state.placedWords) {
    for (let i = 0; i < placed.word.length; i++) {
      const letterPlaced = placed.word[i];
      for (let j = 0; j < word.length; j++) {
        if (word[j] === letterPlaced) {
          let x, y, direction;
          if (placed.direction === "across") {
            // Se a palavra já posicionada é horizontal, tenta posicionar a nova verticalmente
            direction = "down";
            x = placed.x + i; // Alinha na coluna da letra de interseção
            y = placed.y - j; // Ajusta a linha para que a letra j fique na interseção
          } else if (placed.direction === "down") {
            // Se a palavra já posicionada é vertical, tenta posicionar a nova horizontalmente
            direction = "across";
            x = placed.x - j; // Ajusta a coluna para que a letra j fique na interseção
            y = placed.y + i; // Alinha na linha da letra de interseção
          }
          if (isValidPlacement(state, word, x, y, direction)) {
            return { x, y, direction };
          }
        }
      }
    }
  }
  return null;
}

// Tenta posicionar a palavra via interseção; se posicionada, adiciona o clue na célula (como array)
function placeWord(state, word, clueNumber) {
  const placement = findPlacement(state, word);
  if (placement) {
    const { x, y, direction } = placement;
    const key = `${y}_${x}`;
    addClue(state, key, clueNumber);
    const assignedClue = state.clues[key]; // Será um array
    state.placedWords.push({ word, x, y, direction, clue: assignedClue });
    for (let i = 0; i < word.length; i++) {
      let posX = direction === "across" ? x + i : x;
      let posY = direction === "down" ? y + i : y;
      state.grid[`${posY}_${posX}`] = word[i];
    }
    return true;
  }
  return false;
}

// Posiciona uma palavra "solta" no grid, buscando uma linha livre (passada como parâmetro)
function placeLooseWord(state, word, clueNumber, row) {
  let x = 0;
  while (true) {
    let canPlace = true;
    for (let i = 0; i < word.length; i++) {
      const key = `${row}_${x + i}`;
      if (state.grid[key]) {
        canPlace = false;
        break;
      }
    }
    if (canPlace) break;
    x++;
  }
  const key = `${row}_${x}`;
  addClue(state, key, clueNumber);
  const assignedClue = state.clues[key];
  state.placedWords.push({
    word,
    x,
    y: row,
    direction: "across",
    clue: assignedClue,
  });
  for (let i = 0; i < word.length; i++) {
    state.grid[`${row}_${x + i}`] = word[i];
  }
}

// Gera a matriz final do grid com base nos limites utilizados
// Cada célula é um objeto: { letter: 'A', clue: array de números ou null }
function getGridMatrix(state) {
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  Object.keys(state.grid).forEach((key) => {
    const [y, x] = key.split("_").map(Number);
    if (x < minX) minX = x;
    if (y < minY) minY = y;
    if (x > maxX) maxX = x;
    if (y > maxY) maxY = y;
  });
  const rows = maxY - minY + 1;
  const cols = maxX - minX + 1;
  const matrix = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({ letter: " ", clue: null }))
  );
  Object.keys(state.grid).forEach((key) => {
    const [y, x] = key.split("_").map(Number);
    const cell = matrix[y - minY][x - minX];
    cell.letter = state.grid[key];
    if (state.clues[key] !== undefined) {
      cell.clue = state.clues[key];
    }
  });
  return matrix;
}

// Função principal que gera o crossword e retorna a matriz final
export function generateCrossword(words) {
  if (!words.length) return null;
  const state = createState(words);

  // Posiciona a primeira palavra
  placeFirstWord(state);

  // Tenta posicionar as demais palavras via interseção
  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    if (!placeWord(state, word, i)) {
      // Se não conseguir conectar via interseção, adiciona à lista de palavras não conectadas
      state.unplacedWords.push({ word, clue: i });
    }
  }

  // Determina a linha máxima usada no grid para posicionar as palavras "soltas"
  let maxY = -Infinity;
  Object.keys(state.grid).forEach((key) => {
    const [y] = key.split("_").map(Number);
    if (y > maxY) maxY = y;
  });
  // Escolhe uma linha livre abaixo do grid atual (com margem de 2 linhas)
  let freeRow = maxY + 2;
  state.unplacedWords.forEach(({ word, clue }) => {
    placeLooseWord(state, word, clue, freeRow);
    freeRow += 2; // Espaço entre cada palavra solta
  });

  return getGridMatrix(state);
}

// // Exemplo de uso:
// const palavras = ["REACT", "JAVASCRIPT", "ALGORITMO", "CROSSWORD", "NODE", "EXPRESS"];
// const gridMatrix = generateCrossword(palavras);

// // Exibe o grid no console com os clues. Cada célula mostrará, por exemplo, "0,3:R" se os clues forem [0,3] e a letra for R.
// console.table(
//   gridMatrix.map(row =>
//     row.map(cell =>
//       cell.clue !== null ? `${cell.clue.join(',')}:${cell.letter}` : cell.letter
//     )
//   )
// );
