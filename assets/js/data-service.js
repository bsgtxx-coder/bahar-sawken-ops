import { appConfig } from "./config.js";

const defaultState = () => ({
  currentUser: {
    id: 1,
    name: "Bahar Sawken Admin",
    email: "ahmed@baharsawken.com",
    password: "admin123",
    role: "Admin",
    stage: "SystemAdmin",
    defaultPage: "dashboard",
    inheritsRolePermissions: true,
    permissions: {
      adminPanel: true,
      manageUsers: true,
      manageStages: true,
      archiveRequests: true,
      deleteRequests: true,
      editAllRequests: true,
      readOnly: false,
      accessDashboard: true,
      accessRequests: true,
      accessNewRequest: true,
      accessReferences: true,
      accessAccounts: true,
      accessReports: true,
      accessArchive: true,
      accessWorkflow: true
    }
  },
  uiSettings: {
    fontScale: 1,
    radiusScale: 1,
    blurStrength: 24,
    layoutDensity: "balanced",
    compactMode: false,
    stickyTopbar: true,
    globalSearchQuery: ""
  },
  users: [
    {
      id: 1,
      name: "Bahar Sawken Admin",
      email: "ahmed@baharsawken.com",
      password: "admin123",
      role: "Admin",
      stage: "SystemAdmin",
      defaultPage: "dashboard",
      inheritsRolePermissions: true,
      permissions: {
        adminPanel: true,
        manageUsers: true,
        manageStages: true,
        archiveRequests: true,
        deleteRequests: true,
        editAllRequests: true,
        readOnly: false,
        accessDashboard: true,
        accessRequests: true,
        accessNewRequest: true,
        accessReferences: true,
        accessAccounts: true,
        accessReports: true,
        accessArchive: true,
        accessWorkflow: true
      }
    },
    {
      id: 2,
      name: "Invoice Reviewer",
      email: "review@baharsawken.com",
      password: "review123",
      role: "Reviewer",
      stage: "InvoiceReview",
      defaultPage: "requests",
      inheritsRolePermissions: true,
      permissions: {
        adminPanel: false,
        manageUsers: false,
        manageStages: false,
        archiveRequests: false,
        deleteRequests: false,
        editAllRequests: false,
        readOnly: false,
        accessDashboard: true,
        accessRequests: true,
        accessNewRequest: false,
        accessReferences: false,
        accessAccounts: false,
        accessReports: true,
        accessArchive: false,
        accessWorkflow: true
      }
    }
  ],
  roles: [
    {
      id: 1,
      name: "Admin",
      label: "مدير النظام",
      description: "صلاحيات كاملة لإدارة النظام",
      active: true,
      allowedStages: ["SystemAdmin"],
      visibleSections: ["basic", "finance", "custom", "documents", "history"],
      editableSections: ["basic", "finance", "custom", "documents"],
      visibleFields: [],
      editableFields: [],
      permissions: {
        adminPanel: true,
        manageUsers: true,
        manageStages: true,
        archiveRequests: true,
        deleteRequests: true,
        editAllRequests: true,
        readOnly: false,
        accessDashboard: true,
        accessRequests: true,
        accessNewRequest: true,
        accessReferences: true,
        accessAccounts: true,
        accessReports: true,
        accessArchive: true,
        accessWorkflow: true
      }
    },
    {
      id: 2,
      name: "Reviewer",
      label: "مراجع",
      description: "مراجعة الطلبات والتقارير",
      active: true,
      allowedStages: ["InvoiceReview", "FinanceReview"],
      visibleSections: ["basic", "finance", "documents", "history"],
      editableSections: ["finance", "documents"],
      visibleFields: ["sellerCompany", "importerCompany", "agent", "proformaInvoice", "finalInvoice", "invoiceValue", "blNumber", "blDate", "origin", "cooNumber", "cooDate", "commodity", "hsCode", "port", "bank", "transactionType", "importPermit", "notes", "serviceFeeRate", "serviceFeeAmount", "financeNotes"],
      editableFields: ["serviceFeeRate", "serviceFeeAmount", "financeNotes", "notes"],
      permissions: {
        adminPanel: false,
        manageUsers: false,
        manageStages: false,
        archiveRequests: false,
        deleteRequests: false,
        editAllRequests: false,
        readOnly: false,
        accessDashboard: true,
        accessRequests: true,
        accessNewRequest: false,
        accessReferences: false,
        accessAccounts: false,
        accessReports: true,
        accessArchive: false,
        accessWorkflow: true
      }
    },
    {
      id: 3,
      name: "Operator",
      label: "مشغل",
      description: "تنفيذ الأعمال التشغيلية اليومية",
      active: true,
      allowedStages: ["DataEntry", "BankProcessing"],
      visibleSections: ["basic", "documents", "custom", "history"],
      editableSections: ["basic", "documents", "custom"],
      visibleFields: [],
      editableFields: ["sellerCompany", "importerCompany", "agent", "proformaInvoice", "finalInvoice", "invoiceValue", "blNumber", "blDate", "origin", "cooNumber", "cooDate", "commodity", "hsCode", "port", "bank", "transactionType", "importPermit", "notes"],
      permissions: {
        adminPanel: false,
        manageUsers: false,
        manageStages: false,
        archiveRequests: false,
        deleteRequests: false,
        editAllRequests: false,
        readOnly: false,
        accessDashboard: true,
        accessRequests: true,
        accessNewRequest: true,
        accessReferences: false,
        accessAccounts: false,
        accessReports: false,
        accessArchive: false,
        accessWorkflow: true
      }
    },
    {
      id: 4,
      name: "Viewer",
      label: "عرض فقط",
      description: "وصول للقراءة فقط",
      active: true,
      allowedStages: [],
      visibleSections: ["basic", "finance", "custom", "documents", "history"],
      editableSections: [],
      visibleFields: [],
      editableFields: [],
      permissions: {
        adminPanel: false,
        manageUsers: false,
        manageStages: false,
        archiveRequests: false,
        deleteRequests: false,
        editAllRequests: false,
        readOnly: true,
        accessDashboard: true,
        accessRequests: true,
        accessNewRequest: false,
        accessReferences: false,
        accessAccounts: false,
        accessReports: true,
        accessArchive: false,
        accessWorkflow: true
      }
    }
  ],
  stages: [
    {
      id: 1,
      name: "DataEntry",
      label: "إدخال البيانات",
      order: 1,
      next: "InvoiceReview",
      viewFields: ["requestNo", "importerCompanyName", "finalInvoice", "invoiceValue", "blNumber", "notes"],
      editableFields: ["sellerCompany", "importerCompany", "invoice", "shipping", "documents"],
      requiredDocuments: ["bl", "finalInvoice"],
      optionalDocuments: ["proformaInvoice", "coo", "importPermit", "extra"],
      active: true
    },
    {
      id: 2,
      name: "InvoiceReview",
      label: "مراجعة الفاتورة",
      order: 2,
      next: "FinanceReview",
      viewFields: ["requestNo", "invoice", "documents", "notes", "history"],
      editableFields: ["notes", "documents"],
      requiredDocuments: ["finalInvoice"],
      optionalDocuments: ["extra"],
      active: true
    },
    {
      id: 3,
      name: "FinanceReview",
      label: "المراجعة المالية",
      order: 3,
      next: "BankProcessing",
      viewFields: ["requestNo", "invoiceValue", "serviceFeeRate", "serviceFeeAmount", "financeNotes", "history"],
      editableFields: ["finance"],
      requiredDocuments: [],
      optionalDocuments: ["extra"],
      active: true
    },
    {
      id: 4,
      name: "BankProcessing",
      label: "إجراءات البنك",
      order: 4,
      next: "Completed",
      viewFields: ["requestNo", "bank", "documents", "history"],
      editableFields: ["documents", "notes"],
      requiredDocuments: [],
      optionalDocuments: ["extra"],
      active: true
    },
    {
      id: 5,
      name: "Completed",
      label: "مكتمل",
      order: 5,
      next: null,
      viewFields: ["all"],
      editableFields: [],
      requiredDocuments: [],
      optionalDocuments: [],
      active: true
    }
  ],
  companies: [
    { id: 1, name: "Bahar Trading", country: "UAE" },
    { id: 2, name: "Red Sea Export", country: "Saudi Arabia" }
  ],
  agents: [
    {
      id: 1,
      name: "Hassan Ali",
      phone: "249912000001",
      email: "hassan.agent@baharsawken.com",
      openingBalance: 15000,
      outstandingAmount: 42000,
      serviceFeeBalance: 28000,
      notes: "وكيل رئيسي لطلبات Sawken Import"
    },
    {
      id: 2,
      name: "Amal Osman",
      phone: "249912000002",
      email: "amal.agent@baharsawken.com",
      openingBalance: 10000,
      outstandingAmount: 25000,
      serviceFeeBalance: 16000,
      notes: "تتابع ملفات Blue Nile Foods"
    },
    {
      id: 3,
      name: "Khalid Musa",
      phone: "249912000003",
      email: "khalid.agent@baharsawken.com",
      openingBalance: 5000,
      outstandingAmount: 12000,
      serviceFeeBalance: 9000,
      notes: "وكيل شركة مستوردة داخل السودان"
    }
  ],
  importerCompanies: [
    { id: 1, name: "Sawken Import", country: "Sudan", agentId: 1, agentName: "Hassan Ali" },
    { id: 2, name: "Blue Nile Foods", country: "Saudi Arabia", agentId: 2, agentName: "Amal Osman" }
  ],
  ports: [
    { id: 1, name: "Port Sudan" },
    { id: 2, name: "Jebel Ali" },
    { id: 3, name: "Dammam" }
  ],
  banks: [
    { id: 1, name: "Bank of Khartoum", branch: "Main" },
    { id: 2, name: "Faisal Islamic Bank", branch: "Corporate" },
    { id: 3, name: "Emirates NBD", branch: "Trade Finance" }
  ],
  commodities: [
    { id: 1, name: "Sugar", hsCode: "170199" },
    { id: 2, name: "Sesame", hsCode: "120740" },
    { id: 3, name: "Peanuts", hsCode: "120242" }
  ],
  customTables: [
    {
      id: 1,
      key: "customer_accounts",
      name: "حسابات العملاء",
      description: "جدول لتتبع أرصدة العملاء وحركتهم",
      columns: ["customerName", "balance", "status"],
      rows: [
        { id: 1, customerName: "Sawken Import", balance: "125000", status: "نشط" },
        { id: 2, customerName: "Blue Nile Foods", balance: "98000", status: "قيد المتابعة" }
      ],
      active: true
    }
  ],
  notifications: [
    {
      id: 1,
      title: "مرحباً بك في النظام",
      message: "ستظهر هنا الإشعارات المرتبطة بالطلبات الجديدة أو الإرجاعات أو الرسائل التشغيلية.",
      requestId: null,
      recipientStage: null,
      recipientEmail: "ahmed@baharsawken.com",
      category: "system",
      createdAt: new Date().toISOString(),
      createdByName: "System",
      createdByEmail: "system@baharsawken.local"
    }
  ],
  developmentNotes: [
    {
      id: 1,
      title: "بداية مساحة التطوير",
      details: "استخدم هذه المساحة لتسجيل أفكار التطوير والملاحظات الإدارية المهمة الخاصة بالنظام.",
      tag: "ملاحظة",
      status: "open",
      createdAt: new Date().toISOString(),
      createdByName: "System",
      createdByEmail: "system@baharsawken.local"
    }
  ],
  inputFields: [
    { id: 1, key: "sellerCompany", label: "الشركة البائعة", mode: "static", bindKey: "sellerCompany", inputType: "select", section: "basic", placeholder: "", required: true, active: true, sortOrder: 1 },
    { id: 2, key: "importerCompany", label: "الشركة المستوردة", mode: "static", bindKey: "importerCompany", inputType: "select", section: "basic", placeholder: "", required: true, active: true, sortOrder: 2 },
    { id: 3, key: "agent", label: "وكيل الشركة المستوردة في السودان", mode: "static", bindKey: "agent", inputType: "text", section: "basic", placeholder: "اسم الوكيل", required: false, active: true, sortOrder: 3 },
    { id: 4, key: "proformaInvoice", label: "رقم الفاتورة المبدئية", mode: "static", bindKey: "proformaInvoice", inputType: "text", section: "basic", placeholder: "PI-2026-001", required: false, active: true, sortOrder: 4 },
    { id: 5, key: "finalInvoice", label: "رقم الفاتورة النهائية", mode: "static", bindKey: "finalInvoice", inputType: "text", section: "basic", placeholder: "INV-2026-001", required: false, active: true, sortOrder: 5 },
    { id: 6, key: "invoiceValue", label: "قيمة الفاتورة", mode: "static", bindKey: "invoiceValue", inputType: "number", section: "basic", placeholder: "0.00", required: false, active: true, sortOrder: 6 },
    { id: 7, key: "blNumber", label: "رقم البوليصة", mode: "static", bindKey: "blNumber", inputType: "text", section: "basic", placeholder: "BL-000123", required: false, active: true, sortOrder: 7 },
    { id: 8, key: "blDate", label: "تاريخ البوليصة", mode: "static", bindKey: "blDate", inputType: "date", section: "basic", placeholder: "", required: false, active: true, sortOrder: 8 },
    { id: 9, key: "origin", label: "منشأ السلعة", mode: "static", bindKey: "origin", inputType: "text", section: "basic", placeholder: "مثال: Brazil", required: false, active: true, sortOrder: 9 },
    { id: 10, key: "cooNumber", label: "رقم شهادة المنشأ", mode: "static", bindKey: "cooNumber", inputType: "text", section: "basic", placeholder: "COO-4432", required: false, active: true, sortOrder: 10 },
    { id: 11, key: "cooDate", label: "تاريخ شهادة المنشأ", mode: "static", bindKey: "cooDate", inputType: "date", section: "basic", placeholder: "", required: false, active: true, sortOrder: 11 },
    { id: 12, key: "commodity", label: "السلعة", mode: "static", bindKey: "commodity", inputType: "select", section: "basic", placeholder: "", required: true, active: true, sortOrder: 12 },
    { id: 13, key: "hsCode", label: "HS Code", mode: "static", bindKey: "hsCode", inputType: "text", section: "basic", placeholder: "170199", required: false, active: true, sortOrder: 13 },
    { id: 14, key: "port", label: "ميناء الوصول", mode: "static", bindKey: "port", inputType: "select", section: "basic", placeholder: "", required: true, active: true, sortOrder: 14 },
    { id: 15, key: "bank", label: "البنك", mode: "static", bindKey: "bank", inputType: "select", section: "basic", placeholder: "", required: false, active: true, sortOrder: 15 },
    { id: 16, key: "transactionType", label: "نوع المعاملة", mode: "static", bindKey: "transactionType", inputType: "select", section: "basic", placeholder: "", required: false, active: true, sortOrder: 16 },
    { id: 17, key: "importPermit", label: "رقم إذن الاستيراد", mode: "static", bindKey: "importPermit", inputType: "text", section: "basic", placeholder: "IMP-8891", required: false, active: true, sortOrder: 17 },
    { id: 18, key: "notes", label: "ملاحظات", mode: "static", bindKey: "notes", inputType: "textarea", section: "basic", placeholder: "ملاحظات إضافية مرتبطة بالطلب", required: false, active: true, sortOrder: 18 },
    { id: 19, key: "serviceFeeRate", label: "سعر التختيم على 1000 دولار", mode: "static", bindKey: "serviceFeeRate", inputType: "number", section: "finance", placeholder: "200000", required: false, active: true, sortOrder: 19 },
    { id: 20, key: "serviceFeeAmount", label: "تختيم الفاتورة", mode: "static", bindKey: "serviceFeeAmount", inputType: "number", section: "finance", placeholder: "", required: false, active: true, sortOrder: 20 },
    { id: 21, key: "financeNotes", label: "ملاحظة مالية", mode: "static", bindKey: "financeNotes", inputType: "textarea", section: "finance", placeholder: "أي توضيحات خاصة بالمراجعة المالية أو المطالبة", required: false, active: true, sortOrder: 21 }
  ],
  documentCategories: [
    { id: 1, key: "proformaInvoice", label: "فاتورة مبدئية", description: "مستند الفاتورة المبدئية", active: true },
    { id: 2, key: "finalInvoice", label: "فاتورة نهائية", description: "مستند الفاتورة النهائية", active: true },
    { id: 3, key: "bl", label: "بوليصة", description: "مستند البوليصة", active: true },
    { id: 4, key: "coo", label: "شهادة منشأ", description: "مستند شهادة المنشأ", active: true },
    { id: 5, key: "importPermit", label: "إذن استيراد", description: "مستند إذن الاستيراد", active: true },
    { id: 6, key: "extra", label: "مستند إضافي", description: "أي مستند إضافي غير أساسي", active: true }
  ],
  documentNameSources: [
    { id: 1, key: "proformaInvoice", label: "رقم الفاتورة المبدئية", bindKey: "proformaInvoice", description: "يسحب الاسم من رقم الفاتورة المبدئية", active: true },
    { id: 2, key: "finalInvoice", label: "رقم الفاتورة النهائية", bindKey: "finalInvoice", description: "يسحب الاسم من رقم الفاتورة النهائية", active: true },
    { id: 3, key: "blNumber", label: "رقم البوليصة", bindKey: "blNumber", description: "يسحب الاسم من رقم البوليصة", active: true },
    { id: 4, key: "cooNumber", label: "رقم شهادة المنشأ", bindKey: "cooNumber", description: "يسحب الاسم من رقم شهادة المنشأ", active: true },
    { id: 5, key: "importPermit", label: "رقم إذن الاستيراد", bindKey: "importPermit", description: "يسحب الاسم من رقم إذن الاستيراد", active: true },
    { id: 6, key: "customTitle", label: "اسم يدوي", bindKey: "", description: "يسمح للمستخدم بإدخال اسم المستند يدوياً", active: true }
  ],
  accountEntries: [
    {
      id: 1,
      entryType: "openingBalance",
      title: "رصيد افتتاحي للخزينة",
      direction: "in",
      amount: 1500000,
      currency: "SDG",
      account: "treasury_sdg",
      partyName: "الخزينة الرئيسية",
      notes: "رصيد أول المدة",
      createdAt: "2026-04-20T09:00:00"
    },
    {
      id: 2,
      entryType: "collection",
      title: "سداد من Sawken Import",
      direction: "in",
      amount: 500000,
      currency: "SDG",
      account: "collections",
      partyName: "Sawken Import",
      requestNo: "26000000001",
      notes: "تحصيل جزئي من العميل",
      createdAt: "2026-04-23T11:30:00"
    },
    {
      id: 3,
      entryType: "expense",
      title: "منصرفات تشغيلية",
      direction: "out",
      amount: 120000,
      currency: "SDG",
      account: "expenses",
      partyName: "مصاريف تشغيل",
      notes: "مصاريف متابعة وشحن",
      createdAt: "2026-04-24T14:15:00"
    },
    {
      id: 4,
      entryType: "fxPurchase",
      title: "شراء درهم من خزينة الجنيه",
      direction: "in",
      amount: 2250,
      currency: "AED",
      account: "treasury_aed",
      sourceAccount: "treasury_sdg",
      sourceAmount: 270000,
      fxRate: 120,
      partyName: "شراء عملة",
      notes: "تم شراء الدرهم من النقدية بالجنيه",
      createdAt: "2026-04-24T16:45:00"
    }
  ],
  documentTypes: [
    {
      id: 1,
      key: "proformaInvoice",
      label: "الفاتورة المبدئية",
      category: "proformaInvoice",
      nameSource: "proformaInvoice",
      requiredStages: [],
      optionalStages: ["DataEntry"],
      allowCustomTitle: false,
      active: true
    },
    {
      id: 2,
      key: "finalInvoice",
      label: "الفاتورة النهائية",
      category: "finalInvoice",
      nameSource: "finalInvoice",
      requiredStages: ["DataEntry", "InvoiceReview"],
      optionalStages: [],
      allowCustomTitle: false,
      active: true
    },
    {
      id: 3,
      key: "bl",
      label: "البوليصة",
      category: "bl",
      nameSource: "blNumber",
      requiredStages: ["DataEntry"],
      optionalStages: [],
      allowCustomTitle: false,
      active: true
    },
    {
      id: 4,
      key: "coo",
      label: "شهادة المنشأ",
      category: "coo",
      nameSource: "cooNumber",
      requiredStages: [],
      optionalStages: ["DataEntry"],
      allowCustomTitle: false,
      active: true
    },
    {
      id: 5,
      key: "importPermit",
      label: "إذن الاستيراد",
      category: "importPermit",
      nameSource: "importPermit",
      requiredStages: [],
      optionalStages: ["DataEntry"],
      allowCustomTitle: false,
      active: true
    },
    {
      id: 6,
      key: "extra",
      label: "مستند إضافي",
      category: "extra",
      nameSource: "customTitle",
      requiredStages: [],
      optionalStages: ["DataEntry", "InvoiceReview", "FinanceReview", "BankProcessing"],
      allowCustomTitle: true,
      active: true
    }
  ],
  generationTemplates: [],
  requests: [
    {
      id: 1,
      requestNo: "26000000001",
      sellerCompanyId: 1,
      sellerCompanyName: "Bahar Trading",
      importerCompanyId: 1,
      importerCompanyName: "Sawken Import",
      agent: "Hassan Ali",
      proformaInvoice: "PI-2026-221",
      finalInvoice: "INV-2026-221",
      invoiceValue: 125000,
      blNumber: "BL-1001",
      blDate: "2026-04-18",
      origin: "Brazil",
      cooNumber: "COO-7721",
      cooDate: "2026-04-17",
      commodityId: 1,
      commodityName: "Sugar",
      hsCode: "170199",
      portId: 2,
      portName: "Jebel Ali",
      bankId: 3,
      bankName: "Emirates NBD",
      transactionType: "Cash",
      serviceFeeRate: 200000,
      serviceFeeAmount: 25000000,
      financeNotes: "تحت المراجعة الأولية",
      importPermit: "IMP-1102",
      notes: "طلب عاجل خاص بشحنة أبريل",
      stage: "DataEntry",
      status: "Draft",
      archived: false,
      createdBy: "ahmed@baharsawken.com",
      createdByName: "Bahar Sawken Admin",
      createdAt: "2026-04-21T10:30:00",
      history: [
        {
          id: "hist-1",
          action: "Created",
          fromStage: null,
          toStage: "DataEntry",
          actor: "Bahar Sawken Admin",
          actorEmail: "ahmed@baharsawken.com",
          comment: "تم إنشاء الطلب لأول مرة",
          createdAt: "2026-04-21T10:30:00"
        }
      ],
      documents: [
        {
          id: "doc-1",
          title: "BL-1001",
          category: "bl",
          stage: "DataEntry",
          fileName: "BL-1001.pdf",
          mimeType: "application/pdf",
          dataUrl: "",
          uploadedAt: "2026-04-21T10:30:00"
        }
      ]
    },
    {
      id: 2,
      requestNo: "26000000002",
      sellerCompanyId: 1,
      sellerCompanyName: "Bahar Trading",
      importerCompanyId: 2,
      importerCompanyName: "Blue Nile Foods",
      agent: "Amal Osman",
      proformaInvoice: "PI-2026-355",
      finalInvoice: "INV-2026-355",
      invoiceValue: 98000,
      blNumber: "BL-1002",
      blDate: "2026-04-20",
      origin: "Sudan",
      cooNumber: "COO-7701",
      cooDate: "2026-04-20",
      commodityId: 2,
      commodityName: "Sesame",
      hsCode: "120740",
      portId: 1,
      portName: "Port Sudan",
      bankId: 1,
      bankName: "Bank of Khartoum",
      transactionType: "Deferred",
      serviceFeeRate: 200000,
      serviceFeeAmount: 19600000,
      financeNotes: "مطالبة البنك تحسب بعد الاكتمال",
      importPermit: "IMP-1108",
      notes: "قيد التحويل للمراجعة",
      stage: "InvoiceReview",
      status: "Submitted",
      archived: false,
      createdBy: "ahmed@baharsawken.com",
      createdByName: "Bahar Sawken Admin",
      createdAt: "2026-04-20T08:00:00",
      history: [
        {
          id: "hist-2",
          action: "Created",
          fromStage: null,
          toStage: "DataEntry",
          actor: "Bahar Sawken Admin",
          actorEmail: "ahmed@baharsawken.com",
          comment: "تم إنشاء الطلب",
          createdAt: "2026-04-20T08:00:00"
        },
        {
          id: "hist-3",
          action: "Submitted",
          fromStage: "DataEntry",
          toStage: "InvoiceReview",
          actor: "Bahar Sawken Admin",
          actorEmail: "ahmed@baharsawken.com",
          comment: "تم الإرسال للمراجعة",
          createdAt: "2026-04-20T09:10:00"
        }
      ],
      documents: [
        {
          id: "doc-2",
          title: "INV-2026-355",
          category: "finalInvoice",
          stage: "DataEntry",
          fileName: "INV-2026-355.pdf",
          mimeType: "application/pdf",
          dataUrl: "",
          uploadedAt: "2026-04-20T08:00:00"
        },
        {
          id: "doc-3",
          title: "مذكرة مراجعة فاتورة",
          category: "extra",
          stage: "InvoiceReview",
          fileName: "invoice-review-note.pdf",
          mimeType: "application/pdf",
          dataUrl: "",
          uploadedAt: "2026-04-21T09:10:00"
        }
      ]
    },
    {
      id: 3,
      requestNo: "26000000003",
      sellerCompanyId: 1,
      sellerCompanyName: "Bahar Trading",
      importerCompanyId: 2,
      importerCompanyName: "Sawken Import",
      agent: "Hassan Ali",
      proformaInvoice: "PI-2026-487",
      finalInvoice: "INV-2026-487",
      invoiceValue: 176500,
      blNumber: "BL-1003",
      blDate: "2026-04-22",
      origin: "Sudan",
      cooNumber: "COO-7751",
      cooDate: "2026-04-21",
      commodityId: 3,
      commodityName: "Peanuts",
      hsCode: "120242",
      portId: 3,
      portName: "Dammam",
      bankId: 2,
      bankName: "Faisal Islamic Bank",
      transactionType: "Deferred",
      serviceFeeRate: 200000,
      serviceFeeAmount: 35300000,
      financeNotes: "مطالبة دفع آجل على المستورد بعد الاكتمال",
      importPermit: "IMP-1115",
      notes: "الطلب مكتمل وجاهز للأرشفة",
      stage: "Completed",
      status: "Completed",
      archived: false,
      createdBy: "ahmed@baharsawken.com",
      createdByName: "Bahar Sawken Admin",
      createdAt: "2026-04-18T14:15:00",
      history: [
        {
          id: "hist-4",
          action: "Created",
          fromStage: null,
          toStage: "DataEntry",
          actor: "Bahar Sawken Admin",
          actorEmail: "ahmed@baharsawken.com",
          comment: "تم إنشاء الطلب",
          createdAt: "2026-04-18T14:15:00"
        },
        {
          id: "hist-5",
          action: "Submitted",
          fromStage: "DataEntry",
          toStage: "InvoiceReview",
          actor: "Bahar Sawken Admin",
          actorEmail: "ahmed@baharsawken.com",
          comment: "اكتملت بيانات الإدخال",
          createdAt: "2026-04-18T16:00:00"
        },
        {
          id: "hist-6",
          action: "Submitted",
          fromStage: "InvoiceReview",
          toStage: "FinanceReview",
          actor: "Invoice Reviewer",
          actorEmail: "review@baharsawken.com",
          comment: "الفاتورة مطابقة",
          createdAt: "2026-04-19T09:00:00"
        },
        {
          id: "hist-7",
          action: "Submitted",
          fromStage: "FinanceReview",
          toStage: "BankProcessing",
          actor: "Bahar Sawken Admin",
          actorEmail: "ahmed@baharsawken.com",
          comment: "تم اعتماد التختيم",
          createdAt: "2026-04-19T12:00:00"
        },
        {
          id: "hist-8",
          action: "Completed",
          fromStage: "BankProcessing",
          toStage: "Completed",
          actor: "Bahar Sawken Admin",
          actorEmail: "ahmed@baharsawken.com",
          comment: "الطلب مكتمل",
          createdAt: "2026-04-20T15:30:00"
        }
      ],
      documents: []
    }
  ]
});

