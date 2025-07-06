import { Component, inject } from '@angular/core';
import { PersistenceServiceService } from '../../persistence-service.service';

@Component({
  selector: 'app-download-plans',
  imports: [],
  templateUrl: './download-plans.component.html',
  styleUrl: './download-plans.component.scss'
})
export class DownloadPlansComponent {
  persistence = inject(PersistenceServiceService)
  
  url(): string {
      const plans = this.persistence.loadPlans()
      const stringifiedPlans = JSON.stringify(plans)
      const blob = new Blob([stringifiedPlans], {type: "application/json"});
      return URL.createObjectURL(blob);
  }

  filename(): string {
    // Aktuelles Datum und Uhrzeit holen
    const now = new Date();

    // Zeitstempel als String formatieren (z.B. 2025-07-06_22-01-19)
    const pad = (num: number) => num.toString().padStart(2, '0');
    const timestamp = 
      now.getFullYear() + '-' +
      pad(now.getMonth() + 1) + '-' +
      pad(now.getDate()) + '_' +
      pad(now.getHours()) + '-' +
      pad(now.getMinutes()) + '-' +
      pad(now.getSeconds());

    // Dateiname mit Zeitstempel
    return `dayplans_${timestamp}.json`;
  }
}
