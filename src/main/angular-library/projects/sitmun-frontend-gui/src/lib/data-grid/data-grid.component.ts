import { AgGridModule } from '@ag-grid-community/angular';
import { Component, OnInit, NgModule, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AllCommunityModules, ColumnApi, Module } from '@ag-grid-community/all-modules';

@Component({
  selector: 'app-data-grid',
  templateUrl: './data-grid.component.html',
  styleUrls: ['./data-grid.component.css']
})
export class DataGridComponent {
 

  modules: Module[] = AllCommunityModules;
  searchValue: string;
  private gridApi;
  private gridColumnApi;
  statusColumn = false;
  changesMap: Map<number, Map<string, number>> = new Map<number, Map<string, number>>();
   // Guardaremos id de las celas modificadas i el nº de ediciones hechas sobre estas
  private params; // Parametros del grid en la ultima modificacion hecha (por si hacemos apply changes)
  rowData: any[];
  changeCounter: number; // Numero de ediciones hechas sobre las celas
  previousChangeCounter: number; //  Numero de ediciones que habia antes de hacer la ultima modificacion (changeCounter)
  redoCounter: number; // Numero de redo que podemos hacer
  modificationChange = false;
  undoNoChanges = false; // Booleano para saber si es un undo provocado por un cambio sin modificaciones
  gridOptions;
  @Input() frameworkComponents: any;
  @Input() columnDefs: any[];
  @Input() getAll: () => Observable<any>;
  @Input() discardChangesButton: boolean;
  @Input() undoButton: boolean;
  @Input() redoButton: boolean;
  @Input() applyChangesButton: boolean;
  @Input() deleteButton: boolean;
  @Input() newButton: boolean;
  @Input() globalSearch: boolean;
  @Input() themeGrid: any;


  @Output() remove: EventEmitter<any[]>;
  @Output() new: EventEmitter<number>;
  @Output() sendChanges: EventEmitter<any[]>;


  constructor() {

    this.remove = new EventEmitter();
    this.new = new EventEmitter();
    this.sendChanges = new EventEmitter();
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

    };

  }



  onGridReady(params): void{
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

  getColumnKeysToExport(): any[]{    
    let columnkeysToExport:Array<any> = [];
    if (this.columnDefs.length == 0) {return columnkeysToExport};

    let allColumnKeys=this.gridOptions.columnApi.getAllDisplayedColumns();
    console.log(allColumnKeys);
    // return columnkeysToExport;
    allColumnKeys.forEach(element => {
        if (element.userProvidedColDef.headerName !== '')
        {
          columnkeysToExport.push(element.userProvidedColDef.field);
        }
  
      
    });
    return columnkeysToExport
  }

  getCustomHeader(): string{    
    let header:Array<any> = [];
    if (this.columnDefs.length == 0) {return ''};

    let allColumnHeaders=this.gridOptions.columnApi.getAllDisplayedColumns();
    console.log(allColumnHeaders);
    // return columnkeysToExport;
    allColumnHeaders.forEach(element => {
        if (element.userProvidedColDef.headerName !== '')
        {
          header.push(element.userProvidedColDef.headerName);
        }
    });
    console.log(header);

    return header.join(",");
  }

  exportData(): void{
    let columnkeys:Array<any> = [];
    let customHeader:String = '';
    columnkeys = this.getColumnKeysToExport()
    customHeader= this.getCustomHeader();
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
        console.log(items);
        this.rowData = items;
        setTimeout(()=>{this.gridApi.sizeColumnsToFit()}, 30);
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

    this.params = params; // Guardaremos los parametros por si hay que hacer un apply changes
    if (this.changeCounter > this.previousChangeCounter)
      // Esta condición será cierta si venimos de editar la cela o de hacer un redo
      {

        if (params.oldValue !== params.value && !(params.oldValue == null && params.value === ''))
        {
          
          if (! this.changesMap.has(params.node.id)) // Si no habiamos editado la cela con anterioridad, la añadimos al map y la pintamos de verde
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
              // Si ya habíamos modificado la cela, aumentamos el numero de cambios en esta
             const currentChanges = this.changesMap.get(params.node.id).get(params.colDef.field);
             this.changesMap.get(params.node.id).set(params.colDef.field, (currentChanges + 1));
           }

          }
          this.paintCells(params, this.changesMap); // Com ha estado modificada la linia, la pintamos de verde
          this.previousChangeCounter++; //Igualamos el contador de cambios anterior al actual
        }

      }
    else if (this.changeCounter < this.previousChangeCounter){ // Entrará aquí si hemos hecho un undo
        let currentChanges = -1;
        if (this.changesMap.has(params.node.id)) {currentChanges = this.changesMap.get(params.node.id).get(params.colDef.field);}
        
        if (currentChanges === 1) { //Al deshacer el cambio, la dejaremos en su estado inicial

          this.changesMap.get(params.node.id).delete(params.colDef.field);
          if(this.changesMap.get(params.node.id).size === 0) { // No hay mas modificaciones en eta fila
            this.changesMap.delete(params.node.id);
            const row = this.gridApi.getDisplayedRowAtIndex(params.rowIndex);

            // Si solo tiene una modificacion, quiere decir que la cela está en su estado inicial, por lo que la pintamos de blanco
            this.gridApi.redrawRows({rowNodes: [row]});

           }
           else
           {
              this.paintCells(params, this.changesMap);
           }

        }
        else if (currentChanges >1) // La cela aún no está en su estado inicial, por lo que segguirá verde
        {                                 // No podemos hacer else por si hacemos un undo de una cela sin cambios
          this.changesMap.get(params.node.id).set(params.colDef.field, (currentChanges - 1));

          this.paintCells(params, this.changesMap);// Como aun tiene cambios, el background tiene que seguir verde

        }
        this.previousChangeCounter--;  // Com veniem d'undo, hem de decrementar el comptador de canvisAnterior
    }
    else{ // Control de modificaciones en blanco
      if(params.oldValue !== params.value && !(params.oldValue == null && params.value === '') ) // No es modificacion en blanco
      {
        this.modificationChange = true;
      }
      else{ 
        if ( this.changesMap.has(params.node.id)) // Modificacion en blanco sobre una cela modificada
        {
          if(!this.undoNoChanges)
          {
            this.gridApi.undoCellEditing(); // Undo para deshacer el cambio sin modificaciones internamente
            this.undoNoChanges = true;
            this.paintCells(params, this.changesMap);  // Como aun tiene modificaciones, el background sigue siendo verde
          }
          else { this.undoNoChanges = false; }


        }
        else {
          // Como al hacer undo volverá a entrar a esta misma función, hay que enviarlo a su if correspondiente
          if(!this.undoNoChanges)
          {
            this.gridApi.undoCellEditing(); // Undo para deshacer el cambio sin modificaciones internamente
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
    // Definiremos el cellStyle blanco para futuras modificaciones internas (ej: filtro)
  }

  changeCellStyleColumns(params: any, changesMap: Map<number, Map<string, number>>, color: string){

    for (const key of changesMap.get(params.node.id).keys())
    {
      const columnNumber = this.getColumnIndexByColId(this.gridColumnApi, key);
      this.gridColumnApi.columnController.gridColumns[columnNumber].colDef.cellStyle = {backgroundColor: color};
    }


  }

}