class LocalDataService {
  constructor(storageKey) {
    this.storageKey = storageKey;
  }

  loadState() {
    const saved = localStorage.getItem(this.storageKey);
    if (!saved) {
      const fresh = defaultState();
      this.saveState(fresh);
      return fresh;
    }
    return JSON.parse(saved);
  }

  saveState(state) {
    localStorage.setItem(this.storageKey, JSON.stringify(state));
  }

  reset() {
    const fresh = defaultState();
    this.saveState(fresh);
    return fresh;
  }
}

class SupabaseDataService {
  constructor(config) {
    this.config = config;
    this.client = null;
  }

  ensureClient() {
    if (!this.config.supabase.url || !this.config.supabase.anonKey) {
      throw new Error("Supabase config missing in assets/js/config.js");
    }
    if (!window.supabase?.createClient) {
      throw new Error("Supabase CDN client not loaded");
    }
    if (!this.client) {
      this.client = window.supabase.createClient(
        this.config.supabase.url,
        this.config.supabase.anonKey
      );
    }
    return this.client;
  }

  async loadState() {
    const supabase = this.ensureClient();
    const { data, error } = await supabase
      .from("app_state")
      .select("state")
      .eq("id", "main")
      .maybeSingle();
    throwIfError(error);

    const fallback = defaultState();
    const nextState = data?.state && typeof data.state === "object"
      ? data.state
      : fallback;

    if (!data?.state || typeof data.state !== "object") {
      await this.saveState(nextState);
    }

    return nextState;
  }

