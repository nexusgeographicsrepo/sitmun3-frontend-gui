import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatIconRegistry } from "@angular/material/icon";
import { DomSanitizer } from "@angular/platform-browser";


@Component({
  selector: 'app-dialog-translation',
  templateUrl: './dialog-translation.component.html',
  styleUrls: ['./dialog-translation.component.scss']
})
export class DialogTranslationComponent implements OnInit {

  translationForm: FormGroup = new FormGroup({})
  translationsMap:  Map<string, any>;
  languageByDefault:  string;
  languagesAvailables: Array<any>;
  loading = true;

  constructor(private dialogRef: MatDialogRef<DialogTranslationComponent>,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer) { 
  }

  ngOnInit(): void {
    this.initializeDialog();
    this.loading=false;
  }

  initializeDialog(): void{
    this.languagesAvailables.forEach(element => {
      this.registerIcon(element.shortname)
      this.initializeForm(element.shortname);
    });
  }

  registerIcon(elementShortname){
    this.matIconRegistry.addSvgIcon(
      this.getIconName(elementShortname),
      this.domSanitizer.bypassSecurityTrustResourceUrl(`assets/img/flag_${elementShortname}.svg`)
    );
  }

  initializeForm(elementShortname):void{
    let currentValueOnMap = this.translationsMap.get(elementShortname);
    let valueToPutOnForm = (currentValueOnMap && currentValueOnMap.translation)?currentValueOnMap.translation:null;
    this.translationForm.addControl(elementShortname, new FormControl(valueToPutOnForm, []))
  }

  getIconName(elementShortname):string{
    return `icon_lang_${elementShortname}` 
  }

  doAccept(){
    this.languagesAvailables.forEach(language => {
      if(this.translationsMap.has(language.shortname) && this.translationForm.get(language.shortname)?.value){
        this.translationsMap.get(language.shortname).translation = this.translationForm.get(language.shortname).value
      }
    });

    this.dialogRef.close({event:'Accept', data: this.translationsMap});
  }

  closeDialog(){
    this.dialogRef.close({event:'Cancel'});
  }

}
