import { Component, OnInit } from '@angular/core';
import { IHttpHeader } from 'src/app/service/types';
import { HEADER_KEYS, HEADER_VALUES } from 'src/app/constants/http';

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

  addHeader(event) {
    const header = {
      uuid: (new Date().getTime() + Math.random() * 10000).toString(),
      key: '',
      value: '',
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
}