  async saveState(state) {
    const supabase = this.ensureClient();
    const { error } = await supabase
      .from("app_state")
      .upsert(
        {
          id: "main",
          state,
          updated_at: new Date().toISOString()
        },
        { onConflict: "id" }
      );
    throwIfError(error);
    return true;
  }

  async reset() {
    const fresh = defaultState();
    await this.saveState(fresh);
    return fresh;
  }

  async createReference(type, payload) {
    const snapshot = await this.loadState();
    const collection = Array.isArray(snapshot[type]) ? snapshot[type] : [];
    const nextItem = {
      id: nextReferenceId(collection),
      ...payload,
      createdAt: payload.createdAt || new Date().toISOString(),
      updatedAt: payload.updatedAt || new Date().toISOString()
    };
    snapshot[type] = [nextItem, ...collection];
    await this.saveState(snapshot);
    return nextItem;
  }

  async upsertRequest(payload) {
    const snapshot = await this.loadState();
    const requests = Array.isArray(snapshot.requests) ? snapshot.requests : [];
    const index = requests.findIndex((item) => Number(item.id) === Number(payload.id));
    const nextRecord = {
      ...payload,
      updatedAt: new Date().toISOString()
    };

    if (index >= 0) {
      requests[index] = {
        ...requests[index],
        ...nextRecord
      };
    } else {
      requests.unshift(nextRecord);
    }

    snapshot.requests = requests;
    await this.saveState(snapshot);
    return nextRecord;
  }
}

