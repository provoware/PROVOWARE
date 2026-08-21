(() => {
  "use strict";

  const catalog = [];

  Object.defineProperty(window, "PROVOWARE_MODULE_CATALOG", {
    value: Object.freeze(catalog),
    writable: false,
    configurable: false,
    enumerable: true,
  });
})();
