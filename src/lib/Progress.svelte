<script lang="ts">
  export let progress = 0;
</script>

<div class="progress">
  <div
    class="progressBar"
    style={`width: ${progress * 100}%; transition: width ${+!!progress}s;`}
  ></div>
</div>

<style>
  .progressBar {
    background: var(--primary-color);
    height: 0.125lh;
  }

  .progress {
    position: sticky;
    top: 0;
    right: 0;
    left: 0;
    background: var(--gray);
  }
</style>
