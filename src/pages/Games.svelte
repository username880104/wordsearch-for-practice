<script>
  import Header from "../components/Header.svelte";
  import Footer from "../components/Footer.svelte";
  import { onMount } from "svelte";
  import { writable } from "svelte/store";
  import { gameBoard } from "../stores"; // 스토어 import

  export const answersStore = writable([]);
  let board = [];
  gameBoard.subscribe((value) => {
    board = value;
    console.log("Updated board:", board); // 추가: 보드가 업데이트될 때마다 로그
  });

  // 스토어의 변화를 구독

  let boardSize = 10;
  let title = "";
  let description = "";
  let wordList = [];
  let answers = [];
  let selectedWord = "";
  let startIndex = { row: null, col: null }; // 시작 인덱스 초기화
  let currentSelection = []; // 현재 선택된 셀들
  let selectedWordIndices = new Set(); // 선택된 단어 인덱스

  answersStore.subscribe((value) => (answers = value));

  // 세션 스토리지에서 데이터 불러오기
  onMount(() => {
    title = sessionStorage.getItem("title") || "";
    description = sessionStorage.getItem("description") || "";
    wordList = JSON.parse(sessionStorage.getItem("wordList")) || [];

    console.log("Loaded data:", { title, description, wordList });

    // 가장 긴 단어를 기준으로 최소 게임판 크기를 설정
    const longestWordLength = Math.max(...wordList.map((word) => word.length));
    boardSize = Math.max(boardSize, longestWordLength + 2); // 여유 공간을 위해 +2 추가

    createGameBoard();
  });

  function createGameBoard() {
    try {
      console.log("게임 보드 생성 중...");
      selectedWordIndices.clear();

      const initialBoard = Array.from({ length: boardSize }, () =>
        Array(boardSize).fill(null)
      );

      wordList.forEach((word) => {
        placeWordRandomly(word, initialBoard);
        answers.push(word.toUpperCase());
      });

      console.log("현재 정답 목록:", answers);

      fillEmptyCells(initialBoard);

      answersStore.set([...answers]);

      gameBoard.set(initialBoard);
      console.log("게임 보드:", initialBoard); // gameBoard 대신 initialBoard 로깅
    } catch (error) {
      console.error("오류 발생", error);
    }
  }

  function placeWordRandomly(word, board) {
    const directions = [
      { x: 1, y: 0 }, // 가로
      { x: 0, y: 1 }, // 세로
      { x: 1, y: 1 }, // 대각선
      { x: 1, y: -1 }, // 역 대각선
    ];

    let placed = false;
    let attempts = 0;

    while (!placed && attempts < 100) {
      attempts++;
      const direction =
        directions[Math.floor(Math.random() * directions.length)];
      const startX = Math.floor(Math.random() * boardSize);
      const startY = Math.floor(Math.random() * boardSize);

      if (canPlaceWord(word, startX, startY, direction)) {
        for (let i = 0; i < word.length; i++) {
          const newX = startX + i * direction.x;
          const newY = startY + i * direction.y;
          board[newY][newX] = word[i].toUpperCase(); // 대문자로 저장
        }
        placed = true;
        console.log(
          `Placed word '${word}' at (${startX}, ${startY}) in direction (${direction.x}, ${direction.y})`
        );
      } else {
        console.log(
          `Cannot place word '${word}' at (${startX}, ${startY}) in direction (${direction.x}, ${direction.y})`
        );
      }
    }

    if (!placed) {
      console.error(`Failed to place word '${word}' after 100 attempts`);
    }
  }

  // 단어가 해당 위치에 배치 가능한지 확인하는 함수
  function canPlaceWord(word, startX, startY, direction) {
    const endX = startX + (word.length - 1) * direction.x;
    const endY = startY + (word.length - 1) * direction.y;

    if (endX < 0 || endX >= boardSize || endY < 0 || endY >= boardSize) {
      return false;
    }

    for (let i = 0; i < word.length; i++) {
      const newX = startX + i * direction.x;
      const newY = startY + i * direction.y;

      if (newX < 0 || newX >= boardSize || newY < 0 || newY >= boardSize) {
        return false; // 안전하게 false 반환
      }

      // 여기가 수정된 부분
      if (
        !board[newY] ||
        (board[newY][newX] !== null &&
          board[newY][newX] !== word[i].toUpperCase())
      ) {
        return false;
      }
    }
    return true;
  }

  // 빈칸에 랜덤 알파벳 채우는 함수
  function fillEmptyCells(board) {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    for (let row = 0; row < boardSize; row++) {
      for (let col = 0; col < boardSize; col++) {
        if (board[row][col] === null) {
          board[row][col] =
            alphabet[Math.floor(Math.random() * alphabet.length)];
        }
      }
    }
  }

  // 마우스 이벤트 핸들러
  function handleClick(event) {
    const row = Number(event.target.dataset.row);
    const col = Number(event.target.dataset.col);

    // 첫 번째 클릭일 경우
    if (startIndex.row === null && startIndex.col === null) {
      startIndex = { row, col };
      currentSelection.push(startIndex);
    } else {
      // 두 번째 클릭일 경우
      const endIndex = { row, col };
      currentSelection.push(endIndex);

      selectedWord = checkWord(currentSelection); // 단어 확인하고 선택된 단어 저장

      // 초기화
      startIndex = { row: null, col: null };
      currentSelection = [];
    }
  }

  function checkWord(selection) {
    if (selection.length !== 2) return ""; // 선택된 위치가 두 개가 아닐 경우 빈 문자열 반환

    const [start, end] = selection;

    const isHorizontal = start.row === end.row;
    const isVertical = start.col === end.col;
    const isDiagonal =
      Math.abs(start.row - end.row) === Math.abs(start.col - end.col); // 대각선인지 확인

    if (!isHorizontal && !isVertical && !isDiagonal) {
      console.error(
        "Invalid selection: must be horizontal, vertical, or diagonal."
      );
      return ""; // 비정상적인 선택일 경우 빈 문자열 반환
    }

    const selectedLetters = [];

    const wordLength = isHorizontal
      ? end.col - start.col + 1
      : isVertical
        ? end.row - start.row + 1
        : Math.abs(start.row - end.row) + 1; // 대각선의 경우

    for (let i = 0; i < wordLength; i++) {
      const newRow = isHorizontal
        ? start.row
        : isVertical
          ? start.row + i
          : start.row + (start.row < end.row ? i : -i); // 대각선의 경우

      const newCol = isVertical
        ? start.col
        : isHorizontal
          ? start.col + i
          : start.col + (start.col < end.col ? i : -i); // 대각선의 경우

      if (
        newRow < 0 ||
        newRow >= boardSize ||
        newCol < 0 ||
        newCol >= boardSize
      ) {
        console.error(
          `Invalid selection: (${newRow}, ${newCol}) is out of bounds`
        );
        return "";
      }

      if (!board[newRow] || board[newRow][newCol] === null) {
        console.error(
          `Invalid access: board[${newRow}][${newCol}] is undefined`
        );
        return "";
      }

      selectedLetters.push(board[newRow][newCol]);
    }

    const selectedWord = selectedLetters.join("").toUpperCase();
    console.log("Selected word:", selectedWord);

    if (answers.includes(selectedWord)) {
      alert(`찾은 단어: ${selectedWord}`);

      currentSelection.forEach(({ row, col }) => {
        selectedWordIndices.add(`${row}, ${col}`);
      });

      return selectedWord;
    } else {
      alert(`단어를 찾지 못했습니다: ${selectedWord}`);
      return ""; // 빈 문자열 반환
    }
  }
