// Licensed under the MIT license.
// Copyright 2014 Luís Almeida
// https://github.com/luis-almeida/unveil

;(function($) {

  $.fn.unveil = function(opts) {

    opts = opts || {};

    var $w = $(window),
        $c = opts.container || $w,
        th = opts.threshold || 0,
        wh = $w.height(),
        retina = window.devicePixelRatio > 1,
        attrib = retina ? "data-src-retina" : "data-src",
        images = this,
        withRetry = opts.withRetry || false,
        loaded;

    var listen = (function(event, callback) {
      return withRetry ? this.on(event, callback) : this.once(event, callback);
    }).bind(this);

    listen("unveil", function() {
      if (opts.custom) return;
      var $img = $(this), src = $img.attr(attrib);
      src = src || $img.attr("data-src");
      if (src) {
        if ($img.prop("tagName") === "IMG") {
          $img.attr("src", src).trigger("unveiled");
        } else {
          $("<img/>").attr("src", src)
            .load(function() {
              $(this).remove(); // prevent memory leaks
              $img.css("background-image", "url("+ src +")");
              $img.trigger("unveil:bg:load:complete");
            })
            .error(function() {
              $img.trigger("unveil:bg:error");
            });
        }
      }
    });

    function unveil() {
      var inview = images.filter(function() {
        var $e = $(this);
        if ($e.is(":hidden")) return;

        var wt = $w.scrollTop(),
            wb = wt + wh,
            ct = $c !== $w ? wt - $c.offset().top : 0,
            et = $e.offset().top + ct,
            eb = et + $e.height();

        return eb >= wt - th && et <= wb + th;
      });

      loaded = inview.trigger("unveil");
      images = images.not(loaded);
    }

    function resize() {
      wh = $w.height();
      unveil();
    }

    function debounce(fn) {
      var timer;
      return function() {
        if (timer) clearTimeout(timer);
        timer = setTimeout(fn, opts.debounce || 0);
      };
    }

    $c.on({
      "resize.unveil": debounce(resize),
      "scroll.unveil": debounce(unveil),
      "lookup.unveil": unveil
    });

    unveil();

    return this;

  };

})(window.jQuery || window.Zepto);
