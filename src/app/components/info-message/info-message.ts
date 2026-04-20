import { Component, computed, input } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

export type MessageKind = 'info' | 'error' | 'success' | 'warning' | 'loading' | 'empty';
export type MessageType = 'info' | 'error' | 'success' | 'warning';

@Component({
  selector: 'app-info-message',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './info-message.html',
  styleUrl: './info-message.css',
})
export class InfoMessageComponent {
  readonly text = input('');
  readonly textKey = input('');
  readonly visible = input(true);
  readonly isError = input(false);
  readonly isSuccess = input(false);
  readonly isWarning = input(false);
  readonly isLoading = input(false);
  readonly isEmpty = input(false);

  readonly kind = computed<MessageKind>(() => {
    if (this.isError()) {
      return 'error';
    }

    if (this.isSuccess()) {
      return 'success';
    }

    if (this.isWarning()) {
      return 'warning';
    }

    if (this.isLoading()) {
      return 'loading';
    }

    if (this.isEmpty()) {
      return 'empty';
    }

    return 'info';
  });

  readonly type = computed<MessageType>(() => {
    switch (this.kind()) {
      case 'error':
        return 'error';
      case 'success':
        return 'success';
      case 'warning':
        return 'warning';
      default:
        return 'info';
    }
  });

  readonly icon = computed(() => {
    switch (this.kind()) {
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
  });
}
