import { writable, derived } from 'svelte/store'
import { browser } from '$app/environment'

// Types
export interface Player {
    id: number
    name: string
}

export interface Preset {
    label: string
    names: string[]
}

// Constants
export const TOTAL_ROUNDS = 7

// Load presets from localStorage or use default
const defaultPresets: Preset[] = [
    { label: 'Family', names: ['Joel', 'Laura', 'Mom', 'Dad'] }
]

const storedPresets = browser
    ? JSON.parse(localStorage.getItem('presets') || 'null')
    : null

// Stores
export const presets = writable<Preset[]>(storedPresets ?? defaultPresets)

export const players = writable<Player[]>([])

export const scores = writable<number[][]>([])

export const currentRound = writable<number>(1)

export const gamePhase = writable<'setup' | 'entry' | 'scoreboard' | 'complete'>('setup')

// Persist presets to localStorage whenever they change
presets.subscribe(value => {
    if (browser) localStorage.setItem('presets', JSON.stringify(value))
})

// Persist game state to localStorage (crash recovery)
export function persistGameState(
    p: Player[],
    s: number[][],
    round: number,
    phase: string
) {
    if (browser) {
        localStorage.setItem('gameState', JSON.stringify({ players: p, scores: s, currentRound: round, gamePhase: phase }))
    }
}

export function loadGameState() {
    if (!browser) return null
    const saved = localStorage.getItem('gameState')
    return saved ? JSON.parse(saved) : null
}

export function clearGameState() {
    if (browser) localStorage.removeItem('gameState')
}

// Derived: total score per player (sum of all rounds)
export const totals = derived([players, scores], ([$players, $scores]) => {
    return $players.map((_, i) => {
        const playerScores = $scores[i] ?? []
        return playerScores.reduce((a, b) => a + b, 0)
    })
})

// Derived: leaderboard order (sorted by total ascending)
export const leaderboard = derived([players, totals], ([$players, $totals]) => {
    return $players
        .map((player, i) => ({ player, total: $totals[i], index: i }))
        .sort((a, b) => a.total - b.total)
})