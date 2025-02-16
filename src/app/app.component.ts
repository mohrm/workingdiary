import { Component } from '@angular/core';
import { DayPlan } from './feature/day-plan/day-plan';

@Component({
  selector: 'app-root',
  imports: [DayPlan],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'workingdiary';
}
