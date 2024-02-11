<script lang="ts">
	import { onMount } from 'svelte';

	let WebPage;
	let Bookmarks;

	onMount(async () => {
		const webpage = await import('$lib/WebPage.svelte');
		WebPage = webpage.default;

		const bookmarks = await import('$lib/Bookmarks.svelte');
		Bookmarks = bookmarks.default;
	});
</script>

<svelte:component this={WebPage} />
<svelte:component this={Bookmarks} />

<style>
	section {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex: 1;
	}

	h1 {
		width: 100%;
	}
</style>
