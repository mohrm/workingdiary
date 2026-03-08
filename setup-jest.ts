import { setupZonelessTestEnv } from 'jest-preset-angular/setup-env/zoneless';

setupZonelessTestEnv({
  teardown: { destroyAfterEach: true }
});

if (!globalThis.URL.createObjectURL) {
  globalThis.URL.createObjectURL = () => 'blob:jest-mock';
}

if (!globalThis.URL.revokeObjectURL) {
  globalThis.URL.revokeObjectURL = () => {};
}
