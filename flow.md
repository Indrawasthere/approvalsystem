# **APPROVAL SYSTEM - COMPLETE FLOW SUMMARY**

---

## **🎯 SYSTEM OVERVIEW**

**3-Layer Approval System dengan Rejection & Resubmit Flow**

- **Level One** → **Level Two** → **Level Three** → **COMPLETED**
- Rejection bisa terjadi di setiap level
- Auto-approve untuk editor yang udah revisi
- Email notification di setiap step

---

## **📋 MAIN FLOW (Happy Path)**

### **1. Initial Submission**
- ✅ Requester isi data di spreadsheet
- ✅ Check "Send" checkbox (Column F)
- ✅ Email dikirim ke Level One

### **2. Level One Approval**
- ✅ Level One terima email
- ✅ Klik "Approve" di email
- ✅ Status Level One → APPROVED (hijau)
- ✅ Auto-trigger email ke Level Two

### **3. Level Two Approval**
- ✅ Level Two terima email
- ✅ Klik "Approve" di email
- ✅ Status Level Two → APPROVED (hijau)
- ✅ Auto-trigger email ke Level Three

### **4. Level Three Approval**
- ✅ Level Three terima email
- ✅ Klik "Approve" di email
- ✅ Status Level Three → APPROVED (hijau)
- ✅ Overall Status → COMPLETED (hijau)
- ✅ Process selesai!

---

## **🔄 REJECTION FLOW**

### **A. Level One Reject → Requester Edit**

**Step 1: Level One Rejection**
- ❌ Level One klik "Reject" di email
- ❌ Isi rejection note
- ❌ Submit rejection

**Step 2: System Updates**
- 🔴 Level One Status → REJECTED (merah)
- 🟠 Overall Status → EDITING (orange)
- 📝 Current Editor → REQUESTER

**Step 3: Requester Edits**
- 📧 Requester terima email "Revision Required"
- 📎 Requester update attachment link
- ✅ Check "Send" checkbox

**Step 4: Auto-Resubmit**
- 🔄 Level One status AUTO-APPROVED (ga perlu approve manual lagi!)
- 📧 Email dikirim ke Level Two
- 🟡 Overall Status → PROCESSING

---

### **B. Level Two Reject → Level One Edit**

**Step 1: Level Two Rejection**
- ❌ Level Two klik "Reject" di email
- ❌ Isi rejection note
- ❌ Submit rejection

**Step 2: System Updates**
- ✅ Level One Status tetap APPROVED
- 🔴 Level Two Status → REJECTED (merah)
- 🟠 Level One Status → EDITING (orange)
- 🟠 Overall Status → EDITING (orange)
- 📝 Current Editor → LEVEL_ONE

**Step 3: Level One Edits**
- 📧 Level One terima email "Revision Required"
- 📎 Level One update attachment link
- ✅ Check "Send" checkbox

**Step 4: Auto-Resubmit**
- 🔄 Level One status AUTO-APPROVED (tetap approved)
- 🔄 Level Two status RESET → PENDING → dikirim approval email
- 📧 Email dikirim ke Level Two (badge: RESUBMIT)
- 🟡 Overall Status → PROCESSING

**Step 5: Level Two Re-Approve**
- 📧 Level Two terima email resubmit
- ✅ Klik "Approve"
- ✅ Level Two Status → APPROVED (hijau)
- 📧 Auto-trigger email ke Level Three

---

### **C. Level Three Reject → Level Two Edit**

**Step 1: Level Three Rejection**
- ❌ Level Three klik "Reject" di email
- ❌ Isi rejection note
- ❌ Submit rejection

**Step 2: System Updates**
- ✅ Level One Status tetap APPROVED
- ✅ Level Two Status tetap APPROVED
- 🔴 Level Three Status → REJECTED (merah)
- 🟠 Level Two Status → EDITING (orange)
- 🟠 Overall Status → EDITING (orange)
- 📝 Current Editor → LEVEL_TWO

**Step 3: Level Two Edits**
- 📧 Level Two terima email "Revision Required"
- 📎 Level Two update attachment link
- ✅ Check "Send" checkbox

**Step 4: Auto-Resubmit**
- 🔄 Level Two status AUTO-APPROVED (tetap approved)
- 🔄 Level Three status RESET → PENDING → dikirim approval email
- 📧 Email dikirim ke Level Three (badge: RESUBMIT)
- 🟡 Overall Status → PROCESSING

**Step 5: Level Three Re-Approve**
- 📧 Level Three terima email resubmit
- ✅ Klik "Approve"
- ✅ Level Three Status → APPROVED (hijau)
- ✅ Overall Status → COMPLETED (hijau)
- ✅ Process selesai!

---

## **🎨 STATUS COLORS**

