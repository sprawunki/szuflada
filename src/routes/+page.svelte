<script lang="ts">
	import { onMount } from 'svelte';

	let Bookmarks;

	onMount(async () => {
		const bookmarks = await import('$lib/Bookmarks.svelte');
		Bookmarks = bookmarks.default;
	});
</script>

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
