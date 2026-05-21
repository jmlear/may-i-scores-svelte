<script lang="ts">
	import { players, scores, presets, gamePhase, currentRound, persistGameState } from '$lib/stores';
	import type { Player } from '$lib/stores';

	let nextId = 1;

	function loadPreset(names: string[]) {
		const newPlayers: Player[] = names.map((name) => ({ id: nextId++, name }));
		players.set(newPlayers);
		scores.set(newPlayers.map(() => []));
	}

	function addPlayer() {
		players.update((p) => {
			const updated = [...p, { id: nextId++, name: '' }];
			scores.update((s) => [...s, []]);
			return updated;
		});
	}

	function removePlayer(id: number) {
		players.update((p) => {
			const idx = p.findIndex((pl) => pl.id === id);
			scores.update((s) => s.filter((_, i) => i !== idx));
			return p.filter((pl) => pl.id !== id);
		});
	}

	function updateName(id: number, value: string) {
		players.update((p) => p.map((pl) => (pl.id === id ? { ...pl, name: value } : pl)));
	}

	function startGame() {
		currentRound.set(1);
		gamePhase.set('entry');
		persistGameState($players, $scores, 1, 'entry');
	}

	$: canStart = $players.length >= 2 && $players.every((p) => p.name.trim() !== '');
</script>

<div class="flex min-h-screen flex-col gap-6 bg-slate-900 p-6 text-white">
	<!-- Header -->
	<div class="pt-4 text-center">
		<h1 class="text-4xl font-bold tracking-tight">May I</h1>
		<p class="mt-1 text-sm text-slate-400">Set up your players to begin</p>
	</div>

	<!-- Presets -->
	{#if $presets.length > 0}
		<div class="flex flex-col gap-2">
			<p class="text-xs tracking-widest text-slate-400 uppercase">Presets</p>
			<div class="flex flex-wrap gap-2">
				{#each $presets as preset}
					<button
						on:click={() => loadPreset(preset.names)}
						class="rounded-full bg-slate-700 px-4 py-2 text-sm font-medium transition-colors hover:bg-slate-600 active:bg-slate-500"
					>
						{preset.label}
					</button>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Player List -->
	<div class="flex flex-col gap-3">
		<p class="text-xs tracking-widest text-slate-400 uppercase">Players</p>

		{#each $players as player, i (player.id)}
			<div class="flex items-center gap-3 rounded-2xl bg-slate-800 px-4 py-3">
				<!-- Position number -->
				<span class="w-5 text-center font-mono text-sm text-slate-500">{i + 1}</span>

				<!-- Name input -->
				<input
					type="text"
					value={player.name}
					on:input={(e) => updateName(player.id, e.currentTarget.value)}
					placeholder="Player name"
					class="flex-1 bg-transparent text-lg font-medium text-white placeholder-slate-600 outline-none"
				/>

				<!-- Remove button -->
				<button
					on:click={() => removePlayer(player.id)}
					class="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-700 hover:text-red-400"
					aria-label="Remove player"
				>
					✕
				</button>
			</div>
		{/each}

		<!-- Add player -->
		<button
			on:click={addPlayer}
			class="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-600 bg-slate-800 px-4 py-3 text-sm text-slate-400 transition-colors hover:bg-slate-700 active:bg-slate-600"
		>
			<span class="text-xl leading-none">+</span>
			Add Player
		</button>
	</div>

	<!-- Start button -->
	<div class="mt-auto pb-4">
		<button
			on:click={startGame}
			disabled={!canStart}
			class="w-full rounded-2xl py-4 text-lg font-semibold transition-colors
        {canStart
				? 'bg-emerald-500 text-white hover:bg-emerald-400 active:bg-emerald-600'
				: 'cursor-not-allowed bg-slate-700 text-slate-500'}"
		>
			Start Game
		</button>
	</div>
</div>
