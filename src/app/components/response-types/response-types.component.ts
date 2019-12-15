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
import JsonToTS from 'json-to-ts';

declare var amdRequire: any;

@Component({
  selector: 'app-response-types',
  templateUrl: './response-types.component.html',
  styleUrls: ['./response-types.component.scss']
})
export class ResponseTypesComponent implements OnInit, OnDestroy {
  @Input()
  set responseBody(value) {
    this.ignoreFirstChange = true;
    this.responseBody$.next(value);
  }
  responseBody$ = new BehaviorSubject<string>(null);
  // @Output()
  // responseBodyChange = new EventEmitter();
  @ViewChild('editorContainer', { static: true })
  editorContainer: ElementRef<HTMLDivElement>;
  ignoreFirstChange = false;

  editor: monaco.editor.IStandaloneCodeEditor;
  editorCreated$ = new BehaviorSubject<boolean>(false);

  editorChange$ = new Subject<string>();

  subscriptions: Subscription[] = [];

  constructor() {}

  ngOnInit() {
    this.subscribeResponseBodyChange();
    setTimeout(() => {
      this.initEditor();
    });
    const subscribeResize = fromEvent(window, 'resize').subscribe(() => {
      if (this.editor) {
        this.editor.layout();
      }
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
        readOnly: true,
        automaticLayout: true
      });
      this.editorCreated$.next(true);
    });
  }

  subscribeResponseBodyChange() {
    const subscribeResponseBodyChange = combineLatest([
      this.editorCreated$,
      this.responseBody$
    ]).subscribe(([created, responseBody]) => {
      if (created) {
        let typesText = '';
        try {
          JsonToTS(JSON.parse(responseBody)).forEach(
            text => (typesText += text + '\n\n')
          );
          this.editor.setValue(typesText);
        } catch (e) {
          console.error(e);
        }
      }
    });
    this.subscriptions.push(subscribeResponseBodyChange);
  }
}
