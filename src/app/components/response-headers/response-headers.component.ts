import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { IHttpHeader } from 'src/app/service/types';
import { HEADER_KEYS, HEADER_VALUES } from 'src/app/constants/http';
import * as _ from 'lodash';

@Component({
  selector: 'app-response-headers',
  templateUrl: './response-headers.component.html',
  styleUrls: ['./response-headers.component.scss'],
})
export class ResponseHeadersComponent implements OnInit {
  suggestionOptions = [];
  headers: (IHttpHeader & {
    uuid: string;
    keyOptions: any[];
    valueOptions: any[];
  })[] = [];
  @Output()
  change = new EventEmitter();
  @Input()
  set responseHeaders(headers: IHttpHeader[]) {
    this.headers = [];
    headers.forEach(({ key, value }) => {
      this.addHeader(null, key, value);
    });
  }

  constructor() {}

  ngOnInit() {}

  showSuggestions(type, value) {
    if (type === 'key') {
      this.suggestionOptions = HEADER_KEYS.filter(
        (key) => key.toLowerCase().indexOf(value.toLowerCase()) > -1
      );
    } else {
      this.suggestionOptions = HEADER_VALUES.filter(
        (key) => key.toLowerCase().indexOf(value.toLowerCase()) > -1
      );
    }
  }

  addHeader(event, key?, value?) {
    const header = {
      uuid: (new Date().getTime() + Math.random() * 10000).toString(),
      key: key || '',
      value: value || '',
      keyOptions: [],
      valueOptions: [],
    };

    this.headers.push(header);
  }

  removeHeader(uuid) {
    for (let i = 0; i < this.headers.length; i++) {
      if (this.headers[i].uuid === uuid) {
        this.headers.splice(i, 1);
        break;
      }
    }
  }

  onChange() {
    const headers = this.headers.map((item) => {
      return _.pick(item, 'key', 'value');
    });
    this.change.emit(headers);
  }
}
