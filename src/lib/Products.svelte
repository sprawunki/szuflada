<script lang="ts">
  import { productList, productProgress } from '$lib/store'

  const isValidUrl = (url) => {
    try {
      new URL(url)
      return true
    } catch (e) {}

    return false;
  }
</script>

<div class="products">
  <div class="progress">
    <div class="progressBar" style={`width: ${$productProgress*100}%; transition: width ${+!!$productProgress}s;`}></div>
  </div>

  <h2>Products ({$productList.length})</h2>

  <ul class="productlist">
  {#each $productList as product}
  <li class="product" id={product['@id']}>
    <div class="meta">
      <span>{product['schema:brand'] ?? ''} {product['schema:mpn'] ?? ''}</span>
      <a class="gtin" href="https://google.com/search?q={product['schema:gtin13']}" rel="noopener noereferrer">{product['schema:gtin13']}</a>
    </div>
    <h3>{product['schema:name']}</h3>

    <table class="offers">
      {#if !product['schema:offers'] || product['schema:offers'].length === 0}
        <tr><td class="product__offers">No offers</td></tr>
      {:else}
        {#each product['schema:offers'].sort((a, b) => parseFloat(a['schema:price']) - parseFloat(b['schema:price'])).sort((a, b) => a['schema:priceCurrency'].localeCompare(b['schema:priceCurrency'])) as offer}
        {#if offer['schema:url'] && isValidUrl(offer['schema:url'])}
          <tr class={offer['schema:availability']['@id'] == 'schema:InStock' ? 'offer' : 'offer out-of-stock'}>
            <td class="offer__url"><a href={offer['schema:url']} rel="noopener noereferrer">{new URL(offer['schema:url']).host}</a></td>
            <td class="offer__price">{parseFloat(offer['schema:price']).toLocaleString(undefined, { style: "currency", currencyDisplay: "code", currency: offer['schema:priceCurrency']})}</td>
          </tr>
        {/if}
        {/each}
      {/if}
    </table>
  </li>
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

  .meta {
    display: flex;
    justify-content: space-between;
    max-width: 100%;
  }
  .out-of-stock {
    opacity: 0.7;
  }

  th {
    vertical-align: text-top;
    text-align: right;
    color: #377;
  }

  .products {
    max-width: 100%;
    overflow-wrap: break-word;
    padding: 0 0 1.5rem;
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

  .productlist li,
  .product__offers li {
    margin: 0;
    padding: 0;
  }
  .product {
    padding: 0.125em 0;
  }

  .product::after {
    content: '';
    display: block;
    width: 100%;
    height: 1px;
    margin: 1rem auto;
    background: #ccc;
  }

  .product h3 {
    width: 100%;
    font-size: 1em;
  }

  .product__meta {
    margin: 0;
    padding: 0;
    color: #666;
    font-size: 0.75rem;

    display: block;
    text-align: right;
  }

  .product__meta dt,
  .product__meta dd {
    display: inline;
    margin: 0;
    padding: 0;
  }

  .product__meta dt::after {
    content: '\020';
  }

  .offers {
    width: 100%;
  }

  .offers {
    border-spacing: 0;
    border: 0;
  }

  .offers td {
    background: #eee;
    margin: 0;
    padding: 0.25em 0.5em;
  }

  .offer__price {
    text-align: right;
  }
</style>
