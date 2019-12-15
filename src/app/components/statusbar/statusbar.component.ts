import { Component, OnInit } from '@angular/core';
import { StatusbarService } from 'src/app/service/statusbar.service';
const appVersion = require('../../../../package.json').version;

@Component({
  selector: 'app-statusbar',
  templateUrl: './statusbar.component.html',
  styleUrls: ['./statusbar.component.scss']
})
export class StatusbarComponent implements OnInit {
  syncing = false;
  delayTimer;
  appVersion = appVersion;
  constructor(private statusbarService: StatusbarService) {}

  ngOnInit() {
    this.statusbarService.syncingQueueLength$.subscribe(length => {
      if (this.delayTimer) {
        clearTimeout(this.delayTimer);
        this.delayTimer = null;
      }
      if (length === 0) {
        this.delayTimer = setTimeout(() => {
          this.syncing = false;
        }, 1500);
      } else {
        this.syncing = true;
      }
    });
  }
}
