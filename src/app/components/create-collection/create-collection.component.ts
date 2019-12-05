import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { CollectionService } from 'src/app/service/collection.service';
import { CreateCollectionData } from 'src/app/service/types';
import { HTTP_STATUS_CODE } from 'src/app/constants/application';
import { NzMessageService, NzModalRef } from 'ng-zorro-antd';

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

    const collectionData: CreateCollectionData = {
      name: this.formGroup.get('name').value,
      port: Number(this.formGroup.get('port').value),
      prefix: this.formGroup.get('prefix').value,
      proxyUrl: this.formGroup.get('proxyUrl').value
    };
    return new Promise((resolve, reject) => {
      this.collectionService
        .createCollection(collectionData)
        .subscribe(ret => {
          if (ret.statusCode === HTTP_STATUS_CODE.CREATED) {
            this.messageService.success('created');
            resolve();
          }
        },
        error => {
          this.modal.close();
        });
    });
  }
}
