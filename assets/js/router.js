import { ModuleManager } from "./module-manager.js";
import Slideshow from "./modules/Slideshow.js";
import Biography from "./modules/Biography.js";
import Contact from "./modules/Contact.js";
import { GALLERIES } from "./data/galleries.js";

export const Router = (() => {
  let outlet;

  function init(appContainer) {
    outlet = appContainer;

    document.addEventListener("click", handleLinkClick);
    window.addEventListener("popstate", handlePopState);

    route(location.pathname);
  }

  function handleLinkClick(e) {
    const link = e.target.closest("[data-route]");
    if (!link) return;

    e.preventDefault();
    navigate(link.dataset.route);
  }

  function navigate(path) {
    history.pushState({}, "", path);
    route(path);
  }

  function handlePopState() {
    route(location.pathname);
  }

  function route(path) {
    ModuleManager.destroy();

    if (path.startsWith("/gallery/")) {
      const key = path.split("/").pop();
      ModuleManager.mount(
        new Slideshow(outlet, GALLERIES[key])
      );
      return;
    }

    switch (path) {
      case "/biography":
        ModuleManager.mount(new Biography(outlet));
        break;

      case "/contact":
        ModuleManager.mount(new Contact(outlet));
        break;

      default:
        outlet.innerHTML = "<h1>Welcome</h1>";
    }
  }

  return { init };
})();