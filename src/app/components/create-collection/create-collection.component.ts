import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CollectionService } from 'src/app/service/collection.service';
import { CollectionData } from 'src/app/service/types';
import { HTTP_STATUS_CODE, REQUEST_CODE_TEMPLATE } from 'src/app/constants/application';
import { NzMessageService, NzModalRef } from 'ng-zorro-antd';
import * as cuid from 'cuid';

@Component({
  selector: 'app-create-collection',
  templateUrl: './create-collection.component.html',
  styleUrls: ['./create-collection.component.scss']
})
export class CreateCollectionComponent implements OnInit {
  formGroup: FormGroup;
  constructor(
    private collectionService: CollectionService,
    private messageService: NzMessageService,
    private modal: NzModalRef
  ) {}

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.formGroup = new FormGroup({
      name: new FormControl('', [Validators.required]),
      port: new FormControl('', [
        Validators.required,
        Validators.max(65535),
        Validators.min(1)
      ]),
      prefix: new FormControl('', []),
      proxyUrl: new FormControl('', [])
    });
  }

  submit() {
    this.formGroup.get('name').markAsDirty();
    this.formGroup.get('port').markAsDirty();
    if (this.formGroup.invalid) {
      return false;
    }

    const collectionData: CollectionData = {
      id: cuid(),
      name: this.formGroup.get('name').value,
      port: Number(this.formGroup.get('port').value),
      prefix: this.formGroup.get('prefix').value,
      enableProxy: false,
      proxyUrl: '',
      headers: [],
      cors: true,
      delay: 0,
      template: REQUEST_CODE_TEMPLATE
    };
    return new Promise((resolve, reject) => {
      this.collectionService
        .createCollection(collectionData)
        .subscribe(ret => {
          this.messageService.success('created');
          resolve();
        },
        error => {
          this.modal.close();
        });
    });
  }
}
