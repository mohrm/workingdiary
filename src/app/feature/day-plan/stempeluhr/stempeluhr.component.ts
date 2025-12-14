import { Component, inject, Inject, input, model, OnChanges, OnInit, output, SimpleChanges } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { Time } from '../../../model/Time';
import { Section } from '../../../model/Section';
import { WorkLocation } from '../../../model/WorkLocation';
import { PersistenceServiceService } from '../../../persistence-service.service';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule, FormsModule, FormControl} from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-stempeluhr',
  imports: [MatButtonModule, MatIconModule, MatFormFieldModule, ReactiveFormsModule, FormsModule, MatSelectModule, MatInputModule],
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
  workLocation = new FormControl<WorkLocation>('HOME')

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
  const workLocation = this.workLocation.value || 'UNKNOWN';
  if (startTime) {
    this.stempelEreignis.emit(new Section(startTime, Time.now(), workLocation));
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

getWorkLocationLabel(value: string|null): string {
  switch (value) {
    case 'HOME': return 'Zuhause';
    case 'OFFICE': return 'Büro';
    case 'UNKNOWN': return 'Sonstiges';
    default: return '–';
  }
}

}
