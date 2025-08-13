const enc = new TextEncoder();

// Each client is represented by a function that sends a line of SSE data
const clients = new Set<(line: string) => void>();

export function addClient(send: (line: string) => void) {
  clients.add(send);
}

export function removeClient(send: (line: string) => void) {
  clients.delete(send);
}

export function broadcast(data: unknown) {
  const line = `data: ${JSON.stringify(data)}\n\n`;
  clients.forEach((send) => {
    try {
      send(line);
    } catch {
      // ignore
    }
  });
}

export function makeSSEStream(onClose?: () => void): ReadableStream<Uint8Array> {
  return new ReadableStream<Uint8Array>({
    start(controller) {
      const send = (line: string) => controller.enqueue(enc.encode(line));
      // register client
      addClient(send);
      // initial comments and retry
      send(`: connected\n\n`);
      send(`retry: 10000\n\n`);
      // heartbeat
      const hb = setInterval(() => {
        try {
          send(`: ping ${Date.now()}\n\n`);
        } catch {
          // if enqueue fails, stream will close via cancel
        }
      }, 15000);

      // cleanup on cancel/close
      const cleanup = () => {
        clearInterval(hb);
        removeClient(send);
        onClose?.();
        try {
          controller.close();
        } catch {}
      };

      // expose cancel
      (controller as unknown as { _onClose?: () => void })._onClose = cleanup;
    },
    cancel() {
      const c = this as unknown as { _onClose?: () => void };
      const fn = c?._onClose;
      if (typeof fn === "function") fn();
    },
  });
}
