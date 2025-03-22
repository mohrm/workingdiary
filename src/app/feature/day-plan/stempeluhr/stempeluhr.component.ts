import { Component, inject, Inject, input, model, OnChanges, OnInit, output, SimpleChanges } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Time } from '../../../model/Time';
import { Section } from '../../../model/Section';
import { PersistenceServiceService } from '../../../persistence-service.service';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-stempeluhr',
  imports: [MatButtonModule,MatIconModule,FormsModule],
  templateUrl: './stempeluhr.component.html',
  styleUrl: './stempeluhr.component.css'
})
export class StempeluhrComponent implements OnInit, OnChanges {
  persistence = inject(PersistenceServiceService)
  day = input.required<string>();
  startTime = model<Time>();
  stempelEreignis = output<Section>();
  isEdit = model<boolean>(false);
  hour = model<number>(0);
  minute = model<number>(0);

  ngOnInit(): void {
    this.startTime.set(this.persistence.loadStartTime(this.day()));
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.startTime.set(this.persistence.loadStartTime(this.day()));
  }

  setEditable() {
    this.isEdit.set(true);
    const startTime = this.startTime();
    if (startTime) {
      this.hour.set(startTime.hour);
      this.minute.set(startTime.minute);
    }
  }

  abortEdit() {
    this.isEdit.set(false);
  }

  finishEdit() {
    const newHour = this.hour();
    const newMinute = this.minute();
    this.startTime.set(new Time(newHour, newMinute));
    this.isEdit.set(false);
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
