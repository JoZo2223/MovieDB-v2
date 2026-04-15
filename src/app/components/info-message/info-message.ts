import { Component, input } from '@angular/core';

export type MessageType = 'info' | 'error' | 'success' | 'warning';

@Component({
  selector: 'app-info-message',
  standalone: true,
  templateUrl: './info-message.html',
  styleUrl: './info-message.css',
})
export class InfoMessageComponent {
  readonly text = input<string>('');
  readonly type = input<MessageType>('info');
}