/**
 * ========================================
 * Azinco Interiors — Admin Upload
 * ========================================
 * Uploads images to ImageKit, saves metadata
 * to JSONBin. Drag-drop + compression + progress.
 */

var AdminUpload = (function () {
  var selectedFile = null;
  var isUploading = false;
  var lastHash = "";

  function init() {
    _bindEvents();
    _setupDragDrop();
  }

  function _bindEvents() {
    var fi = document.getElementById("productImage");
    if (fi) fi.addEventListener("change", function (e) { _handleFile(e.target.files[0]); });

    var form = document.getElementById("uploadForm");
    if (form) form.addEventListener("submit", function (e) { e.preventDefault(); _upload(); });

    var clr = document.getElementById("clearForm");
    if (clr) clr.addEventListener("click", _clear);
  }

  function _setupDragDrop() {
    var dz = document.getElementById("dropZone");
    if (!dz) return;
    ["dragenter","dragover"].forEach(function(ev) {
      dz.addEventListener(ev, function(e) { e.preventDefault(); dz.classList.add("drag-over"); });
    });
    ["dragleave","drop"].forEach(function(ev) {
      dz.addEventListener(ev, function(e) { e.preventDefault(); dz.classList.remove("drag-over"); });
    });
    dz.addEventListener("drop", function(e) {
      if (e.dataTransfer.files.length) _handleFile(e.dataTransfer.files[0]);
    });
    dz.addEventListener("click", function() {
      var fi = document.getElementById("productImage");
      if (fi) fi.click();
    });
  }

  function _handleFile(file) {
    if (!file) return;
    var v = ImageUtils.validate(file);
    if (!v.valid) { Toast.error(v.error); return; }
    selectedFile = file;
    _preview(file);
    var dt = document.getElementById("dropText");
    if (dt) dt.textContent = file.name + " (" + ImageUtils.formatSize(file.size) + ")";
  }

  function _preview(file) {
    var el = document.getElementById("imagePreview");
    if (!el) return;
    var r = new FileReader();
    r.onload = function(e) { el.innerHTML = '<img src="'+e.target.result+'" alt="Preview">'; el.style.display = "block"; };
    r.readAsDataURL(file);
  }

  async function _upload() {
    if (isUploading) return;
    var titleEl = document.getElementById("productTitle");
    var descEl = document.getElementById("productDescription");
    var catEl = document.getElementById("productCategory");

    var title = titleEl ? titleEl.value.trim() : "";
    var desc = descEl ? descEl.value.trim() : "";
    var cat = catEl ? catEl.value : "";

    if (!selectedFile) { Toast.error("Please select an image."); return; }
    if (!title) { Toast.error("Please enter a product title."); return; }

    // Duplicate prevention
    var hash = title + "_" + selectedFile.name + "_" + selectedFile.size;
    if (hash === lastHash) { Toast.warning("Duplicate upload detected."); return; }

    isUploading = true;
    _setBtnState(true);

    try {
      // Step 1: Compress image
      _progress(10, "Compressing image…");
      var compressed = await ImageUtils.compress(selectedFile);

      // Step 2: Upload to ImageKit
      _progress(30, "Uploading to ImageKit…");
      var imageUrl = await _uploadToImageKit(compressed, title);

      // Step 3: Save metadata to JSONBin
      _progress(70, "Saving product data…");
      await _saveToJsonBin({
        id: _generateId(),
        title: title,
        description: desc,
        category: cat,
        image: imageUrl,
        createdAt: Date.now()
      });

      _progress(100, "Done!");
      lastHash = hash;
      Toast.success("Product uploaded successfully!");

      if (typeof AdminProducts !== "undefined") AdminProducts.refresh();
      setTimeout(_clear, 600);

    } catch (err) {
      console.error("Upload failed:", err);
      Toast.error("Upload failed: " + (err.message || "Unknown error"));
      // Show retry
      var rb = document.getElementById("retryBtn");
      if (rb) { rb.style.display = "inline-block"; rb.onclick = function() { rb.style.display = "none"; _upload(); }; }
    }

    isUploading = false;
    _setBtnState(false);
  }

  /**
   * Upload image to ImageKit using their Upload API.
   * Returns the CDN URL of the uploaded image.
   */
  async function _uploadToImageKit(file, title) {
    var formData = new FormData();
    formData.append("file", file);
    formData.append("fileName", Date.now() + "_" + file.name.replace(/[^a-zA-Z0-9._-]/g, ""));
    formData.append("folder", CONFIG.IMAGEKIT_FOLDER);
    formData.append("useUniqueFileName", "true");

    // ImageKit Upload API uses Basic Auth with private key
    var authHeader = "Basic " + btoa(CONFIG.IMAGEKIT_PRIVATE_KEY + ":");

    var res = await fetch(CONFIG.IMAGEKIT_UPLOAD_URL, {
      method: "POST",
      headers: { "Authorization": authHeader },
      body: formData
    });

    if (!res.ok) {
      var errData = await res.json().catch(function() { return {}; });
      throw new Error(errData.message || "ImageKit upload failed");
    }

    var data = await res.json();
    return data.url; // CDN URL
  }

  /**
   * Save product metadata to JSONBin.
   * Reads existing array, pushes new item, updates bin.
   */
  async function _saveToJsonBin(product) {
    // Step 1: Fetch existing products
    var res = await fetch(CONFIG.JSONBIN_API_URL + "/b/" + CONFIG.JSONBIN_BIN_ID + "/latest", {
      headers: { "X-Master-Key": CONFIG.JSONBIN_MASTER_KEY }
    });

    var products = [];
    if (res.ok) {
      var data = await res.json();
      products = data.record || [];
      if (!Array.isArray(products)) products = [];
      products = products.filter(function(p) { return p.title && p.image; });
    } else {
      console.warn("Could not fetch existing products (HTTP " + res.status + "), starting fresh array.");
    }

    // Add new product
    products.push(product);

    // Small delay to avoid JSONBin free-tier rate limiting (1 req/sec)
    await new Promise(function(r) { setTimeout(r, 1200); });

    // Step 2: Update bin
    var updateRes = await fetch(CONFIG.JSONBIN_API_URL + "/b/" + CONFIG.JSONBIN_BIN_ID, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": CONFIG.JSONBIN_MASTER_KEY
      },
      body: JSON.stringify(products)
    });

    if (!updateRes.ok) {
      var errBody = await updateRes.text().catch(function() { return ""; });
      console.error("JSONBin PUT failed:", updateRes.status, errBody);
      throw new Error("JSONBin save failed (HTTP " + updateRes.status + "): " + errBody);
    }
  }

  function _generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 6);
  }

  function _progress(pct, txt) {
    var w = document.getElementById("progressWrapper");
    var b = document.getElementById("progressBar");
    var l = document.getElementById("progressText");
    if (w) w.style.display = "block";
    if (b) b.style.width = pct + "%";
    if (l) l.textContent = txt || "";
  }

  function _setBtnState(loading) {
    var btn = document.getElementById("uploadBtn");
    if (btn) { btn.disabled = loading; btn.textContent = loading ? "Uploading…" : "Upload Product"; }
  }

  function _clear() {
    selectedFile = null;
    ["productTitle","productDescription"].forEach(function(id) { var e = document.getElementById(id); if (e) e.value = ""; });
    var fi = document.getElementById("productImage"); if (fi) fi.value = "";
    var pv = document.getElementById("imagePreview"); if (pv) { pv.innerHTML = ""; pv.style.display = "none"; }
    var dt = document.getElementById("dropText"); if (dt) dt.textContent = "Drag & drop image here, or click to select";
    var pw = document.getElementById("progressWrapper"); if (pw) pw.style.display = "none";
    var pb = document.getElementById("progressBar"); if (pb) pb.style.width = "0%";
    var cat = document.getElementById("productCategory"); if (cat) cat.value = "";
  }

  return { init: init };
})();
