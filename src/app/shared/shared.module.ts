import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NumbersOnlyDirective } from '../directives/numbers-only.directive';
import { RoadMapCardComponent } from './component/road-map-card/road-map-card.component';
import { ScheduleCardComponent } from './component/schedule-card/schedule-card.component';
import { TermsOfServiceComponent } from './component/terms-of-service/terms-of-service.component';
import { MatModule } from './modules/mat-module';
import { HeaderComponent } from './component/header/header.component';

@NgModule({
  declarations: [
    TermsOfServiceComponent,
    ScheduleCardComponent,
    RoadMapCardComponent,
    NumbersOnlyDirective,
    HeaderComponent
  ],
  imports: [
    CommonModule,
    MatModule,
    RouterModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  exports: [MatModule, TermsOfServiceComponent, ScheduleCardComponent,RoadMapCardComponent, NumbersOnlyDirective, HeaderComponent]
})
export class SharedModule { }
