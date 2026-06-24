/* Almanca Aşkına — V15.2
   Eski Less is More katmanı nötrlendi. Güncel vitrin js/vitrine-refresh.js üzerinden çalışır. */
(function(){
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  window.addEventListener("load", function(){
    if (!location.hash || location.hash === "#home") {
      setTimeout(function(){ window.scrollTo(0,0); }, 0);
    }
  });
})();
