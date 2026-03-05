import { documentDirectory, getInfoAsync, readAsStringAsync, writeAsStringAsync } from 'expo-file-system/legacy';

const MAX_QUEUE_SIZE = 200;

interface QueueItem<T> {
  id: string;
  data: T;
  createdAt: number;
  attempts: number;
}

export class OfflineQueue<T> {
  private items: QueueItem<T>[] = [];
  private readonly filePath: string;
  private flushing = false;

  constructor(storageKey: string) {
    this.filePath = `${documentDirectory}prudency_queue_${storageKey}.json`;
  }

  async load(): Promise<void> {
    try {
      const info = await getInfoAsync(this.filePath);
      if (!info.exists) {
        this.items = [];
        return;
      }
      const raw = await readAsStringAsync(this.filePath);
      if (raw) {
        this.items = JSON.parse(raw) as QueueItem<T>[];
      }
    } catch {
      this.items = [];
    }
  }

  async enqueue(data: T): Promise<void> {
    const item: QueueItem<T> = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      data,
      createdAt: Date.now(),
      attempts: 0,
    };

    this.items.push(item);

    if (this.items.length > MAX_QUEUE_SIZE) {
      this.items = this.items.slice(-MAX_QUEUE_SIZE);
    }

    await this.persist();
  }

  async flush(
    sender: (data: T) => Promise<void>,
  ): Promise<{ sent: number; failed: number }> {
    if (this.flushing || this.items.length === 0) {
      return { sent: 0, failed: 0 };
    }

    this.flushing = true;
    let sent = 0;
    let failed = 0;
    const remaining: QueueItem<T>[] = [];

    for (const item of this.items) {
      try {
        await sender(item.data);
        sent++;
      } catch {
        item.attempts++;
        if (item.attempts < 5) {
          remaining.push(item);
        }
        failed++;
      }
    }

    this.items = remaining;
    await this.persist();
    this.flushing = false;

    return { sent, failed };
  }

  get size(): number {
    return this.items.length;
  }

  get isFlushing(): boolean {
    return this.flushing;
  }

  async clear(): Promise<void> {
    this.items = [];
    await this.persist();
  }

  private async persist(): Promise<void> {
    try {
      await writeAsStringAsync(
        this.filePath,
        JSON.stringify(this.items),
      );
    } catch {
      // File write failed — keep in-memory only
    }
  }
}
