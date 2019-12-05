/// <reference path="../../../../node_modules/monaco-editor/monaco.d.ts" />
import {
  Component,
  OnInit,
  Input,
  ElementRef,
  ViewChild,
  OnDestroy
} from '@angular/core';
import {
  Subject,
  BehaviorSubject,
  Subscription,
  combineLatest,
  fromEvent
} from 'rxjs';
import { Route } from 'src/app/service/types';
import { CollectionService } from 'src/app/service/collection.service';
declare var amdRequire: any;

@Component({
  selector: 'app-request-code',
  templateUrl: './request-code.component.html',
  styleUrls: ['./request-code.component.scss']
})
export class RequestCodeComponent implements OnInit, OnDestroy {
  @Input()
  set routeData(value) {
    if (value) {
      this.ignoreFirstChange = true;
      this.routeData$.next(value);
    }
  }
  routeData$ = new BehaviorSubject<Route>(null);
  // @Output()
  // responseBodyChange = new EventEmitter();
  @ViewChild('editorContainer', { static: true })
  editorContainer: ElementRef<HTMLDivElement>;
  ignoreFirstChange = false;

  editor: monaco.editor.IStandaloneCodeEditor;
  editorCreated$ = new BehaviorSubject<boolean>(false);
  editorChange$ = new Subject<string>();
  subscriptions: Subscription[] = [];

  constructor(private collectionService: CollectionService) {}

  ngOnInit() {
    this.subscribeResponseBodyChange();
    setTimeout(() => {
      this.initEditor();
    });
    const subscribeResize = fromEvent(window, 'resize').subscribe(() => {
      this.editor.layout();
    });

    this.subscriptions.push(subscribeResize);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  initEditor() {
    amdRequire(['vs/editor/editor.main'], () => {
      const editorContainer = this.editorContainer.nativeElement;
      this.editor = monaco.editor.create(editorContainer, {
        value: [''].join('\n'),
        language: 'typescript',
        readOnly: true
      });
      this.editorCreated$.next(true);
    });
  }

  subscribeResponseBodyChange() {
    const subscribeResponseBodyChange = combineLatest([
      this.editorCreated$,
      this.routeData$
    ]).subscribe(([created, route]) => {
      if (created) {
        this.collectionService
          .getCollectionLocalData(route.collectionId)
          .subscribe(collectionData => {
            let template = collectionData.template;
            template = template.replace('{{METHOD}}', route.method);
            template = template.replace('{{PATH}}', route.path);
            this.editor.setValue(template);
          });
      }
    });
    this.subscriptions.push(subscribeResponseBodyChange);
  }
}
