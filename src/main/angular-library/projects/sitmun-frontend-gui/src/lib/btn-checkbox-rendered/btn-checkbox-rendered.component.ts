import { ICellRendererAngularComp } from '@ag-grid-community/angular';
import { Component, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-btn-checkbox-rendered',
  templateUrl: './btn-checkbox-rendered.component.html',
  styleUrls: ['./btn-checkbox-rendered.component.css']
})
export class BtnCheckboxRenderedComponent implements ICellRendererAngularComp, OnDestroy {

  public params: any;

  agInit(params: any): void {
    this.params = params;
  }

  refresh(params: any): boolean {
    return true;
  }

  btnCheckedHandler(event) {
    let checked = event.target.checked;
    let colId = this.params.column.colId;
    this.params.node.setDataValue(colId, checked);
  }

  getParams(){
    return this.params;
  }

  ngOnDestroy() {
    // no need to remove the button click handler 
  }

}
