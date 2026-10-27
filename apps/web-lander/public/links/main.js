"use strict";

let toastTimeout;

// The page has one language. Keep shared URLs free of obsolete language parameters.
document.getElementById("share-button").addEventListener("click", async () => {
  const url = window.location.origin + window.location.pathname;
  try {
    if (navigator.share && window.matchMedia("(pointer: coarse)").matches) {
      await navigator.share({title: document.title, url});
    } else {
      await navigator.clipboard.writeText(url);
      const toast = document.getElementById("share-toast");
      toast.querySelector("span").textContent = "Luxero link copied.";
      toast.classList.add("visible");
      window.clearTimeout(toastTimeout);
      toastTimeout = window.setTimeout(() => toast.classList.remove("visible"), 3000);
    }
  } catch (error) {
    if (error.name === "AbortError") return;
    const dialog = document.getElementById("copy-dialog");
    const input = document.getElementById("copy-url");
    input.value = url;
    dialog.showModal();
    input.focus();
    input.select();
  }
});