function nextReferenceId(items) {
  return (items || []).reduce((max, item) => Math.max(max, Number(item?.id || 0)), 0) + 1;
}

function throwIfError(error) {
  if (error) throw error;
}

function mapSupabaseUser(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    stage: row.stage_name
  };
}

function mapSupabaseStage(row) {
  return {
    id: row.id,
    name: row.name,
    label: row.label,
    order: row.order_no,
    next: row.next_stage
  };
}

function mapSupabaseCompany(row) {
  return { id: row.id, name: row.name, agent: row.agent, country: row.country };
}

function mapSupabasePort(row) {
  return { id: row.id, name: row.name };
}

function mapSupabaseBank(row) {
  return { id: row.id, name: row.name, branch: row.branch };
}

function mapSupabaseCommodity(row) {
  return { id: row.id, name: row.name, hsCode: row.hs_code };
}

function mapSupabaseRequest(row) {
  return {
    id: row.id,
    requestNo: row.request_no,
    sellerCompanyId: row.seller_company_id,
    sellerCompanyName: row.seller_company_name,
    importerCompanyId: row.importer_company_id,
    importerCompanyName: row.importer_company_name,
    agent: row.agent,
    proformaInvoice: row.proforma_invoice,
    finalInvoice: row.final_invoice,
    invoiceValue: row.invoice_value,
    blNumber: row.bl_number,
    blDate: row.bl_date,
    origin: row.origin,
    cooNumber: row.coo_number,
    cooDate: row.coo_date,
    commodityId: row.commodity_id,
    commodityName: row.commodity_name,
    hsCode: row.hs_code,
    portId: row.port_id,
    portName: row.port_name,
    bankId: row.bank_id,
    bankName: row.bank_name,
    transactionType: row.transaction_type,
    serviceFeeRate: row.service_fee_rate,
    serviceFeeAmount: row.service_fee_amount,
    financeNotes: row.finance_notes,
    importPermit: row.import_permit,
    notes: row.notes,
    documents: row.documents || [],
    stage: row.stage_name,
    status: row.status,
    createdBy: row.created_by,
    createdAt: row.created_at
  };
}

