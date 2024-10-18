<script>
  // @ts-nocheck

  import Footer from "../components/Footer.svelte";
  import Header from "../components/Header.svelte";

  let title = "";
  let description = "";
  let wordList = Array(30).fill(""); // 30개의 빈 문자열로 초기화

  const handleSubmit = (event) => {
    event.preventDefault();

    const filledWords = wordList.filter((word) => word.trim() !== "");
    if (filledWords.length < 10 || filledWords.length > 30) {
      alert("단어는 10개에서 30개 사이여야 합니다.");
      return;
    }

    sessionStorage.setItem("title", title);
    sessionStorage.setItem("description", description);
    sessionStorage.setItem("wordList", JSON.stringify(filledWords));
    console.log("세션 스토리지에 잘 저장됨.");

    // 페이지 전환
    window.location.href = "/#/games"; // 해시 사용
  };

  // 입력 필드의 값을 업데이트하는 함수
  const updateWord = (index, value) => {
    wordList[index] = value; // 해당 인덱스의 값을 업데이트
  };
</script>

<Header />

<p style="padding: 0 22px; color: #e30651"></p>
<section id="maker">
  <div id="mHead">
    Make your own word search game on any topic you like, simply by providing
    between 10 and 30 words. Once submitted, your puzzle will be instantly
    playable on-line as well as easily printed, so you can share it with
    friends. Instructions are available at the bottom of this page
  </div>
</section>

<div id="mTitle">
  <label for="Title-block">Title</label>
  <input id="Title-block" type="text" bind:value={title} required />
</div>
<div id="mDesc">
  <label for="Desc-block">Description</label>
  <textarea id="Desc-block" bind:value={description} required></textarea>
</div>
<div id="mWords">
  Word List
  <p style="margin: 0">
    Between 10 and 30 words. Puzzles are randomly generated using a selection of
    your words at play time.
  </p>
  <main>
    {#each Array(30) as _, index}
      <div class="word">
        <input
          type="text"
          bind:value={wordList[index]}
          on:input={(event) => updateWord(index, event.target.value)}
        />
      </div>
    {/each}
  </main>
</div>
<div id="mSubject">
  Subject
  <div class="radio-buttons">
    <label>
      <input value="personal" type="radio" name="subject" />
      <span>Myself, family, friends etc</span>
    </label>
    <label>
      <input value="other" type="radio" name="subject" />
      <span>Non-Personal (recommended)</span>
    </label>
  </div>
</div>
<button id="mSubmit" type="submit" on:click={handleSubmit}>Submit</button>

<section>
  <div id="mInstructions">
    <h3>Instructions</h3>
    <ul>
      <li>
        To create a word search puzzle you must supply a word list of at least
        10 words.
      </li>
      <li>
        The word list should be based on a single theme or topic. For example a
        television show or a movie you enjoy.
      </li>
      <li>
        Words can only contain the letters a-z and a maximum of two spaces or
        dashes. Spaces and dashes will be removed when words are added to the
        word search grid.
      </li>
      <li>Words can have a maximum length of 14 letters</li>
      <li>
        All puzzles created will remain on the site for at least 30 days, but
        the very best puzzles may be permanently added to our collection.
      </li>
      <li>
        Do not include any personally identifiable information in your puzzles
      </li>
    </ul>
  </div>
</section>

<Footer />

<style>
  button {
    background: #ffc107;
  }
</style>
