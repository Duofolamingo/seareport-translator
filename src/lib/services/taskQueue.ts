// 翻译任务队列 - Redis 简易队列
// 内存回退：开发环境 Redis 不可用时使用内存队列

import { redis, memory } from "@/lib/redis";

export type QueueTask = {
  orderId: string;
  fileUrl: string;
  fileName: string;
  fileType: "PDF" | "IMAGE";
  targetLang: string;
  outputFormat: string;
  enqueuedAt: number;
};

const QUEUE_KEY = "queue:translation";
const memQueue: QueueTask[] = [];

export async function enqueue(task: QueueTask): Promise<void> {
  const payload = JSON.stringify(task);
  try {
    await redis.lpush(QUEUE_KEY, payload);
    return;
  } catch {
    /* */
  }
  memQueue.push(task);
}

export async function dequeue(timeoutSec = 5): Promise<QueueTask | null> {
  try {
    const result = await redis.brpop(QUEUE_KEY, timeoutSec);
    if (result) return JSON.parse(result[1]);
    return null;
  } catch {
    const t = memQueue.shift();
    if (t) return t;
    await new Promise((r) => setTimeout(r, 1000));
    return null;
  }
}

export async function queueSize(): Promise<number> {
  try {
    return await redis.llen(QUEUE_KEY);
  } catch {
    return memQueue.length;
  }
}
