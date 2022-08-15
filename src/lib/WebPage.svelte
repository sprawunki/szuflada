<script lang="ts">
  import { remoteStorage } from '$lib/remotestorage'

  const parsedUrl = new URL(window.location);
  let webpage;

  const title = parsedUrl.searchParams.get('title');
  const text = parsedUrl.searchParams.get('text');
  let url = parsedUrl.searchParams.get('url');

  const getUrlFromCandidate = (candidate) => {
    try {
      return new URL(candidate).toString()
    } catch (e) {
      return null
    }
  }

  url = getUrlFromCandidate(url) || getUrlFromCandidate(text)

  if (url) {
    webpage = {
      "@context": "http://schema.org/WebPage",
      "http://schema.org/name": [{
        "@value": title,
      }],
      "http://schema.org/url": url
    }

    remoteStorage['szuflada.app/WebPage'].save(webpage)
  }
</script>

<div class="webpage">
  <pre>{JSON.stringify(webpage, null, 2)}</pre>
</div>
