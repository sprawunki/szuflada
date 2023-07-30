<script>
    import { base } from "$app/paths"
</script>

<div class="navigation" id="navigation">
    <ul>
        <li>
            <a href="{base}/">Bookmarks</a>
        </li>
        <li>
            <a href="{base}/task/">Tasks</a>
        </li>
    </ul>
</div>

<style>
    .navigation {
        background: #eee;
        color: #111;
        width: 100%;
        padding: 0.5em 0;
    }

    .navigation a {
        color: inherit;
        padding: 0.25em;
        margin: 0;
        display: block;
    }

    .navigation ul {
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: row;
        justify-content: space-evenly;
    }

    .navigation li {
        list-style: none;
        margin: 0;
        padding: 0;
    }
</style>