function mapReferencePayload(type, payload) {
  if (type === "commodities") {
    return { name: payload.name, hs_code: payload.hsCode };
  }
  return payload;
}

function mapRequestPayload(payload) {
  return {
    id: payload.id,
    request_no: payload.requestNo,
    seller_company_id: payload.sellerCompanyId,
    seller_company_name: payload.sellerCompanyName,
    importer_company_id: payload.importerCompanyId,
    importer_company_name: payload.importerCompanyName,
    agent: payload.agent,
    proforma_invoice: payload.proformaInvoice,
    final_invoice: payload.finalInvoice,
    invoice_value: payload.invoiceValue,
    bl_number: payload.blNumber,
    bl_date: payload.blDate,
    origin: payload.origin,
    coo_number: payload.cooNumber,
    coo_date: payload.cooDate,
    commodity_id: payload.commodityId,
    commodity_name: payload.commodityName,
    hs_code: payload.hsCode,
    port_id: payload.portId,
    port_name: payload.portName,
    bank_id: payload.bankId,
    bank_name: payload.bankName,
    transaction_type: payload.transactionType,
    service_fee_rate: payload.serviceFeeRate,
    service_fee_amount: payload.serviceFeeAmount,
    finance_notes: payload.financeNotes,
    import_permit: payload.importPermit,
    notes: payload.notes,
    documents: payload.documents || [],
    stage_name: payload.stage,
    status: payload.status,
    created_by: payload.createdBy,
    created_at: payload.createdAt
  };
}

export function createDataService() {
  if (appConfig.dataMode === "supabase") {
    return new SupabaseDataService(appConfig);
  }
  return new LocalDataService(appConfig.localStorageKey);
}

export { defaultState };
