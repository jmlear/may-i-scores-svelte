<script lang="ts">
	import { gamePhase } from '$lib/stores';
	import SetupScreen from '$lib/components/SetupScreen.svelte';
	import EntryScreen from '$lib/components/EntryScreen.svelte';
	import ScoreboardScreen from '$lib/components/ScoreboardScreen.svelte';
	import CompleteScreen from '$lib/components/CompleteScreen.svelte';
</script>

{#if $gamePhase === 'setup'}
	<SetupScreen />
{:else if $gamePhase === 'entry'}
	<EntryScreen />
{:else if $gamePhase === 'scoreboard'}
	<ScoreboardScreen />
{:else if $gamePhase === 'complete'}
	<CompleteScreen />
{/if}
