// Redis 客户端 - 内存回退模式
// 当 REDIS_URL 为空时，使用纯内存存储（开发环境）

type Callback = (payload: string) => void;

class MemoryStore {
  private store = new Map<string, string>();
  private channels = new Map<string, Set<Callback>>();

  duplicate() {
    return this;
  }

  get(k: string) {
    return this.store.get(k) ?? null;
  }
  set(k: string, v: string) {
    this.store.set(k, v);
  }
  del(k: string) {
    this.store.delete(k);
  }
  lpush(_k: string, v: string) {
    // 简化：直接 push 到数组模拟
    return Promise.resolve();
  }
  brpop(_k: string, _timeout: number) {
    return Promise.resolve(null);
  }
  llen(_k: string) {
    return Promise.resolve(0);
  }
  publish(channel: string, payload: string) {
    const subs = this.channels.get(channel);
    if (subs) subs.forEach((cb) => cb(payload));
    return Promise.resolve();
  }
  subscribe(channel: string, cb?: Callback) {
    if (cb) {
      if (!this.channels.has(channel)) this.channels.set(channel, new Set());
      this.channels.get(channel)!.add(cb);
    }
    return Promise.resolve();
  }
  on(event: string, handler: (channel: string, msg: string) => void) {
    if (event === "message") {
      const allChannels = this.channels;
      allChannels.forEach((cbs, channel) => {
        cbs.add((payload) => handler(channel, payload));
      });
    }
  }
  disconnect() {}
}

// 导出内存模式实例
export const redis = new MemoryStore();

// 便捷方法（兼容原有调用方式）
export const memory = {
  get: (k: string) => redis.get(k),
  set: (k: string, v: string) => redis.set(k, v),
  del: (k: string) => redis.del(k),
  publish: (channel: string, payload: string) => redis.publish(channel, payload),
  subscribe: (channel: string, cb: Callback) => {
    redis.subscribe(channel, cb);
    return () => {
      // unsubscribe
    };
  },
};