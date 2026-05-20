/**
 * ========================================
 * Azinco Interiors — Image Utilities
 * ========================================
 * Client-side image compression before upload.
 * Converts to JPEG/WebP and resizes.
 * No dependencies.
 */

var ImageUtils = {
  /**
   * Compress and resize an image File.
   *
   * @param {File} file – the original image file
   * @param {object} [opts] – options
   * @param {number} [opts.maxWidth=1600] – max width in px
   * @param {number} [opts.quality=0.82] – JPEG quality 0-1
   * @param {string} [opts.type="image/jpeg"] – output MIME type
   * @returns {Promise<File>} compressed File object
   */
  compress: function (file, opts) {
    opts = opts || {};
    var maxWidth = opts.maxWidth || CONFIG.COMPRESS_MAX_WIDTH || 1600;
    var quality = opts.quality || CONFIG.COMPRESS_QUALITY || 0.82;
    var outputType = opts.type || "image/jpeg";

    return new Promise(function (resolve, reject) {
      // Skip non-images
      if (!file.type.startsWith("image/")) {
        return resolve(file);
      }

      var reader = new FileReader();
      reader.onerror = function () { reject(new Error("Failed to read file")); };
      reader.onload = function (e) {
        var img = new Image();
        img.onerror = function () { reject(new Error("Failed to load image")); };
        img.onload = function () {
          var w = img.width;
          var h = img.height;

          // Calculate new dimensions
          if (w > maxWidth) {
            h = Math.round((h * maxWidth) / w);
            w = maxWidth;
          }

          var canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;

          var ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, w, h);

          canvas.toBlob(
            function (blob) {
              if (!blob) {
                return resolve(file); // fallback to original
              }

              // Only use compressed if it's actually smaller
              if (blob.size >= file.size) {
                return resolve(file);
              }

              var ext = outputType === "image/webp" ? ".webp" : ".jpg";
              var name = file.name.replace(/\.[^.]+$/, "") + "_compressed" + ext;
              var compressed = new File([blob], name, {
                type: outputType,
                lastModified: Date.now(),
              });

              resolve(compressed);
            },
            outputType,
            quality
          );
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  },

  /**
   * Validate a file before upload.
   *
   * @param {File} file
   * @returns {{ valid: boolean, error: string }}
   */
  validate: function (file) {
    if (!file) {
      return { valid: false, error: "No file selected" };
    }

    if (file.size > CONFIG.MAX_FILE_SIZE) {
      var sizeMB = (CONFIG.MAX_FILE_SIZE / (1024 * 1024)).toFixed(0);
      return { valid: false, error: "File too large. Max " + sizeMB + "MB" };
    }

    if (CONFIG.ALLOWED_TYPES.indexOf(file.type) === -1) {
      return {
        valid: false,
        error: "Invalid file type. Allowed: JPEG, PNG, WebP",
      };
    }

    return { valid: true, error: "" };
  },

  /**
   * Format file size for display.
   *
   * @param {number} bytes
   * @returns {string}
   */
  formatSize: function (bytes) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  },
};
