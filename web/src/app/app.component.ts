import { Component } from '@angular/core';
import { TableData } from 'src/modules/utils/interfaces';

import { createElement } from '@syncfusion/ej2-base';
import { BeforeOpenCloseEventArgs } from '@syncfusion/ej2-inputs';
import { EditSettingsModel, SortSettingsModel } from '@syncfusion/ej2-angular-treegrid';
import { SocketService } from 'src/modules/services/socket.service';
import { DataService } from 'src/modules/services/data.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(
    private socketService: SocketService,
    private dataService: DataService,
  ) {}

  title: string = 'syncfusion';
  data: TableData[] = []; // Need to change the type from any when actual data is rendered
  isInitialLoad: boolean = true;
  sortSettings!: SortSettingsModel;
  contextMenuItems = [
    { text: "Add Next", target: ".e-content", id: "add-text" },
    { text: "Add Child", target: ".e-content", id: "add-child" },
    { text: "Delete Row", target: ".e-content", id: "delete-row" },
    { text: "Edit Row", target: ".e-content", id: "edit row" },
    { text: "Multi Select", target: ".e-content", id: "multi-select", iconCss: 'c-custom' },
    { text: "Copy Rows", target: ".e-content", id: "copy-rows" },
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
    allowEditOnDblClick: true
  };

  ngOnInit(): void {
    this.getList();
    this.assignSubtasks();
    this.socketService.rowAdded().subscribe((data: string) => {
      console.log(data);
    });
  }

  assignSubtasks(): void {
    // this.data.forEach((value, index: number) => {
    //   value['ID'] = index;
    // });
    // // To assign subtasks
    // this.data.forEach((value, index: number) => {
    //   if (value['ID'] % 5 === 0) {
    //     value['subtasks'] = this.data.splice(index+1, 4);
    //   }
    // });
  }

  getList(): void {
    this.dataService.getAllLists().subscribe({
      next: (res) => {
        this.data = res;
      },
    });
  }

  contextMenuOpen(args?: BeforeOpenCloseEventArgs): void {
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

  contextMenuClick(args: any): void {
    if (args.event.target.classList.contains('e-checkboxspan')) {
      const checkbox = args.element.querySelector('.e-checkbox');
      checkbox.checked = !checkbox.checked;
    }
  }
}

