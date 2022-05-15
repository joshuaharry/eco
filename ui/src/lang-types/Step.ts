
export type Step = { uses: "Run", name: string, run: string, timeout: number | null, } | { uses: "Find", name: string, ecosystem: string, timeout: number | null, };