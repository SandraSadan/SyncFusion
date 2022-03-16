import { Component, ViewChild } from '@angular/core';
import { TableData, Column } from 'src/modules/utils/interfaces';

import { createElement } from '@syncfusion/ej2-base';
import { BeforeOpenCloseEventArgs } from '@syncfusion/ej2-inputs';
import { SocketService } from 'src/modules/services/socket.service';
import { DataService } from 'src/modules/services/data.service';

import { 
  SortService, 
  ResizeService, 
  ContextMenuService, 
  EditService, 
  VirtualScrollService, 
  ColumnChooserService, 
  ToolbarService, 
  FilterService, 
  EditSettingsModel, 
  SortSettingsModel, 
  SelectionSettingsModel, 
  TreeGridComponent
} from '@syncfusion/ej2-angular-treegrid';

import { get } from 'lodash';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [
    SortService,
    ContextMenuService,
    EditService,
    ResizeService,
    VirtualScrollService,
    ColumnChooserService,
    ToolbarService,
    FilterService
  ]
})
export class AppComponent {
  constructor(
    private socketService: SocketService,
    private dataService: DataService,
  ) {}

  title: string = 'syncfusion';
  data: TableData[] = []; // Need to change the type from any when actual data is rendered
  columnList: Column[] = [];
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
    this.selectionOptions = {
      type: 'Multiple',
      mode: 'Row',
    };
    this.getList();
    this.getColumn();
    this.socketService.rowAdded().subscribe((data: string) => {
      console.log(data);
    });
  }

  assignSubtasks(): void {
    this.data.forEach((value, index: number) => {
      value['id'] = index;
    });
    // To assign subtasks for expand and collapse
    this.data.forEach((value, index: number) => {
      if (value['id'] % 5 === 0) {
        value['subtasks'] = this.data.splice(index+1, 4);
      }
    });
  }

  getList(): void {
    this.dataService.getAllLists().subscribe({
      next: (res) => {
        this.data = get(res, 'data', []);
        this.assignSubtasks();
      },
    });
  }

  getColumn(): void {
    this.dataService.getColumn().subscribe({
      next: (res) => {
        this.columnList = get(res, 'column', []);
      }
    })
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

  // TODO need to change the arg type "any" and integrate API functionality
  contextMenuClick(args: any): void {
    const data = {
      id: this.data.length + 1,
    };
    if (args.event.target.classList.contains('e-checkboxspan')) {
      const checkbox = args.element.querySelector('.e-checkbox');
      checkbox.checked = !checkbox.checked;
    }
    
    const selectedRecord = this.selectedRecord ? this.selectedRecord: this.treeGrid['getSelectedRecords']()[0];
    switch (args.item.id) {
      case 'add-row':
        this.treeGrid.addRecord(data, this.rowIndex, 'Below'); // add record user can add row top or below using new row position
        break;
      case 'add-child':
        this.treeGrid.addRecord(data, this.rowIndex, 'Child'); // add child row
        break;
      case 'delete-row':
        this.treeGrid.deleteRecord('id', selectedRecord); // delete the selected row
        break;
      case 'edit-row':
        this.treeGrid.startEdit(); // edit the selected row
        break;
      case 'multi-select':
        this.treeGrid.selectionSettings.type = 'Multiple'; // enable multi selection
        break;
      case 'copy-row':
        this.selectedIndex = this.treeGrid['getSelectedRowIndexes']()[0]; // select the records on perform Copy action
        this.selectedRecord = this.treeGrid['getSelectedRecords']()[0];
        break;
      case 'paste-next':
        const index = this.treeGrid['getSelectedRowIndexes']()[0]; // delete the copied record
        const record = this.treeGrid['getSelectedRecords']()[0];
        this.treeGrid.deleteRecord('id', this.selectedRecord);
        // Paste as Sibling or another separate row using Below, Above or Top newRowPosition
        this.treeGrid.addRecord(this.selectedRecord, index, 'Below');
        break;
      case 'paste-child':
        this.treeGrid.deleteRecord('id', this.selectedRecord); // delete the copied record
        const childIndex = this.treeGrid['getSelectedRowIndexes']()[0];
        this.treeGrid.addRecord(this.selectedRecord, childIndex - 1, 'Child'); // paste as Child
        break;
    }
  }
}

