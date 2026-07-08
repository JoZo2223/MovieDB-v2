import { Component, computed, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

import { MessageKind, MessageOptions } from './message-options';

export type MessageType = 'info' | 'error' | 'success' | 'warning';

@Component({
  selector: 'app-info-message',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './info-message.html',
  styleUrl: './info-message.css',
})
export class InfoMessageComponent {
  readonly messages = input<MessageOptions[]>([]);

  readonly visibleMessages = computed(() =>
    this.messages().filter((message) => message.visible),
  );

  resolveType(kind: MessageKind): MessageType {
    switch (kind) {
      case 'error':
        return 'error';
      case 'success':
        return 'success';
      case 'warning':
        return 'warning';
      default:
        return 'info';
    }
  }

  resolveIcon(kind: MessageKind): string {
    switch (kind) {
      case 'error':
        return '❌';
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'loading':
        return '⏳';
      case 'empty':
        return '🔎';
      default:
        return 'ℹ️';
    }
  }

  trackById(_: number, message: MessageOptions): string {
    return message.id;
  }
}