export type MessageKind = 'info' | 'error' | 'success' | 'warning' | 'loading' | 'empty';

export type MessageOptions = {
  id: string;
  visible: boolean;
  kind: MessageKind;
  text?: string;
  textKey?: string;
};