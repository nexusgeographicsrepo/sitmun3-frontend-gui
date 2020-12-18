import { AgGridModule } from '@ag-grid-community/angular';
import { Component, OnInit, NgModule, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AllCommunityModules, ColumnApi, Module } from '@ag-grid-community/all-modules';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'app-data-grid',
  templateUrl: './data-grid.component.html',
  styleUrls: ['./data-grid.component.css']
})
export class DataGridComponent implements OnInit {
 
  private _eventRefreshSubscription: any;
  private _eventGetSelectedRowsSubscription: any;
  modules: Module[] = AllCommunityModules;
  searchValue: string;
  private gridApi;
  private gridColumnApi;
  statusColumn = false;
  changesMap: Map<number, Map<string, number>> = new Map<number, Map<string, number>>();
   // We will save the id of edited cells and the number of editions done.
  private params; // Last parameters of the grid (in case we do apply changes we will need it) 
  rowData: any[];
  changeCounter: number; // Number of editions done above any cell 
  previousChangeCounter: number; // Number of ditions done after the last modification(changeCounter)
  redoCounter: number; // Number of redo we can do
  modificationChange = false;
  undoNoChanges = false; // Boolean that indicates if an undo hasn't modifications
  gridOptions;

  @Input() eventRefreshSubscription: Observable <boolean> ;
  @Input() eventGetSelectedRowsSubscription: Observable <boolean> ;
  @Input() frameworkComponents: any;
  @Input() columnDefs: any[];
  @Input() getAll: () => Observable<any>;
  @Input() discardChangesButton: boolean;
  @Input() undoButton: boolean;
  @Input() redoButton: boolean;
  @Input() applyChangesButton: boolean;
  @Input() deleteButton: boolean;
  @Input() newButton: boolean;
  @Input() actionButton: boolean;
  @Input() addButton: boolean;
  @Input() globalSearch: boolean;
  @Input() themeGrid: any;
  @Input() singleSelection: boolean;
  @Input() title: string;


  @Output() remove: EventEmitter<any[]>;
  @Output() new: EventEmitter<number>;
  @Output() sendChanges: EventEmitter<any[]>;
  @Output() getSelectedRows: EventEmitter<any[]>;


  constructor(public translate: TranslateService) {
    this.translate = translate;

    this.remove = new EventEmitter();
    this.new = new EventEmitter();
    this.sendChanges = new EventEmitter();
    this.getSelectedRows = new EventEmitter();
    this.changeCounter = 0;
    this.previousChangeCounter = 0;
    this.redoCounter = 0;
    this.gridOptions = {
      defaultColDef: {
        sortable: true,
        flex: 1,
        filter: true,
        editable: true,
        cellStyle: {backgroundColor: '#FFFFFF'},
      },
      columnTypes: {
        dateColumn: {
            filter: 'agDateColumnFilter',
            filterParams: {
              comparator(filterLocalDateAtMidnight, cellValue) {
                const dateCellValue = new Date(cellValue);
                const dateFilter = new Date(filterLocalDateAtMidnight);

                if (dateCellValue.getTime() < dateFilter.getTime()) {
                  return -1;
                } else if (dateCellValue.getTime()  > dateFilter.getTime()) {
                  return 1;
                } else {
                  return 0;
                }
              },
            },
            suppressMenu: true
        }
    },
      rowSelection: 'multiple',
      singleClickEdit: true,
      // suppressHorizontalScroll: true,
      localeTextFunc: (key: string, defaultValue: string) => {
        const data = this.translate.instant(key);
        return data === key ? defaultValue : data;
    }
    };

  }


  ngOnInit(){

    if (this.eventRefreshSubscription) {
      this._eventRefreshSubscription = this.eventRefreshSubscription.subscribe(() => {
        this.getElements();
      });
    }
    if (this.eventGetSelectedRowsSubscription) {
      this._eventGetSelectedRowsSubscription = this.eventGetSelectedRowsSubscription.subscribe(() => {
        this.emitSelectedRows();
      });
    }


  }



