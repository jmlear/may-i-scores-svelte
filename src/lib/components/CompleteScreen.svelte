<script lang="ts">
	import {
		players,
		scores,
		totals,
		leaderboard,
		gamePhase,
		clearGameState,
		TOTAL_ROUNDS
	} from '$lib/stores';
	import { browser } from '$app/environment';

	type SubmitState = 'idle' | 'loading' | 'success' | 'error';
	let submitState: SubmitState = 'idle';
	let errorMessage = '';

	const medals = ['🥇', '🥈', '🥉'];

	// Winner is leaderboard position 0 (lowest total)
	$: winner = $leaderboard[0];

	async function submitGame() {
		submitState = 'loading';
		errorMessage = '';

		const names = $players.map((p) => p.name);
		const playersTotalScores = $totals;
		const winnerIndex = $players.findIndex((p) => p.id === winner.player.id);

		const data = {
			date: new Date(),
			rowData: {
				players: names,
				rawScores: $scores,
				playersTotalScores,
				winnerIndex
			}
		};

		try {
			const res = await fetch('https://h2xg3pt368.execute-api.us-west-1.amazonaws.com', {
				method: 'POST',
				body: JSON.stringify(data),
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				}
			});

			if (!res.ok) throw new Error(`Server error: ${res.status}`);

			// Save winner to local history
			if (browser) {
				const history = JSON.parse(localStorage.getItem('history') || '[]');
				history.push(winner.player.name);
				localStorage.setItem('history', JSON.stringify(history));
			}

			clearGameState();
			submitState = 'success';
		} catch (err) {
			console.error(err);
			errorMessage = 'There was an error saving scores. Please try again.';
			submitState = 'error';
		}
	}

	function newGame() {
		gamePhase.set('setup');
	}
</script>

<div class="flex h-screen flex-col overflow-hidden bg-slate-900 text-white">
	<!-- Header -->
	<div class="shrink-0 px-6 pt-10 pb-4 text-center">
		<p class="mb-1 text-xs tracking-widest text-slate-400 uppercase">Game Over</p>
		<h1 class="text-4xl font-bold">{winner?.player.name} wins!</h1>
		<p class="mt-1 text-sm text-slate-400">
			Final score: <span class="font-semibold text-emerald-400">{winner?.total} pts</span>
		</p>

		<!-- Round progress dots (all complete) -->
		<div class="mt-3 flex justify-center gap-1">
			{#each Array(TOTAL_ROUNDS) as _}
				<div class="h-2 w-2 rounded-full bg-emerald-400"></div>
			{/each}
		</div>
	</div>

	<!-- Final leaderboard -->
	<div class="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-4 py-2">
		{#each $leaderboard as { player, total, index }, rank}
			<div class="rounded-2xl bg-slate-800 px-4 py-4">
				<!-- Player row -->
				<div class="mb-2 flex items-center justify-between">
					<div class="flex items-center gap-3">
						<span class="w-8 text-center text-xl">
							{#if rank < 3}
								{medals[rank]}
							{:else}
								<span class="text-base font-bold text-slate-400">{rank + 1}</span>
							{/if}
						</span>
						<span class="text-lg font-semibold">{player.name}</span>
					</div>
					<span class="text-2xl font-bold {rank === 0 ? 'text-emerald-400' : 'text-white'}">
						{total}
					</span>
				</div>

				<!-- Round scores -->
				<div class="flex gap-1 pl-11">
					{#each Array(TOTAL_ROUNDS) as _, r}
						<div class="flex-1 text-center">
							<p class="mb-1 text-xs text-slate-500">{r + 1}</p>
							<p
								class="text-sm font-medium
                {$scores[index]?.[r] === 0 ? 'text-emerald-400' : 'text-white'}"
							>
								{$scores[index]?.[r] ?? '—'}
							</p>
						</div>
					{/each}
				</div>
			</div>
		{/each}
	</div>

	<!-- Bottom actions -->
	<div class="flex shrink-0 flex-col gap-3 px-4 pt-3 pb-8">
		{#if submitState === 'success'}
			<div
				class="w-full rounded-2xl bg-emerald-800 py-4 text-center font-semibold text-emerald-300"
			>
				✓ Scores saved successfully
			</div>
		{:else if submitState === 'error'}
			<p class="text-center text-sm text-red-400">{errorMessage}</p>
			<button
				on:click={submitGame}
				class="w-full rounded-2xl bg-blue-600 py-4 text-lg font-semibold text-white transition-colors hover:bg-blue-500 active:bg-blue-700"
			>
				Retry
			</button>
		{:else}
			<button
				on:click={submitGame}
				disabled={submitState === 'loading'}
				class="w-full rounded-2xl py-4 text-lg font-semibold transition-colors
          {submitState === 'loading'
					? 'cursor-not-allowed bg-slate-700 text-slate-400'
					: 'bg-blue-600 text-white hover:bg-blue-500 active:bg-blue-700'}"
			>
				{submitState === 'loading' ? 'Saving...' : 'Submit Game'}
			</button>
		{/if}

		<!-- New game always available -->
		<button
			on:click={newGame}
			class="w-full rounded-2xl bg-slate-700 py-4 text-lg font-semibold text-white transition-colors hover:bg-slate-600 active:bg-slate-800"
		>
			New Game
		</button>
	</div>
</div>
