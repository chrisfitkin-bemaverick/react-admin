import assert from 'assert';
import { until } from 'selenium-webdriver';
import driver from '../chromeDriver';
import editPageFactory from '../pages/EditPage';
import loginPageFactory from '../pages/LoginPage';
import showPageFactory from '../pages/ShowPage';

describe('Tabs with custom routing', () => {
    const EditPage = editPageFactory('http://localhost:8083/#/users/1')(driver);
    const ShowPage = showPageFactory(
        'http://localhost:8083/#/users/1/show',
        'name'
    )(driver);
    const LoginPage = loginPageFactory('http://localhost:8083/#/login')(driver);

    before(async () => {
        await LoginPage.navigate();
        await LoginPage.login('admin', 'password');
        await driver.wait(until.urlIs('http://localhost:8083/#/posts'));
    });

    describe('in TabbedLayout component', () => {
        it('allows to switch tabs using the buttons', async () => {
            await ShowPage.navigate();
            assert.deepEqual(await ShowPage.getTabs(), ['SUMMARY', 'SECURITY']);
            assert.deepEqual(await ShowPage.getFields(), ['id', 'name']);
            await ShowPage.gotoTab(2);
            assert.equal(
                await driver.getCurrentUrl(),
                'http://localhost:8083/#/users/1/show/security'
            );
            assert.deepEqual(await ShowPage.getFields(), ['role']);
            await ShowPage.gotoTab(1);
            assert.deepEqual(await ShowPage.getFields(), ['id', 'name']);
            assert.equal(
                await driver.getCurrentUrl(),
                'http://localhost:8083/#/users/1/show'
            );
        });

        it('allows to switch tabs using the browser history', async () => {
            await driver.navigate().back();
            await ShowPage.waitUntilDataLoaded();
            assert.equal(
                await driver.getCurrentUrl(),
                'http://localhost:8083/#/users/1/show/security'
            );
            assert.deepEqual(await ShowPage.getFields(), ['role']);
            await driver.navigate().back();
            await ShowPage.waitUntilDataLoaded();
            assert.equal(
                await driver.getCurrentUrl(),
                'http://localhost:8083/#/users/1/show'
            );
            assert.deepEqual(await ShowPage.getFields(), ['id', 'name']);
        });
    });

    describe('in TabbedForm component', () => {
        it('allows to switch tabs using the buttons', async () => {
            await EditPage.navigate();
            assert.deepEqual(await EditPage.getTabs(), ['SUMMARY', 'SECURITY']);
            assert.deepEqual(await EditPage.getFields(), ['id', 'name']);
            await EditPage.gotoTab(2);
            assert.equal(
                await driver.getCurrentUrl(),
                'http://localhost:8083/#/users/1/security'
            );
            assert.deepEqual(await EditPage.getFields(), ['role']);
            await EditPage.gotoTab(1);
            assert.deepEqual(await EditPage.getFields(), ['id', 'name']);
            assert.equal(
                await driver.getCurrentUrl(),
                'http://localhost:8083/#/users/1'
            );
        });

        it('allows to switch tabs using the browser history', async () => {
            await driver.navigate().back();
            await EditPage.waitUntilDataLoaded();
            assert.equal(
                await driver.getCurrentUrl(),
                'http://localhost:8083/#/users/1/security'
            );
            assert.deepEqual(await EditPage.getFields(), ['role']);
            await driver.navigate().back();
            await EditPage.waitUntilDataLoaded();
            assert.equal(
                await driver.getCurrentUrl(),
                'http://localhost:8083/#/users/1'
            );
            assert.deepEqual(await EditPage.getFields(), ['id', 'name']);
        });
    });
});
