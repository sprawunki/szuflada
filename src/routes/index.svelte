<script context="module" lang="ts">
	export const prerender = true;
</script>

<script lang="ts">
	import { onMount } from 'svelte';

	let WebPage;
	let RemoteStorage;
	let Bookmarks;

	onMount(async () => {
		const webpage = await import('$lib/WebPage.svelte');
		WebPage = webpage.default;

		const bookmarks = await import('$lib/Bookmarks.svelte');
		Bookmarks = bookmarks.default;

		const remotestorage = await import('$lib/RemoteStorage.svelte');
		RemoteStorage = remotestorage.default;
	});
</script>

<section>
	<svelte:component this={RemoteStorage} />
	<svelte:component this={WebPage} />
	<svelte:component this={Bookmarks} />
</section>

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

	.welcome {
		display: block;
		position: relative;
		width: 100%;
		height: 0;
		padding: 0 0 calc(100% * 495 / 2048) 0;
	}

	.welcome img {
		position: absolute;
		width: 100%;
		height: 100%;
		top: 0;
		display: block;
	}
</style>
