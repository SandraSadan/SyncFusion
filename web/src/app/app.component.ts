import { Component, ViewChild } from '@angular/core';
import { sampleData } from './sample';
import { ContextMenuItem, SortSettingsModel, TreeGridComponent } from '@syncfusion/ej2-angular-treegrid';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  @ViewChild(TreeGridComponent) grid!: TreeGridComponent;
  title: string = 'syncfusion';
  data: any[] = [];
  sortSettings!: SortSettingsModel;
  contextMenuItems: ContextMenuItem[] = ['AutoFit', 'AutoFitAll', 'SortAscending', 'SortDescending', 'Edit',
    'Delete', 'Save', 'Cancel'];
  editSettings = {
    allowEditing: true,
    allowAdding: true,
    allowDeleting: true,
    mode: "Normal",
    allowEditOnDblClick: true
  };

  ngOnInit(): void {
    this.data = sampleData;
    this.assignSubtasks();
    // this.sortSettings = { columns: [{ field: 'Country', direction: 'Ascending' }, { field: 'Order ID', direction: 'Descending' }]  };
  }

  assignSubtasks(): void {
    this.data.forEach((value, index: number) => {
      value['ID'] = index;
    });
    this.data.forEach((value, index: number) => {
      if (value['ID'] % 5 === 0) {
        value['subtasks'] = this.data.splice(index+1, 4);
      }
    });
  }

  commandClick(args:any) {
    (<any>this.grid.contextMenuModule).element.ej2_instances[0].openMenu(null, null, (<any>event).pageY, (<any>event).pageX, event); 
  }
}

