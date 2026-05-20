/**
 * ========================================
 * Azinco Interiors — Admin Products CRUD
 * ========================================
 * Lists, edits, and deletes products via JSONBin API.
 */

var AdminProducts = (function () {
  var products = [];
  var currentPage = 1;
  var perPage = 10;

  function init() { refresh(); }

  async function refresh() {
    var tbody = document.getElementById("productsTableBody");
    if (!tbody) return;
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:30px;color:#888;">Loading…</td></tr>';

    try {
      var res = await fetch(CONFIG.JSONBIN_API_URL + "/b/" + CONFIG.JSONBIN_BIN_ID + "/latest", {
        headers: { "X-Master-Key": CONFIG.JSONBIN_MASTER_KEY }
      });
      var data = await res.json();
      products = data.record || [];
      if (!Array.isArray(products)) products = [];
      products = products.filter(function(p) { return p.title && p.image; });
      products.sort(function(a,b) { return (b.createdAt||0) - (a.createdAt||0); });
      _render();
    } catch (err) {
      console.error("Fetch failed:", err);
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#e53e3e;">Failed to load</td></tr>';
    }
  }

  function _render() {
    var tbody = document.getElementById("productsTableBody");
    if (!tbody) return;
    tbody.innerHTML = "";

    if (products.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:30px;color:#888;">No products yet</td></tr>';
      _updatePagination();
      return;
    }

    var totalPages = Math.ceil(products.length / perPage);
    if (currentPage > totalPages) currentPage = totalPages;
    var start = (currentPage - 1) * perPage;
    var pageItems = products.slice(start, start + perPage);

    pageItems.forEach(function(p) {
      var imgSrc = p.image || "";
      // ImageKit thumbnail transform
      if (imgSrc.indexOf("imagekit.io") > -1) imgSrc += "?tr=w-80,h-80,fo-auto";

      var tr = document.createElement("tr");
      tr.innerHTML =
        '<td><img src="'+imgSrc+'" alt="" style="width:60px;height:60px;object-fit:cover;border-radius:8px;"></td>' +
        '<td><strong>'+_esc(p.title||"")+'</strong><br><small style="color:#888">'+_esc((p.description||"").substring(0,60))+'</small></td>' +
        '<td>'+(p.category||"—")+'</td>' +
        '<td>'+_formatDate(p.createdAt)+'</td>' +
        '<td class="actions-cell"></td>';

      var editBtn = document.createElement("button");
      editBtn.className = "btn-sm btn-edit";
      editBtn.textContent = "Edit";
      editBtn.onclick = function() { _editProduct(p); };

      var delBtn = document.createElement("button");
      delBtn.className = "btn-sm btn-delete";
      delBtn.textContent = "Delete";
      delBtn.onclick = function() { _deleteProduct(p.id); };

      var cell = tr.querySelector(".actions-cell");
      cell.appendChild(editBtn);
      cell.appendChild(delBtn);
      tbody.appendChild(tr);
    });

    _updatePagination();
  }

  async function _deleteProduct(id) {
    if (!confirm("Delete this product? Cannot be undone.")) return;

    products = products.filter(function(p) { return p.id !== id; });

    try {
      await _saveBin(products);
      Toast.success("Product deleted.");
      _render();
    } catch (err) {
      Toast.error("Failed to delete.");
      refresh(); // re-fetch
    }
  }

  function _editProduct(product) {
    var modal = document.getElementById("editModal");
    if (!modal) return;
    modal.style.display = "flex";

    document.getElementById("editId").value = product.id || "";
    document.getElementById("editTitle").value = product.title || "";
    document.getElementById("editDescription").value = product.description || "";
    document.getElementById("editCategory").value = product.category || "";

    var form = document.getElementById("editForm");
    form.onsubmit = async function(e) {
      e.preventDefault();
      var newTitle = document.getElementById("editTitle").value.trim();
      var newDesc = document.getElementById("editDescription").value.trim();
      var newCat = document.getElementById("editCategory").value;

      // Find and update in array
      for (var i = 0; i < products.length; i++) {
        if (products[i].id === product.id) {
          products[i].title = newTitle;
          products[i].description = newDesc;
          products[i].category = newCat;
          break;
        }
      }

      try {
        await _saveBin(products);
        modal.style.display = "none";
        Toast.success("Product updated!");
        _render();
      } catch (err) {
        Toast.error("Failed to update.");
      }
    };
  }

  // Close modal
  document.addEventListener("click", function(e) {
    if (e.target.id === "editModal" || e.target.id === "closeEditModal") {
      var m = document.getElementById("editModal");
      if (m) m.style.display = "none";
    }
  });

  /**
   * Save entire products array back to JSONBin.
   */
  async function _saveBin(data) {
    // JSONBin free tier may reject completely empty arrays
    var payload = (Array.isArray(data) && data.length === 0) ? [{"_empty": true}] : data;

    var res = await fetch(CONFIG.JSONBIN_API_URL + "/b/" + CONFIG.JSONBIN_BIN_ID, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "X-Master-Key": CONFIG.JSONBIN_MASTER_KEY
      },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      var errBody = await res.text().catch(function() { return ""; });
      console.error("JSONBin save failed:", res.status, errBody);
      throw new Error("JSONBin save failed (HTTP " + res.status + ")");
    }
  }

  function _updatePagination() {
    var totalPages = Math.max(1, Math.ceil(products.length / perPage));
    var info = document.getElementById("pageInfo");
    var prev = document.getElementById("prevPage");
    var next = document.getElementById("nextPage");
    if (info) info.textContent = "Page " + currentPage + " of " + totalPages;
    if (prev) { prev.disabled = currentPage <= 1; prev.onclick = function() { currentPage--; _render(); }; }
    if (next) { next.disabled = currentPage >= totalPages; next.onclick = function() { currentPage++; _render(); }; }
  }

  function _esc(s) { var d = document.createElement("div"); d.textContent = s; return d.innerHTML; }

  function _formatDate(ts) {
    if (!ts) return "—";
    return new Date(ts).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" });
  }

  return { init: init, refresh: refresh };
})();
