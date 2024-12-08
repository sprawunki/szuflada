<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { base } from "$app/paths";
  import { page } from "$app/stores";
  import { browser } from "$app/environment";

  import { v5 as uuidv5 } from "uuid";
  const NS_BOOKMARK = uuidv5("https://szuflada.app/bookmark/", uuidv5.URL);

  let title: string | null = "";
  let text: string | null = "";
  let url: string | null = "";

  onMount(async () => {
    if (!browser) {
      return;
    }

    title = $page.url.searchParams.get("title");
    text = $page.url.searchParams.get("text");
    url = $page.url.searchParams.get("url");

    const { remoteStorage } = await import("$lib/remotestorage");
    const getUrlFromCandidate = (candidate: string) => {
      try {
        return new URL(candidate).toString();
      } catch (e) {
        return null;
      }
    };

    const finalUrl = getUrlFromCandidate(url) || getUrlFromCandidate(text);

    if (finalUrl) {
      console.log("SAVING", finalUrl);
      remoteStorage["szuflada.app/bookmark"]
        .save({
          "@id": `urn:uuid:${uuidv5(finalUrl, NS_BOOKMARK)}`,
          "@type": "http://www.w3.org/2002/01/bookmark#Bookmark",
          "http://purl.org/dc/elements/1.1/#created": new Date().toISOString(),
          "http://purl.org/dc/elements/1.1/#date": new Date().toISOString(),
          "http://www.w3.org/2002/01/bookmark#title": [
            {
              "@value": title,
            },
          ],
          "http://www.w3.org/2002/01/bookmark#recalls": {
            "@id": finalUrl,
          },
        })
        .then(() => {
          goto(`${base}/#urn:uuid:${uuidv5(finalUrl, NS_BOOKMARK)}`, {
            replaceState: true,
          });
        });
    }
  });
</script>

<div>
  <h1>New bookmark</h1>
  <article>
    <h2>{title}</h2>
    <p>{url}</p>
  </article>
</div>

<style>
  h1 {
    justify-self: flex-start;
  }
  article {
    background: var(--slight-shade);
    padding: 1lh;
  }
</style>
