<script>
  import "./css/style.css";
  import Router from "svelte-spa-router";
  import Maker from "./pages/Maker.svelte";
  import Games from "./pages/Games.svelte";
  import Home from "./pages/Home.svelte";

  const routes = {
    "/": Home,
    "/maker": Maker,
    "/games": Games,
  };
</script>

<Router {routes} />