| Status | Color | Meaning |
|--------|-------|---------|
| **PENDING** | Putih | Waiting for approval |
| **APPROVED** | 🟢 Hijau (#90EE90) | Approved successfully |
| **REJECTED** | 🔴 Merah (#FF6B6B) | Rejected, sent back |
| **EDITING** | 🟠 Orange (#FFE0B2) | Currently being edited |
| **PROCESSING** | 🟡 Kuning (#FFF2CC) | In progress |
| **COMPLETED** | 🟢 Hijau (#90EE90) | All layers approved |

---

## **📧 EMAIL NOTIFICATIONS**

### **1. Approval Request Email**
- Subject: "Approval Request - [Project Name] [Layer]"
- Content:
  - Progress bar (Level 1 → 2 → 3)
  - Project details
  - Attachment validation
  - **APPROVE** button (hijau)
  - **REJECT** button (merah)

### **2. Resubmit Email (setelah edit)**
- Subject: "Resubmit Required - [Project Name] [Layer]"
- Badge: 🔄 RESUBMIT REQUIRED
- Content sama kayak approval request

### **3. Revision Required Email (setelah reject)**
- Subject: "Document Revision Required - [Project Name]"
- Content:
  - Rejection feedback box
  - Who rejected
  - Next steps instructions
  - Reminder: "Use Send checkbox to resubmit"

---

## **⚙️ KEY FEATURES**

### **✅ Auto-Approve After Edit**
- Level yang edit **ga perlu approve manual lagi**
- Cukup check "Send" checkbox
- System auto-approve dan lanjut ke layer berikutnya

### **✅ Smart Email Routing**
- Rejection selalu kirim ke layer **sebelumnya**
- Level One reject → Requester
- Level Two reject → Level One
- Level Three reject → Level Two

### **✅ Attachment Validation**
- Support Google Drive folders
- Show file list dalam folder
- Validate folder accessibility
- Show Shared Drive vs My Drive

### **✅ Status Tracking**
- Current Editor: Siapa yang lagi edit
- Overall Status: Status keseluruhan approval
- Layer Status: Status per level approval

---

## **🔧 MENU FUNCTIONS**

| Menu Item | Function |
|-----------|----------|
| **Send Approvals** | Kirim approval email (main function) |
| **Force Send Level Two** | Manual trigger Level Two email |
| **Force Send Level Three** | Manual trigger Level Three email |
| **View Approval Pipeline** | Dashboard status semua approval |
| **Check Attachment Validation** | Validate semua attachment |
| **Fix Stuck Status** | Fix status yang stuck di PROCESSING |
| **Reset Selected Rows** | Reset row ke status awal |
| **Manual Approve** | Force approve tanpa email |
| **Debug Current Row** | Debug info untuk selected row |

---

## **🐛 FIXES YANG UDAH DILAKUKAN**

### **Problem 1: Rejection Flow**
- ✅ Level Two reject → Level One ga dapet email
- ✅ Fix: Enhanced notification function dengan null check

### **Problem 2: Status Not Updated**
- ✅ Status stuck di PROCESSING meskipun udah all approved
- ✅ Fix: Force flush + recheck completion status

### **Problem 3: Redundant Manual Approval**
- ✅ Editor harus approve manual via email (ribet!)
- ✅ Fix: Auto-approve untuk editor yang udah revisi

### **Problem 4: Rejection Note Error**
- ✅ TypeError: Cannot read 'replace' of undefined
- ✅ Fix: Sanitize rejection note dengan null check

---

## **🚀 TESTING CHECKLIST**

### **✅ Test 1: Normal Flow**
- [ ] Submit → Level One approve → Level Two approve → Level Three approve → COMPLETED

### **✅ Test 2: Level One Rejection**
- [ ] Level One reject → Requester edit → Resubmit → Auto-approve Level One → Level Two approve

### **✅ Test 3: Level Two Rejection**
- [ ] Level Two reject → Level One edit → Resubmit → Auto-approve Level One → Level Two re-approve → Level Three approve

### **✅ Test 4: Level Three Rejection**
- [ ] Level Three reject → Level Two edit → Resubmit → Auto-approve Level Two → Level Three re-approve → COMPLETED

### **✅ Test 5: Multiple Rejections**
- [ ] Level Three reject → Level Two edit → Level Three reject again → Level Two edit again → COMPLETED

---

## **📊 SPREADSHEET COLUMNS**

| Column | Name | Description |
|--------|------|-------------|
| A | Name | Requester name |
| B | Requester Email | Requester email address |
| C | Description | Project/document description |
| D | Document Type | ICC / Quotation / Proposal |
| E | Attachment | Google Drive folder link |
| F | Send | Checkbox to trigger approval |
| G | Log | System log/notes |
| H | Level One Status | PENDING/APPROVED/REJECTED/EDITING |
| I | Level Two Status | PENDING/APPROVED/REJECTED/EDITING |
| J | Level Three Status | PENDING/APPROVED/REJECTED/EDITING |
| K | Level One Email | Auto-populated dari config |
| L | Level Two Email | Auto-populated dari config |
| M | Level Three Email | Auto-populated dari config |
| N | Current Editor | REQUESTER/LEVEL_ONE/LEVEL_TWO |
| O | Overall Status | ACTIVE/PROCESSING/EDITING/COMPLETED |

---

**Itu flow lengkapnya bro! 3-layer approval dengan smart rejection handling dan auto-approve setelah revisi. Tinggal test di production Senin! 🔥**