import { writable, derived } from 'svelte/store'

export const bookmarks = writable({})

export const bookmarkList = derived(
  bookmarks,
  $bookmarks => [...Object.values($bookmarks)
    .sort((a: any, b: any) => b["created"]
      .localeCompare(
        a["created"]
      )
    )
  ]
)
