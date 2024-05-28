<script lang="ts">
  import { base } from "$app/paths"
  import { productList, productProgress } from '$lib/store'
  import Product from '$lib/Product.svelte'
</script>

<div class="products">
  <div class="progress">
    <div class="progressBar" style={`width: ${$productProgress*100}%; transition: width ${+!!$productProgress}s;`}></div>
  </div>

  <h2>Products ({$productList.length})</h2>

  <ul class="productlist">
  {#each $productList as product}
    <Product product={product}/>
  {/each}
</ul>
</div>

<style>
  .progressBar {
    background: #0cc;
    height: 0.125rem;
  }

  .progress {
    position: sticky;
    top: 0;
    right: 0;
    left: 0;
    background: #077;
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
