export class TestClock {
  private currentTime: Date
  private originalDateConstructor: typeof Date

  constructor(initialTime: Date = new Date()) {
    this.currentTime = initialTime
    this.originalDateConstructor = globalThis.Date
  }

  setTime(time: Date): void {
    this.currentTime = time
  }

  advance(ms: number): void {
    this.currentTime = new Date(this.currentTime.getTime() + ms)
  }

  install(): void {
    const originalDate = this.originalDateConstructor
    const currentTime = this.currentTime
    globalThis.Date = class extends originalDate {
      constructor(...args: ConstructorParameters<typeof Date>) {
        super(...args)
        if (args.length === 0) {
          return currentTime
        }
        return new originalDate(...args)
      }

      static override now(): number {
        return currentTime.getTime()
      }
    } as typeof Date
  }

  uninstall(): void {
    globalThis.Date = this.originalDateConstructor
  }

  getCurrentTime(): Date {
    return new Date(this.currentTime.getTime())
  }
}

export function createTestClock(initialTime?: Date): TestClock {
  return new TestClock(initialTime)
}
