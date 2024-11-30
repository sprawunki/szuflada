<script lang="ts">
  import { base } from "$app/paths";
  import { productList, productProgress } from "$lib/store";
  import Product from "$lib/Product.svelte";
  import Progress from "$lib/Progress.svelte";
</script>

<div class="products">
  <header>
    <h1>Products ({$productList.length})</h1>

    <Progress progress={$productProgress} />
  </header>

  <ul class="productlist">
    {#each $productList as product}
      <Product {product} />
    {/each}
  </ul>
</div>

<style>
  header {
    position: sticky;
    top: 0;
    overflow: hidden;
    background: var(--background-color);
    z-index: 1;
  }

  th {
    vertical-align: text-top;
    text-align: right;
    color: #377;
  }

  .products {
    max-width: 100%;
    overflow-wrap: break-word;
  }

  .products a {
    hyphens: auto;
    max-width: 100%;
  }

  .productlist {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  ul.product__offers {
    margin: 0;
    padding: 0 0 0 1rem;
  }
</style>
