import { Component, inject, Inject, input, model, OnInit, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Time } from '../../../model/Time';
import { Section } from '../../../model/Section';
import { PersistenceServiceService } from '../../../persistence-service.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-stempeluhr',
  imports: [MatButtonModule,MatIconModule],
  templateUrl: './stempeluhr.component.html',
  styleUrl: './stempeluhr.component.css'
})
export class StempeluhrComponent implements OnInit {
  persistence = inject(PersistenceServiceService)
  day = input.required<string>();
  startTime = model<Time>();
  stempelEreignis = output<Section>();

  ngOnInit(): void {
    this.startTime.set(this.persistence.loadStartTime(this.day()));
  }

  einstempeln(): void {
    this.startTime.update(startTime => {
      if (!startTime) {
        return Time.now();
      } else {
        throw new Error("Kann nicht einstempeln, denn es wurde bereits eingestempelt!");
      }
    })
    this.persistence.saveStartTime(this.day(), this.startTime());
}

ausstempeln(): void {
  const startTime = this.startTime();
  if (startTime) {
    this.stempelEreignis.emit(new Section(startTime, Time.now()));
  }
  this.startTime.update(startTime => {
    if (startTime) {
      return undefined;
    } else {
      throw new Error("Kann nicht ausstempeln, denn es wurde noch nicht eingestempelt!")
    }
  })
  this.persistence.saveStartTime(this.day(), this.startTime());
}

}
