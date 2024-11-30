<script>
  import OfferSummary from "$lib/OfferSummary.svelte";

  export let product = {};

  const isValidUrl = (url) => {
    try {
      new URL(url);
      return true;
    } catch (e) {}

    return false;
  };

  let avgPrice;
  let avgPrices;
  let stdDev;

  let productName = "---";
  let brandName = "";

  let offers = [];

  $: {
    avgPrices = {};

    if (Array.isArray(product["schema:offers"])) {
      offers = (product["schema:offers"] ?? [])
        .filter(
          (offer) => offer["schema:url"] && isValidUrl(offer["schema:url"]),
        )
        .sort(
          (a, b) =>
            (parseFloat(a["schema:price"]) || 0) -
            (parseFloat(b["schema:price"]) || 0),
        )
        .sort((a, b) =>
          a["schema:priceCurrency"].localeCompare(b["schema:priceCurrency"]),
        );

      avgPrices = offers
        .map((offer) => [
          offer["schema:priceCurrency"] ? offer["schema:priceCurrency"] : "",
          offer["schema:price"] ? parseFloat(offer["schema:price"]) : 0,
        ])
        .filter((prices) => prices[1] > 0)
        .reduce(
          (prices, price) => ({
            ...prices,
            [price[0]]: Array.isArray(prices[price[0]])
              ? [...prices[price[0]], price[1]]
              : [price[1]],
          }),
          {},
        );
    }

    for (const index in avgPrices) {
      const mean = avgPrices[index].reduce(
        (avg, value, _, { length }) => avg + value / length,
        0,
      );
      const stdDev = Math.sqrt(
        avgPrices[index].reduce(
          (pre, cur) => pre + Math.pow(cur - mean, 2),
          0,
        ) / avgPrices[index].length,
      );

      avgPrices[index] = { average: mean, stdDev: stdDev };
    }

    let nameCandidates = {};
    let brandNameCandidates = {};

    if (product["schema:name"]) {
      [product["schema:name"]].flat().forEach((candidate) => {
        nameCandidates[candidate] = (nameCandidates[candidate] || 0) + 1;
      });
    }

    if (product["schema:brand"]) {
      [product["schema:brand"]].flat().forEach((candidate) => {
        brandNameCandidates[candidate] =
          (brandNameCandidates[candidate] || 0) + 1;
      });
    }

    productName = Object.entries(nameCandidates).reduce(
      (acc, curr) =>
        curr[1] > acc[1] ? curr : curr[0].length < acc[0].length ? curr : acc,
      ["", 0],
    )[0];

    brandName = Object.entries(brandNameCandidates).reduce(
      (acc, curr) =>
        curr[1] > acc[1] ? curr : curr[0].length < acc[0].length ? curr : acc,
      ["", 0],
    )[0];

    typeof brandName === "string"
      ? brandName
      : brandName["schema:name"] && typeof brandName["schema:name"] === "string"
        ? brandName["schema:name"]
        : "";
  }
</script>

<li class="product" id={product["@id"]}>
  <div class="product__meta">
    <span>{brandName} {product["schema:mpn"] ?? ""}</span>
    <a
      class="gtin"
      href="https://google.com/search?q={product['schema:gtin13']}"
      rel="noopener noereferrer">{product["schema:gtin13"]}</a
    >
  </div>
  <h3>{productName}</h3>
  <table class="offers">
    {#if offers.length === 0}
      <tr><td class="product__offers">No offers</td></tr>
    {:else}
      {#each offers as offer}
        <OfferSummary
          {offer}
          expectedPrices={avgPrices[offer["schema:priceCurrency"]]}
        />
      {/each}
    {/if}
  </table>
</li>

<style>
  .productlist li,
  .product__offers li {
    margin: 0;
    padding: 0;
  }

  .product {
    padding: 0.5lh;
    margin: 0.5lh 0;
    background: var(--delicate-gray);
  }

  .product h3 {
    width: 100%;
    font-size: 1em;
  }

  .product__meta {
    margin: 0;
    padding: 0;
    color: var(--gray);
    font-size: 0.6lh;
    line-height: 1lh;

    display: block;
    text-align: right;

    display: flex;
    justify-content: space-between;
    max-width: 100%;
  }

  .product__meta dt,
  .product__meta dd {
    display: inline;
    margin: 0;
    padding: 0;
  }

  .product__meta dt::after {
    content: "\020";
  }

  .offers {
    width: 100%;
    max-width: 100%;
    overflow: hidden;
  }

  .offers {
    border-spacing: 0;
    border: 0;
  }
</style>
