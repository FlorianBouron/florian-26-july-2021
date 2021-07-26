import { useEffect, useRef } from 'react';
import SocketState from '../enums/socket';

type useSocketProps = {
  url: string;
  message: {
    feed: string;
    product_ids: string[];
  };
  onError: (_message: string) => void;
  onMessage: (res: MessageEvent) => void;
};

type useSocketReturn = {
  closeSocket: () => void;
};

export default function useSocket({
  url,
  message,
  onError,
  onMessage,
}: useSocketProps): useSocketReturn {
  const socketRef = useRef<WebSocket>();

  const closeSocket = (): void => {
    try {
      if (
        socketRef.current
        && socketRef.current.readyState === (SocketState.OPEN || SocketState.CONNECTING)
      ) {
        socketRef.current.send(
          JSON.stringify({
            ...message,
            ...{ event: 'unsubscribe' },
          }),
        );
      }
    } catch {
      onError('Failed to close the connection');
    }
  };

  useEffect(() => {
    try {
      socketRef.current = new WebSocket(url);

      socketRef.current.onerror = () => {
        onError('Something went wrong');
      };

      // eslint-disable-next-line func-names
      socketRef.current.onopen = function () {
        this.send(JSON.stringify({ ...message, ...{ event: 'subscribe' } }));

        this.onmessage = (res: MessageEvent) => {
          onMessage(res);
        };
      };
    } catch (_) {
      onError('Impossible to connect');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, message]);

  return {
    closeSocket,
  };
}
