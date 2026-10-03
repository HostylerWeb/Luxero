(function () {
  if (
    typeof window === "undefined" ||
    !("serviceWorker" in navigator) ||
    window.__swRegistered
  )
    return;
  window.__swRegistered = true;

  var SW_PATH = "/sw.js";

  function reloadPage() {
    window.location.reload();
  }

  navigator.serviceWorker
    .register(SW_PATH, { updateViaCache: "none" })
    .then(function (reg) {
      reg.addEventListener("updatefound", function () {
        var installing = reg.installing;
        if (!installing) return;
        installing.addEventListener("statechange", function () {
          if (installing.state === "activated") {
            reloadPage();
          }
        });
      });

      if (reg.active) {
        reg.active.postMessage({ type: "CONFIG", cachingEnabled: false });
      }

      reg.addEventListener("controllerchange", function () {
        reg.active &&
          reg.active.postMessage({ type: "CONFIG", cachingEnabled: false });
      });

      // Periodically force the browser to check for SW updates
      setInterval(function () {
        reg.update();
      }, 600000);
    })
    .catch(function () {});
})();
