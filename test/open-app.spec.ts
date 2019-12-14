import { Tester } from './helper/tester';
import { async } from '@angular/core/testing';

describe('Open app', () => {
  const tester = new Tester();
  tester.runHooks();
  tester.waitForWindowReady();
  tester.waitForCollectionLoaded();

  it('Open window with Mockingbird title', async () => {
    await tester.spectron.webContents
      .getTitle()
      .should.eventually.equal('Mockingbird');
  });

  it('Collection number is two', async () => {
    await tester.spectron.client
      .elements('app-collection-list .collections li')
      .should.eventually.have.property('value')
      .to.be.an('Array')
      .that.have.lengthOf(2);
  });

  it('Route number is two', async () => {
    await tester.spectron.client
      .elements('app-route-list .routes li')
      .should.eventually.have.property('value')
      .to.be.an('Array')
      .that.have.lengthOf(2);
  });

  it('Activated response name is "OK"', async () => {
    await tester.spectron.client.element(
      'app-route .response-actions .ant-select-selection-selected-value'
    ).getHTML(false).should.eventually.include('OK');
  });
});
