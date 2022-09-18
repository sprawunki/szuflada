<script lang="ts">
  import { remoteStorage } from '$lib/remotestorage'
  import { v5 as uuidv5 } from 'uuid'

  const NS_BOOKMARK = uuidv5("https://szuflada.app/bookmark/", uuidv5.URL);

  const parsedUrl = new URL(window.location);
  let bookmark;

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
    bookmark = {
      "@id": `urn:uuid:${uuidv5(url, NS_BOOKMARK)}`,
      "@type": "http://www.w3.org/2002/01/bookmark#Bookmark",
      "http://purl.org/dc/elements/1.1/#created": new Date().toISOString(),
      "http://purl.org/dc/elements/1.1/#date": new Date().toISOString(),
      "http://www.w3.org/2002/01/bookmark#title": [{
        "@value": title,
      }],
      "http://www.w3.org/2002/01/bookmark#recalls": {
        "@id": url
      }
    }

    remoteStorage['szuflada.app/bookmark'].save(bookmark)
  }
</script>

<div class="webpage">
  <!-- <pre>{JSON.stringify(bookmark, null, 2)}</pre> -->
</div>