</script>

<Header />

<h1 class="title">{title}</h1>
<p class="desc">{description}</p>

<div class="game-container">
  <div
    class="game-board"
    style="grid-template-columns: repeat({boardSize}, 50px); grid-template-rows: repeat({boardSize}, 50px);"
  >
    {#each $gameBoard as row, rowIndex}
      <div class="row">
        {#each row as cell, colIndex}
          <button
            class="cell
          {selectedWordIndices.has(`${rowIndex},${colIndex}`) ? 'found' : ''} 
          {currentSelection.includes({ row: rowIndex, col: colIndex })
              ? 'matched'
              : ''}"
            type="button"
            on:click={handleClick}
            data-row={rowIndex}
            data-col={colIndex}
          >
            {cell}
          </button>
        {/each}
      </div>
    {/each}
  </div>
  <div class="answers">
    <h3>정답 목록</h3>
    {#if answers.length > 0}
      <ul>
        {#each answers as answer}
          <li>{answer}</li>
        {/each}
      </ul>
    {:else}
      <p>정답이 없습니다.</p>
    {/if}
  </div>
</div>

<Footer />

<style>
  .title {
    color: teal;
    font-size: 35px;
    padding-left: 300px;
  }

  .desc {
    font-size: 20px;
    text-align: left;
  }

  .game-container {
    display: flex; /* 두 요소를 나란히 배치 */
    align-items: flex-start; /* 세로 정렬 조정 */
  }

  .game-board {
    display: grid;
    grid-template-columns: repeat(10, 50px); /* 기본값 */
    grid-template-rows: repeat(10, 50px); /* 기본값 */
    gap: 5px; /* 셀 간의 간격 */
    margin-right: 20px;
  }

  .row {
    display: contents; /* 이 속성을 사용하면 각 셀이 올바르게 정렬됩니다. */
  }

  .cell {
    width: 50px;
    height: 50px;
    border: 1px solid black;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.5rem;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .matched {
    background-color: greenyellow !important; /* 선택된 단어 강조 */
  }

  .found {
    background-color: blue; /* 정답 단어 강조 */
  }

  .answers {
    margin-top: 0;
  }

  .answers h3 {
    margin: 0;
  }

  .answers ul {
    list-style-type: none;
    padding: 0;
  }

  .answers li {
    font-size: 1.2rem;
    margin: 5px 0;
  }
</style>
