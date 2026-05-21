<script lang="ts">
	import {
		players,
		scores,
		currentRound,
		gamePhase,
		totals,
		leaderboard,
		TOTAL_ROUNDS,
		persistGameState
	} from '$lib/stores';

	const medals = ['🥇', '🥈', '🥉'];

	function enterRound() {
		gamePhase.set('entry');
		persistGameState($players, $scores, $currentRound, 'entry');
	}

	// Has this round been submitted already
	$: roundsCompleted = $currentRound - 1;
</script>

<div class="flex h-screen flex-col overflow-hidden bg-slate-900 text-white">
	<!-- Header -->
	<div class="shrink-0 px-6 pt-8 pb-4">
		<div class="mb-4 flex items-center justify-between">
			<div>
				<p class="text-xs tracking-widest text-slate-400 uppercase">Scoreboard</p>
				<p class="text-3xl font-bold">
					{#if roundsCompleted === 0}
						Not Started
					{:else if roundsCompleted >= TOTAL_ROUNDS}
						Final
					{:else}
						After Round {roundsCompleted}
					{/if}
				</p>
			</div>

			<!-- Round progress pills -->
			<div class="flex gap-1">
				{#each Array(TOTAL_ROUNDS) as _, i}
					<div
						class="h-2 w-2 rounded-full {i < roundsCompleted ? 'bg-emerald-400' : 'bg-slate-600'}"
					></div>
				{/each}
			</div>
		</div>

		<!-- Enter round / Submit game button -->
		{#if roundsCompleted < TOTAL_ROUNDS}
			<button
				on:click={enterRound}
				class="w-full rounded-2xl bg-blue-600 py-4 text-lg font-semibold text-white transition-colors hover:bg-blue-500 active:bg-blue-700"
			>
				{roundsCompleted === 0 ? 'Enter Round 1' : `Enter Round ${roundsCompleted + 1}`}
			</button>
		{:else}
			<button
				on:click={() => gamePhase.set('complete')}
				class="w-full rounded-2xl bg-emerald-500 py-4 text-lg font-semibold text-white transition-colors hover:bg-emerald-400 active:bg-emerald-600"
			>
				Submit Game
			</button>
		{/if}
	</div>

	<!-- Leaderboard list -->
	<div class="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 pb-8">
		{#each $leaderboard as { player, total, index }, rank}
			<div class="rounded-2xl bg-slate-800 px-4 py-4">
				<!-- Player row -->
				<div class="mb-2 flex items-center justify-between">
					<div class="flex items-center gap-3">
						<!-- Rank -->
						<span class="w-8 text-center text-xl">
							{#if rank < 3}
								{medals[rank]}
							{:else}
								<span class="text-base font-bold text-slate-400">{rank + 1}</span>
							{/if}
						</span>
						<span class="text-lg font-semibold">{player.name}</span>
					</div>
					<!-- Total -->
					<span class="text-2xl font-bold {rank === 0 ? 'text-emerald-400' : 'text-white'}">
						{total}
					</span>
				</div>

				<!-- Round scores row -->
				<div class="flex gap-1 pl-11">
					{#each Array(TOTAL_ROUNDS) as _, r}
						<div class="flex-1 text-center">
							<p class="mb-1 text-xs text-slate-500">{r + 1}</p>
							<p
								class="text-sm font-medium
                {r < roundsCompleted
									? $scores[index]?.[r] === 0
										? 'text-emerald-400'
										: 'text-white'
									: 'text-slate-600'}"
							>
								{r < roundsCompleted ? ($scores[index]?.[r] ?? '—') : '—'}
							</p>
						</div>
					{/each}
				</div>
			</div>
		{/each}
	</div>
</div>
