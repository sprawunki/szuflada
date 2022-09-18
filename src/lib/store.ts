import { writable, derived } from 'svelte/store'

export const bookmarks = writable({})

export const bookmarkList = derived(
  bookmarks,
  $bookmarks => [...Object.values($bookmarks)
    .sort((a: any, b: any) => b["http://purl.org/dc/elements/1.1/#created"]
      .localeCompare(
        a["http://purl.org/dc/elements/1.1/#created"]
      )
    )
  ]
)
