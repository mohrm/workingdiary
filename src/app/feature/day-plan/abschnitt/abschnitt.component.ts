import { Component, model } from '@angular/core';
import { Section } from '../../../model/Section';
import { MatIconModule } from '@angular/material/icon';
import { Time } from '../../../model/Time';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-abschnitt',
  imports: [MatIconModule, FormsModule],
  templateUrl: './abschnitt.component.html',
  styleUrl: './abschnitt.component.scss'
})
export class AbschnittComponent {
  section = model.required<Section>();
  isEdit = model<boolean>(false);

  startHour = model<number>(0);
  startMinute = model<number>(0);
  endHour = model<number>(0);
  endMinute = model<number>(0);
  location = model<string>('');

  setEditable() {
    this.isEdit.set(true);
    this.startHour.set(this.section()?.startTime.hour);
    this.startMinute.set(this.section()?.startTime.minute);
    this.endHour.set(this.section()?.endTime.hour);
    this.endMinute.set(this.section()?.endTime.minute);
    this.location.set(this.section()?.location ?? '');
  }

  abortEdit() {
    this.isEdit.set(false);
  }

  finishEdit() {
    const newStart = new Time(this.startHour(), this.startMinute())
    const newEnd = new Time(this.endHour(), this.endMinute())
    this.section.set(new Section(newStart, newEnd, this.location()));
    this.isEdit.set(false);
  }
}
