import { Tester } from './helper/tester';
import { wait } from './helper/helpers';
import * as request from 'request-promise-native';
import { async } from 'rxjs/internal/scheduler/async';

describe('Start and stop server', async function() {
  const tester = new Tester();
  tester.runHooks();
  tester.waitForWindowReady();
  tester.waitForCollectionLoaded();

  it('Click start button', async function() {
    await tester.spectron.client.element('button.play').click();
    await wait(1000);
    await tester.spectron.client.element('button.stop').getAttribute<any>('hidden').should.eventually.equal(null);
  });

  it('Request a route url', async function() {
    await request.get('http://localhost:8000/api/animals').should.eventually.equal('[{\"name\"：\"Tiger\"}]');
  });

  it('Stop server', async function() {
    await tester.spectron.client.element('button.stop').click();
    await wait(1000);
    await tester.spectron.client.element('button.stop').getAttribute<any>('hidden').should.eventually.equal('true');
    await tester.spectron.client.element('button.play').getAttribute<any>('hidden').should.eventually.equal(null);
  });

});
