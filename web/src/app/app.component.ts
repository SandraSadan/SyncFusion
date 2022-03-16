import { Component, ViewChild } from '@angular/core';
import { sampleData } from './sample';

import { createElement } from '@syncfusion/ej2-base';
import { BeforeOpenCloseEventArgs } from '@syncfusion/ej2-inputs';
import { EditSettingsModel, SortSettingsModel, SelectionSettingsModel, TreeGridComponent } from '@syncfusion/ej2-angular-treegrid';
import { SocketService } from 'src/modules/services/socket.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor(
    private socketService: SocketService
  ) {}

  title: string = 'syncfusion';
  data: any[] = []; // Need to change the type from any when actual data is rendered
  isInitialLoad: boolean = true;
  sortSettings!: SortSettingsModel;
  selectionOptions!: SelectionSettingsModel;
  selectedIndex!: number;
  rowIndex!: number;
  selectedRecord!: Object;
  contextMenuItems = [
    { text: "Add Next", target: ".e-content", id: "add-row" },
    { text: "Add Child", target: ".e-content", id: "add-child" },
    { text: "Delete Row", target: ".e-content", id: "delete-row" },
    { text: "Edit Row", target: ".e-content", id: "edit-row" },
    { text: "Multi Select", target: ".e-content", id: "multi-select", iconCss: 'c-custom' },
    { text: "Copy Rows", target: ".e-content", id: "copy-row" },
    { text: "Cut Rows", target: ".e-content", id: "cut-rows" },
    { text: "Paste Next", target: ".e-content", id: "paste-next" },
    { text: "Paste Child", target: ".e-content", id: "paste-child" },
    { text: 'Edit Column', target: '.e-headercontent', id: 'edit-col' },
    { text: 'New Column', target: '.e-headercontent', id: 'new-col' },
    { text: 'Delete Column', target: '.e-headercontent', id: 'del-col' },
    { text: 'Choose Column', target: '.e-headercontent', id: 'choose-col' },
    { text: 'Freeze Column', target: '.e-headercontent', id: 'freeze-col', iconCss: 'c-custom'},
    { text: 'Filter Column', target: '.e-headercontent', id: 'filter-col', iconCss: 'c-custom' },
    { text: 'Multi Sort', target: '.e-headercontent', id: 'multi-sort', iconCss: 'c-custom' },
  ];
  editSettings: EditSettingsModel = {
    allowEditing: true,
    allowAdding: true,
    allowDeleting: true,
    allowEditOnDblClick: true,
    newRowPosition: 'Top',
    showConfirmDialog: false,
    mode: 'Dialog',
  };
  @ViewChild('treeGrid')
  public treeGrid!: TreeGridComponent;

  ngOnInit(): void {
    this.data = sampleData;
    this.selectionOptions = {
      type: 'Multiple',
      mode: 'Row',
    };
    this.assignSubtasks();
    this.socketService.rowAdded().subscribe((data: string) => {
      console.log(data);
    });
  }

  assignSubtasks(): void {
    this.data.forEach((value, index: number) => {
      value['ID'] = index;
    });
    // To assign subtasks
    this.data.forEach((value, index: number) => {
      if (value['ID'] % 5 === 0) {
        value['subtasks'] = this.data.splice(index+1, 4);
      }
    });
  }

  contextMenuOpen(args: any): void {
    if (this.isInitialLoad) {
      this.isInitialLoad = false;
      this.rowIndex = args.rowInfo.rowIndex;
      const parentNode: any[] = [],
        customElement = (args as BeforeOpenCloseEventArgs).element.querySelectorAll('.c-custom');
    
      // To append checkbox for elements
      if (customElement.length) {
        customElement.forEach((innerEle: Element) => {
          parentNode.push(innerEle.parentElement);
        });
        parentNode.forEach((ele) => {
          const text = ele.textContent;
          ele.innerText = '';
          let inputEle: any = createElement('input');
          inputEle.type = 'checkbox';

          inputEle.setAttribute('class', 'e-checkbox');
          ele.prepend(inputEle);
          let spanEle = createElement('span');
          spanEle.textContent = text;
          spanEle.setAttribute('class', 'e-checkboxspan');
          ele.appendChild(spanEle);
        });
      }
    }
  }

  contextMenuClick(args: any): void {
    if (args.event.target.classList.contains('e-checkboxspan')) {
      const checkbox = args.element.querySelector('.e-checkbox');
      checkbox.checked = !checkbox.checked;
    }
    const data = {
      ID: this.data.length + 1,
    };
    const selectedRecord = this.selectedRecord;
    if (args.item.id === 'add-row') {
      this.treeGrid.addRecord(data, this.rowIndex, 'Top'); // add record user can add row top or below using new row position
    } else if (args.item.id === 'add-child') {
      this.treeGrid.addRecord(data, this.rowIndex, 'Child'); // add child row
    } else if (args.item.id === 'delete-row') {
      this.treeGrid.deleteRecord('taskID', selectedRecord); // delete the selected row
    } else if (args.item.id === 'edit-row') {
      this.treeGrid.startEdit(); // edit the selected row
    } else if (args.item.id === 'multi-select') {
      this.treeGrid.selectionSettings.type = 'Multiple'; // enable multi selection
    } else if (args.item.id === 'copy-row') {
      this.selectedIndex = this.treeGrid['getSelectedRowIndexes']()[0]; // select the records on perform Copy action
      this.selectedRecord = this.treeGrid['getSelectedRecords']()[0];
    } else if (args.item.id === 'paste-next') {
      debugger;
      const index = this.treeGrid['getSelectedRowIndexes']()[0]; // delete the copied record
      const record = this.treeGrid['getSelectedRecords']()[0];
      this.treeGrid.deleteRecord('taskID', this.selectedRecord);
      this.treeGrid.addRecord(this.selectedRecord, index, 'Top'); // Paste as Sibling or another separate row using Below, Above or Top newRowPosition
    } else if (args.item.id === 'paste-child') {
      this.treeGrid.deleteRecord('taskID', this.selectedRecord); // delete the copied record
      const index = this.treeGrid['getSelectedRowIndexes']()[0];

      this.treeGrid.addRecord(this.selectedRecord, index - 1, 'Child'); // paste as Child
    }
  }
}

