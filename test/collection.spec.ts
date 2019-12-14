import { Tester } from './helper/tester';
import { wait } from './helper/helpers';
import { async } from '@angular/core/testing';

describe('Collection', async () => {
  const tester = new Tester();
  tester.runHooks();
  tester.waitForWindowReady();

  it('Open the modal of create collection', async () => {
    await tester.spectron.client
      .element('app-collection-list .header button')
      .click();
    await tester.spectron.client
      .element('.ant-modal-title div')
      .getHTML(false)
      .should.eventually.equal('New Collection');
  });

  it('Create new collection', async () => {
    tester.spectron.client
      .element('#create-collection-name-input')
      .setValue('Collection3');
    tester.spectron.client
      .element('#create-collection-port-input')
      .setValue('8300');
    tester.spectron.client
      .element('#create-collection-prefix-input')
      .setValue('api');
    tester.spectron.client
      .element('#create-collection-proxy-url-input')
      .setValue('http://bluehymn.com');
    await wait(1000);
    tester.spectron.client
      .element('.ant-modal-footer .ant-btn-primary')
      .click();
    await wait(2000);

    await tester.spectron.client
      .elements('app-collection-list .collections li')
      .should.eventually.have.property('value')
      .to.be.a('Array')
      .that.have.lengthOf(3);
  });

  it('Remove a collection and 2 left', async () => {
    await tester.spectron.client
      .element('app-collection-list .collections li:nth-child(3) .remove')
      .click();
    await wait(2000);
    await tester.spectron.client.element('.ant-modal-confirm-btns .ant-btn-primary').click();
    await wait(1000);
    await tester.spectron.client
      .elements('app-collection-list .collections li')
      .should.eventually.have.property('value')
      .to.be.a('Array')
      .that.have.lengthOf(2);
  });
});
