// ============================================================
// MADFAT STORE — Google Apps Script Backend
// Paste seluruh file ini ke Google Apps Script editor
// Deploy sebagai Web App: Execute as "Me", Access "Anyone"
// ============================================================

const ADMIN_PASSWORD = "madfat123"; // Ganti password admin Anda di sini

// Helper: Get admin password dynamically from Settings sheet or fallback to constant
function getAdminPassword() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheetSettings = ss.getSheetByName("Settings");
    if (sheetSettings) {
      const settingsData = sheetSettings.getDataRange().getValues();
      for (let i = 1; i < settingsData.length; i++) {
        if (String(settingsData[i][0]).trim() === "password") {
          return String(settingsData[i][1]).trim();
        }
      }
    }
  } catch (e) {
    // Fallback
  }
  return ADMIN_PASSWORD;
}

// Helper: Get admin email dynamically from Settings sheet or fallback to script owner email
function getAdminEmail() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheetSettings = ss.getSheetByName("Settings");
    if (sheetSettings) {
      const settingsData = sheetSettings.getDataRange().getValues();
      for (let i = 1; i < settingsData.length; i++) {
        if (String(settingsData[i][0]).trim() === "admin_email") {
          return String(settingsData[i][1]).trim();
        }
      }
    }
  } catch (e) {
    // Fallback
  }
  return Session.getEffectiveUser().getEmail();
}

// ============================================================
// doGet — Ambil data dari sheet mana saja
// Query param: ?sheet=Products | WebsitePackages | Transactions | Settings
// ============================================================
function doGet(e) {
  try {
    const sheetName = (e && e.parameter && e.parameter.sheet) ? e.parameter.sheet : "Products";

    // Protection: Prevent reading Transactions and Settings sheets without valid admin password
    if (sheetName === "Transactions" || sheetName === "Settings") {
      const password = (e && e.parameter && e.parameter.password) ? e.parameter.password : "";
      if (password !== getAdminPassword()) {
        return jsonResponse({ status: "error", message: "Akses ditolak! Password admin tidak valid." });
      }
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(sheetName);

    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      if (sheetName === "Categories") {
        sheet.appendRow(["id", "name"]);
      } else if (sheetName === "Products") {
        sheet.appendRow(["id", "name", "category", "price", "sub", "description", "icon", "color", "hot", "bestSeller", "image", "isOutOfStock"]);
      } else if (sheetName === "WebsitePackages") {
        sheet.appendRow(["id", "name", "priceText", "price", "sub", "features", "isFeatured", "badge", "categoryName", "btnText", "isOutOfStock"]);
      } else if (sheetName === "Transactions") {
        sheet.appendRow(["orderId", "customerName", "customerEmail", "items", "totalAmount", "status", "createdAt"]);
      } else if (sheetName === "Settings") {
        sheet.appendRow(["key", "value"]);
      }
    }

    const data = sheet.getDataRange().getValues();
    if (data.length < 2) {
      return jsonResponse({ status: "success", data: [] });
    }

    const headers = data[0];
    const rows = data.slice(1);

    const result = rows
      .filter(row => row[0] !== "" && row[0] !== null && row[0] !== undefined) // skip baris kosong
      .map(row => {
        let obj = {};
        headers.forEach((header, index) => {
          let val = row[index];

          // Tipe numerik
          if (header === "price" || header === "totalAmount") {
            val = val !== "" && val !== null ? Number(val) : 0;
          }

          // Tipe boolean
          if (header === "hot" || header === "bestSeller" || header === "isFeatured" || header === "isOutOfStock") {
            val = val === true || val === "TRUE" || val === "true" || val === 1;
          }

          // Tipe array (features — pisah koma)
          if (header === "features") {
            if (typeof val === "string" && val.trim() !== "") {
              val = val.split(",").map(f => f.trim()).filter(f => f !== "");
            } else if (!Array.isArray(val)) {
              val = [];
            }
          }

          // String fallback
          if (val === null || val === undefined) val = "";

          obj[header] = val;
        });
        return obj;
      });

    return jsonResponse({ status: "success", data: result });

  } catch (err) {
    return jsonResponse({ status: "error", message: "doGet error: " + err.message });
  }
}

