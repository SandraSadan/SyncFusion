import { Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { createElement } from '@syncfusion/ej2-base';
import { BeforeOpenCloseEventArgs } from '@syncfusion/ej2-inputs';

import { SocketService } from 'src/modules/services/socket.service';
import { DataService } from 'src/modules/services/data.service';
import { TableData, ColumnData } from 'src/modules/utils/interfaces';

import {
  EditSettingsModel,
  SortSettingsModel,
  SelectionSettingsModel,
  TreeGridComponent
} from '@syncfusion/ej2-angular-treegrid';
import { get, find } from 'lodash';
import { ColumnSettingsDialogComponent } from 'src/modules/dialogs/column-settings-dialog/column-settings-dialog.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor(
    private socketService: SocketService,
    private dataService: DataService,
    private matDialog: MatDialog
  ) { }

  title: string = 'syncfusion';
  data: TableData[] = [];
  columnList!: ColumnData[];
  isInitialLoad: boolean = true;
  sortSettings!: SortSettingsModel;
  selectionOptions!: SelectionSettingsModel;
  selectedIndex!: number;
  selectedRecord!: Object;
  contextMenuItems = [
    { text: "Add Next", target: ".e-content", id: "add-row" },
    { text: "Add Child", target: ".e-content", id: "add-child" },
    { text: "Edit Row", target: ".e-content", id: "edit-row" },
    { text: "Delete Row", target: ".e-content", id: "delete-row" },
    { text: "Multi Select", target: ".e-content", id: "multi-select", iconCss: 'c-custom' },
    { text: "Copy Rows", target: ".e-content", id: "copy-row" },
    { text: "Cut Rows", target: ".e-content", id: "cut-rows" },
    { text: "Paste Next", target: ".e-content", id: "paste-next" },
    { text: "Paste Child", target: ".e-content", id: "paste-child" },
    { text: 'Edit Column', target: '.e-headercontent', id: 'edit-col' },
    { text: 'New Column', target: '.e-headercontent', id: 'new-col' },
    { text: 'Delete Column', target: '.e-headercontent', id: 'del-col' },
    { text: 'Choose Column', target: '.e-headercontent', id: 'choose-col' },
    { text: 'Freeze Column', target: '.e-headercontent', id: 'freeze-col', iconCss: 'c-custom' },
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
    this.initiateSockets();
  }

  ngAfterViewInit() {
    this.treeGrid.contextMenuItems = this.contextMenuItems;
    this.treeGrid.sortSettings = this.sortSettings;
    this.treeGrid.editSettings = this.editSettings;
    this.treeGrid.selectionSettings = this.selectionOptions;
    this.treeGrid.allowMultiSorting = false;
    this.treeGrid.allowFiltering = false;
  }

  initiateSockets(): void {
    this.socketService.columnChanges().subscribe((res: any) => {
      this.data = get(res, 'data', []);
      this.columnList = get(res, 'columns', []);
    });
  }

  getList(): void {
    this.dataService.getAllLists().subscribe({
      next: (res) => {
        this.data = get(res, 'data', []);
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
    switch (args.item.id) {
      case 'add-row':
        this.treeGrid.addRecord(data, args.rowInfo.rowIndex, 'Below'); // add record user can add row top or below using new row position
        break;
      case 'add-child':
        this.treeGrid.addRecord(data, args.rowInfo.rowIndex, 'Child'); // add child row
        break;
      case 'delete-row':
        this.treeGrid.deleteRecord(); // delete the selected row
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
        this.treeGrid.deleteRecord('id', this.selectedRecord);
        // Paste as Sibling or another separate row using Below, Above or Top newRowPosition
        this.treeGrid.addRecord(this.selectedRecord, index, 'Below');
        break;
      case 'paste-child':
        this.treeGrid.deleteRecord('id', this.selectedRecord); // delete the copied record
        const childIndex = this.treeGrid['getSelectedRowIndexes']()[0];
        this.treeGrid.addRecord(this.selectedRecord, childIndex - 1, 'Child'); // paste as Child
        break;
      case 'new-col':
        const dialogReference = this.matDialog.open(ColumnSettingsDialogComponent, {
          width: '400px',
          height: 'auto',
          disableClose: true,
        });
        dialogReference.componentInstance.actionPerformed = 'add';
        break;
      case 'edit-col':
        const dialogRef = this.matDialog.open(ColumnSettingsDialogComponent, {
          width: '400px',
          height: 'auto',
          disableClose: true,
        });
        dialogRef.componentInstance.actionPerformed = 'edit';
        dialogRef.componentInstance.columnDetails = find(this.columnList, { fieldName: get(args, 'column.field') }) as ColumnData;
        break;
      case 'choose-col':
        this.treeGrid.openColumnChooser();
        break;
      case 'filter-col':
        this.treeGrid.allowFiltering = !this.treeGrid.allowFiltering;
        break;
      case 'freeze-col':
        // Need to modify
        this.treeGrid.frozenColumns = args.column.dirIndex;
        break;
      case 'multi-sort':
        this.treeGrid.allowMultiSorting = !this.treeGrid.allowMultiSorting;
        break;
    }
  }
}
