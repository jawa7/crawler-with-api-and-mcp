import { Injectable } from '@nestjs/common';

/**
 * A simple asynchronous task queue with concurrency control.
 * Allows enqueuing async tasks and waits for all to finish via onIdle().
 */
@Injectable()
export class TaskQueueService {
  private processingQueue: (() => Promise<void>)[] = [];
  private runningTask = 0;
  private concurrencyTaskLimit = 10;
  private idleResolvers: (() => void)[] = [];

  /**
   * Enqueue a new async task to be run by the queue.
   * @param task An async function to execute.
   */
  enqueue(task: () => Promise<void>) {
    this.processingQueue.push(task);
    this.run();
  }

  private async run() {
    if (
      this.runningTask >= this.concurrencyTaskLimit ||
      this.processingQueue.length === 0
    ) {
      return;
    }
    this.runningTask++;
    const task = this.processingQueue.shift();
    if (task) await task();
    this.runningTask--;
    this.run();
    if (this.runningTask === 0 && this.processingQueue.length === 0) {
      for (const resolve of this.idleResolvers) {
        resolve();
      }
      this.idleResolvers = [];
    }
  }

  /**
   * Returns a promise that resolves when all tasks are finished and the queue is idle.
   */
  onIdle(): Promise<void> {
    if (this.runningTask === 0 && this.processingQueue.length === 0) {
      return Promise.resolve();
    }
    return new Promise((resolve) => this.idleResolvers.push(resolve));
  }
}
