import * as chai from 'chai';
import * as chaiAsPromised from 'chai-as-promised';
import { Application } from 'spectron';
import * as fs from 'fs';
const electronPath: any = require('electron');

export class Tester {
  public spectron: Application;
  constructor() {
    chai.should();
    chai.use(chaiAsPromised);
  }

  public runHooks() {
    before(() => {
      this.spectron = new Application({
        path: electronPath,
        args: ['./dist', '--tests'],
        webdriverOptions: {
          deprecationWarnings: false
        }
      });

      return this.spectron.start();
    });

    before(() => {
      // load the default data for test
      fs.readFile('./test/helper/data/test-data.json', (err, data) => {
        if (!err) {
          let collections: any[] = [];
          let routes: any[] = [];
          let responses: any[] = [];
          try {
            collections = JSON.parse(data.toString()).collections;
            routes = JSON.parse(data.toString()).routes;
            responses = JSON.parse(data.toString()).responses;
          } catch (e) {}
          this.spectron.client.execute(
            function(_collections, _routes, _responses) {
              const dbRequest = window.indexedDB.open('mockingbird', 1);
              dbRequest.onerror = function(e) {
                console.log(e);
              };
              dbRequest.onsuccess = event => {
                const db = event.target['result'] as IDBDatabase;
                const transaction = db.transaction(
                  ['collection', 'route', 'response'],
                  'readwrite'
                );
                const collectionStore = transaction.objectStore('collection');
                const routeStore = transaction.objectStore('route');
                const responseStore = transaction.objectStore('response');
                _collections.forEach(collection => {
                  collectionStore.add(collection);
                });

                _routes.forEach(route => {
                  routeStore.add(route);
                });

                _responses.forEach(response => {
                  responseStore.add(response);
                });

                setTimeout(() => {
                  // reload page for load data
                  location.reload();
                });
              };
            },
            collections,
            routes,
            responses
          );
        }
      });
    });

    after(() => {
      if (this.spectron && this.spectron.isRunning()) {
        return this.spectron.stop();
      }

      return undefined;
    });
  }

  public waitForWindowReady() {
    it('Window ready', async () => {
      await this.spectron.client.waitUntilWindowLoaded();
    });
  }

  public waitForCollectionLoaded() {
    it('Collection loaded', async () => {
      await this.spectron.client.waitForExist(
        'app-collection-list .collections li',
        5000
      );
    });
  }
}