  onGridReady(params): void{
    if (this.singleSelection) {this.gridOptions.rowSelection = 'single'}
    this.params = params;
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    this.getElements();
    this.gridApi.sizeColumnsToFit();
    for (const col of this.columnDefs) {
      if (col.field === 'estat') {
        this.statusColumn = true;
      }
    }
  }

  
  emitSelectedRows(): void{
    const selectedNodes = this.gridApi.getSelectedNodes();
    const selectedData = selectedNodes.map(node => node.data);
    this.getSelectedRows.emit(selectedData);
  }

  getColumnKeysAndHeaders(columnkeys: Array<any>): String{    
    let header:Array<any> = [];
    if (this.columnDefs.length == 0) {return ''};

    let allColumnKeys=this.gridOptions.columnApi.getAllDisplayedColumns();
    console.log(allColumnKeys);
    allColumnKeys.forEach(element => {
        if (element.userProvidedColDef.headerName !== '')
        {
          columnkeys.push(element.userProvidedColDef.field);
          header.push(element.userProvidedColDef.headerName);
        }
  
      
    });
    
    return header.join(",");
  }


  exportData(): void{
    let columnkeys:Array<any> = [];
    let customHeader:String = '';
    customHeader = this.getColumnKeysAndHeaders(columnkeys)
    console.log(this.gridApi);
    let params = {
        onlySelected: true,
        columnKeys: columnkeys,
        customHeader: customHeader,
        skipHeader: true
    };
    this.gridApi.exportDataAsCsv(params);
  }

  quickSearch(): void{
    this.gridApi.setQuickFilter(this.searchValue);
}

  getElements(): void
  {
    this.getAll()
    .subscribe((items) => {
        this.rowData = items;
        setTimeout(()=>{this.gridApi.sizeColumnsToFit()}, 30);
        this.gridApi.setRowData(this.rowData);
        console.log(this.rowData);
    });
  }

  removeData(): void {
    this.gridApi.stopEditing(false);
    const selectedNodes = this.gridApi.getSelectedNodes();
    const selectedData = selectedNodes.map(node => node.data);
    this.remove.emit(selectedData);

    if(this.statusColumn)
    {
      const selectedRows = selectedNodes.map(node => node.rowIndex);

      for (const id of selectedRows){
          this.gridApi.getRowNode(id).data.estat ='Eliminat';
        }
      this.gridOptions.api.refreshCells();
    }
    this.gridOptions.api.deselectAll();
  }

  newData(): void
  {
    this.gridApi.stopEditing(false);
    this.new.emit(-1);
  }


  applyChanges(): void
  {
    const itemsChanged: any[] = [];
    this.gridApi.stopEditing(false);
    for (const key of this.changesMap.keys())
    {
      itemsChanged.push(this.gridApi.getRowNode(key).data);
    }
    this.sendChanges.emit(itemsChanged);
    this.changesMap.clear();
    this.changeCounter = 0;
    this.previousChangeCounter = 0;
    this.redoCounter = 0;
    this.params.colDef.cellStyle =  {backgroundColor: '#FFFFFF'};
    this.gridApi.redrawRows();
  }



  deleteChanges(): void
  {
    for (let i = 0; i < this.changeCounter; i++)
    {
      this.gridApi.undoCellEditing();
    }
    this.changesMap.clear();
    this.previousChangeCounter = 0;
    this.changeCounter = 0;
    this.redoCounter = 0;
    this.params.colDef.cellStyle =  {backgroundColor: '#FFFFFF'};
    this.gridApi.redrawRows();
  }


  onFilterModified(): void{
    this.deleteChanges();
  }


  undo(): void {
    this.gridApi.stopEditing(false);
    this.gridApi.undoCellEditing();
    this.changeCounter -= 1;
    this.redoCounter += 1;
  }

  redo(): void {
    this.gridApi.stopEditing(false);
    this.gridApi.redoCellEditing();
    this.changeCounter += 1;
    this.redoCounter -= 1;
  }


  onCellEditingStopped(e)
  {
      if (this.modificationChange)
      {
        this.changeCounter++;
        this.redoCounter = 0;
        this.onCellValueChanged(e);
        this.modificationChange = false;
      }
  }


