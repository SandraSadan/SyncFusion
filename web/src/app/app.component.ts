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
  TreeGridComponent,
} from '@syncfusion/ej2-angular-treegrid';
import { get, find, map } from 'lodash';
import { ColumnSettingsDialogComponent } from 'src/modules/dialogs/column-settings-dialog/column-settings-dialog.component';
import { DeleteDialogComponent } from 'src/modules/dialogs/delete-dialog/delete-dialog.component';
import { NotificationService } from 'src/modules/services/notification.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  constructor(
    private notification: NotificationService,
    private socketService: SocketService,
    private dataService: DataService,
    private matDialog: MatDialog
  ) {}

  title: string = 'syncfusion';
  data: TableData[] = [];
  columnList!: ColumnData[];
  isInitialLoad: boolean = true;
  sortSettings!: SortSettingsModel;
  selectionOptions!: SelectionSettingsModel;
  selectedIndex!: number;
  selectedRecord!: Object;
  selectedRowParentId!: number;
  selectedRowId!: number;
  selectedData!: any;
  contextMenuItems = [
    { text: 'Add Next', target: '.e-content', id: 'add-row' },
    { text: 'Add Child', target: '.e-content', id: 'add-child' },
    { text: 'Edit Row', target: '.e-content', id: 'edit-row' },
    { text: 'Delete Row', target: '.e-content', id: 'delete-row' },
    {
      text: 'Multi Select',
      target: '.e-content',
      id: 'multi-select',
      iconCss: 'c-custom',
    },
    { text: 'Copy Rows', target: '.e-content', id: 'copy-row' },
    { text: 'Cut Rows', target: '.e-content', id: 'cut-rows' },
    { text: 'Paste Next', target: '.e-content', id: 'paste-next' },
    { text: 'Paste Child', target: '.e-content', id: 'paste-child' },
    { text: 'New Column', target: '.e-headercontent', id: 'new-col' },
    { text: 'Edit Column', target: '.e-headercontent', id: 'edit-col' },
    { text: 'Delete Column', target: '.e-headercontent', id: 'del-col' },
    { text: 'Choose Column', target: '.e-headercontent', id: 'choose-col' },
    {
      text: 'Freeze Column',
      target: '.e-headercontent',
      id: 'freeze-col',
      iconCss: 'c-custom',
    },
    {
      text: 'Filter Column',
      target: '.e-headercontent',
      id: 'filter-col',
      iconCss: 'c-custom',
    },
    {
      text: 'Multi Sort',
      target: '.e-headercontent',
      id: 'multi-sort',
      iconCss: 'c-custom',
    },
  ];
  editSettings: EditSettingsModel = {
    allowEditing: true,
    allowAdding: true,
    allowDeleting: true,
    allowEditOnDblClick: true,
    newRowPosition: 'Top',
    showConfirmDialog: false,
    showDeleteConfirmDialog: false,
    mode: 'Dialog',
  };
  actionType: string = '';

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
    this.treeGrid.allowSorting = false;
    this.treeGrid.allowSelection = true;
    this.treeGrid.allowFiltering = false;
  }

  initiateSockets(): void {
    this.socketService.columnChanges().subscribe((res: any) => {
      this.data = get(res, 'data', []);
      this.assignColumnData(get(res, 'columns', []));
    });
    this.socketService.rowChanges().subscribe((res: any) => {
      this.data = get(res, 'data', []);
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
        this.assignColumnData(get(res, 'column', []));
      },
    });
  }

  assignColumnData(columns: ColumnData[]): void {
    this.columnList = map(columns, (column) => {
      column['customAttributes'] = {
        style: {
          'background-color': column.backgroundColor,
          'font-size': column.fontSize + 'px',
          color: column.fontColor,
          'min-width': '150px',
          width: column.minimumWidth,
        },
        class: column.textWrap ? 'text-wrap' : 'text-truncate',
      };
      return column;
    });
  }

  contextMenuOpen(args: any): void {
    const parentNode: any[] = [],
      customElement = (
        args as BeforeOpenCloseEventArgs
      ).element.querySelectorAll(
        this.isInitialLoad ? '.c-custom' : '.e-checkbox'
      );
    this.isInitialLoad = false;

    // To append checkbox for elements
    if (customElement.length) {
      customElement.forEach((innerEle: Element) => {
        parentNode.push(innerEle.parentElement);
      });
      parentNode.forEach((ele) => {
        let value = false;
        switch (ele.outerText) {
          case 'Multi Select':
            value = this.treeGrid.allowSelection;
            break;
          case 'Filter Column':
            value = this.treeGrid.allowFiltering;
            break;
          case 'Freeze Column':
            value =
              this.treeGrid.frozenColumns >= args.column.index + 1 &&
              this.treeGrid.frozenColumns > 0;
            break;
          case 'Multi Sort':
            value = this.treeGrid.allowMultiSorting;
            break;
        }
        const text = ele.textContent;
        ele.innerText = '';
        let inputEle: any = createElement('input');
        inputEle.type = 'checkbox';

        inputEle.setAttribute('class', 'e-checkbox');
        value
          ? inputEle.setAttribute('checked', value)
          : inputEle.removeAttribute('checked');
        ele.prepend(inputEle);
        let spanEle = createElement('span');
        spanEle.textContent = text;
        spanEle.setAttribute('class', 'e-checkboxspan');
        ele.appendChild(spanEle);
      });
    }
  }

  changeCheckboxValue(args: any, value: boolean): void {
    if (args.event.target.classList.contains('e-checkboxspan')) {
      const checkbox = args.element.querySelector('.e-checkbox');
      checkbox.checked = value;
    }
  }

  // TODO need to change the arg type 'any' and integrate API functionality
  contextMenuClick(args: any): void {
    this.actionType = args.item.id;

    switch (args.item.id) {
      case 'add-row':
        this.treeGrid.editSettings.newRowPosition = 'Below';
        this.selectedIndex = args.rowInfo.rowData.id;
        this.treeGrid.addRecord();
        break;
      case 'add-child':
        this.treeGrid.editSettings.newRowPosition = 'Child';
        this.selectedIndex = args.rowInfo.rowData.id;
        this.treeGrid.addRecord();
        break;
      case 'delete-row':
        this.dataService.deleteRow(args.rowInfo.rowData).subscribe({
          next: (res) => {
            this.notification.openSuccessSnackBar('Row deleted successfully');
          },
        });
        break;
      case 'edit-row':
        this.treeGrid.startEdit(); // edit the selected row
        break;
      case 'multi-select':
        this.treeGrid.allowSelection = !this.treeGrid.allowSelection;
        this.changeCheckboxValue(args, this.treeGrid.allowSelection);
        break;
      case 'copy-row':
        this.selectedIndex = this.treeGrid['getSelectedRowIndexes']()[0]; // select the records on perform Copy action
        this.selectedRecord = this.treeGrid['getSelectedRecords']()[0];
        this.selectedData = this.treeGrid.getSelectedRecords();
        break;
      case 'paste-next':
        this.selectedRowParentId = 0;
        this.selectedRowId = args.rowInfo.rowData.id + 1;
        const index = this.treeGrid['getSelectedRowIndexes']()[0]; // delete the copied record
        this.treeGrid.deleteRecord('id', this.selectedRecord);
        // Paste as Sibling or another separate row using Below, Above or Top newRowPosition
        // this.treeGrid.addRecord(this.selectedRecord, index, 'Below');
        break;
      case 'paste-child':
        this.selectedRowParentId = args.rowInfo.rowData.parentUniqueId;
        this.selectedRowId = args.rowInfo.rowData.id + 1;
        this.treeGrid.deleteRecord('id', this.selectedRecord); // delete the copied record
        const childIndex = this.treeGrid['getSelectedRowIndexes']()[0];
        // this.treeGrid.addRecord(this.selectedRecord, childIndex - 1, 'Child'); // paste as Child
        break;
      case 'new-col':
        const dialogReference = this.matDialog.open(
          ColumnSettingsDialogComponent,
          {
            width: '400px',
            height: 'auto',
            disableClose: true,
          }
        );
        dialogReference.componentInstance.actionPerformed = 'add';
        break;
      case 'edit-col':
        const dialogRef = this.matDialog.open(ColumnSettingsDialogComponent, {
          width: '400px',
          height: 'auto',
          disableClose: true,
        });
        dialogRef.componentInstance.actionPerformed = 'edit';
        dialogRef.componentInstance.columnDetails = find(this.columnList, {
          fieldName: get(args, 'column.field'),
        }) as ColumnData;
        break;
      case 'del-col':
        const deleteDialog = this.matDialog.open(DeleteDialogComponent, {
          width: '400px',
          height: 'auto',
          disableClose: true,
        });
        deleteDialog.componentInstance.column = find(this.columnList, {
          fieldName: get(args, 'column.field'),
        }) as ColumnData;
        break;
      case 'choose-col':
        this.treeGrid.openColumnChooser();
        break;
      case 'filter-col':
        this.treeGrid.allowFiltering = !this.treeGrid.allowFiltering;
        // this.treeGrid.filterSettings.type = 'Menu';
        this.changeCheckboxValue(args, this.treeGrid.allowFiltering);
        break;
      case 'freeze-col':
        this.isInitialLoad = true;
        if (
          this.treeGrid.frozenColumns == 0 ||
          (args.column.dirIndex == 0 && this.treeGrid.frozenColumns == 1)
        ) {
          this.treeGrid.enableVirtualization =
            !this.treeGrid.enableVirtualization;
          this.treeGrid.enableInfiniteScrolling =
            !this.treeGrid.enableInfiniteScrolling;
          this.treeGrid.frozenColumns = this.treeGrid.enableInfiniteScrolling
            ? args.column.dirIndex + 1
            : 0;
        } else if (this.treeGrid.frozenColumns == args.column.dirIndex + 1) {
          this.treeGrid.frozenColumns = this.treeGrid.frozenColumns - 1;
        } else if (this.treeGrid.frozenColumns < args.column.dirIndex + 1) {
          this.treeGrid.frozenColumns = args.column.dirIndex + 1;
        } else {
          this.notification.openWarningSnackBar('Action is not allowed');
        }
        break;
      case 'multi-sort':
        this.treeGrid.allowSorting = !this.treeGrid.allowSorting;
        this.treeGrid.allowMultiSorting = !this.treeGrid.allowMultiSorting;
        this.changeCheckboxValue(args, this.treeGrid.allowMultiSorting);
        break;
    }
  }

  actionComplete(args: TreeGridComponent['actionComplete']): void {
    if (args.requestType === 'save') {
      if (args.action === 'add') {
        args.data.id = this.selectedIndex + 1;
        args.data.parentId =
          this.actionType === 'add-row' ? 0 : this.selectedIndex;
        this.dataService.addRow(args.data).subscribe({
          next: (res) => {
            this.notification.openSuccessSnackBar('Row added successfully');
          },
        });
      }
      if (args.action === 'edit') {
        this.dataService.editRow(args.data.id, args.data).subscribe({
          next: (res) => {
            this.notification.openSuccessSnackBar('Row edited successfully');
          },
        });
      }
    }
    if (args.requestType === 'delete') {
      this.dataService
        .pasteRow({
          id: this.selectedRowId,
          parentId: this.selectedRowParentId,
          rowData: this.selectedData,
        })
        .subscribe({
          next: (res) => {
            this.notification.openSuccessSnackBar('Row updated successfully');
          },
        });
    }
  }
}
