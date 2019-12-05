import {
  Component,
  OnInit,
  Input,
  ComponentRef,
  ViewChildren,
  Renderer2,
  QueryList
} from '@angular/core';
import { IHttpHeader } from 'src/app/service/types';
import { HEADER_KEYS, HEADER_VALUES } from 'src/app/constants/http';
import { NzAutocompleteComponent } from 'ng-zorro-antd';
import { CollectionService } from 'src/app/service/collection.service';

@Component({
  selector: 'app-collection-settings',
  templateUrl: './collection-settings.component.html',
  styleUrls: ['./collection-settings.component.scss']
})
export class CollectionSettingsComponent implements OnInit {
  @Input()
  collectionId: string;
  enableCors = false;
  headers: (IHttpHeader & {
    uuid: string;
    keyOptions: any[];
    valueOptions: any[];
  })[] = [];
  suggestionOptions = [];
  constructor(private collectionService: CollectionService) {}

  ngOnInit() {
    this.getCollectionLocalData();
  }

  getCollectionLocalData() {
    this.collectionService
      .getCollectionLocalData(this.collectionId)
      .then(data => {
        if (data) {
          this.enableCors = data.cors;
          if (data.headers && data.headers.length) {
            this.headers = data.headers.map(item => ({
              uuid: (new Date().getTime() + Math.random() * 10000).toString(),
              keyOptions: [],
              valueOptions: [],
              ...item
            }));
          }
        }
      });
  }

  corsChange(enable) {}

  addHeader() {
    const header = {
      uuid: (new Date().getTime() + Math.random() * 10000).toString(),
      key: '',
      value: '',
      keyOptions: [],
      valueOptions: []
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

  showSuggestions(type, value) {
    if (type === 'key') {
      this.suggestionOptions = HEADER_KEYS.filter(
        key => key.toLowerCase().indexOf(value.toLowerCase()) > -1
      );
    } else {
      this.suggestionOptions = HEADER_VALUES.filter(
        key => key.toLowerCase().indexOf(value.toLowerCase()) > -1
      );
    }
  }

  updateCollection() {
    this.collectionService.updateCollectionLocally(this.collectionId, {
      cors: this.enableCors,
      headers: this.headers.map(item => ({
        key: item.key,
        value: item.value
      }))
    });
  }
}
