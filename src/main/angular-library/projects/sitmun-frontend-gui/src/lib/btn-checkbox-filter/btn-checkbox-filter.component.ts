import { Component, ViewChild, ViewContainerRef } from '@angular/core';
import {
  IAfterGuiAttachedParams,
  IDoesFilterPassParams,
  IFilterParams,
  RowNode,
} from '@ag-grid-community/all-modules';

import { IFilterAngularComp } from '@ag-grid-community/angular';

@Component({
  selector: 'app-btn-checkbox-filter',
  templateUrl: './btn-checkbox-filter.component.html',
  styleUrls: ['./btn-checkbox-filter.component.css']
})
export class BtnCheckboxFilterComponent implements IFilterAngularComp  {

  private params: IFilterParams;
  private valueGetter: (rowNode: RowNode) => any;
  public text: string = '';

  @ViewChild('input', { read: ViewContainerRef }) public input;

  agInit(params: IFilterParams): void {
    this.params = params;
    this.valueGetter = params.valueGetter;
  }

  isFilterActive(): boolean {
    return this.text != null && this.text !== '';
  }

  doesFilterPass(params: IDoesFilterPassParams): boolean {
    return this.text
      .toLowerCase()
      .split(' ')
      .every(
        (filterWord) =>
          this.valueGetter(params.node)
            .toString()
            .toLowerCase()
            .indexOf(filterWord) >= 0
      );
  }

  getModel(): any {
    return { value: this.text };
  }

  setModel(model: any): void {
    this.text = model ? model.value : '';
  }

  afterGuiAttached(params: IAfterGuiAttachedParams): void {
    window.setTimeout(() => this.input.element.nativeElement.focus());
  }

  // noinspection JSMethodCanBeStatic
  componentMethod(message: string): void {
    alert(`Alert from PartialMatchFilterComponent: ${message}`);
  }

  onChange(newValue): void {
    if (this.text !== newValue) {
      this.text = newValue;
      this.params.filterChangedCallback();
    }
  }
}
