<script lang="ts">
  import Lazy from "svelte-lazy";
</script>

<div itemscope itemtype="http://schema.org/ListItem">
  <Lazy height={"5.5lh"} keep="true" offset="0">
    <slot />
  </Lazy>
</div>

<style>
  [itemtype="http://schema.org/ListItem"]
  {
    padding: 0;
    margin: 0.5lh 0;
  }
</style>
