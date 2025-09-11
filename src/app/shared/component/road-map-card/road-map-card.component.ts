import { Component, Input } from '@angular/core';
interface RoadmapItem {
  month: string;
  value: string;
  class: string;
}
@Component({
  selector: 'app-road-map-card',
  templateUrl: './road-map-card.component.html',
  styleUrl: './road-map-card.component.scss'
})
export class RoadMapCardComponent {
@Input() data : RoadmapItem;
}
