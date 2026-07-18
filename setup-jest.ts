if (!globalThis.URL.createObjectURL) {
  globalThis.URL.createObjectURL = () => 'blob:jest-mock';
}

if (!globalThis.URL.revokeObjectURL) {
  globalThis.URL.revokeObjectURL = () => {};
}
