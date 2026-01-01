export const ModuleManager = (() => {
  let activeModule = null;

  function mount(moduleInstance) {
    activeModule = moduleInstance;
    activeModule.init();
  }

  function destroy() {
    if (activeModule?.destroy) {
      activeModule.destroy();
    }
    activeModule = null;
  }

  return { mount, destroy };
})();