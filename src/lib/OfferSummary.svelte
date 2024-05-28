<script>
    export let offer = {}
    export let expectedPrices = {}

    let available
    let availability
    let urlHost
    let fullUrl
    let price
    let priceRange = ""

    $: {
        available = offer.hasOwnProperty('schema:availability') && offer['schema:availability'] == 'schema:InStock' ? ' available' : ''
        availability = offer['schema:availability']
        const url = new URL(offer['schema:url'].replace(/^(http[s]?:)?\/\//i, 'https://'))
        urlHost = url.host
        fullUrl = url.toString()
        price = offer['schema:price'] ? parseFloat(offer['schema:price']).toLocaleString(undefined, { style: "currency", currencyDisplay: "code", currency: offer['schema:priceCurrency']}) : '–⁠'

        if (offer['schema:price'] < expectedPrices['average'] - expectedPrices['stdDev']) {
            priceRange = "cheap"
        }

        if (offer['schema:price'] > expectedPrices['average'] + expectedPrices['stdDev']) {
            priceRange = "expensive"
        }

        if (
            offer['schema:price'] < expectedPrices['average'] - 2 * expectedPrices['stdDev'] ||
            offer['schema:price'] > expectedPrices['average'] + 2 * expectedPrices['stdDev']
        ) {
            priceRange = `very-${priceRange}`
        }

        if (
            offer['schema:price'] < expectedPrices['average'] - 3 * expectedPrices['stdDev'] ||
            offer['schema:price'] > expectedPrices['average'] + 3 * expectedPrices['stdDev']
        ) {
            priceRange = `very-${priceRange}`
        }

    }
</script>

<tr class="offer {available}">
  <td class="offer__url"><span class="icon {availability}" title="{availability}">{offer['schema:availability']}</span> <a href={ fullUrl } rel="noopener noereferrer">{ urlHost }</a></td>
  <td class="offer__price">{ price } <span class="icon {priceRange}" title="{priceRange}">{priceRange}</span></td>
</tr>

<style>
  .offer {
    background: #eee;
    margin: 0;
    padding: 0.25em 0.5em;
    line-height: 1.25;
  }

  .offer td {
    padding: 0.25em 0.5em;
  }

  .offer__price {
    text-align: right;
    white-space: nowrap;
  }

  .icon {
    overflow: hidden;
    text-indent: 100%;
    white-space: nowrap;
    width: 1.25em;
    height: 1.25em;
    font-size: 1em;
    line-height: 1.25;
    display: inline-block;
    vertical-align: baseline;
    position: relative;
  }

  .icon::after {
    width: 1em;
    height: 1em;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-indent: 0;
    text-align: center;
  }


  .very-very-cheap::after {
    content: "⤋";
  }

  .very-cheap::after {
    content: "⇓";
  }

  .cheap::after {
    content: "↓";
  }

  .expensive::after {
    content: "↑";
  }

  .very-expensive::after {
    content: "⇑";
  }

  .very-very-expensive::after {
    content: "⤊";
  }

  .icon.schema\:InStock::after {
    content: '●';
  }

  .icon.schema\:OutOfStock::after {
    content: '◎';
  }

  .icon.schema\:LimitedAvailability::after {
    content: '◉';
  }

  .icon.schema\:BackOrder::after {
    content: '⧖';
  }

  .icon.schema\:SoldOut::after {
    content: '○';
  }

  .icon.schema\:Discontinued::after {
    content: '○';
  }
</style>