import { Component } from '@angular/core';
import { sampleData } from './sample';
import { PageSettingsModel, SortSettingsModel } from '@syncfusion/ej2-angular-treegrid';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'syncfusion';
  data: Object[] = [];
  public sortSettings!: SortSettingsModel;

  ngOnInit(): void {
    this.data = sampleData;
    // this.sortSettings = { columns: [{ field: 'Country', direction: 'Ascending' }, { field: 'Order ID', direction: 'Descending' }]  };
  }
}
