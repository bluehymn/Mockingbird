import { Component, OnInit, Input } from '@angular/core';
import { ResponseService } from 'src/app/service/response.service';
import { NzMessageService, NzModalRef, valueFunctionProp } from 'ng-zorro-antd';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ResponseData } from 'src/app/service/types';
import { HTTP_STATUS_CODE } from 'src/app/constants/application';
import { HTTP_STATUS_CODES } from 'src/app/constants/http';
import * as cuid from 'cuid';

@Component({
  selector: 'app-create-response',
  templateUrl: './create-response.component.html',
  styleUrls: ['./create-response.component.scss']
})
export class CreateResponseComponent implements OnInit {
  @Input()
  routeId: string;
  formGroup: FormGroup;
  statusCodes = [];
  constructor(
    private responseService: ResponseService,
    private messageService: NzMessageService,
    private modal: NzModalRef
  ) {}

  ngOnInit() {
    this.initForm();
    this.statusCodes = HTTP_STATUS_CODES;
  }

  initForm() {
    this.formGroup = new FormGroup({
      name: new FormControl('unnamed (OK)', [Validators.required]),
      statusCode: new FormControl(200, [Validators.required])
    });

    this.formGroup.get('statusCode').valueChanges.subscribe(statusCode => {
      const nameControl = this.formGroup.get('name');
      const name = nameControl.value;
      if (!nameControl.dirty) {
        nameControl.setValue(
          `unnamed (${
            this.statusCodes.find(item => item.code === statusCode).text
          })`
        );
      }
    });
  }

  submit() {
    this.formGroup.get('name').markAsDirty();
    this.formGroup.get('statusCode').markAsDirty();
    if (this.formGroup.invalid) {
      return false;
    }

    const responseData: ResponseData = {
      id: cuid(),
      routeId: this.routeId,
      name: this.formGroup.get('name').value,
      statusCode: this.formGroup.get('statusCode').value,
      headers: [],
      body: '{}'
    };

    return new Promise((resolve, reject) => {
      this.responseService.createResponse(responseData).subscribe(
        ret => {
          this.messageService.success('created');
          resolve();
        },
        error => {
          this.modal.close();
        }
      );
    });
  }
}
