/// <reference path="../../../../node_modules/monaco-editor/monaco.d.ts" />
import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
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
import { debounceTime } from 'rxjs/operators';

declare var amdRequire: any;

@Component({
  selector: 'app-response-body',
  templateUrl: './response-body.component.html',
  styleUrls: ['./response-body.component.scss']
})
export class ResponseBodyComponent implements OnInit, OnDestroy {
  _responseBody: string;
  @Input()
  set responseBody(value) {
    if (value === this._responseBody) {
      return;
    }
    this.firstChange = true;
    this.responseBody$.next(value);
  }
  responseBody$ = new BehaviorSubject<string>(null);
  @Output()
  responseBodyChange = new EventEmitter();
  @ViewChild('editorContainer', { static: true })
  editorContainer: ElementRef<HTMLDivElement>;
  firstChange = false;

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
    this.subscribeEditorChange();
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
        language: 'json'
      });
      this.editor.onDidChangeModelContent(this.editorChange.bind(this));
      this.editorCreated$.next(true);
    });
  }

  subscribeResponseBodyChange() {
    const subscribeResponseBodyChange = combineLatest([
      this.editorCreated$,
      this.responseBody$
    ]).subscribe(([created, responseBody]) => {
      if (created) {
        this.editor.setValue(responseBody);
      }
    });
    this.subscriptions.push(subscribeResponseBodyChange);
  }

  editorChange(event: monaco.editor.IModelContentChangedEvent) {
    if (this.firstChange) {
      this.firstChange = false;
      return;
    }
    const responseBody = this.editor.getModel().getValue();
    // this.responseBodyChange.emit(responseBody);
    this.editorChange$.next(responseBody);
  }

  subscribeEditorChange() {
    const subscription = this.editorChange$
      .pipe(debounceTime(500))
      .subscribe(responseBody => {
        this.responseBodyChange.emit(responseBody);
        this._responseBody = responseBody;
      });
    this.subscriptions.push(subscription);
  }
}
