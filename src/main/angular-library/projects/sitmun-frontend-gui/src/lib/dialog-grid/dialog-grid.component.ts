import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Component({
  selector: 'app-dialog-grid',
  templateUrl: './dialog-grid.component.html',
  styleUrls: ['./dialog-grid.component.css']
})
export class DialogGridComponent implements OnInit {

  getAllRows: Subject<boolean> = new Subject <boolean>();
  private _addButtonClickedSubscription: any;
  tablesReceivedCounter: number;
  allRowsReceived: Array<any[]> = [];
  @Input() themeGrid: any;
  @Input() getAllsTable: Array<() => Observable<any>>;
  @Input() columnDefsTable: Array<any[]>;
  @Input() addButtonClickedSubscription: Observable <boolean> ;

  @Output() joinTables : EventEmitter<Array<any[]>>;



  constructor() {
    this.joinTables = new EventEmitter();
    this.tablesReceivedCounter = 0;
   }

  ngOnInit() {

    if (this.addButtonClickedSubscription) {
      this._addButtonClickedSubscription = this.addButtonClickedSubscription.subscribe(() => {
        this.getAllSelectedRows();
      });
    }

  }

  getAllSelectedRows() {
    this.getAllRows.next(true);
  }

  joinRowsReceived(data: any[])
  {
      this.allRowsReceived.push(data);
      this.tablesReceivedCounter++;
      if(this.tablesReceivedCounter === this.getAllsTable.length)
      {
        this.joinTables.emit(this.allRowsReceived);
        console.log(this.allRowsReceived);
        this.tablesReceivedCounter=0;
        this.allRowsReceived = [];
      }
  }

}
