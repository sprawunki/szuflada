<script>
  import { base } from "$app/paths";
</script>

<div class="navigation" id="navigation">
  <ul>
    <li>
      <a href="{base}/">Bookmarks</a>
    </li>
    <li>
      <a href="{base}/products/">Products</a>
    </li>
    <li>
      <a href="{base}/tasks/">Tasks</a>
    </li>
  </ul>
</div>

<style>
  .navigation {
    background: var(--background-color);
    color: var(--foreground-color);
    width: 100%;
    padding: 0;
  }

  .navigation a {
    padding: 0.5lh;
    margin: 0;
    display: block;
  }

  .navigation ul {
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
  }

  .navigation li {
    list-style: none;
    margin: 0;
    padding: 0;
  }
</style>
