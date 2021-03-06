import { Component, OnInit, ViewChild } from '@angular/core';
import {
  DxTreeViewModule,
  DxTreeViewComponent,
  DxSortableModule,
} from 'devextreme-angular';
import DataSource from 'devextreme/data/data_source';
import { Service, FileSystemItem, UploadViewModel } from './app.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  selectedData: any;

  title = 'FileManagerFront';
  actionTarget: any;
  itemsDriveC: FileSystemItem[] = [];
  items: any;
  model: FileSystemItem;
  uploadModel: UploadViewModel = new UploadViewModel();
  form = new FormData();
  itemsDriveD: FileSystemItem[];
  ds: DataSource;
  popup: boolean;
  showUploadPopup: boolean = false;
  @ViewChild('treeviewDriveC') treeviewDriveC: DxTreeViewComponent;

  @ViewChild('treeviewDriveD') treeviewDriveD: DxTreeViewComponent;
  constructor(private service: Service) {
    this.items = [
      // {
      //   text: 'Share',
      //   items: [{ text: 'Facebook' }, { text: 'Twitter' }],
      // },
      { text: 'Create', id: 1 },
      { text: 'Edit', id: 2 },
      { text: 'Delete', id: 3 },
    ];

    // let x = this.service.getFileManager();
    // this.itemsDriveD = this.service.getItemsDriveD();
  }

  async ngOnInit() {
    this.itemsDriveC = await this.service.getFileManager().toPromise();
  }

  async add() {
    this.model.expanded = true;
    this.model.icon = 'folder';
    this.model.isDirectory = true;
    if (this.selectedData) {
      this.model.parentId = await this.selectedData.id;
    } else {
      this.model.parentId = null;
    }

    this.model.createdDate = new Date();
    await this.service.createFolder(this.model).toPromise();
    this.selectedData = null;
    this.popup = false;
    this.model = null;
    this.ngOnInit();
  }

  async delete(id: number) {
    await this.service.deleteFolder(id).toPromise();
    this.ngOnInit();
  }

  onDragChange(e: any) {
    if (e.fromComponent === e.toComponent) {
      const fromNode = this.findNode(this.getTreeView(e.fromData), e.fromIndex);
      const toNode = this.findNode(
        this.getTreeView(e.toData),
        this.calculateToIndex(e)
      );
      if (toNode !== null && this.isChildNode(fromNode, toNode)) {
        e.cancel = true;
      }
    }
  }

  onDragEnd(e) {
    if (e.fromComponent === e.toComponent && e.fromIndex === e.toIndex) {
      return;
    }

    const fromTreeView = this.getTreeView(e.fromData);
    const toTreeView = this.getTreeView(e.toData);

    const fromNode = this.findNode(fromTreeView, e.fromIndex);
    const toNode = this.findNode(toTreeView, this.calculateToIndex(e));

    if (e.dropInsideItem && toNode !== null && !toNode.itemData.isDirectory) {
      return;
    }

    const fromTopVisibleNode = this.getTopVisibleNode(e.fromComponent);
    const toTopVisibleNode = this.getTopVisibleNode(e.toComponent);

    const fromItems = fromTreeView.option('items');
    const toItems = toTreeView.option('items');
    this.moveNode(fromNode, toNode, fromItems, toItems, e.dropInsideItem);

    fromTreeView.option('items', fromItems);
    toTreeView.option('items', toItems);
    fromTreeView.scrollToItem(fromTopVisibleNode);
    toTreeView.scrollToItem(toTopVisibleNode);
  }

  getTreeView(driveName) {
    return driveName === 'driveC'
      ? this.treeviewDriveC.instance
      : this.treeviewDriveD.instance;
  }

  calculateToIndex(e: any) {
    if (e.fromComponent != e.toComponent || e.dropInsideItem) {
      return e.toIndex;
    }

    return e.fromIndex >= e.toIndex ? e.toIndex : e.toIndex + 1;
  }
  findNode(treeView, index) {
    const nodeElement = treeView
      .element()
      .querySelectorAll('.dx-treeview-node')[index];
    if (nodeElement) {
      return this.findNodeById(
        treeView.getNodes(),
        nodeElement.getAttribute('data-item-id')
      );
    }
    return null;
  }
  findNodeById(nodes, id) {
    for (let i = 0; i < nodes.length; i++) {
      if (nodes[i].itemData.id == id) {
        return nodes[i];
      }
      if (nodes[i].children) {
        const node = this.findNodeById(nodes[i].children, id);
        if (node != null) {
          return node;
        }
      }
    }
    return null;
  }

  moveNode(fromNode, toNode, fromItems, toItems, isDropInsideItem) {
    const fromIndex = fromItems.findIndex(
      (item) => item.id == fromNode.itemData.id
    );
    fromItems.splice(fromIndex, 1);

    const toIndex =
      toNode === null || isDropInsideItem
        ? toItems.length
        : toItems.findIndex((item) => item.id == toNode.itemData.id);
    toItems.splice(toIndex, 0, fromNode.itemData);

    this.moveChildren(fromNode, fromItems, toItems);
    if (isDropInsideItem) {
      fromNode.itemData.parentId = toNode.itemData.id;
    } else {
      fromNode.itemData.parentId =
        toNode != null ? toNode.itemData.parentId : undefined;
    }
  }
  moveChildren(node, fromDataSource, toDataSource) {
    if (!node.itemData.isDirectory) {
      return;
    }

    node.children.forEach((child) => {
      if (child.itemData.isDirectory) {
        this.moveChildren(child, fromDataSource, toDataSource);
      }

      const fromIndex = fromDataSource.findIndex(
        (item) => item.id == child.itemData.id
      );
      fromDataSource.splice(fromIndex, 1);
      toDataSource.splice(toDataSource.length, 0, child.itemData);
    });
  }
  isChildNode(parentNode, childNode) {
    let parent = childNode.parent;
    while (parent !== null) {
      if (parent.itemData.id === parentNode.itemData.id) {
        return true;
      }
      parent = parent.parent;
    }
    return false;
  }
  getTopVisibleNode(component) {
    const treeViewElement = component.element();
    const treeViewTopPosition = treeViewElement.getBoundingClientRect().top;
    const nodes = treeViewElement.querySelectorAll('.dx-treeview-node');
    for (let i = 0; i < nodes.length; i++) {
      const nodeTopPosition = nodes[i].getBoundingClientRect().top;
      if (nodeTopPosition >= treeViewTopPosition) {
        return nodes[i];
      }
    }

    return null;
  }
  async itemClickk(e) {
    this.selectedData = await e.itemData;
  }

  itemClick(e: any) {
    if (e.itemData.id == 1) {
      console.log(this.selectedData, 'Yeni');
      //  this.model.parentId = this.popup = true;

      this.model = new FileSystemItem();
    }
    if (e.itemData.id == 2) {
      console.log(this.selectedData, 'Edit');
      this.model = this.selectedData;
      //  this.service.getById();
    }
    if (e.itemData.id == 3) {
      console.log(this.selectedData, 'Del');
      this.delete(this.selectedData.id);
    }
  }

  async selectItem(e: any) {
    console.log(e.itemData, 'ee');
    this.selectedData = await e.itemData;
    this.ds = await this.service.getFiles(e.itemData.id).toPromise();
  }
  addFile() {
    this.showUploadPopup = true;
  }

  async uploadFile() {
    await this.populateForm(this.uploadModel, this.form);
    this.uploadModel.id = await this.selectedData.id;
    await this.service.uploadFile(this.form);
    this.showUploadPopup = false;
    this.selectedData = null;
    this.ngOnInit();
  }

  async populateForm(model: any, form: FormData) {
    for (let key in model) {
      let val = model[key];
      form.delete(key);

      if (val instanceof Date) {
        form.append(key, val.toISOString());
      } else {
        form.append(key, val);
      }
    }
  }

  onFileChange(event: any) {
    let file = event.value[0];
    this.form.delete('File');
    this.form.append('File', file);
    this.uploadModel.id = this.selectedData.id;
  }
}
