import { Tester } from './helper/tester';
import { wait } from './helper/helpers';

describe('Response Tests', async function() {
  const tester = new Tester();
  tester.runHooks();
  tester.waitForWindowReady();
  tester.waitForCollectionLoaded();

  it('Open create response modal', async () => {
    await tester.spectron.client.element('app-route .add-response-btn').click();
    await tester.spectron.client
      .element('.ant-modal-title div')
      .getHTML(false)
      .should.eventually.equal('New Response');
  });

  wait(1000);

  it('Create new response', async () => {
    await tester.spectron.client
      .element('.ant-modal-footer .ant-btn-primary')
      .click();

    wait(1000);

    await tester.spectron.client
      .element('.response-selector .ant-select-selection')
      .click();
  });
});
