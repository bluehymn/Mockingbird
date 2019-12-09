import { Component, OnInit } from '@angular/core';
import { NzMessageService, NzModalRef } from 'ng-zorro-antd';
import { RouteService } from 'src/app/service/route.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { RouteData } from 'src/app/service/types';
import { catchError } from 'rxjs/operators';
import { HTTP_STATUS_CODE } from 'src/app/constants/application';
import { EmptyError, of } from 'rxjs';
import { HTTP_METHODS } from 'src/app/constants/http';
import { HttpMethod } from 'src/app/types/http.types';
import * as _ from 'lodash';
import { allSettled } from 'q';
import * as cuid from 'cuid';
@Component({
  selector: 'app-create-route',
  templateUrl: './create-route.component.html',
  styleUrls: ['./create-route.component.scss']
})
export class CreateRouteComponent implements OnInit {
  collectionId: string;
  formGroup: FormGroup;
  httpMethods: { value: HttpMethod; name: string }[] = [];
  constructor(
    private routeService: RouteService,
    private messageService: NzMessageService,
    private modal: NzModalRef
  ) {
    this.httpMethods = [...HTTP_METHODS].map(method => ({
      value: method,
      name: method.toUpperCase()
    }));
  }

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.formGroup = new FormGroup({
      name: new FormControl('', [Validators.required]),
      path: new FormControl('', [Validators.required]),
      method: new FormControl(this.httpMethods[0].value, [Validators.required]),
      description: new FormControl('', [])
    });
  }

  submit() {
    this.formGroup.get('name').markAsDirty();
    this.formGroup.get('path').markAsDirty();
    if (this.formGroup.invalid) {
      return false;
    }

    const routeData: RouteData = {
      id: cuid(),
      collectionId: this.collectionId,
      name: this.formGroup.get('name').value,
      path: this.formGroup.get('path').value,
      method: this.formGroup.get('method').value,
      description: this.formGroup.get('description').value
    };
    return new Promise((resolve, reject) => {
      this.routeService
        .createRoute(routeData)
        .pipe(
          catchError(error => {
            this.messageService.error(error);
            this.modal.getInstance().nzOkLoading = false;
            return EmptyError;
          })
        )
        .subscribe(ret => {
          this.messageService.success('created');
          resolve();
        });
    });
  }
}
