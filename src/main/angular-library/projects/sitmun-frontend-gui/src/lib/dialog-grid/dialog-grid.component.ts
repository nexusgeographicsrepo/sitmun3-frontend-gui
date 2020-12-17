import { Component, OnInit, Input } from '@angular/core';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-dialog-grid',
  templateUrl: './dialog-grid.component.html',
  styleUrls: ['./dialog-grid.component.css']
})
export class DialogGridComponent implements OnInit {

  @Input() themeGrid: any;
  @Input() getAllsTable: Array<() => Observable<any>>;
  @Input() columnDefsTable: Array<any[]>;

  constructor() { }

  ngOnInit() {
  }

}
