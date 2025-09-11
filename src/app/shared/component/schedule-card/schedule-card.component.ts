import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-schedule-card',
  templateUrl: './schedule-card.component.html',
  styleUrl: './schedule-card.component.scss'
})
export class ScheduleCardComponent {
@Input() label = '';
@Input() value = 0;
}
