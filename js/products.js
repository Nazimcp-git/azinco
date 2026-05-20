/**
 * ========================================
 * Azinco Interiors — Product Loader
 * ========================================
 * Fetches products from JSONBin and renders
 * them with lazy loading, skeleton placeholders,
 * infinite scroll, and magnific popup gallery.
 *
 * Uses ImageKit CDN URLs for optimized delivery.
 */

var Products = (function () {
  var allProducts = [];
  var currentIndex = 0;
  var gridEl = null;
  var loadMoreBtn = null;
  var lazyObserver = null;

  async function init() {
    gridEl = document.getElementById("productGrid");
    loadMoreBtn = document.getElementById("loadMore");
    if (!gridEl) return;

    _showSkeletons(CONFIG.PAGE_SIZE);
    await _fetchProducts();
    _removeSkeletons();

    if (allProducts.length === 0) {
      _showEmpty();
      return;
    }

    _loadNextBatch();
    _setupInfiniteScroll();

    if (loadMoreBtn) {
      loadMoreBtn.addEventListener("click", function () {
        _loadNextBatch();
      });
    }
  }

  /**
   * Fetch products from JSONBin.
   */
  async function _fetchProducts() {
    try {
      var res = await fetch(CONFIG.JSONBIN_API_URL + "/b/" + CONFIG.JSONBIN_BIN_ID + "/latest", {
        headers: { "X-Master-Key": CONFIG.JSONBIN_MASTER_KEY }
      });
      if (!res.ok) throw new Error("HTTP " + res.status);

      var data = await res.json();
      allProducts = data.record || [];

      // Ensure allProducts is an array
      if (!Array.isArray(allProducts)) allProducts = [];

      // Filter out placeholder entries
      allProducts = allProducts.filter(function (p) { return p.title && p.image; });
      // Sort latest first
      allProducts.sort(function (a, b) {
        return (b.createdAt || 0) - (a.createdAt || 0);
      });
    } catch (err) {
      console.error("Failed to load products:", err);
      allProducts = [];
    }
  }

  function _loadNextBatch() {
    if (currentIndex >= allProducts.length) return;
    var batch = allProducts.slice(currentIndex, currentIndex + CONFIG.PAGE_SIZE);
    _renderProducts(batch);
    currentIndex += CONFIG.PAGE_SIZE;
    _updateBtn();
  }

  function _renderProducts(products) {
    products.forEach(function (product) {
      var imageUrl = product.image || "";

      // ImageKit auto-optimization: add transforms for thumbnails
      var thumbUrl = imageUrl;
      if (imageUrl.indexOf("imagekit.io") > -1) {
        thumbUrl = imageUrl + "?tr=w-600,q-80,f-webp";
      }
      var fullUrl = imageUrl;
      if (imageUrl.indexOf("imagekit.io") > -1) {
        fullUrl = imageUrl + "?tr=q-90,f-auto";
      }

      var div = document.createElement("div");
      div.className = "image-box";

      var link = document.createElement("a");
      link.href = fullUrl;
      link.title = product.title || "";
      link.className = "popup-link";

      var placeholder = document.createElement("div");
      placeholder.className = "image-placeholder";

      var img = document.createElement("img");
      img.setAttribute("data-src", thumbUrl);
      img.alt = product.title || "Azinco Product";
      img.loading = "lazy";

      img.onload = function () {
        if (placeholder.parentNode) placeholder.remove();
        img.style.opacity = "1";
      };
      img.onerror = function () {
        if (placeholder.parentNode) placeholder.remove();
        img.style.opacity = "1";
      };

      var titleDiv = document.createElement("div");
      titleDiv.className = "image-title";
      titleDiv.innerText = product.title || "";

      link.appendChild(placeholder);
      link.appendChild(img);
      link.appendChild(titleDiv);
      div.appendChild(link);
      gridEl.appendChild(div);

      _observeImage(img);
    });

    _initPopup();
  }

  function _observeImage(img) {
    if (!lazyObserver) {
      lazyObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            var el = entry.target;
            var src = el.getAttribute("data-src");
            if (src) { el.src = src; el.removeAttribute("data-src"); }
            lazyObserver.unobserve(el);
          }
        });
      }, { rootMargin: "200px" });
    }
    lazyObserver.observe(img);
  }

  function _setupInfiniteScroll() {
    if (!loadMoreBtn) return;
    var obs = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting && currentIndex < allProducts.length) {
        _loadNextBatch();
      }
    }, { rootMargin: "300px" });
    obs.observe(loadMoreBtn);
  }

  function _initPopup() {
    if (typeof $ !== "undefined" && $.fn.magnificPopup) {
      $(".popup-link").magnificPopup({
        type: "image",
        gallery: { enabled: true },
        zoom: { enabled: true, duration: 300, easing: "ease-in-out",
          opener: function (el) { return el.is("img") ? el : el.find("img"); }
        }
      });
    }
  }

  function _showSkeletons(n) {
    for (var i = 0; i < n; i++) {
      var s = document.createElement("div");
      s.className = "image-box skeleton-box";
      s.innerHTML = '<div class="image-placeholder"></div>';
      gridEl.appendChild(s);
    }
  }

  function _removeSkeletons() {
    gridEl.querySelectorAll(".skeleton-box").forEach(function (s) { s.remove(); });
  }

  function _showEmpty() {
    if (loadMoreBtn) loadMoreBtn.style.display = "none";
    gridEl.innerHTML =
      '<div class="products-empty" style="grid-column:1/-1;">' +
        '<div class="empty-icon">🛋️</div>' +
        '<p>Products coming soon. Stay tuned!</p>' +
      '</div>';
  }

  function _updateBtn() {
    if (!loadMoreBtn) return;
    loadMoreBtn.style.display = currentIndex >= allProducts.length ? "none" : "inline-block";
  }

  return { init: init };
})();

document.addEventListener("DOMContentLoaded", function () {
  Products.init();
});