// ============================================================
// doPost — Semua operasi CRUD + Auth
// ============================================================
function doPost(e) {
  let postData;
  try {
    postData = JSON.parse(e.postData.contents);
  } catch (err) {
    return jsonResponse({ status: "error", message: "JSON tidak valid: " + err.message });
  }

  const { action, password, pin, newPin, product, id, status, sheetName, email, otp, newPassword, newEmail } = postData;

  // ----------------------------------------------------------
  // PUBLIC: Simpan transaksi baru (tidak butuh auth)
  // ----------------------------------------------------------
  if (action === "create_transaction") {
    try {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const sheet = ss.getSheetByName("Transactions");

      if (!sheet) {
        return jsonResponse({ status: "error", message: "Sheet 'Transactions' tidak ditemukan." });
      }

      const headers = sheet.getDataRange().getValues()[0];
      
      // Helper to get value matching header name case/space insensitively
      const getVal = function(prod, headerName) {
        if (!prod) return "";
        const cleanHeader = String(headerName).replace(/[\s_-]/g, "").toLowerCase();
        for (let key in prod) {
          const cleanKey = String(key).replace(/[\s_-]/g, "").toLowerCase();
          if (cleanKey === cleanHeader) {
            return prod[key];
          }
        }
        return "";
      };

      const rowValues = headers.map(header => {
        let val = getVal(product, header);
        return (val !== undefined && val !== null) ? val : "";
      });

      sheet.appendRow(rowValues);
      return jsonResponse({ status: "success", message: "Transaksi berhasil disimpan." });

    } catch (err) {
      return jsonResponse({ status: "error", message: "Gagal simpan transaksi: " + err.message });
    }
  }

  // ----------------------------------------------------------
  // PUBLIC: Auth & Password Reset Actions via Gmail OTP (bypasses admin password check)
  // ----------------------------------------------------------
  const registeredEmail = getAdminEmail().toLowerCase().trim();

  if (action === "verify_admin_login") {
    if (!email || !password) {
      return jsonResponse({ status: "error", message: "Email dan password diperlukan." });
    }
    if (email.toLowerCase().trim() !== registeredEmail || password !== getAdminPassword()) {
      return jsonResponse({ status: "error", message: "Gmail atau Password admin salah." });
    }
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    CacheService.getScriptCache().put("login_otp_" + email.toLowerCase().trim(), otpCode, 300);
    try {
      MailApp.sendEmail(email, "MADFAT Secure Login OTP", "Kode OTP Login Admin Anda adalah: " + otpCode + "\n\nKode ini hanya berlaku selama 5 menit. Jangan bagikan kode ini kepada siapapun.");
      return jsonResponse({ status: "otp_sent", message: "OTP login berhasil dikirim ke Gmail." });
    } catch (mailErr) {
      return jsonResponse({ status: "error", message: "Gagal mengirim email: " + mailErr.message });
    }
  }

  if (action === "verify_login_otp") {
    if (!email || !otp) {
      return jsonResponse({ status: "error", message: "Email dan OTP diperlukan." });
    }
    const cachedOtp = CacheService.getScriptCache().get("login_otp_" + email.toLowerCase().trim());
    if (cachedOtp && cachedOtp === String(otp).trim()) {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const sheetSettings = ss.getSheetByName("Settings");
      let currentPin = "300319"; // default fallback
      if (sheetSettings) {
        const settingsData = sheetSettings.getDataRange().getValues();
        for (let i = 1; i < settingsData.length; i++) {
          if (String(settingsData[i][0]).trim() === "pin") {
            currentPin = String(settingsData[i][1]).trim();
            break;
          }
        }
      }
      return jsonResponse({ status: "success", message: "OTP valid.", password: getAdminPassword(), pin: currentPin });
    }
    return jsonResponse({ status: "error", message: "Kode OTP salah atau telah kedaluwarsa." });
  }

  if (action === "send_reset_otp") {
    if (!email || email.toLowerCase().trim() !== registeredEmail) {
      return jsonResponse({ status: "error", message: "Email tidak terdaftar sebagai admin." });
    }
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    CacheService.getScriptCache().put("reset_otp_" + email.toLowerCase().trim(), otpCode, 300);
    try {
      MailApp.sendEmail(email, "MADFAT Reset Password OTP", "Kode OTP untuk RESET PASSWORD Admin Anda adalah: " + otpCode + "\n\nKode ini hanya berlaku selama 5 menit. Jangan bagikan kode ini kepada siapapun.");
      return jsonResponse({ status: "success", message: "OTP reset password berhasil dikirim." });
    } catch (mailErr) {
      return jsonResponse({ status: "error", message: "Gagal mengirim email: " + mailErr.message });
    }
  }

  if (action === "reset_password_otp") {
    if (!email || !otp || !newPassword) {
      return jsonResponse({ status: "error", message: "Data tidak lengkap." });
    }
    const cachedOtp = CacheService.getScriptCache().get("reset_otp_" + email.toLowerCase().trim());
    if (cachedOtp && cachedOtp === String(otp).trim()) {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      let sheetSettings = ss.getSheetByName("Settings");
      if (!sheetSettings) {
        sheetSettings = ss.insertSheet("Settings");
        sheetSettings.appendRow(["key", "value"]);
      }
      const data = sheetSettings.getDataRange().getValues();
      let passwordRow = -1;
      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]).trim() === "password") {
          passwordRow = i + 1;
          break;
        }
      }
      if (passwordRow !== -1) {
        sheetSettings.getRange(passwordRow, 2).setValue(newPassword);
      } else {
        sheetSettings.appendRow(["password", newPassword]);
      }
      return jsonResponse({ status: "success", message: "Password berhasil diubah." });
    }
    return jsonResponse({ status: "error", message: "Kode OTP salah atau telah kedaluwarsa." });
  }

  // ----------------------------------------------------------
  // STEP 1: Verifikasi Password Admin
  // ----------------------------------------------------------
  if (password !== getAdminPassword()) {
    return jsonResponse({ status: "error", message: "Password admin tidak valid!" });
  }

  // Hanya cek password (sebelum PIN)
  if (action === "verify") {
    return jsonResponse({ status: "success", message: "Password valid." });
  }

  // ----------------------------------------------------------
  // Ambil PIN dari sheet Settings
  // ----------------------------------------------------------
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheetSettings = ss.getSheetByName("Settings");

  let currentPin = "300319"; // fallback default PIN
  if (sheetSettings) {
    const settingsData = sheetSettings.getDataRange().getValues();
    for (let i = 1; i < settingsData.length; i++) {
      if (String(settingsData[i][0]).trim() === "pin") {
        currentPin = String(settingsData[i][1]).trim();
        break;
      }
    }
  }

  // ----------------------------------------------------------
  // STEP 2: Verifikasi PIN untuk semua aksi admin
  // ----------------------------------------------------------
  if (String(pin).trim() !== currentPin) {
    return jsonResponse({ status: "error", message: "PIN keamanan tidak valid!" });
  }

  // Hanya verifikasi PIN
  if (action === "verify_pin") {
    return jsonResponse({ status: "success", message: "PIN valid." });
  }

  // ----------------------------------------------------------
  // Update PIN di Settings
  // ----------------------------------------------------------
  if (action === "update_pin") {
    if (!sheetSettings) {
      return jsonResponse({ status: "error", message: "Sheet 'Settings' tidak ditemukan. Buat tab bernama 'Settings' terlebih dahulu." });
    }

    if (!newPin || String(newPin).length !== 6 || isNaN(Number(newPin))) {
      return jsonResponse({ status: "error", message: "PIN baru harus berupa 6 digit angka." });
    }

    const data = sheetSettings.getDataRange().getValues();
    let pinRow = -1;
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]).trim() === "pin") {
        pinRow = i + 1;
        break;
      }
    }

    if (pinRow !== -1) {
      sheetSettings.getRange(pinRow, 2).setValue(newPin);
    } else {
      sheetSettings.appendRow(["pin", newPin]);
    }

    return jsonResponse({ status: "success", message: "PIN berhasil diperbarui." });
  }

  // ----------------------------------------------------------
  // Update Admin Email di Settings
  // ----------------------------------------------------------
  if (action === "update_admin_email") {
    if (!sheetSettings) {
      return jsonResponse({ status: "error", message: "Sheet 'Settings' tidak ditemukan." });
    }
    if (!newEmail || !newEmail.includes("@")) {
      return jsonResponse({ status: "error", message: "Email tidak valid." });
    }
    const data = sheetSettings.getDataRange().getValues();
    let emailRow = -1;
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]).trim() === "admin_email") {
        emailRow = i + 1;
        break;
      }
    }
    if (emailRow !== -1) {
      sheetSettings.getRange(emailRow, 2).setValue(newEmail);
    } else {
      sheetSettings.appendRow(["admin_email", newEmail]);
    }
    return jsonResponse({ status: "success", message: "Email admin berhasil diperbarui." });
  }

  // ----------------------------------------------------------
  // CRUD: Upsert (tambah/edit) ke Products atau WebsitePackages
  // ----------------------------------------------------------
  if (action === "upsert") {
    try {
      const targetSheetName = sheetName || "Products";
      let targetSheet = ss.getSheetByName(targetSheetName);

      if (!targetSheet) {
        targetSheet = ss.insertSheet(targetSheetName);
        if (targetSheetName === "Categories") {
          targetSheet.appendRow(["id", "name"]);
        } else if (targetSheetName === "Products") {
          targetSheet.appendRow(["id", "name", "category", "price", "sub", "description", "icon", "color", "hot", "bestSeller", "image", "isOutOfStock"]);
        } else if (targetSheetName === "WebsitePackages") {
          targetSheet.appendRow(["id", "name", "priceText", "price", "sub", "features", "isFeatured", "badge", "categoryName", "btnText", "isOutOfStock"]);
        } else if (targetSheetName === "Transactions") {
          targetSheet.appendRow(["orderId", "customerName", "customerEmail", "items", "totalAmount", "status", "createdAt"]);
        } else if (targetSheetName === "Settings") {
          targetSheet.appendRow(["key", "value"]);
        }
      }

      const data = targetSheet.getDataRange().getValues();
      const headers = data[0];

      // Cek apakah ID sudah ada (update) atau belum (insert)
      let rowIndex = -1;
      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]).trim() === String(product.id).trim()) {
          rowIndex = i + 1;
          break;
        }
      }

      // Susun nilai baris sesuai urutan header di sheet
      const rowValues = headers.map(header => {
        let val = product[header];

        // Array features → string CSV
        if (header === "features" && Array.isArray(val)) {
          val = val.join(", ");
        }

        // Boolean → TRUE/FALSE string
        if (header === "hot" || header === "bestSeller" || header === "isFeatured" || header === "isOutOfStock") {
          val = val === true || val === "true" || val === 1 ? "TRUE" : "FALSE";
        }

        return (val !== undefined && val !== null) ? val : "";
      });

      if (rowIndex !== -1) {
        targetSheet.getRange(rowIndex, 1, 1, headers.length).setValues([rowValues]);
        return jsonResponse({ status: "success", message: "Data berhasil diperbarui." });
      } else {
        targetSheet.appendRow(rowValues);
        return jsonResponse({ status: "success", message: "Data baru berhasil ditambahkan." });
      }

    } catch (err) {
      return jsonResponse({ status: "error", message: "Gagal upsert: " + err.message });
    }
  }

  // ----------------------------------------------------------
  // CRUD: Hapus baris dari Products atau WebsitePackages
  // ----------------------------------------------------------
  if (action === "delete") {
    try {
      const targetSheetName = sheetName || "Products";
      let targetSheet = ss.getSheetByName(targetSheetName);

      if (!targetSheet) {
        targetSheet = ss.insertSheet(targetSheetName);
        if (targetSheetName === "Categories") {
          targetSheet.appendRow(["id", "name"]);
        } else if (targetSheetName === "Products") {
          targetSheet.appendRow(["id", "name", "category", "price", "sub", "description", "icon", "color", "hot", "bestSeller", "image", "isOutOfStock"]);
        } else if (targetSheetName === "WebsitePackages") {
          targetSheet.appendRow(["id", "name", "priceText", "price", "sub", "features", "isFeatured", "badge", "categoryName", "btnText", "isOutOfStock"]);
        }
      }

      const data = targetSheet.getDataRange().getValues();
      let rowIndex = -1;

      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]).trim() === String(id).trim()) {
          rowIndex = i + 1;
          break;
        }
      }

      if (rowIndex !== -1) {
        targetSheet.deleteRow(rowIndex);
        return jsonResponse({ status: "success", message: "Data berhasil dihapus." });
      }

      return jsonResponse({ status: "error", message: "Data dengan ID '" + id + "' tidak ditemukan." });

    } catch (err) {
      return jsonResponse({ status: "error", message: "Gagal hapus: " + err.message });
    }
  }

  // ----------------------------------------------------------
  // Update status transaksi (PENDING / SUCCESS / CANCELLED)
  // ----------------------------------------------------------
  if (action === "update_status") {
    try {
      const sheetTransactions = ss.getSheetByName("Transactions");

      if (!sheetTransactions) {
        return jsonResponse({ status: "error", message: "Sheet 'Transactions' tidak ditemukan." });
      }

      const data = sheetTransactions.getDataRange().getValues();
      const headers = data[0];

      // Cari kolom "status" secara dinamis
      const statusColIndex = headers.indexOf("status");
      if (statusColIndex === -1) {
        return jsonResponse({ status: "error", message: "Kolom 'status' tidak ditemukan di sheet Transactions." });
      }

      // Cari baris berdasarkan orderId (kolom pertama)
      let rowIndex = -1;
      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]).trim() === String(id).trim()) {
          rowIndex = i + 1;
          break;
        }
      }

      if (rowIndex !== -1) {
        sheetTransactions.getRange(rowIndex, statusColIndex + 1).setValue(status);
        return jsonResponse({ status: "success", message: "Status transaksi berhasil diperbarui." });
      }

      return jsonResponse({ status: "error", message: "Transaksi dengan ID '" + id + "' tidak ditemukan." });

    } catch (err) {
      return jsonResponse({ status: "error", message: "Gagal update status: " + err.message });
    }
  }

  return jsonResponse({ status: "error", message: "Action tidak dikenal: " + action });
}

// ============================================================
// Helper: Buat response JSON dengan header CORS
// ============================================================
function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
