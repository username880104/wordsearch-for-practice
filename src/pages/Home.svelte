<script>
  import Header from "../components/Header.svelte";
  import Footer from "../components/Footer.svelte";

  function maker() {
    window.location.href = "/#/maker";
  }
</script>

<Header />
<br />
<br />
<br />
<br />
<button on:click={maker}>게임 만들기</button>

<Footer />

<style>
  button {
    border-radius: 5px;
    background-color: teal;
    color: white;
  }
</style>
