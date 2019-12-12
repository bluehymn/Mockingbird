import {
  Component,
  OnInit,
  Input
} from '@angular/core';
import { IHttpHeader } from 'src/app/service/types';
import { HEADER_KEYS, HEADER_VALUES } from 'src/app/constants/http';
import { CollectionService } from 'src/app/service/collection.service';
import { ServerService } from 'src/app/service/server.service';

@Component({
  selector: 'app-collection-settings',
  templateUrl: './collection-settings.component.html',
  styleUrls: ['./collection-settings.component.scss']
})
export class CollectionSettingsComponent implements OnInit {
  @Input()
  collectionId: string;
  enableCors = false;
  enableProxy = false;
  proxyUrl = '';
  headers: (IHttpHeader & {
    uuid: string;
    keyOptions: any[];
    valueOptions: any[];
  })[] = [];
  suggestionOptions = [];
  constructor(private collectionService: CollectionService, private serverService: ServerService) {}

  ngOnInit() {
    this.getCollectionLocalData();
  }

  getCollectionLocalData() {
    this.collectionService
      .getCollectionData(this.collectionId)
      .subscribe(data => {
        if (data) {
          this.enableCors = data.cors;
          this.proxyUrl = data.proxyUrl;
          this.enableProxy = data.enableProxy;
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

  addHeader(event) {
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
    this.collectionService.updateCollection(this.collectionId, {
      cors: this.enableCors,
      enableProxy: this.enableProxy,
      proxyUrl: this.proxyUrl,
      headers: this.headers.map(item => ({
        key: item.key,
        value: item.value
      }))
    }).subscribe(ret => {
      this.collectionService.updateCollectionListData$.next(null);
      this.serverService.serverNeedRestart$.next(this.collectionId);
    });
  }
}
