// SSE 进度推送服务

import { memory, redis } from "@/lib/redis";

const CHANNEL = (orderId: string) => `order:${orderId}:progress`;

type ProgressEvent = {
  status: string;
  progress: number;
  message: string;
  downloadUrl?: string;
  errorMessage?: string;
};

/** 推送进度 */
export async function publishProgress(orderId: string, event: ProgressEvent): Promise<void> {
  const payload = JSON.stringify(event);
  try {
    await redis.publish(CHANNEL(orderId), payload);
  } catch {
    /* 内存回退 */
  }
  memory.publish(CHANNEL(orderId), payload);
}

/** 订阅进度（用于 SSE Route Handler） */
export function subscribeProgress(orderId: string, onEvent: (e: ProgressEvent) => void): () => void {
  let redisUnsub: (() => void) | null = null;
  try {
    const sub = redis.duplicate();
    sub.subscribe(CHANNEL(orderId)).catch(() => {});
    sub.on("message", (_channel, msg) => {
      try {
        onEvent(JSON.parse(msg));
      } catch {
        /* */
      }
    });
    redisUnsub = () => sub.disconnect();
  } catch {
    /* */
  }
  const memUnsub = memory.subscribe(CHANNEL(orderId), (payload) => {
    try {
      onEvent(JSON.parse(payload));
    } catch {
      /* */
    }
  });
  return () => {
    redisUnsub?.();
    memUnsub();
  };
}
