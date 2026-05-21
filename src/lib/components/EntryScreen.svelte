<script lang="ts">
	import {
		players,
		scores,
		currentRound,
		gamePhase,
		totals,
		persistGameState,
		TOTAL_ROUNDS
	} from '$lib/stores';

	let activeIndex = 0;
	let roundScores: number[] = $players.map(() => 0);
	let confirmed: boolean[] = $players.map(() => false);
	let inputDisplay = '0';

	$: activePlayer = $players[activeIndex];

	function selectPlayer(index: number) {
		commitDisplay();
		activeIndex = index;
		inputDisplay = roundScores[index] === 0 ? '0' : String(roundScores[index]);
	}

	function commitDisplay() {
		roundScores[activeIndex] = parseInt(inputDisplay) || 0;
	}

	function numpadPress(val: string) {
		if (val === 'DEL') {
			inputDisplay = inputDisplay.length > 1 ? inputDisplay.slice(0, -1) : '0';
		} else if (val === 'WENT OUT') {
			roundScores[activeIndex] = 0;
			confirmed[activeIndex] = true;
			inputDisplay = '0';
			advance();
		} else if (val === 'OK') {
			commitDisplay();
			confirmed[activeIndex] = true;
			advance();
		} else {
			if (inputDisplay === '0') {
				inputDisplay = val;
			} else {
				if (inputDisplay.length < 3) inputDisplay += val;
			}
		}
	}

	function advance() {
		const next = $players.findIndex((_, i) => i > activeIndex && !confirmed[i]);
		if (next !== -1) {
			activeIndex = next;
			inputDisplay = String(roundScores[next]) === '0' ? '0' : String(roundScores[next]);
		} else {
			// wrap to first unconfirmed if any remain before active
			const any = $players.findIndex((_, i) => !confirmed[i]);
			if (any !== -1 && any !== activeIndex) {
				activeIndex = any;
				inputDisplay = String(roundScores[any]);
			}
		}
	}

	$: allConfirmed = confirmed.every(Boolean);

	function submitRound() {
		commitDisplay();

		scores.update((s) => {
			return s.map((playerScores, i) => {
				const copy = [...playerScores];
				copy[$currentRound - 1] = roundScores[i];
				return copy;
			});
		});

		if ($currentRound >= TOTAL_ROUNDS) {
			currentRound.update((r) => r + 1);
			gamePhase.set('complete');
			persistGameState($players, $scores, $currentRound, 'complete');
		} else {
			currentRound.update((r) => r + 1);
			gamePhase.set('scoreboard');
			persistGameState($players, $scores, $currentRound, 'scoreboard');
		}
	}
</script>

<div class="flex h-screen flex-col overflow-hidden bg-slate-900 text-white">
	<!-- Header: fixed top -->
	<div class="flex shrink-0 items-center justify-between px-6 pt-8 pb-3">
		<div>
			<p class="text-xs tracking-widest text-slate-400 uppercase">Round</p>
			<p class="text-3xl font-bold">
				{$currentRound}
				<span class="text-xl text-slate-500">/ {TOTAL_ROUNDS}</span>
			</p>
		</div>
		<div class="text-right">
			<p class="text-xs tracking-widest text-slate-400 uppercase">Leader</p>
			<p class="text-lg font-semibold text-emerald-400">
				{$players[$totals.indexOf(Math.min(...$totals))]?.name ?? '—'}
			</p>
		</div>
	</div>

	<!-- Player list: scrollable middle zone, fixed height -->
	<div class="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto px-4 py-2">
		{#each $players as player, i (player.id)}
			<button
				on:click={() => selectPlayer(i)}
				class="w-full shrink-0 rounded-2xl px-4 py-3 text-left transition-all
          {activeIndex === i ? 'bg-slate-700 ring-2 ring-emerald-400' : 'bg-slate-800 opacity-80'}"
			>
				<div class="flex items-center justify-between">
					<div class="flex items-center gap-3">
						<span
							class="h-2 w-2 shrink-0 rounded-full
              {confirmed[i]
								? 'bg-emerald-400'
								: activeIndex === i
									? 'bg-yellow-400'
									: 'bg-slate-600'}"
						>
						</span>
						<span
							class="font-medium
              {activeIndex === i ? 'text-base text-white' : 'text-sm text-slate-300'}"
						>
							{player.name}
						</span>
					</div>
					<div class="flex items-center gap-3">
						<span class="text-xs text-slate-500">Total: {$totals[i]}</span>
						<span
							class="w-10 text-right font-bold
              {activeIndex === i
								? 'text-lg text-emerald-400'
								: confirmed[i]
									? 'text-base text-white'
									: 'text-base text-slate-500'}"
						>
							{activeIndex === i ? inputDisplay : roundScores[i]}
						</span>
					</div>
				</div>
			</button>
		{/each}
	</div>

	<!-- Now Entering strip: sticky above numpad -->
	<div
		class="mx-4 mb-2 flex shrink-0 items-center justify-between rounded-2xl border border-slate-600 bg-slate-800 px-5 py-3"
	>
		<div>
			<p class="text-xs tracking-widest text-slate-400 uppercase">Entering score for</p>
			<p class="text-lg font-bold text-white">{activePlayer?.name ?? '—'}</p>
		</div>
		<div class="text-right">
			<p class="text-xs tracking-widest text-slate-400 uppercase">Score</p>
			<p class="text-3xl font-bold text-emerald-400 tabular-nums">{inputDisplay}</p>
		</div>
	</div>

	<!-- Numpad: fixed bottom -->
	<div class="flex shrink-0 flex-col gap-2 px-4 pb-8">
		<!-- Went Out + DEL -->
		<div class="grid grid-cols-2 gap-3">
			<button
				on:click={() => numpadPress('WENT OUT')}
				class="rounded-2xl bg-emerald-600 py-4 text-sm font-semibold tracking-wide text-white transition-colors hover:bg-emerald-500 active:bg-emerald-700"
			>
				Went Out
			</button>
			<button
				on:click={() => numpadPress('DEL')}
				class="rounded-2xl bg-slate-700 py-4 text-xl font-semibold text-white transition-colors hover:bg-slate-600 active:bg-slate-800"
			>
				⌫
			</button>
		</div>

		<!-- 1–9 -->
		<div class="grid grid-cols-3 gap-2">
			{#each ['1', '2', '3', '4', '5', '6', '7', '8', '9'] as digit}
				<button
					on:click={() => numpadPress(digit)}
					class="rounded-2xl bg-slate-700 py-4 text-2xl font-semibold text-white transition-colors hover:bg-slate-600 active:bg-slate-800"
				>
					{digit}
				</button>
			{/each}
		</div>

		<!-- 0 + OK -->
		<div class="grid grid-cols-3 gap-2">
			<div></div>
			<button
				on:click={() => numpadPress('0')}
				class="rounded-2xl bg-slate-700 py-4 text-2xl font-semibold text-white transition-colors hover:bg-slate-600 active:bg-slate-800"
			>
				0
			</button>
			<button
				on:click={() => numpadPress('OK')}
				class="rounded-2xl bg-blue-600 py-4 text-lg font-semibold text-white transition-colors hover:bg-blue-500 active:bg-blue-700"
			>
				OK
			</button>
		</div>

		<!-- Submit -->
		{#if allConfirmed}
			<button
				on:click={submitRound}
				class="w-full rounded-2xl bg-emerald-500 py-4 text-lg font-semibold text-white transition-colors hover:bg-emerald-400 active:bg-emerald-600"
			>
				Submit Round {$currentRound}
			</button>
		{/if}
	</div>
</div>
