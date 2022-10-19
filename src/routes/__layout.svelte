<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';

	let RemoteStorage;

	onMount(async () => {
		const remotestorage = await import('$lib/RemoteStorage.svelte');
		RemoteStorage = remotestorage.default;
	})
</script>

<header>
	<div class="container">
		<img src="/szuflada/favicon.png" alt="Szuflada" width="32" height="32" />
		<svelte:component this={RemoteStorage} />
	</div>
</header>

<main>
	<div class="container">
		<slot/>
	</div>
</main>

<footer>
	<div class="container">
		<span>This app is experimental. Use at your own risk.</span>
	</div>
</footer>

<style>
	header {
		background: #077;
		color: #eee;
		padding: 0.25rem 0;
    position: sticky;
    top: 0;
    right: 0;
    left: 0;
	}

	header .container {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	main {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 1rem;
		width: 100%;
		height: 100%;
		margin: 0;
		padding: 0;
		box-sizing: border-box;
	}

	footer {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		padding: 0.5rem 0;
    position: sticky;
    right: 0;
    bottom: 0;
    left: 0;
    background: #111;
    color: #eee;
	}

	footer a {
		font-weight: bold;
	}
</style>
