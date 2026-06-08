export {};

declare global {
  interface Window {
    BassikChat?: {
      open: () => void;
      close: () => void;
      mount: () => void;
    };
    BassikChatConfig?: Record<string, unknown>;
  }
}
