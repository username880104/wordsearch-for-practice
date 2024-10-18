// stores.js
import { writable } from "svelte/store";

export const gameBoard = writable(
  Array.from({ length: 10 }, () => Array(10).fill(null))
); // 기본 10x10 배열

export const answersStore = writable([]);
