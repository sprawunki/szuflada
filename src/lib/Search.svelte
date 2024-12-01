<script lang="ts">
  import { searchQuery } from "$lib/store";
</script>

<form>
  <input
    type="search"
    placeholder="I'm looking for..."
    bind:value={$searchQuery}
  />
</form>

<style>
  form {
    position: sticky;
    top: 0;
    width: 100%;
    display: flex;
    background: var(--background-color);
  }

  input {
    display: block;
    border: 0;
    appearance: none;
    width: 100%;
    background: var(--slight-shade);
    color: var(--foreground-color);
    padding: 0.5lh;
  }
</style>