  onCellValueChanged(params): void{

    this.params = params; 
    if (this.changeCounter > this.previousChangeCounter)
      // True if we have edited some cell or we have done a redo 
      {

        if (params.oldValue !== params.value && !(params.oldValue == null && params.value === ''))
        {
          
          if (! this.changesMap.has(params.node.id)) // If it's firts edit of a cell, we add it to the map and we paint it
          {
            const addMap: Map<string, number> = new Map<string, number>();
            addMap.set(params.colDef.field, 1)
            this.changesMap.set(params.node.id, addMap);
          }
          else{
            if (! this.changesMap.get(params.node.id).has(params.colDef.field))
            {

              this.changesMap.get(params.node.id).set(params.colDef.field, 1);
            }

            else{
              // We already had edited this cell, so we only increment number of changes of it on the map 
             const currentChanges = this.changesMap.get(params.node.id).get(params.colDef.field);
             this.changesMap.get(params.node.id).set(params.colDef.field, (currentChanges + 1));
           }

          }
          this.paintCells(params, this.changesMap); //We paint the row of the edited cell 
          this.previousChangeCounter++; //We match the current previousChangeCounter with changeCounter
        }

      }
    else if (this.changeCounter < this.previousChangeCounter){ // True if we have done an undo
        let currentChanges = -1;
        if (this.changesMap.has(params.node.id)) {currentChanges = this.changesMap.get(params.node.id).get(params.colDef.field);}
        
        if (currentChanges === 1) { //Once the undo it's done, cell is in his initial status

          this.changesMap.get(params.node.id).delete(params.colDef.field);
          if(this.changesMap.get(params.node.id).size === 0) { // No more modifications in this row
            this.changesMap.delete(params.node.id);
            const row = this.gridApi.getDisplayedRowAtIndex(params.rowIndex);

            // We paint it white
            this.gridApi.redrawRows({rowNodes: [row]});

           }
           else
           {
              this.paintCells(params, this.changesMap);
           }

        }
        else if (currentChanges >1) // The cell isn't in his initial state yet
        {                                 //We can't do else because we can be doing an undo without changes 
          this.changesMap.get(params.node.id).set(params.colDef.field, (currentChanges - 1));

          this.paintCells(params, this.changesMap);//Not initial state -> green background

        }
        this.previousChangeCounter--;  //We decrement previousChangeCounter because we have done undo
    }
    else{ // Control of modifications without changes
      if(params.oldValue !== params.value && !(params.oldValue == null && params.value === '') ) //Isn't a modification without changes
      {
        this.modificationChange = true;
      }
      else{ 
        if ( this.changesMap.has(params.node.id)) //Modification without changes in en edited cell
        {
          if(!this.undoNoChanges)
          {
            this.gridApi.undoCellEditing(); // Undo to delete the change without changes internally 
            this.undoNoChanges = true;
            this.paintCells(params, this.changesMap);  //The cell has modifications yet -> green background 
          }
          else { this.undoNoChanges = false; }


        }
        else {
          //With the internally undo will enter at this function, so we have to control when done the undo or not 
          if(!this.undoNoChanges)
          {
            this.gridApi.undoCellEditing(); // Undo to delete the change internally
            this.undoNoChanges = true;
          }
          else { this.undoNoChanges = false; }
        }

      }

    }
  }

  getColumnIndexByColId(api: ColumnApi, colId: string): number {
    return api.getAllColumns().findIndex(col => col.getColId() === colId);
  }
  paintCells(params: any,  changesMap: Map<number, Map<string, number>>, )
  {
    const row = this.gridApi.getDisplayedRowAtIndex(params.rowIndex);

    this.changeCellStyleColumns(params,changesMap,'#E8F1DE');
    this.gridApi.redrawRows({rowNodes: [row]});
    this.changeCellStyleColumns(params,changesMap,'#FFFFFF'); 
    // We will define cellStyle white to future modifications (like filter)
  }

  changeCellStyleColumns(params: any, changesMap: Map<number, Map<string, number>>, color: string){

    for (const key of changesMap.get(params.node.id).keys())
    {
      const columnNumber = this.getColumnIndexByColId(this.gridColumnApi, key);
      this.gridColumnApi.columnController.gridColumns[columnNumber].colDef.cellStyle = {backgroundColor: color};
    }


  }

}
