import { appConfig } from "./config.js";
import { createDataService, defaultState } from "./data-service.js";

const dataService = createDataService();

let state = defaultState();
let currentView = "dashboard";
let currentEditRequestId = null;
let currentReferenceType = null;
let currentReferenceEditId = null;
let currentCustomTableId = null;
let currentCustomTableRowId = null;
const collapsedDatabasePanels = {};
const uploadProgressState = {};
const uploadProgressTimers = {};
const referenceFilters = {};
const documentsFilter = { search: "", from: "", to: "" };
const uiStateStorageKey = "baharSawkenOps.uiState";
const authStorageKey = "baharSawkenOps.auth";

const templateCategoryLabels = {
  proformaInvoice: "فاتورة مبدئية",
  finalInvoice: "فاتورة نهائية",
  bl: "بوليصة",
  coo: "شهادة منشأ",
  importPermit: "إذن استيراد",
  extra: "مستند إضافي"
};

const fallbackDocumentNameSourceLabels = {
  proformaInvoice: "رقم الفاتورة المبدئية",
  finalInvoice: "رقم الفاتورة النهائية",
  blNumber: "رقم البوليصة",
  cooNumber: "رقم شهادة المنشأ",
  importPermit: "رقم إذن الاستيراد",
  customTitle: "اسم يدوي"
};

const referenceConfigs = {
  companies: {
    title: "إضافة شركة مصدرة",
    editTitle: "تعديل شركة مصدرة",
    fields: [
      { key: "name", label: "اسم الشركة المصدرة", type: "text" },
      { key: "country", label: "الدولة", type: "text" }
    ]
  },
  agents: {
    title: "إضافة وكيل",
    editTitle: "تعديل وكيل",
    fields: [
      { key: "name", label: "اسم الوكيل", type: "text" },
      { key: "phone", label: "الهاتف", type: "text" },
      { key: "email", label: "البريد الإلكتروني", type: "email" }
      ,
      { key: "openingBalance", label: "الرصيد الافتتاحي", type: "number" },
      { key: "outstandingAmount", label: "إجمالي المستحقات", type: "number" },
      { key: "serviceFeeBalance", label: "رصيد رسوم الخدمات", type: "number" },
      { key: "notes", label: "ملاحظات مالية", type: "textarea", placeholder: "أي تفاصيل مالية أو ملاحظات على الوكيل" }
    ]
  },
  importerCompanies: {
    title: "إضافة شركة مستوردة",
    editTitle: "تعديل شركة مستوردة",
    fields: [
      { key: "name", label: "اسم الشركة المستوردة", type: "text" },
      { key: "country", label: "الدولة", type: "text" },
      { key: "agentId", label: "الوكيل", type: "select", optionsFromAgents: true, allowBlank: true }
    ]
  },
  ports: {
    title: "إضافة ميناء",
    editTitle: "تعديل ميناء",
    fields: [{ key: "name", label: "اسم الميناء", type: "text" }]
  },
  banks: {
    title: "إضافة بنك",
    editTitle: "تعديل بنك",
    fields: [
      { key: "name", label: "اسم البنك", type: "text" },
      { key: "branch", label: "الفرع", type: "text" }
    ]
  },
  commodities: {
    title: "إضافة سلعة",
    editTitle: "تعديل سلعة",
    fields: [
      { key: "name", label: "اسم السلعة", type: "text" },
      { key: "hsCode", label: "HS Code", type: "text" }
    ]
  },
  customTables: {
    title: "إنشاء جدول",
    editTitle: "تعديل جدول",
    fields: [
      { key: "key", label: "المعرف التقني", type: "text" },
      { key: "name", label: "اسم الجدول", type: "text" },
      { key: "description", label: "وصف الجدول", type: "textarea", placeholder: "الغرض من هذا الجدول" },
      { key: "columns", label: "الأعمدة", type: "textarea", placeholder: "name, code, amount" },
      { key: "active", label: "مفعّل", type: "boolean" }
    ]
  },
  users: {
    title: "إضافة مستخدم",
    editTitle: "تعديل مستخدم",
    fields: [
      { key: "name", label: "اسم المستخدم", type: "text" },
      { key: "email", label: "البريد الإلكتروني", type: "email" },
      { key: "password", label: "كلمة المرور", type: "password", required: false },
      { key: "role", label: "الدور", type: "select", optionsFromRoles: true },
      { key: "stage", label: "المرحلة", type: "select", optionsFromStages: true },
      { key: "inheritsRolePermissions", label: "يرث صلاحيات الدور", type: "boolean" },
      {
        key: "defaultPage",
        label: "صفحة البداية",
        type: "select",
        options: [
          { value: "dashboard", label: "لوحة التحكم" },
          { value: "requests", label: "الطلبات" },
          { value: "new-request", label: "طلب جديد" },
          { value: "references", label: "قاعدة البيانات" },
          { value: "accounts", label: "الحسابات" },
          { value: "reports", label: "تقارير" },
          { value: "archive", label: "الأرشيف" },
          { value: "workflow", label: "سير المراحل" }
        ]
      },
      { key: "adminPanel", label: "لوحة الإدارة", type: "boolean" },
      { key: "manageUsers", label: "إدارة المستخدمين", type: "boolean" },
      { key: "manageStages", label: "إدارة المراحل", type: "boolean" },
      { key: "archiveRequests", label: "أرشفة الطلبات", type: "boolean" },
      { key: "deleteRequests", label: "حذف الطلبات", type: "boolean" },
      { key: "editAllRequests", label: "تعديل كل الطلبات", type: "boolean" },
      { key: "readOnly", label: "قراءة فقط", type: "boolean" },
      { key: "accessDashboard", label: "الوصول إلى لوحة التحكم", type: "boolean" },
      { key: "accessRequests", label: "الوصول إلى الطلبات", type: "boolean" },
      { key: "accessNewRequest", label: "الوصول إلى طلب جديد", type: "boolean" },
      { key: "accessReferences", label: "الوصول إلى قاعدة البيانات", type: "boolean" },
      { key: "accessAccounts", label: "الوصول إلى الحسابات", type: "boolean" },
      { key: "accessReports", label: "الوصول إلى التقارير", type: "boolean" },
      { key: "accessArchive", label: "الوصول إلى الأرشيف", type: "boolean" },
      { key: "accessWorkflow", label: "الوصول إلى سير المراحل", type: "boolean" }
    ]
  },
  roles: {
    title: "إضافة دور",
    editTitle: "تعديل دور",
    fields: [
      { key: "name", label: "المعرف التقني", type: "text" },
      { key: "label", label: "اسم الدور", type: "text" },
      { key: "description", label: "الوصف", type: "textarea", placeholder: "وصف مختصر لهذا الدور", required: false },
      { key: "allowedStages", label: "المراحل المسموح بها", type: "textarea", placeholder: "DataEntry, InvoiceReview", required: false },
      { key: "visibleSections", label: "الأقسام الظاهرة", type: "textarea", placeholder: "basic, finance, documents, history", required: false },
      { key: "editableSections", label: "الأقسام القابلة للتعديل", type: "textarea", placeholder: "basic, finance, documents", required: false },
      { key: "visibleFields", label: "الحقول الظاهرة", type: "textarea", placeholder: "sellerCompany, importerCompany, blNumber", required: false },
      { key: "editableFields", label: "الحقول القابلة للتعديل", type: "textarea", placeholder: "notes, serviceFeeRate, serviceFeeAmount", required: false },
      { key: "adminPanel", label: "لوحة الإدارة", type: "boolean" },
      { key: "manageUsers", label: "إدارة المستخدمين", type: "boolean" },
      { key: "manageStages", label: "إدارة المراحل", type: "boolean" },
      { key: "archiveRequests", label: "أرشفة الطلبات", type: "boolean" },
      { key: "deleteRequests", label: "حذف الطلبات", type: "boolean" },
      { key: "editAllRequests", label: "تعديل كل الطلبات", type: "boolean" },
      { key: "readOnly", label: "قراءة فقط", type: "boolean" },
      { key: "accessDashboard", label: "الوصول إلى لوحة التحكم", type: "boolean" },
      { key: "accessRequests", label: "الوصول إلى الطلبات", type: "boolean" },
      { key: "accessNewRequest", label: "الوصول إلى طلب جديد", type: "boolean" },
      { key: "accessReferences", label: "الوصول إلى قاعدة البيانات", type: "boolean" },
      { key: "accessAccounts", label: "الوصول إلى الحسابات", type: "boolean" },
      { key: "accessReports", label: "الوصول إلى التقارير", type: "boolean" },
      { key: "accessArchive", label: "الوصول إلى الأرشيف", type: "boolean" },
      { key: "accessWorkflow", label: "الوصول إلى سير المراحل", type: "boolean" },
      { key: "active", label: "مفعّل", type: "boolean" }
    ]
  },
  stages: {
    title: "إضافة مرحلة",
    editTitle: "تعديل مرحلة",
    fields: [
      { key: "name", label: "الاسم التقني", type: "text" },
      { key: "label", label: "اسم المرحلة", type: "text" },
      { key: "order", label: "الترتيب", type: "number" },
      { key: "next", label: "المرحلة التالية", type: "select", optionsFromStages: true, allowBlank: true },
      { key: "viewFields", label: "الحقول المعروضة", type: "textarea", placeholder: "requestNo, importerCompanyName, notes" },
      { key: "editableFields", label: "الحقول القابلة للتعديل", type: "textarea", placeholder: "documents, notes, finance" },
      { key: "requiredDocuments", label: "المستندات المطلوبة", type: "textarea", placeholder: "bl, finalInvoice" },
      { key: "optionalDocuments", label: "المستندات الاختيارية", type: "textarea", placeholder: "extra, coo" },
      { key: "active", label: "نشطة", type: "boolean" }
    ]
  },
  documentTypes: {
    title: "إضافة مستند",
    editTitle: "تعديل مستند",
    fields: [
      { key: "key", label: "المعرف", type: "text" },
      { key: "label", label: "اسم المستند", type: "text" },
      { key: "category", label: "النوع", type: "select", optionsFromDocumentCategories: true },
      { key: "nameSource", label: "مصدر الاسم", type: "select", optionsFromDocumentNameSources: true },
      { key: "requiredStages", label: "مطلوب في المراحل", type: "textarea", placeholder: "DataEntry, InvoiceReview" },
      { key: "optionalStages", label: "اختياري في المراحل", type: "textarea", placeholder: "FinanceReview, BankProcessing" },
      { key: "allowCustomTitle", label: "اسم يدوي", type: "boolean" },
      { key: "active", label: "مفعّل", type: "boolean" }
    ]
  },
  documentCategories: {
    title: "إضافة نوع مستند",
    editTitle: "تعديل نوع مستند",
    fields: [
      { key: "key", label: "المعرف", type: "text" },
      { key: "label", label: "اسم النوع", type: "text" },
      { key: "description", label: "الوصف", type: "textarea", placeholder: "وصف مختصر لهذا النوع", required: false },
      { key: "active", label: "مفعّل", type: "boolean" }
    ]
  },
  documentNameSources: {
    title: "إضافة مصدر اسم",
    editTitle: "تعديل مصدر اسم",
    fields: [
      { key: "key", label: "المعرف", type: "text" },
      { key: "label", label: "اسم المصدر", type: "text" },
      { key: "bindKey", label: "الحقل المرتبط", type: "select", optionsFromInputFieldsBindKeys: true, allowBlank: true, required: false },
      { key: "description", label: "الوصف", type: "textarea", placeholder: "كيف يتم تسمية المستند من هذا المصدر", required: false },
      { key: "active", label: "مفعّل", type: "boolean" }
    ]
  },
  inputFields: {
    title: "إضافة حقل إدخال",
    editTitle: "تعديل حقل إدخال",
    fields: [
      { key: "key", label: "المعرف", type: "text" },
      { key: "label", label: "اسم الحقل", type: "text" },
      {
        key: "mode",
        label: "نوع الحقل",
        type: "select",
        options: [
          { value: "static", label: "حقل موجود" },
          { value: "custom", label: "حقل إضافي" }
        ]
      },
      {
        key: "bindKey",
        label: "ربط الحقل",
        type: "select",
        options: [
          "sellerCompany","importerCompany","agent","proformaInvoice","finalInvoice","invoiceValue","blNumber","blDate","origin","cooNumber","cooDate","commodity","hsCode","port","bank","transactionType","importPermit","notes","serviceFeeRate","serviceFeeAmount","financeNotes"
        ],
        allowBlank: true,
        required: false
      },
      {
        key: "inputType",
        label: "نوع الإدخال",
        type: "select",
        options: ["text", "number", "date", "textarea"]
      },
      {
        key: "section",
        label: "القسم",
        type: "select",
        options: [
          { value: "basic", label: "البيانات الأساسية" },
          { value: "finance", label: "المراجعة المالية" },
          { value: "custom", label: "حقول إضافية" }
        ]
      },
      { key: "placeholder", label: "النص الإرشادي", type: "text", required: false },
      { key: "sortOrder", label: "الترتيب", type: "number" },
      { key: "required", label: "مطلوب", type: "boolean" },
      { key: "active", label: "مفعّل", type: "boolean" }
    ]
  }
};

const pageTitles = {
  dashboard: "لوحة التحكم",
  requests: "الطلبات",
  "new-request": "طلب جديد",
  references: "قاعدة البيانات",
  accounts: "الحسابات",
  reports: "تقارير",
  archive: "الأرشيف",
  workflow: "سير المراحل"
};

const pagePermissionMap = {
  dashboard: "accessDashboard",
  requests: "accessRequests",
  "new-request": "accessNewRequest",
  references: "accessReferences",
  accounts: "accessAccounts",
  reports: "accessReports",
  archive: "accessArchive",
  workflow: "accessWorkflow"
};

const arabicIndicDigits = "٠١٢٣٤٥٦٧٨٩";
const easternArabicDigits = "۰۱۲۳۴۵۶۷۸۹";

function getDefaultPermissions() {
  return {
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
  };
}

function normalizeUserStage(userLike) {
  const stageValue = userLike?.stage;
  if (stageValue && stageValue !== "DataEntry") return stageValue;
  if (userLike?.role === "Admin" && userLike?.permissions?.adminPanel) {
    return "SystemAdmin";
  }
  return stageValue || "DataEntry";
}

function formatStageLabel(stageName) {
  if (!stageName) return "-";
  if (stageName === "SystemAdmin") return "مدير النظام";
  return getStageMeta(stageName)?.label || stageName;
}

function formatRoleLabel(roleName) {
  if (!roleName) return "-";
  return state.roles?.find((role) => role.name === roleName)?.label || roleName;
}

function getRoleDefinitionByName(roleName) {
  return (state.roles || []).find((role) => role.name === roleName) || null;
}

function getEffectivePermissions(user = state.currentUser) {
  const isSystemAdmin = user?.role === "Admin" || user?.stage === "SystemAdmin";
  if (isSystemAdmin) {
    return {
      ...getDefaultPermissions(),
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
    };
  }
  const rolePermissions = getRoleDefinitionByName(user?.role)?.permissions || {};
  return {
    ...getDefaultPermissions(),
    ...rolePermissions,
    ...((user?.permissions && user.inheritsRolePermissions !== true) ? user.permissions : {})
  };
}

function getEffectiveRoleConfig(user = state.currentUser) {
  const role = getRoleDefinitionByName(user?.role);
  return {
    allowedStages: role?.allowedStages || [],
    visibleSections: role?.visibleSections || [],
    editableSections: role?.editableSections || [],
    visibleFields: role?.visibleFields || [],
    editableFields: role?.editableFields || []
  };
}

function getDocumentCategoryOptions() {
  return (state.documentCategories || [])
    .filter((item) => item.active !== false)
    .map((item) => ({ value: item.key, label: item.label || item.key }));
}

function getDocumentNameSourceOptions() {
  return (state.documentNameSources || [])
    .filter((item) => item.active !== false)
    .map((item) => ({ value: item.key, label: item.label || item.key }));
}

function getInputFieldBindKeyOptions() {
  return (state.inputFields || [])
    .filter((item) => item.active !== false)
    .map((item) => ({ value: item.bindKey || item.key, label: item.label || item.bindKey || item.key }))
    .filter((item, index, array) => array.findIndex((candidate) => candidate.value === item.value) === index);
}

function getDocumentCategoryLabel(categoryKey) {
  return state.documentCategories?.find((item) => item.key === categoryKey)?.label || templateCategoryLabels[categoryKey] || "مستند";
}

function getDocumentNameSourceMeta(sourceKey) {
  return state.documentNameSources?.find((item) => item.key === sourceKey) || null;
}

function normalizeLoadedState(loadedState) {
  const fallback = defaultState();
  const nowIso = new Date().toISOString();
  const withAuditDates = (item, index) => ({
    ...item,
    id: item.id ?? index + 1,
    createdAt: item.createdAt || item.updatedAt || nowIso,
    updatedAt: item.updatedAt || item.createdAt || nowIso
  });
  const normalizedRoles = (loadedState.roles || fallback.roles || []).map((item, index) => ({
    ...withAuditDates(item, index),
    name: item.name || "",
    label: item.label || item.name || "",
    description: item.description || "",
    allowedStages: Array.isArray(item.allowedStages) ? item.allowedStages : splitCommaValues(item.allowedStages),
    visibleSections: Array.isArray(item.visibleSections) ? item.visibleSections : splitCommaValues(item.visibleSections),
    editableSections: Array.isArray(item.editableSections) ? item.editableSections : splitCommaValues(item.editableSections),
    visibleFields: Array.isArray(item.visibleFields) ? item.visibleFields : splitCommaValues(item.visibleFields),
    editableFields: Array.isArray(item.editableFields) ? item.editableFields : splitCommaValues(item.editableFields),
    permissions: {
      ...getDefaultPermissions(),
      ...(item.permissions || {})
    },
    active: item.active ?? true
  }));
  const getRolePermissionsForNormalization = (roleName) => normalizedRoles.find((item) => item.name === roleName)?.permissions || {};
  const resolveNormalizedUserPermissions = (user, fallbackPermissions = {}) => ({
    ...getDefaultPermissions(),
    ...(user?.inheritsRolePermissions === true
      ? getRolePermissionsForNormalization(user?.role)
      : { ...fallbackPermissions, ...(user?.permissions || {}) })
  });
  const currentUser = {
    ...fallback.currentUser,
    ...(loadedState.currentUser || {}),
    password: loadedState.currentUser?.password || fallback.currentUser.password || "123456",
    defaultPage: loadedState.currentUser?.defaultPage || fallback.currentUser.defaultPage || "dashboard",
    inheritsRolePermissions: loadedState.currentUser?.inheritsRolePermissions ?? fallback.currentUser.inheritsRolePermissions ?? true,
    stage: normalizeUserStage({
      ...fallback.currentUser,
      ...(loadedState.currentUser || {}),
      permissions: {
        ...getDefaultPermissions(),
        ...fallback.currentUser.permissions,
        ...(loadedState.currentUser?.permissions || {})
      }
    }),
    permissions: resolveNormalizedUserPermissions({
      ...fallback.currentUser,
      ...(loadedState.currentUser || {})
    }, fallback.currentUser.permissions)
  };

  const agents = (loadedState.agents || fallback.agents || []).map((agent, index) => ({
    ...(fallback.agents?.[Math.min(index, (fallback.agents?.length || 1) - 1)] || {}),
    ...withAuditDates(agent, index),
    archived: agent.archived ?? false,
    archivedAt: agent.archivedAt ?? null,
    archiveReason: agent.archiveReason ?? "",
    openingBalance: Number(agent.openingBalance ?? 0),
    outstandingAmount: Number(agent.outstandingAmount ?? 0),
    serviceFeeBalance: Number(agent.serviceFeeBalance ?? 0),
    notes: agent.notes ?? ""
  }));
  const importerCompanies = (loadedState.importerCompanies || fallback.importerCompanies || []).map((company, index) => ({
    ...withAuditDates(company, index),
    archived: company.archived ?? false,
    archivedAt: company.archivedAt ?? null,
    archiveReason: company.archiveReason ?? ""
  }));
  const documentTypes = (loadedState.documentTypes || fallback.documentTypes || []).map((item, index) => ({
    ...(fallback.documentTypes?.[Math.min(index, (fallback.documentTypes?.length || 1) - 1)] || {}),
    ...withAuditDates(item, index),
    requiredStages: Array.isArray(item.requiredStages) ? item.requiredStages : splitCommaValues(item.requiredStages),
    optionalStages: Array.isArray(item.optionalStages) ? item.optionalStages : splitCommaValues(item.optionalStages),
    allowCustomTitle: item.allowCustomTitle ?? false,
    active: item.active ?? true
  }));
  const documentCategories = (loadedState.documentCategories || fallback.documentCategories || []).map((item, index) => ({
    ...withAuditDates(item, index),
    key: item.key || "",
    label: item.label || item.key || "",
    description: item.description || "",
    active: item.active ?? true
  }));
  const documentNameSources = (loadedState.documentNameSources || fallback.documentNameSources || []).map((item, index) => ({
    ...withAuditDates(item, index),
    key: item.key || "",
    label: item.label || item.key || "",
    bindKey: item.bindKey || "",
    description: item.description || "",
    active: item.active ?? true
  }));
  const inputFields = (loadedState.inputFields || fallback.inputFields || []).map((item, index) => ({
    ...withAuditDates(item, index),
    mode: item.mode || "static",
    bindKey: item.bindKey || item.key || "",
    inputType: item.inputType || "text",
    section: item.section || "basic",
    placeholder: item.placeholder || "",
    required: item.required ?? false,
    active: item.active ?? true,
    sortOrder: Number(item.sortOrder ?? index + 1)
  }));
  const customTables = (loadedState.customTables || fallback.customTables || []).map((item, index) => ({
    ...withAuditDates(item, index),
    key: item.key || `table_${index + 1}`,
    name: item.name || "جدول جديد",
    description: item.description || "",
    columns: Array.isArray(item.columns) ? item.columns : splitCommaValues(item.columns),
    rows: Array.isArray(item.rows) ? item.rows.map((row, rowIndex) => ({ id: row.id ?? rowIndex + 1, ...row })) : [],
    active: item.active ?? true
  }));
  const accountEntries = (loadedState.accountEntries || fallback.accountEntries || []).map((item, index) => ({
    ...withAuditDates(item, index),
    entryType: item.entryType || "manual",
    title: item.title || "حركة مالية",
    direction: item.direction || "in",
    amount: Number(item.amount || 0),
    currency: item.currency || "SDG",
    account: item.account || "treasury_sdg",
    sourceAccount: item.sourceAccount || "",
    sourceAmount: Number(item.sourceAmount || 0),
    fxRate: Number(item.fxRate || 0),
    partyName: item.partyName || "",
    requestNo: item.requestNo || "",
    notes: item.notes || ""
  }));

  return {
    ...fallback,
    ...loadedState,
    currentUser,
    users: (loadedState.users || fallback.users).map((user, index) => ({
      ...fallback.users[0],
      ...withAuditDates(user, index),
      password: user.password || fallback.users[0].password || "123456",
      defaultPage: user.defaultPage || fallback.users[0].defaultPage || "dashboard",
      inheritsRolePermissions: user.inheritsRolePermissions ?? fallback.users[0].inheritsRolePermissions ?? true,
      stage: normalizeUserStage({
        ...fallback.users[0],
        ...user,
        permissions: {
          ...getDefaultPermissions(),
          ...fallback.users[0].permissions,
          ...(user.permissions || {})
        }
      }),
      permissions: resolveNormalizedUserPermissions(user, fallback.users[0].permissions)
    })),
    agents,
    importerCompanies,
    documentTypes,
    documentCategories,
    documentNameSources,
    inputFields,
    customTables,
    accountEntries,
    roles: normalizedRoles,
    companies: (loadedState.companies || fallback.companies || []).map((company, index) => ({
      ...withAuditDates(company, index),
      archived: company.archived ?? false,
      archivedAt: company.archivedAt ?? null,
      archiveReason: company.archiveReason ?? "",
      name: company.name ?? "",
      country: company.country ?? ""
    })),
    stages: (loadedState.stages || fallback.stages).map((stage, index) => ({
      ...fallback.stages[Math.min(index, fallback.stages.length - 1)],
      ...withAuditDates(stage, index),
      viewFields: Array.isArray(stage.viewFields) ? stage.viewFields : [],
      editableFields: Array.isArray(stage.editableFields) ? stage.editableFields : [],
      requiredDocuments: Array.isArray(stage.requiredDocuments) ? stage.requiredDocuments : [],
      optionalDocuments: Array.isArray(stage.optionalDocuments) ? stage.optionalDocuments : [],
      active: stage.active ?? true
    })),
    ports: (loadedState.ports || fallback.ports || []).map((item, index) => ({
      ...withAuditDates(item, index),
      name: item.name ?? ""
    })),
    banks: (loadedState.banks || fallback.banks || []).map((item, index) => ({
      ...withAuditDates(item, index),
      name: item.name ?? "",
      branch: item.branch ?? ""
    })),
    commodities: (loadedState.commodities || fallback.commodities || []).map((item, index) => ({
      ...withAuditDates(item, index),
      name: item.name ?? "",
      hsCode: item.hsCode ?? ""
    })),
    generationTemplates: loadedState.generationTemplates ?? fallback.generationTemplates ?? [],
    requests: (loadedState.requests || fallback.requests).map((request) => ({
      ...request,
      sellerCompanyId: request.sellerCompanyId ?? request.companyId ?? null,
      sellerCompanyName: request.sellerCompanyName ?? request.companyName ?? "",
      importerCompanyId: request.importerCompanyId
        ?? importerCompanies.find((company) => company.name === (request.importerCompanyName ?? request.companyName ?? ""))?.id
        ?? request.companyId
        ?? null,
      importerCompanyName: request.importerCompanyName ?? request.companyName ?? "",
      agent: request.agent
        || importerCompanies.find((company) => company.name === (request.importerCompanyName ?? request.companyName ?? ""))?.agentName
        || "",
      transactionType: request.transactionType ?? "Cash",
      serviceFeeRate: request.serviceFeeRate ?? 0,
      serviceFeeAmount: request.serviceFeeAmount ?? 0,
      financeNotes: request.financeNotes ?? "",
      archived: request.archived ?? false,
      createdByName: request.createdByName ?? currentUser.name,
      history: Array.isArray(request.history) ? request.history : [],
      documents: (request.documents || []).map((doc, index) => ({
        ...doc,
        id: doc.id || `legacy-doc-${request.id || "request"}-${index + 1}`,
        title: doc.title || doc.fileName || "مستند",
        fileName: doc.fileName || doc.originalFileName || doc.title || `document-${index + 1}`,
        originalFileName: doc.originalFileName || doc.fileName || "",
        stage: doc.stage || request.stage || "DataEntry",
        category: doc.category || doc.definitionKey || "extra",
        definitionKey: doc.definitionKey || doc.category || "",
        mimeType: doc.mimeType || "application/octet-stream",
        dataUrl: doc.dataUrl || "",
        uploadedAt: doc.uploadedAt || doc.createdAt || request.updatedAt || request.createdAt || nowIso
      })),
      customFields: request.customFields ?? {},
    }))
  };
}

function saveUiState() {
  try {
    sessionStorage.setItem(uiStateStorageKey, JSON.stringify({
      currentView,
      currentEditRequestId
    }));
  } catch (error) {
    console.warn("Unable to save UI state", error);
  }
}

function restoreUiState() {
  try {
    const raw = sessionStorage.getItem(uiStateStorageKey);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    currentView = parsed.currentView || "dashboard";
    currentEditRequestId = parsed.currentEditRequestId ?? null;
  } catch (error) {
    console.warn("Unable to restore UI state", error);
  }
}

function findUserByEmail(email) {
  return state.users.find((user) => String(user.email || "").trim().toLowerCase() === String(email || "").trim().toLowerCase());
}

function setCurrentUserFromRecord(user) {
  if (!user) return;
  const effectivePermissions = getEffectivePermissions(user);
  state.currentUser = {
    ...state.currentUser,
    ...user,
    defaultPage: user.defaultPage || "dashboard",
    permissions: effectivePermissions
  };
}

function saveAuthSession() {
  try {
    sessionStorage.setItem(authStorageKey, JSON.stringify({ userId: state.currentUser.id }));
  } catch (error) {
    console.warn("Unable to save auth session", error);
  }
}

function clearAuthSession() {
  try {
    sessionStorage.removeItem(authStorageKey);
  } catch (error) {
    console.warn("Unable to clear auth session", error);
  }
}

function restoreAuthSession() {
  try {
    const raw = sessionStorage.getItem(authStorageKey);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    const user = state.users.find((item) => item.id === parsed.userId);
    if (!user) return false;
    setCurrentUserFromRecord(user);
    return true;
  } catch (error) {
    console.warn("Unable to restore auth session", error);
    return false;
  }
}

function userCanAccessView(view, user = state.currentUser) {
  const permissionKey = pagePermissionMap[view];
  if (!permissionKey) return true;
  return Boolean(getEffectivePermissions(user)?.[permissionKey]);
}

function getAccessibleDefaultView(user = state.currentUser) {
  const preferred = user?.defaultPage || "dashboard";
  if (userCanAccessView(preferred, user)) return preferred;
  return Object.keys(pageTitles).find((view) => userCanAccessView(view, user)) || "dashboard";
}

function applyViewAccessGuard() {
  if (userCanAccessView(currentView)) return;
  currentView = getAccessibleDefaultView();
  currentEditRequestId = null;
  saveUiState();
}

function showLoginScreen() {
  document.body.classList.add("auth-locked");
  document.getElementById("loginScreen").hidden = false;
  document.querySelector(".app-shell")?.setAttribute("hidden", "hidden");
  document.getElementById("loginErrorMessage").hidden = true;
  document.getElementById("passwordRecoveryErrorMessage").hidden = true;
  closeAccountProfileDialog();
  closeReferenceDialog();
  closeDetailsDialog();
  closeTemplatePreview();
  closeAccountEntryDialog();
  closePasswordRecoveryDialog();
  setTimeout(() => {
    document.getElementById("loginEmailInput")?.focus();
  }, 0);
}

function showAppShell() {
  document.body.classList.remove("auth-locked");
  document.getElementById("loginScreen").hidden = true;
  document.querySelector(".app-shell")?.removeAttribute("hidden");
}

function openAccountProfileDialog() {
  const dialog = document.getElementById("accountProfileDialog");
  const user = state.currentUser;
  document.getElementById("accountProfileNameInput").value = user.name || "";
  document.getElementById("accountProfileEmailInput").value = user.email || "";
  document.getElementById("accountProfileRoleInput").value = formatRoleLabel(user.role);
  document.getElementById("accountProfileStageInput").value = formatStageLabel(user.stage);
  document.getElementById("accountProfileDefaultPageInput").value = getAccessibleDefaultView(user);
  document.getElementById("accountProfileCurrentPasswordInput").value = "";
  document.getElementById("accountProfileNewPasswordInput").value = "";
  document.getElementById("accountProfileConfirmPasswordInput").value = "";

  const defaultPageSelect = document.getElementById("accountProfileDefaultPageInput");
  [...defaultPageSelect.options].forEach((option) => {
    option.hidden = !userCanAccessView(option.value, user);
  });

  dialog?.showModal();
}

function closeAccountProfileDialog() {
  const dialog = document.getElementById("accountProfileDialog");
  if (dialog?.open) dialog.close();
}

function persistCurrentUserIntoUsers() {
  const index = state.users.findIndex((user) => user.id === state.currentUser.id);
  if (index >= 0) {
    state.users[index] = {
      ...state.users[index],
      ...state.currentUser,
      permissions: {
        ...getDefaultPermissions(),
        ...(state.currentUser.permissions || {})
      }
    };
  }
}

function saveAccountProfile(event) {
  event.preventDefault();
  const currentPasswordInput = document.getElementById("accountProfileCurrentPasswordInput");
  const newPasswordInput = document.getElementById("accountProfileNewPasswordInput");
  const confirmPasswordInput = document.getElementById("accountProfileConfirmPasswordInput");
  const defaultPageInput = document.getElementById("accountProfileDefaultPageInput");

  const currentPassword = currentPasswordInput.value;
  const newPassword = newPasswordInput.value.trim();
  const confirmPassword = confirmPasswordInput.value.trim();
  const defaultPage = defaultPageInput.value || getAccessibleDefaultView();

  if (!userCanAccessView(defaultPage)) {
    alert("صفحة البداية المختارة غير متاحة لهذا المستخدم.");
    return;
  }

  if (newPassword || confirmPassword) {
    if (currentPassword !== state.currentUser.password) {
      alert("كلمة المرور الحالية غير صحيحة.");
      return;
    }
    if (newPassword.length < 4) {
      alert("كلمة المرور الجديدة يجب أن تكون 4 أحرف على الأقل.");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("تأكيد كلمة المرور الجديدة غير مطابق.");
      return;
    }
    state.currentUser.password = newPassword;
  }

  state.currentUser.defaultPage = defaultPage;
  persistCurrentUserIntoUsers();
  dataService.saveState(state);
  saveAuthSession();
  closeAccountProfileDialog();
  renderApp();
  alert("تم تحديث بيانات المستخدم بنجاح.");
}

function handleLogin(event) {
  event.preventDefault();
  const email = document.getElementById("loginEmailInput").value.trim();
  const password = document.getElementById("loginPasswordInput").value;
  const errorMessage = document.getElementById("loginErrorMessage");
  const user = findUserByEmail(email);

  if (!user || user.password !== password) {
    errorMessage.hidden = false;
    return;
  }

  errorMessage.hidden = true;
  setCurrentUserFromRecord(user);
  saveAuthSession();
  currentView = getAccessibleDefaultView(user);
  currentEditRequestId = null;
  saveUiState();
  showAppShell();
  renderApp();
}

function logoutCurrentUser() {
  clearAuthSession();
  currentEditRequestId = null;
  currentView = "dashboard";
  saveUiState();
  document.getElementById("loginForm")?.reset();
  showLoginScreen();
}

function openPasswordRecoveryDialog() {
  document.getElementById("passwordRecoveryErrorMessage").hidden = true;
  document.getElementById("passwordRecoveryForm")?.reset();
  document.getElementById("passwordRecoveryEmailInput").value =
    document.getElementById("loginEmailInput")?.value.trim() || "";
  document.getElementById("passwordRecoveryDialog")?.showModal();
  setTimeout(() => {
    document.getElementById("passwordRecoveryEmailInput")?.focus();
  }, 0);
}

function closePasswordRecoveryDialog() {
  const dialog = document.getElementById("passwordRecoveryDialog");
  if (dialog?.open) dialog.close();
}

function handlePasswordRecovery(event) {
  event.preventDefault();
  const email = document.getElementById("passwordRecoveryEmailInput").value.trim();
  const name = document.getElementById("passwordRecoveryNameInput").value.trim();
  const newPassword = document.getElementById("passwordRecoveryNewPasswordInput").value.trim();
  const confirmPassword = document.getElementById("passwordRecoveryConfirmPasswordInput").value.trim();
  const errorMessage = document.getElementById("passwordRecoveryErrorMessage");

  const user = findUserByEmail(email);
  if (!user || String(user.name || "").trim() !== name) {
    errorMessage.textContent = "لم يتم العثور على مستخدم مطابق للبريد والاسم.";
    errorMessage.hidden = false;
    return;
  }

  if (newPassword.length < 4) {
    errorMessage.textContent = "كلمة المرور الجديدة يجب أن تكون 4 أحرف على الأقل.";
    errorMessage.hidden = false;
    return;
  }

  if (newPassword !== confirmPassword) {
    errorMessage.textContent = "تأكيد كلمة المرور الجديدة غير مطابق.";
    errorMessage.hidden = false;
    return;
  }

  user.password = newPassword;
  if (state.currentUser?.id === user.id) {
    state.currentUser.password = newPassword;
  }
  dataService.saveState(state);
  document.getElementById("loginEmailInput").value = user.email || email;
  document.getElementById("loginPasswordInput").value = "";
  document.getElementById("loginErrorMessage").hidden = true;
  closePasswordRecoveryDialog();
  alert("تمت إعادة تعيين كلمة المرور بنجاح. يمكنك تسجيل الدخول الآن.");
}

function hasUnsavedRequestChanges() {
  if (currentView !== "new-request") return false;

  const existing = state.requests.find((request) => request.id === currentEditRequestId);
  const sellerCompanyId = document.getElementById("sellerCompanySelect")?.value || "";
  const importerCompanyId = document.getElementById("importerCompanySelect")?.value || "";
  const proformaInvoice = document.getElementById("proformaInvoiceInput")?.value.trim() || "";
  const finalInvoice = document.getElementById("finalInvoiceInput")?.value.trim() || "";
  const invoiceValue = document.getElementById("invoiceValueInput")?.value || "";
  const blNumber = document.getElementById("blNumberInput")?.value.trim() || "";
  const blDate = document.getElementById("blDateInput")?.value || "";
  const origin = document.getElementById("originInput")?.value.trim() || "";
  const cooNumber = document.getElementById("cooNumberInput")?.value.trim() || "";
  const cooDate = document.getElementById("cooDateInput")?.value || "";
  const commodityId = document.getElementById("commoditySelect")?.value || "";
  const hsCode = document.getElementById("hsCodeInput")?.value.trim() || "";
  const portId = document.getElementById("portSelect")?.value || "";
  const bankId = document.getElementById("bankSelect")?.value || "";
  const transactionType = document.getElementById("transactionTypeSelect")?.value || "";
  const serviceFeeRate = document.getElementById("serviceFeeRateInput")?.value || "";
  const financeNotes = document.getElementById("financeNotesInput")?.value.trim() || "";
  const importPermit = document.getElementById("importPermitInput")?.value.trim() || "";
  const notes = document.getElementById("notesInput")?.value.trim() || "";
  const hasFiles = getStageDocumentDefinitions(existing?.stage || "DataEntry").some((definition) => {
    const input = document.getElementById(`uploadFile-${definition.key}`);
    return Boolean(input?.files?.length);
  });

  if (!existing) {
    return Boolean(
      sellerCompanyId || importerCompanyId || proformaInvoice || finalInvoice || invoiceValue ||
      blNumber || blDate || origin || cooNumber || cooDate || commodityId || hsCode ||
      portId || bankId || transactionType || serviceFeeRate || financeNotes || importPermit || notes || hasFiles
    );
  }

  return Boolean(
    String(existing.sellerCompanyId || "") !== String(sellerCompanyId) ||
    String(existing.importerCompanyId || "") !== String(importerCompanyId) ||
    String(existing.proformaInvoice || "") !== proformaInvoice ||
    String(existing.finalInvoice || "") !== finalInvoice ||
    String(existing.invoiceValue || "") !== String(invoiceValue) ||
    String(existing.blNumber || "") !== blNumber ||
    String(existing.blDate || "") !== blDate ||
    String(existing.origin || "") !== origin ||
    String(existing.cooNumber || "") !== cooNumber ||
    String(existing.cooDate || "") !== cooDate ||
    String(existing.commodityId || "") !== String(commodityId) ||
    String(existing.hsCode || "") !== hsCode ||
    String(existing.portId || "") !== String(portId) ||
    String(existing.bankId || "") !== String(bankId) ||
    String(existing.transactionType || "") !== transactionType ||
    String(existing.serviceFeeRate || "") !== String(serviceFeeRate) ||
    String(existing.financeNotes || "") !== financeNotes ||
    String(existing.importPermit || "") !== importPermit ||
    String(existing.notes || "") !== notes ||
    hasFiles
  );
}

async function boot() {
  try {
    state = normalizeLoadedState(await dataService.loadState());
    reconcileOperationalReferences();
    await dataService.saveState(state);
  } catch (error) {
    console.error(error);
    alert(`تعذر تحميل البيانات من ${appConfig.dataMode}. سيتم الرجوع للوضع المحلي.`);
    state = defaultState();
  }

  restoreUiState();
  try {
    bindStaticEvents();
  } catch (error) {
    console.error("Failed to bind static events", error);
  }
  const isAuthenticated = restoreAuthSession();
  if (!isAuthenticated) {
    showLoginScreen();
    return;
  }
  applyViewAccessGuard();
  showAppShell();
  try {
    renderApp();
  } catch (error) {
    console.error("Failed to render app shell", error);
  }
  if (currentView === "new-request") {
    if (currentEditRequestId) {
      const request = state.requests.find((item) => item.id === currentEditRequestId);
      if (request) hydrateForm(request);
      else clearForm();
    } else {
      clearForm();
    }
  }
}

function bindStaticEvents() {
  document.getElementById("toggleSidebarButton").addEventListener("click", toggleSidebar);
  document.getElementById("topbarPrimaryButton").addEventListener("click", handleTopbarPrimaryAction);
  document.getElementById("loginForm").addEventListener("submit", handleLogin);
  document.getElementById("openPasswordRecoveryButton").addEventListener("click", openPasswordRecoveryDialog);
  document.getElementById("closePasswordRecoveryDialogButton").addEventListener("click", closePasswordRecoveryDialog);
  document.getElementById("cancelPasswordRecoveryDialogButton").addEventListener("click", closePasswordRecoveryDialog);
  document.getElementById("passwordRecoveryForm").addEventListener("submit", handlePasswordRecovery);
  document.getElementById("openAccountDialogButton").addEventListener("click", openAccountProfileDialog);
  document.getElementById("logoutButton").addEventListener("click", logoutCurrentUser);
  document.getElementById("closeAccountProfileDialogButton").addEventListener("click", closeAccountProfileDialog);
  document.getElementById("cancelAccountProfileDialogButton").addEventListener("click", closeAccountProfileDialog);
  document.getElementById("accountProfileForm").addEventListener("submit", saveAccountProfile);
  document.getElementById("loginEmailInput").addEventListener("input", () => {
    document.getElementById("loginErrorMessage").hidden = true;
  });
  document.getElementById("loginPasswordInput").addEventListener("input", () => {
    document.getElementById("loginErrorMessage").hidden = true;
  });
  document.getElementById("passwordRecoveryEmailInput").addEventListener("input", () => {
    document.getElementById("passwordRecoveryErrorMessage").hidden = true;
  });
  document.getElementById("passwordRecoveryNameInput").addEventListener("input", () => {
    document.getElementById("passwordRecoveryErrorMessage").hidden = true;
  });
  document.getElementById("passwordRecoveryNewPasswordInput").addEventListener("input", () => {
    document.getElementById("passwordRecoveryErrorMessage").hidden = true;
  });
  document.getElementById("passwordRecoveryConfirmPasswordInput").addEventListener("input", () => {
    document.getElementById("passwordRecoveryErrorMessage").hidden = true;
  });
  document.querySelectorAll(".nav-link").forEach((button) => {
    button.addEventListener("click", () => {
      const targetView = button.dataset.view;
      if (!userCanAccessView(targetView)) return;
      currentView = targetView;
      if (targetView === "new-request") {
        currentEditRequestId = null;
        setRequestFormBusy(false);
      } else {
        currentEditRequestId = null;
      }
      saveUiState();
      renderNavigation();
      if (targetView === "new-request") clearForm();
    });
  });

  document.getElementById("requestSearchInput").addEventListener("input", renderRequestsTable);
  document.getElementById("stageFilterSelect").addEventListener("change", renderRequestsTable);
  document.getElementById("statusFilterSelect").addEventListener("change", renderRequestsTable);

  document.getElementById("importerCompanySelect").addEventListener("change", (event) => {
    syncAgentFromImporterSelection(Number(event.target.value));
  });

  document.getElementById("commoditySelect").addEventListener("change", (event) => {
    const commodity = state.commodities.find((item) => item.id === Number(event.target.value));
    if (commodity) {
      document.getElementById("hsCodeInput").value = commodity.hsCode || "";
    }
  });

  document.getElementById("invoiceValueInput").addEventListener("input", syncFinancialCalculation);
  document.getElementById("serviceFeeRateInput").addEventListener("input", syncFinancialCalculation);

  document.getElementById("resetFormButton").addEventListener("click", clearForm);

  document.getElementById("requestForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const mode = event.submitter?.dataset.submitMode || "draft";
    if (mode === "submit" && !event.currentTarget.reportValidity()) return;
    await submitRequest(mode);
  });

  document.querySelectorAll("[data-reference-modal]").forEach((button) => {
    button.addEventListener("click", () => openReferenceDialog(button.dataset.referenceModal));
  });

  document.getElementById("saveReferenceButton").addEventListener("click", saveReference);
  document.getElementById("closeReferenceDialogButton").addEventListener("click", closeReferenceDialog);
  document.getElementById("cancelReferenceDialogButton").addEventListener("click", closeReferenceDialog);
  document.getElementById("saveGenerationTemplateButton").addEventListener("click", saveGenerationTemplate);
  document.getElementById("closeTemplatePreviewButton").addEventListener("click", closeTemplatePreview);
  document.getElementById("closeTemplatePreviewFooterButton").addEventListener("click", closeTemplatePreview);
  document.getElementById("closeDetailsDialogButton").addEventListener("click", closeDetailsDialog);
  document.getElementById("closeDetailsDialogFooterButton").addEventListener("click", closeDetailsDialog);
  document.getElementById("closeCustomTableRecordDialogButton").addEventListener("click", closeCustomTableRecordDialog);
  document.getElementById("cancelCustomTableRecordDialogButton").addEventListener("click", closeCustomTableRecordDialog);
  document.getElementById("customTableRecordForm").addEventListener("submit", saveCustomTableRecord);
  document.getElementById("closeAccountEntryDialogButton").addEventListener("click", closeAccountEntryDialog);
  document.getElementById("cancelAccountEntryDialogButton").addEventListener("click", closeAccountEntryDialog);
  document.getElementById("accountEntryTypeInput").addEventListener("change", toggleAccountEntryMode);
  document.getElementById("accountEntryForm").addEventListener("submit", saveAccountEntry);
  document.getElementById("referencesGlobalSearchInput").addEventListener("input", applyReferencesGlobalSearch);
  document.getElementById("printReportsButton")?.addEventListener("click", printReportsView);

  const referencesView = document.getElementById("references-view");
  referencesView?.addEventListener("click", (event) => {
    const toggleButton = event.target.closest("[data-panel-toggle]");
    if (!toggleButton) return;
    const panelKey = toggleButton.dataset.panelToggle;
    collapsedDatabasePanels[panelKey] = !collapsedDatabasePanels[panelKey];
    setupReferencePanelToggles();
  });
  referencesView?.addEventListener("input", handleDatabaseFilterChange);
  referencesView?.addEventListener("change", handleDatabaseFilterChange);

  window.addEventListener("beforeunload", (event) => {
    saveUiState();
    if (!hasUnsavedRequestChanges()) return;
    event.preventDefault();
    event.returnValue = "";
  });
}

function renderApp() {
  safeRenderSection("topbar", renderTopbar);
  safeRenderSection("navigation", renderNavigation);
  safeRenderSection("dashboard", renderDashboard);
  safeRenderSection("requestFilters", renderRequestFilters);
  safeRenderSection("requestsTable", renderRequestsTable);
  safeRenderSection("referenceLists", renderReferenceLists);
  safeRenderSection("accounts", renderAccounts);
  safeRenderSection("reports", renderReports);
  safeRenderSection("archiveList", renderArchiveList);
  safeRenderSection("workflow", renderWorkflow);
  safeRenderSection("templateLibrary", renderTemplateLibrary);
  safeRenderSection("formOptions", populateFormOptions);
  safeRenderSection("dynamicEvents", attachDynamicEvents);
  safeRenderSection("referencesGlobalSearch", applyReferencesGlobalSearch);
  safeRenderSection("normalizeDocumentDigits", normalizeDocumentDigits);
}

function safeRenderSection(sectionName, callback) {
  try {
    callback();
  } catch (error) {
    console.error(`Render section failed: ${sectionName}`, error);
  }
}

function renderTopbar() {
  document.getElementById("currentUserName").textContent = state.currentUser.name;
  document.getElementById("currentUserRole").textContent = formatRoleLabel(state.currentUser.role);
  document.getElementById("currentUserStage").textContent = formatStageLabel(state.currentUser.stage);
  document.getElementById("pageTitle").textContent =
    currentView === "new-request" ? (currentEditRequestId ? "تعديل الطلب" : "طلب جديد") : pageTitles[currentView];
  const primaryButton = document.getElementById("topbarPrimaryButton");
  if (primaryButton) {
    const visible =
      (currentView === "accounts" && userCanAccessView("accounts")) ||
      (currentView === "references" && userCanAccessView("references")) ||
      (currentView === "requests" && userCanAccessView("new-request"));
    primaryButton.hidden = false;
    primaryButton.style.display = visible ? "inline-flex" : "none";
    primaryButton.textContent =
      currentView === "accounts" ? "إنشاء حركة" :
      currentView === "references" ? "إنشاء جدول" :
      "إنشاء طلب";
  }
}

function handleTopbarPrimaryAction() {
  if (currentView === "accounts") {
    openAccountEntryDialog();
    return;
  }
  if (currentView === "references") {
    openReferenceDialog("customTables");
    return;
  }
  if (!userCanAccessView("new-request")) return;
  currentView = "new-request";
  currentEditRequestId = null;
  setRequestFormBusy(false);
  saveUiState();
  clearForm();
  renderNavigation();
}

function printReportsView() {
  if (currentView !== "reports") {
    currentView = "reports";
    saveUiState();
    renderNavigation();
  }
  window.print();
}

function toggleSidebar() {
  document.querySelector(".sidebar")?.classList.toggle("menu-hidden");
}

function setupReferencePanelToggles() {
  const referencePanels = document.querySelectorAll("#references-view .panel:not(.reference-group-header)");
  referencePanels.forEach((panel, index) => {
    const header = panel.querySelector(".panel-header");
    const title = header?.querySelector("h3")?.textContent?.trim() || `panel-${index}`;
    const panelKey = panel.dataset.panelKey || title;
    panel.dataset.panelKey = panelKey;

    if (header && !header.querySelector("[data-panel-toggle]")) {
      const toggleButton = document.createElement("button");
      toggleButton.type = "button";
      toggleButton.className = "panel-toggle-button";
      toggleButton.dataset.panelToggle = panelKey;
      header.appendChild(toggleButton);
    }

    if (collapsedDatabasePanels[panelKey] === undefined) {
      collapsedDatabasePanels[panelKey] = true;
    }
    const isCollapsed = Boolean(collapsedDatabasePanels[panelKey]);
    panel.classList.toggle("panel-collapsed", isCollapsed);
    const toggleButton = header?.querySelector("[data-panel-toggle]");
    if (toggleButton) {
      toggleButton.textContent = isCollapsed ? "إظهار" : "إخفاء";
      toggleButton.setAttribute("aria-expanded", String(!isCollapsed));
      toggleButton.title = isCollapsed ? `إظهار ${title}` : `إخفاء ${title}`;
    }
  });
}

function renderNavigation() {
  applyViewAccessGuard();
  renderTopbar();
  document.querySelectorAll(".nav-link").forEach((button) => {
    const canAccess = userCanAccessView(button.dataset.view);
    button.hidden = !canAccess;
    button.classList.toggle("active", button.dataset.view === currentView);
  });

  document.querySelectorAll(".view").forEach((view) => view.classList.remove("active"));
  document.getElementById(`${currentView}-view`)?.classList.add("active");
  document.getElementById("formTitle").textContent = currentEditRequestId ? "تعديل طلب موجود" : "إنشاء طلب جديد";
  if (currentView === "new-request" && !currentEditRequestId) {
    setRequestFormBusy(false);
  }
  updateRequestFormContext();
  setupReferencePanelToggles();
  normalizeDocumentDigits();
}

function renderDashboard() {
  const requests = state.requests.filter((request) => !request.archived);
  document.getElementById("heroStage").textContent = formatStageLabel(state.currentUser.stage);
  document.getElementById("heroDraftsCount").textContent = requests.filter((r) => r.status === "Draft").length;
  document.getElementById("heroCompaniesCount").textContent = state.companies.length;
  document.getElementById("totalRequestsStat").textContent = requests.length;
  document.getElementById("dataEntryStat").textContent = requests.filter((r) => r.stage === "DataEntry").length;
  document.getElementById("reviewStat").textContent = requests.filter((r) =>
    ["InvoiceReview", "FinanceReview", "BankProcessing"].includes(r.stage)
  ).length;
  document.getElementById("completedStat").textContent = requests.filter((r) => r.stage === "Completed").length;

  const recentRequestsList = document.getElementById("recentRequestsList");
  recentRequestsList.innerHTML = "";
  [...requests]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 4)
    .forEach((request) => {
      const item = document.createElement("article");
      item.className = "request-item";
      item.innerHTML = `
        <div>
          <h4><button class="inline-link" type="button" data-open-request="${request.id}">${request.requestNo}</button></h4>
          <div class="request-meta">${request.importerCompanyName} • ${request.finalInvoice || request.proformaInvoice || "بدون فاتورة"}</div>
        </div>
        <div>
          <span class="status-pill status-${statusClass(request.status)}">${request.status}</span>
        </div>
      `;
      recentRequestsList.appendChild(item);
    });

  const stageTimeline = document.getElementById("stageTimeline");
  stageTimeline.innerHTML = "";
  state.stages.forEach((stage) => {
    const count = requests.filter((request) => request.stage === stage.name).length;
    const item = document.createElement("article");
      item.className = "timeline-item";
      item.innerHTML = `<strong><button class="inline-link" type="button" data-open-stage="${stage.id}">${stage.label}</button></strong><p>${count} طلب</p>`;
      stageTimeline.appendChild(item);
    });

  renderClaimsPanels();
  renderAdminPanel();
}

function renderRequestFilters() {
  const stageFilter = document.getElementById("stageFilterSelect");
  if (!stageFilter.dataset.initialized) {
    stageFilter.innerHTML = `<option value="all">كل المراحل</option>`;
    state.stages.forEach((stage) => {
      const option = document.createElement("option");
      option.value = stage.name;
      option.textContent = stage.name;
      stageFilter.appendChild(option);
    });
    stageFilter.dataset.initialized = "true";
  }

  const preferredStage = getDefaultRequestStageFilter();
  if (stageFilter && (!stageFilter.value || stageFilter.value === "all") && preferredStage !== "all") {
    stageFilter.value = preferredStage;
  }
}

function resetRequestFilters() {
  const searchInput = document.getElementById("requestSearchInput");
  const stageFilter = document.getElementById("stageFilterSelect");
  const statusFilter = document.getElementById("statusFilterSelect");
  if (searchInput) searchInput.value = "";
  if (stageFilter) stageFilter.value = getDefaultRequestStageFilter();
  if (statusFilter) statusFilter.value = "all";
}

function canCurrentUserViewAllRequests() {
  const permissions = getEffectivePermissions();
  return Boolean(permissions.adminPanel || permissions.editAllRequests || state.currentUser?.stage === "SystemAdmin");
}

function getDefaultRequestStageFilter() {
  if (canCurrentUserViewAllRequests()) return "all";
  return state.currentUser?.stage || "all";
}

function getFilteredRequests() {
  const search = document.getElementById("requestSearchInput")?.value.trim().toLowerCase() || "";
  const selectedStage = document.getElementById("stageFilterSelect")?.value || getDefaultRequestStageFilter();
  const status = document.getElementById("statusFilterSelect")?.value || "all";
  const forcedStage = canCurrentUserViewAllRequests() ? null : (state.currentUser?.stage || null);
  const stage = forcedStage || selectedStage;

  return state.requests.filter((request) => {
    if (request.archived) return false;
    const matchesSearch = !search || [
      request.requestNo,
      request.sellerCompanyName,
      request.importerCompanyName,
      request.finalInvoice,
      request.proformaInvoice,
      request.blNumber
    ].filter(Boolean).some((value) => value.toLowerCase().includes(search));

    return (stage === "all" || request.stage === stage) &&
      (status === "all" || request.status === status) &&
      matchesSearch;
  });
}

function renderRequestsTable() {
  const tableBody = document.getElementById("requestsTableBody");
  tableBody.innerHTML = "";
  const filteredRequests = getFilteredRequests();

  if (!filteredRequests.length) {
    const totalRequests = state.requests.filter((request) => !request.archived).length;
    const row = document.createElement("tr");
    row.innerHTML = `
      <td colspan="8" class="empty-table-cell">
        ${totalRequests ? "لا توجد طلبات مطابقة للفلاتر الحالية." : "لا توجد طلبات محفوظة حالياً."}
      </td>
    `;
    tableBody.appendChild(row);
    return;
  }

  filteredRequests.forEach((request) => {
    const row = document.createElement("tr");
    const invoiceLabel = request.finalInvoice || request.proformaInvoice || "-";
    row.innerHTML = `
      <td><button class="inline-link" type="button" data-open-request="${request.id}">${request.requestNo}</button></td>
      <td><button class="inline-link" type="button" data-open-company="importer:${request.importerCompanyId}">${request.importerCompanyName}</button></td>
      <td><button class="inline-link" type="button" data-open-agent="${encodeURIComponent(request.agent || "")}">${escapeHtml(request.agent || "-")}</button></td>
      <td><button class="inline-link" type="button" data-open-invoice="${request.id}">${escapeHtml(invoiceLabel)}</button></td>
      <td>${formatUsd(request.invoiceValue)}</td>
      <td>${request.stage}</td>
      <td><span class="status-pill status-${statusClass(request.status)}">${request.status}</span></td>
      <td>
        <div class="row-actions">
          <button class="link-button" data-edit-request="${request.id}">تعديل</button>
          <button class="link-button" data-archive-request="${request.id}">أرشفة</button>
          <button class="link-button danger-link" data-delete-request="${request.id}">حذف</button>
        </div>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

function renderReferenceLists() {
  renderReferenceCollectionByType("companies");
  renderReferenceCollectionByType("customTables");
  renderReferenceCollectionByType("agents");
  renderReferenceCollectionByType("importerCompanies");
  renderReferenceCollectionByType("ports");
  renderReferenceCollectionByType("banks");
  renderReferenceCollectionByType("commodities");
  renderReferenceCollectionByType("roles");
  renderReferenceCollectionByType("stages");
  renderReferenceCollectionByType("documentCategories");
  renderReferenceCollectionByType("documentNameSources");
  renderReferenceCollectionByType("documentTypes");
  renderReferenceCollectionByType("inputFields");
  renderDocumentsDatabaseTable();
}

function renderReferenceCollectionByType(type) {
  if (type === "companies") {
    renderReferenceCollection("companiesList", "companies", state.companies, (item) => `<strong>${item.name}</strong><small>${item.country || "-"}</small>`);
    return;
  }
  if (type === "customTables") {
    renderReferenceCollection("customTablesList", "customTables", state.customTables, (item) => `<strong><button class="inline-link" type="button" data-open-custom-table="${item.id}">${item.name}</button></strong><small>${item.key} • ${(item.columns || []).join(", ") || "بدون أعمدة"} • ${(item.rows || []).length} سجل • ${item.active ? "مفعّل" : "متوقف"}</small>`);
    return;
  }
  if (type === "roles") {
    renderReferenceCollection("rolesList", "roles", state.roles, (item) =>
      `<strong>${item.label || item.name}</strong><small>${item.name} • ${(item.allowedStages || []).join(", ") || "كل المراحل"} • ${item.description || "-"}</small>`);
    return;
  }
  if (type === "documentCategories") {
    renderReferenceCollection("documentCategoriesList", "documentCategories", state.documentCategories, (item) =>
      `<strong>${item.label || item.key}</strong><small>${item.key} • ${item.description || "-"}</small>`);
    return;
  }
  if (type === "documentNameSources") {
    renderReferenceCollection("documentNameSourcesList", "documentNameSources", state.documentNameSources, (item) =>
      `<strong>${item.label || item.key}</strong><small>${item.bindKey || "بدون ربط"} • ${item.description || "-"}</small>`);
    return;
  }
  if (type === "agents") {
    renderReferenceCollection("agentsList", "agents", state.agents, (item) => `<strong>${item.name}</strong><small>مستحقات ${formatCurrency(item.outstandingAmount || 0)} • خدمات ${formatCurrency(item.serviceFeeBalance || 0)}</small>`);
    return;
  }
  if (type === "importerCompanies") {
    renderReferenceCollection("importerCompaniesList", "importerCompanies", state.importerCompanies, (item) => `<strong>${item.name}</strong><small>${item.country || "-"} • ${item.agentName || "بدون وكيل"}</small>`);
    return;
  }
  if (type === "ports") {
    renderReferenceCollection("portsList", "ports", state.ports, (item) => `<strong>${item.name}</strong><small>ميناء</small>`);
    return;
  }
  if (type === "banks") {
    renderReferenceCollection("banksList", "banks", state.banks, (item) => `<strong>${item.name}</strong><small>${item.branch || "-"}</small>`);
    return;
  }
  if (type === "commodities") {
    renderReferenceCollection("commoditiesList", "commodities", state.commodities, (item) => `<strong>${item.name}</strong><small>${item.hsCode || "-"}</small>`);
    return;
  }
  if (type === "users") {
    renderReferenceCollection("usersDatabaseList", "users", state.users, (item) => `<strong>${item.name}</strong><small>${item.role} • ${item.stage}</small>`);
    return;
  }
  if (type === "stages") {
    renderReferenceCollection("stagesDatabaseList", "stages", state.stages, (item) => `<strong>${item.label}</strong><small>${item.name} • ترتيب ${item.order} • ${item.active ? "نشطة" : "معطلة"}</small>`);
    return;
  }
  if (type === "documentTypes") {
    renderReferenceCollection("documentTypesList", "documentTypes", state.documentTypes, (item) => `<strong>${item.label}</strong><small>${item.key} • ${getDocumentCategoryLabel(item.category)} • ${(getDocumentNameSourceMeta(item.nameSource)?.label || fallbackDocumentNameSourceLabels[item.nameSource] || item.nameSource)} • ${item.active ? "مفعّل" : "متوقف"}</small>`);
    return;
  }
  if (type === "inputFields") {
    renderReferenceCollection("inputFieldsList", "inputFields", state.inputFields, (item) => `<strong>${item.label}</strong><small>${item.mode === "custom" ? "إضافي" : "موجود"} • ${item.section} • ${item.active ? "مفعّل" : "متوقف"}</small>`);
  }
}

function renderDocumentsDatabaseTable() {
  const tableBody = document.getElementById("documentsDatabaseTableBody");
  if (!tableBody) return;

  const rows = state.requests
    .flatMap((request) => (request.documents || []).map((doc) => ({ request, doc })))
    .filter(({ request, doc }) => matchesDocumentsFilter(request, doc))
    .sort((a, b) => {
      const requestCompare = String(a.request.requestNo || "").localeCompare(String(b.request.requestNo || ""), "en");
      if (requestCompare !== 0) return requestCompare;
      const stageCompare = (getStageMeta(a.doc.stage)?.order || 999) - (getStageMeta(b.doc.stage)?.order || 999);
      if (stageCompare !== 0) return stageCompare;
      return resolveDocumentLinkedName(a.doc, a.request).localeCompare(resolveDocumentLinkedName(b.doc, b.request), "ar");
    });

  tableBody.innerHTML = "";

  if (!rows.length) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" class="empty-state">لا توجد مستندات محفوظة بعد</td>
      </tr>
    `;
    return;
  }

  rows.forEach(({ request, doc }) => {
    const documentName = resolveDocumentLinkedName(doc, request);
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><button class="inline-link" type="button" data-open-request="${request.id}">${escapeHtml(request.requestNo)}</button></td>
      <td>${escapeHtml(doc.stage || "-")}</td>
      <td>${escapeHtml(documentName)}</td>
      <td>${escapeHtml(getTemplateCategoryLabel(doc.category === "generated" ? doc.sourceCategory || "generated" : doc.category || "document"))}</td>
      <td>${escapeHtml(formatPreviewDate(doc.uploadedAt))}</td>
      <td>
        <div class="row-actions">
          ${doc.category === "generated" && doc.previewHtml ? `<button class="link-button" type="button" data-preview-generated-doc="${doc.id}">معاينة</button>` : `<button class="link-button" type="button" ${doc.dataUrl ? `data-preview-doc="${doc.id}"` : "disabled"}>معاينة</button>`}
          <button class="link-button" type="button" ${doc.dataUrl ? `data-open-doc="${doc.id}"` : "disabled"}>عرض</button>
          <button class="link-button" type="button" ${doc.dataUrl ? `data-download-doc="${doc.id}"` : "disabled"}>تنزيل</button>
        </div>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

function renderReferenceCollection(containerId, type, items, labelFn) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const filters = getReferenceFilterState(type);
  const filteredItems = items.filter((item) => !item.archived).filter((item) => matchesReferenceFilters(type, item));
  container.innerHTML = `
    <div class="reference-toolbar">
      <input type="search" data-reference-filter="${type}" data-filter-kind="search" placeholder="بحث سريع" value="${escapeHtml(filters.search)}">
      <input type="date" data-reference-filter="${type}" data-filter-kind="from" value="${escapeHtml(filters.from)}">
      <input type="date" data-reference-filter="${type}" data-filter-kind="to" value="${escapeHtml(filters.to)}">
    </div>
    <div class="reference-record-list"></div>
  `;
  const list = container.querySelector(".reference-record-list");
  if (!filteredItems.length) {
    list.innerHTML = `<div class="empty-state">لا توجد نتائج مطابقة</div>`;
    return;
  }
  filteredItems.forEach((item) => {
    const card = document.createElement("article");
    card.className = "reference-record";
    card.innerHTML = `
      <div>
        ${labelFn(item)}
        <small class="reference-audit">أضيف ${escapeHtml(formatPreviewDate(item.createdAt))} • عُدل ${escapeHtml(formatPreviewDate(item.updatedAt))}</small>
      </div>
      <div class="document-actions">
        <button class="link-button" type="button" data-edit-reference="${type}:${item.id}">تعديل</button>
        <button class="link-button danger-link" type="button" data-delete-reference="${type}:${item.id}">حذف</button>
      </div>
    `;
    list.appendChild(card);
  });
}

function applyReferencesGlobalSearch() {
  const searchValue = document.getElementById("referencesGlobalSearchInput")?.value.trim().toLowerCase() || "";
  const groups = document.querySelectorAll("#references-view .reference-group-block");

  groups.forEach((group) => {
    const panels = [...group.querySelectorAll(".panel")];
    let visiblePanels = 0;

    panels.forEach((panel) => {
      const text = panel.textContent.toLowerCase();
      const matches = !searchValue || text.includes(searchValue);
      panel.hidden = !matches;
      if (matches) visiblePanels += 1;
    });

    group.hidden = visiblePanels === 0;
  });
}

function renderWorkflow() {
  const workflowBoard = document.getElementById("workflowBoard");
  workflowBoard.innerHTML = "";
  state.stages.forEach((stage) => {
    const count = state.requests.filter((request) => !request.archived && request.stage === stage.name).length;
    const card = document.createElement("article");
    card.className = "workflow-step";
    card.innerHTML = `
      <span class="step-index">${stage.order}</span>
      <h4><button class="inline-link" type="button" data-open-stage="${stage.id}">${stage.label}</button></h4>
      <p><strong>${stage.name}</strong></p>
      <p>${count} طلب في هذه المرحلة</p>
      <p>${stage.next ? `المرحلة التالية: ${stage.next}` : "هذه المرحلة النهائية"}</p>
    `;
    workflowBoard.appendChild(card);
  });
}

function renderAdminPanel() {
  const panel = document.getElementById("adminPanel");
  const usersList = document.getElementById("usersAdminList");
  const stagesList = document.getElementById("stagesAdminList");
  if (!panel || !usersList || !stagesList) return;

  if (!state.currentUser.permissions?.adminPanel) {
    panel.hidden = true;
    return;
  }

  panel.hidden = false;

  usersList.innerHTML = "";
  state.users.forEach((user) => {
    const item = document.createElement("article");
    item.className = "document-item";
    item.innerHTML = `
      <div>
        <strong><button class="inline-link" type="button" data-open-user="${user.id}">${user.name}</button></strong>
        <small>${formatRoleLabel(user.role)} • ${formatStageLabel(user.stage)} • ${pageTitles[user.defaultPage] || user.defaultPage || "-"}</small>
      </div>
      <div class="document-actions">
        <span class="badge">${user.permissions?.readOnly ? "قراءة فقط" : "تعديل"}</span>
        <button class="link-button" type="button" data-edit-reference="users:${user.id}">تعديل</button>
      </div>
    `;
    usersList.appendChild(item);
  });

  stagesList.innerHTML = "";
  state.stages.forEach((stage) => {
    const requiredCount = (state.documentTypes || []).filter((item) => item.active && (item.requiredStages || []).includes(stage.name)).length;
    const item = document.createElement("article");
    item.className = "document-item";
    item.innerHTML = `
      <div>
        <strong><button class="inline-link" type="button" data-open-stage="${stage.id}">${stage.label}</button></strong>
        <small>${stage.name} • ${stage.active ? "نشطة" : "معطلة"}</small>
      </div>
      <div class="document-actions">
        <span class="badge">${requiredCount} مستند إلزامي</span>
      </div>
    `;
    stagesList.appendChild(item);
  });
}

function populateFormOptions() {
  fillSelect("sellerCompanySelect", state.companies.filter((item) => !item.archived), "name", "اختر الشركة البائعة");
  fillSelect("importerCompanySelect", state.importerCompanies.filter((item) => !item.archived), "name", "اختر الشركة المستوردة");
  fillSelect("commoditySelect", state.commodities.filter((item) => !item.archived), "name", "اختر سلعة");
  fillSelect("portSelect", state.ports.filter((item) => !item.archived), "name", "اختر ميناء");
  fillSelect("bankSelect", state.banks.filter((item) => !item.archived), "name", "اختر بنك", true);
  applyInputFieldDefinitions();
  syncAgentFromImporterSelection();
}

function fillSelect(id, items, labelKey, placeholder, allowBlank = false) {
  const select = document.getElementById(id);
  const currentValue = select.value;
  select.innerHTML = "";
  const placeholderOption = document.createElement("option");
  placeholderOption.value = "";
  placeholderOption.textContent = placeholder;
  if (!allowBlank) placeholderOption.disabled = true;
  placeholderOption.selected = true;
  select.appendChild(placeholderOption);

  items.forEach((item) => {
    const option = document.createElement("option");
    option.value = item.id;
    option.textContent = item[labelKey];
    select.appendChild(option);
  });

  if (currentValue) select.value = currentValue;
}

function attachDynamicEvents() {
  document.querySelectorAll("[data-edit-request]").forEach((button) => {
    button.onclick = () => editRequest(Number(button.dataset.editRequest));
  });
  document.querySelectorAll("[data-open-request]").forEach((button) => {
    button.onclick = () => openRequestDetails(Number(button.dataset.openRequest));
  });
  document.querySelectorAll("[data-open-company]").forEach((button) => {
    button.onclick = () => {
      const value = button.dataset.openCompany || "";
      const [companyType, rawId] = value.includes(":") ? value.split(":") : ["auto", value];
      openCompanyDetails(Number(rawId), companyType);
    };
  });
  document.querySelectorAll("[data-open-agent]").forEach((button) => {
    button.onclick = () => openAgentDetails(decodeURIComponent(button.dataset.openAgent || ""));
  });
  document.querySelectorAll("[data-open-invoice]").forEach((button) => {
    button.onclick = () => openRequestInvoicePreview(Number(button.dataset.openInvoice));
  });
  document.querySelectorAll("[data-open-stage]").forEach((button) => {
    button.onclick = () => openStageDetails(Number(button.dataset.openStage));
  });
  document.querySelectorAll("[data-open-user]").forEach((button) => {
    button.onclick = () => openUserDetails(Number(button.dataset.openUser));
  });
  document.querySelectorAll("[data-open-custom-table]").forEach((button) => {
    button.onclick = () => openCustomTableDetails(Number(button.dataset.openCustomTable));
  });
  document.querySelectorAll("[data-add-custom-table-row]").forEach((button) => {
    button.onclick = () => openCustomTableRecordDialog(Number(button.dataset.addCustomTableRow));
  });
  document.querySelectorAll("[data-edit-custom-table-row]").forEach((button) => {
    const [tableId, rowId] = String(button.dataset.editCustomTableRow || "").split(":").map(Number);
    button.onclick = () => openCustomTableRecordDialog(tableId, rowId);
  });
  document.querySelectorAll("[data-delete-custom-table-row]").forEach((button) => {
    const [tableId, rowId] = String(button.dataset.deleteCustomTableRow || "").split(":").map(Number);
    button.onclick = () => deleteCustomTableRow(tableId, rowId);
  });
  document.querySelectorAll("[data-archive-request]").forEach((button) => {
    button.onclick = () => archiveRequest(Number(button.dataset.archiveRequest));
  });
  document.querySelectorAll("[data-delete-request]").forEach((button) => {
    button.onclick = () => deleteRequest(Number(button.dataset.deleteRequest));
  });
  document.querySelectorAll("[data-edit-reference]").forEach((button) => {
    button.onclick = () => {
      const [type, id] = button.dataset.editReference.split(":");
      openReferenceDialog(type, Number(id));
    };
  });
  document.querySelectorAll("[data-delete-reference]").forEach((button) => {
    button.onclick = () => {
      const [type, id] = button.dataset.deleteReference.split(":");
      deleteReferenceRecord(type, Number(id));
    };
  });
  document.querySelectorAll("[data-restore-request]").forEach((button) => {
    button.onclick = () => restoreRequest(Number(button.dataset.restoreRequest));
  });
  document.querySelectorAll("[data-restore-reference]").forEach((button) => {
    button.onclick = () => {
      const [type, id] = button.dataset.restoreReference.split(":");
      restoreReferenceRecord(type, Number(id));
    };
  });
  document.querySelectorAll("[data-preview-generated-doc]").forEach((button) => {
    button.onclick = () => previewGeneratedDocument(button.dataset.previewGeneratedDoc);
  });
  document.querySelectorAll("[data-preview-doc]").forEach((button) => {
    button.onclick = () => previewStoredDocument(button.dataset.previewDoc);
  });
  document.querySelectorAll("[data-open-doc]").forEach((button) => {
    button.onclick = () => openStoredDocument(button.dataset.openDoc);
  });
  document.querySelectorAll("[data-download-doc]").forEach((button) => {
    button.onclick = () => downloadStoredDocument(button.dataset.downloadDoc);
  });
  document.querySelectorAll("[data-generate-from-doc]").forEach((button) => {
    button.onclick = () => generateDocumentFromTemplate(button.dataset.generateFromDoc);
  });
}

function openDetailsDialog(title, eyebrow, html) {
  const dialog = document.getElementById("detailsDialog");
  if (dialog.open) dialog.close();
  document.getElementById("detailsDialogTitle").textContent = title;
  document.getElementById("detailsDialogEyebrow").textContent = eyebrow;
  document.getElementById("detailsDialogBody").innerHTML = html;
  normalizeDocumentDigits(document.getElementById("detailsDialogBody"));
  dialog.showModal();
  attachDynamicEvents();
}

function closeDetailsDialog() {
  const dialog = document.getElementById("detailsDialog");
  if (dialog?.open) dialog.close();
}

function closeReferenceDialog() {
  const dialog = document.getElementById("referenceDialog");
  if (dialog?.open) dialog.close();
}

function closeCustomTableRecordDialog() {
  const dialog = document.getElementById("customTableRecordDialog");
  if (dialog?.open) dialog.close();
}

function openAccountEntryDialog() {
  resetAccountEntryForm();
  document.getElementById("accountEntryDialog")?.showModal();
}

function closeAccountEntryDialog() {
  const dialog = document.getElementById("accountEntryDialog");
  if (dialog?.open) dialog.close();
}

function resetAccountEntryForm() {
  document.getElementById("accountEntryForm")?.reset();
  document.getElementById("accountEntryTypeInput").value = "collection";
  document.getElementById("accountEntryAccountInput").value = "treasury_sdg";
  document.getElementById("accountEntryCurrencyInput").value = "SDG";
  populateAccountEntryLookups();
  toggleAccountEntryMode();
}

function toggleAccountEntryMode() {
  const type = document.getElementById("accountEntryTypeInput")?.value;
  const fxFields = document.getElementById("fxPurchaseFields");
  const clientField = document.getElementById("accountEntryClientField");
  const receivableField = document.getElementById("accountEntryReceivableField");
  const currencyField = document.getElementById("accountEntryCurrencyField");
  const accountField = document.getElementById("accountEntryAccountField");
  const partyField = document.getElementById("accountEntryPartyField");
  const requestField = document.getElementById("accountEntryRequestField");
  const titleField = document.getElementById("accountEntryTitleField");
  const amountField = document.getElementById("accountEntryAmountField");
  const clientLabel = document.getElementById("accountEntryClientLabel");
  const accountSelect = document.getElementById("accountEntryAccountInput");
  const currencyInput = document.getElementById("accountEntryCurrencyInput");
  const clientInput = document.getElementById("accountEntryClientInput");
  const receivableInput = document.getElementById("accountEntryReceivableInput");
  const partyInput = document.getElementById("accountEntryPartyInput");
  const requestInput = document.getElementById("accountEntryRequestNoInput");
  const fxRateInput = document.getElementById("accountEntryFxRateInput");
  const aedAmountInput = document.getElementById("accountEntryAedAmountInput");

  if (fxFields) fxFields.hidden = type !== "fxPurchase";
  if (clientField) clientField.hidden = !["collection", "payment"].includes(type);
  if (receivableField) receivableField.hidden = type !== "payment";
  if (currencyField) currencyField.hidden = !["expense", "payment"].includes(type);
  if (requestField) requestField.hidden = type === "payment";
  if (partyField) partyField.hidden = type === "collection" || type === "payment";
  if (clientInput) clientInput.required = ["collection", "payment"].includes(type);
  if (receivableInput) receivableInput.required = type === "payment";
  if (partyInput) partyInput.required = type === "expense";
  if (requestInput) requestInput.required = false;
  if (fxRateInput) fxRateInput.required = type === "fxPurchase";
  if (aedAmountInput) aedAmountInput.required = type === "fxPurchase";

  if (clientLabel) {
    clientLabel.textContent = type === "payment" ? "الجهة المدينة" : "العملاء";
  }

  if (titleField) {
    titleField.querySelector("span").textContent =
      type === "collection" ? "بيان التحصيل" :
      type === "expense" ? "بيان المنصرف" :
      type === "payment" ? "بيان السداد" :
      "بيان شراء العملة";
  }

  if (amountField) {
    amountField.querySelector("span").textContent =
      type === "fxPurchase" ? "المبلغ المدفوع بالجنيه" :
      type === "expense" && currencyInput?.value === "AED" ? "المبلغ بالدرهم" :
      type === "payment" && currencyInput?.value === "AED" ? "المبلغ بالدرهم" :
      "المبلغ";
  }

  if (accountSelect) {
    let options = [];
    if (type === "collection") {
      options = [
        { value: "treasury_sdg", label: "توريد إلى خزينة الجنيه" },
        { value: "bank_sdg", label: "توريد إلى الحساب البنكي بالجنيه" }
      ];
    } else if (type === "expense") {
      options = currencyInput?.value === "AED"
        ? [{ value: "treasury_aed", label: "الصرف من خزينة الدرهم" }]
        : [
          { value: "treasury_sdg", label: "الصرف من خزينة الجنيه" },
          { value: "bank_sdg", label: "الصرف من الحساب البنكي بالجنيه" }
        ];
    } else if (type === "payment") {
      options = currencyInput?.value === "AED"
        ? [{ value: "treasury_aed", label: "السداد من خزينة الدرهم" }]
        : [
          { value: "treasury_sdg", label: "السداد من خزينة الجنيه" },
          { value: "bank_sdg", label: "السداد من الحساب البنكي بالجنيه" }
        ];
    } else if (type === "fxPurchase") {
      options = [
        { value: "treasury_sdg", label: "شراء من خزينة الجنيه" },
        { value: "bank_sdg", label: "شراء من الحساب البنكي بالجنيه" }
      ];
    }
    resetSelectOptions(accountSelect, options, false);
  }

  populateAccountEntryLookups();
}

function populateAccountEntryLookups() {
  const clientSelect = document.getElementById("accountEntryClientInput");
  const receivableSelect = document.getElementById("accountEntryReceivableInput");
  const type = document.getElementById("accountEntryTypeInput")?.value;
  if (clientSelect) {
    const importers = state.importerCompanies.filter((item) => !item.archived).map((item) => ({
      value: String(item.id),
      label: item.name
    }));
    resetSelectOptions(clientSelect, importers, true, type === "payment" ? "اختر الجهة المدينة" : "اختر العميل");
  }
  if (receivableSelect) {
    const claims = state.requests
      .filter((request) => !request.archived && request.stage === "Completed")
      .map((request) => ({
        value: String(request.id),
        label: `${request.requestNo} - ${request.importerCompanyName} - ${formatReceivableSummary(request.invoiceValue || 0, request.serviceFeeAmount || 0)}`
      }));
    resetSelectOptions(receivableSelect, claims, true, "اختر المطالبة");
  }
}

function resetSelectOptions(select, options, allowBlank = true, blankLabel = "اختر") {
  if (!select) return;
  const previous = select.value;
  select.innerHTML = "";
  if (allowBlank) {
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = blankLabel;
    select.appendChild(placeholder);
  }
  options.forEach((option) => {
    const opt = document.createElement("option");
    opt.value = option.value;
    opt.textContent = option.label;
    select.appendChild(opt);
  });
  if ([...select.options].some((option) => option.value === previous)) {
    select.value = previous;
  }
}

function syncAgentFromImporterSelection(importerId = null) {
  const importerSelect = document.getElementById("importerCompanySelect");
  const agentInput = document.getElementById("agentInput");
  if (!agentInput) return;
  const selectedImporterId = importerId ?? Number(importerSelect?.value || 0);
  const importer = state.importerCompanies.find((item) => item.id === Number(selectedImporterId));
  const agent = state.agents.find((item) => item.id === Number(importer?.agentId));
  agentInput.value = importer?.agentName || agent?.name || "";
}

function reconcileOperationalReferences() {
  state.importerCompanies = (state.importerCompanies || []).map((company) => {
    const agentId = company.agentId ? Number(company.agentId) : null;
    const agent = state.agents.find((item) => item.id === agentId);
    return {
      ...company,
      agentId,
      agentName: agent?.name || company.agentName || ""
    };
  });

  state.requests = (state.requests || []).map((request) => {
    const sellerCompany = state.companies.find((item) => item.id === Number(request.sellerCompanyId));
    const importerCompany = state.importerCompanies.find((item) => item.id === Number(request.importerCompanyId));
    const importerAgent = state.agents.find((item) => item.id === Number(importerCompany?.agentId));
    return {
      ...request,
      sellerCompanyName: sellerCompany?.name || request.sellerCompanyName || "",
      importerCompanyName: importerCompany?.name || request.importerCompanyName || "",
      agent: importerCompany?.agentName || importerAgent?.name || request.agent || ""
    };
  });
}

function handleDatabaseFilterChange(event) {
  const target = event.target;
  if (target.matches("[data-reference-filter]")) {
    const type = target.dataset.referenceFilter;
    const kind = target.dataset.filterKind;
    const cursorStart = target.selectionStart;
    const cursorEnd = target.selectionEnd;
    referenceFilters[type] = { ...getReferenceFilterState(type), [kind]: target.value };
    renderReferenceCollectionByType(type);
    attachDynamicEvents();
    if (kind === "search") {
      const nextInput = document.querySelector(`[data-reference-filter="${type}"][data-filter-kind="search"]`);
      if (nextInput) {
        nextInput.focus();
        const length = nextInput.value.length;
        nextInput.setSelectionRange(
          Math.min(cursorStart ?? length, length),
          Math.min(cursorEnd ?? length, length)
        );
      }
    }
    return;
  }

  if (target.matches("[data-documents-filter]")) {
    documentsFilter[target.dataset.documentsFilter] = target.value;
    renderDocumentsDatabaseTable();
    attachDynamicEvents();
  }
}

function editRequest(id) {
  const request = state.requests.find((item) => item.id === id);
  if (!request) return;
  closeDetailsDialog();
  currentEditRequestId = id;
  currentView = "new-request";
  saveUiState();
  renderNavigation();
  hydrateForm(request);
}

function openRequestDetails(id) {
  const request = state.requests.find((item) => item.id === id);
  if (!request) return;
  const documentsHtml = (request.documents || []).length
    ? request.documents.map((doc) => `
      <article class="document-item">
        <div>
          <strong>${escapeHtml(resolveDocumentLinkedName(doc, request))}</strong>
          <small>${escapeHtml(doc.stage || "-")} • ${escapeHtml(doc.fileName || "-")}</small>
        </div>
        <div class="document-actions">
          ${doc.category === "generated" && doc.previewHtml ? `<button class="ghost-button" type="button" data-preview-generated-doc="${doc.id}">معاينة</button>` : `<button class="ghost-button" type="button" ${doc.dataUrl ? `data-preview-doc="${doc.id}"` : "disabled"}>معاينة</button>`}
          <button class="ghost-button" type="button" ${doc.dataUrl ? `data-open-doc="${doc.id}"` : "disabled"}>عرض</button>
          <button class="primary-button" type="button" ${doc.dataUrl ? `data-download-doc="${doc.id}"` : "disabled"}>تنزيل</button>
        </div>
      </article>
    `).join("")
    : `<div class="empty-state">لا توجد مستندات مرفوعة لهذا الطلب</div>`;

  const historyHtml = (request.history || []).length
    ? request.history.map((entry) => `
      <article class="timeline-item">
        <strong>${escapeHtml(entry.action || "Update")}</strong>
        <p>${escapeHtml(formatPreviewDate(entry.createdAt))} • ${escapeHtml(entry.actor || "-")}</p>
        <p>${escapeHtml(entry.fromStage || "-")} → ${escapeHtml(entry.toStage || request.stage || "-")}</p>
        <p>${escapeHtml(entry.comment || "بدون تعليق")}</p>
      </article>
    `).join("")
    : `<div class="empty-state">لا يوجد سجل حركة بعد</div>`;

  const html = `
    <section class="preview-sheet">
      <div class="preview-sheet-header">
        <div>
          <p class="eyebrow">Request View</p>
          <h4>${escapeHtml(request.requestNo)}</h4>
        </div>
        <div class="document-actions">
          <span class="badge">${escapeHtml(request.status)}</span>
          <span class="badge">${escapeHtml(request.stage)}</span>
        </div>
      </div>
      <div class="preview-grid">
        <article class="preview-item"><span>تاريخ الإنشاء</span><strong>${escapeHtml(formatPreviewDate(request.createdAt))}</strong></article>
        <article class="preview-item"><span>أنشأ بواسطة</span><strong><button class="inline-link" type="button" data-open-user="${state.users.find((u) => u.email === request.createdBy)?.id || state.currentUser.id}">${escapeHtml(request.createdByName || request.createdBy || "-")}</button></strong></article>
        <article class="preview-item"><span>الشركة المستوردة</span><strong><button class="inline-link" type="button" data-open-company="${request.importerCompanyId}">${escapeHtml(request.importerCompanyName || "-")}</button></strong></article>
        <article class="preview-item"><span>الوكيل</span><strong><button class="inline-link" type="button" data-open-agent="${encodeURIComponent(request.agent || "")}">${escapeHtml(request.agent || "-")}</button></strong></article>
        <article class="preview-item"><span>رقم البوليصة</span><strong>${escapeHtml(request.blNumber || "-")}</strong></article>
        <article class="preview-item"><span>رقم الفاتورة</span><strong>${escapeHtml(request.finalInvoice || request.proformaInvoice || "-")}</strong></article>
      </div>
      <section class="preview-section">
        <h5>الملاحظات</h5>
        <p>${escapeHtml(request.notes || "لا توجد ملاحظات")}</p>
        <p>${escapeHtml(request.financeNotes || "")}</p>
      </section>
      <section class="preview-section">
        <h5>المستندات</h5>
        <div class="document-list">${documentsHtml}</div>
      </section>
      <section class="preview-section">
        <h5>سجل الحركة والتعليقات</h5>
        <div class="timeline">${historyHtml}</div>
      </section>
      <div class="document-actions">
        <button class="secondary-button" type="button" data-edit-request="${request.id}">فتح للتعديل</button>
        <button class="ghost-button" type="button" data-archive-request="${request.id}">أرشفة</button>
        <button class="ghost-button danger-link" type="button" data-delete-request="${request.id}">حذف</button>
      </div>
    </section>
  `;

  openDetailsDialog(`تفاصيل الطلب ${request.requestNo}`, "Request Details", html);
}

function openCompanyDetails(companyId, companyType = "auto") {
  const importerCompany = companyType === "exporter" ? null : state.importerCompanies.find((item) => item.id === companyId);
  const exporterCompany = companyType === "importer" ? null : state.companies.find((item) => item.id === companyId);
  const company = importerCompany || exporterCompany;
  if (!company) return;
  const isImporter = Boolean(importerCompany);
  const relatedRequests = state.requests.filter((request) =>
    isImporter ? request.importerCompanyId === companyId : request.sellerCompanyId === companyId
  );
  const metrics = buildRequestMetrics(relatedRequests, {
    partyNames: [company.name],
    requestNoSet: new Set(relatedRequests.map((request) => request.requestNo).filter(Boolean))
  });

  const html = `
    <section class="preview-sheet">
      <div class="preview-sheet-header">
        <div>
          <p class="eyebrow">${isImporter ? "Importer Company" : "Exporter Company"}</p>
          <h4>${escapeHtml(company.name)}</h4>
        </div>
        <span class="badge">${escapeHtml(company.country || "-")}</span>
      </div>
      <div class="preview-grid">
        ${isImporter ? `<article class="preview-item"><span>الوكيل في السودان</span><strong>${escapeHtml(company.agentName || "-")}</strong></article>` : `<article class="preview-item"><span>نوع الشركة</span><strong>مصدرة</strong></article>`}
        <article class="preview-item"><span>إجمالي المعاملات</span><strong>${metrics.totalCount}</strong></article>
        <article class="preview-item"><span>المعاملات المكتملة</span><strong>${metrics.completedCount}</strong></article>
        <article class="preview-item"><span>المعاملات المعلقة</span><strong>${metrics.pendingCount}</strong></article>
        <article class="preview-item"><span>المعاملات المؤرشفة</span><strong>${metrics.archivedCount}</strong></article>
        <article class="preview-item"><span>قيمة الفواتير المكتملة</span><strong>${escapeHtml(formatUsd(metrics.invoiceReceivables))}</strong></article>
        <article class="preview-item"><span>${isImporter ? "تختيم وكيل الشركة" : "إجمالي تختيم الوكلاء المرتبط"}</span><strong>${escapeHtml(formatCurrency(metrics.stampingReceivables))}</strong></article>
        <article class="preview-item"><span>إجمالي السداد المسجل</span><strong>${escapeHtml(formatUsd(metrics.paidAmount))}</strong></article>
      </div>
      <section class="preview-section">
        <h5>الطلبات المرتبطة</h5>
        <div class="timeline">
          ${relatedRequests.length ? relatedRequests.map((request) => `
            <article class="timeline-item">
              <strong><button class="inline-link" type="button" data-open-request="${request.id}">${escapeHtml(request.requestNo)}</button></strong>
              <p>${escapeHtml(request.stage)} • ${escapeHtml(request.status)} ${request.archived ? "• مؤرشف" : ""}</p>
              <p>${escapeHtml(request.finalInvoice || request.proformaInvoice || "-")}</p>
            </article>
          `).join("") : `<div class="empty-state">لا توجد طلبات مرتبطة</div>`}
        </div>
      </section>
    </section>
  `;

  openDetailsDialog(`بيانات الشركة ${company.name}`, isImporter ? "Importer Report" : "Exporter Report", html);
}

function openAgentDetails(agentName) {
  const agentProfile = state.agents.find((item) => item.name === agentName);
  const relatedRequests = state.requests.filter((request) => (request.agent || "") === agentName);
  const metrics = buildRequestMetrics(relatedRequests, {
    partyNames: [agentName],
    requestNoSet: new Set(relatedRequests.map((request) => request.requestNo).filter(Boolean))
  });

  const html = `
    <section class="preview-sheet">
      <div class="preview-sheet-header">
        <div>
          <p class="eyebrow">Agent Profile</p>
          <h4>${escapeHtml(agentName || "بدون وكيل")}</h4>
        </div>
        <span class="badge">${metrics.totalCount} معاملة</span>
      </div>
      <div class="preview-grid">
        <article class="preview-item"><span>الرصيد الافتتاحي</span><strong>${escapeHtml(formatCurrency(agentProfile?.openingBalance || 0))}</strong></article>
        <article class="preview-item"><span>إجمالي المستحقات</span><strong>${escapeHtml(formatCurrency(agentProfile?.outstandingAmount || 0))}</strong></article>
        <article class="preview-item"><span>رصيد رسوم الخدمات</span><strong>${escapeHtml(formatCurrency(agentProfile?.serviceFeeBalance || 0))}</strong></article>
        <article class="preview-item"><span>المعاملات المكتملة</span><strong>${metrics.completedCount}</strong></article>
        <article class="preview-item"><span>المعاملات المعلقة</span><strong>${metrics.pendingCount}</strong></article>
        <article class="preview-item"><span>المعاملات المؤرشفة</span><strong>${metrics.archivedCount}</strong></article>
        <article class="preview-item"><span>مطالبات التختيم</span><strong>${escapeHtml(formatCurrency(metrics.stampingReceivables))}</strong></article>
        <article class="preview-item"><span>إجمالي السداد المسجل</span><strong>${escapeHtml(formatCurrency(metrics.paidAmount))}</strong></article>
        <article class="preview-item"><span>إجمالي المعاملات</span><strong>${metrics.totalCount}</strong></article>
      </div>
      <section class="preview-section">
        <h5>بيانات الوكيل</h5>
        <p>${escapeHtml(agentProfile?.phone || "-")}</p>
        <p>${escapeHtml(agentProfile?.email || "-")}</p>
        <p>${escapeHtml(agentProfile?.notes || "لا توجد ملاحظات مالية")}</p>
      </section>
      <section class="preview-section">
        <h5>الطلبات المرتبطة</h5>
        <div class="timeline">
          ${relatedRequests.length ? relatedRequests.map((request) => `
            <article class="timeline-item">
              <strong><button class="inline-link" type="button" data-open-request="${request.id}">${escapeHtml(request.requestNo)}</button></strong>
              <p>${escapeHtml(request.importerCompanyName || "-")} • ${escapeHtml(request.stage)} ${request.archived ? "• مؤرشف" : ""}</p>
            </article>
          `).join("") : `<div class="empty-state">لا توجد معاملات لهذا الوكيل</div>`}
        </div>
      </section>
    </section>
  `;

  openDetailsDialog(`بيانات الوكيل ${agentName || "-"}`, "Agent Report", html);
}

function openStageDetails(stageId) {
  const stage = state.stages.find((item) => item.id === stageId);
  if (!stage) return;
  const related = state.requests.filter((request) => !request.archived && request.stage === stage.name);
  const requiredDocs = (state.documentTypes || []).filter((item) => item.active && (item.requiredStages || []).includes(stage.name));
  const optionalDocs = (state.documentTypes || []).filter((item) => item.active && !(item.requiredStages || []).includes(stage.name) && (item.optionalStages || []).includes(stage.name));

  const html = `
    <section class="preview-sheet">
      <div class="preview-sheet-header">
        <div>
          <p class="eyebrow">Stage Settings</p>
          <h4>${escapeHtml(stage.label)}</h4>
        </div>
        <span class="badge">${escapeHtml(stage.name)}</span>
      </div>
      <div class="preview-grid">
        <article class="preview-item"><span>الترتيب</span><strong>${stage.order}</strong></article>
        <article class="preview-item"><span>المرحلة التالية</span><strong>${escapeHtml(stage.next || "لا يوجد")}</strong></article>
        <article class="preview-item"><span>الحقول المعروضة</span><strong>${escapeHtml((stage.viewFields || []).join(", ") || "-")}</strong></article>
        <article class="preview-item"><span>الحقول القابلة للتعديل</span><strong>${escapeHtml((stage.editableFields || []).join(", ") || "-")}</strong></article>
        <article class="preview-item"><span>المستندات المطلوبة</span><strong>${escapeHtml(requiredDocs.map((item) => item.label).join(", ") || "لا يوجد")}</strong></article>
        <article class="preview-item"><span>المستندات الاختيارية</span><strong>${escapeHtml(optionalDocs.map((item) => item.label).join(", ") || "لا يوجد")}</strong></article>
      </div>
      <section class="preview-section">
        <h5>الطلبات في هذه المرحلة</h5>
        <div class="timeline">
          ${related.length ? related.map((request) => `
            <article class="timeline-item">
              <strong><button class="inline-link" type="button" data-open-request="${request.id}">${escapeHtml(request.requestNo)}</button></strong>
              <p>${escapeHtml(request.importerCompanyName || "-")} • ${escapeHtml(request.status)}</p>
            </article>
          `).join("") : `<div class="empty-state">لا توجد طلبات في هذه المرحلة</div>`}
        </div>
      </section>
    </section>
  `;

  openDetailsDialog(`إعدادات المرحلة ${stage.label}`, "Stage Configuration", html);
}

function calculateEntityPaidAmount({ partyNames = [], requestNoSet = new Set() } = {}) {
  const names = new Set(
    (partyNames || [])
      .map((item) => String(item || "").trim())
      .filter(Boolean)
  );

  return (state.accountEntries || [])
    .filter((entry) => {
      if (!["collection", "payment"].includes(entry.entryType)) return false;
      const partyName = String(entry.partyName || "").trim();
      const requestNo = String(entry.requestNo || "").trim();
      return names.has(partyName) || (requestNo && requestNoSet.has(requestNo));
    })
    .reduce((sum, entry) => sum + Number(entry.amount || 0), 0);
}

function buildRequestMetrics(requests, options = {}) {
  const allRequests = requests || [];
  const activeRequests = allRequests.filter((request) => !request.archived);
  const completedRequests = activeRequests.filter((request) => request.stage === "Completed");
  const pendingRequests = activeRequests.filter((request) => request.stage !== "Completed");
  const archivedRequests = allRequests.filter((request) => request.archived);
  const requestNoSet = options.requestNoSet || new Set(allRequests.map((request) => request.requestNo).filter(Boolean));

  return {
    totalCount: allRequests.length,
    completedCount: completedRequests.length,
    pendingCount: pendingRequests.length,
    archivedCount: archivedRequests.length,
    invoiceReceivables: completedRequests.reduce((sum, request) => sum + Number(request.invoiceValue || 0), 0),
    stampingReceivables: completedRequests.reduce((sum, request) => sum + Number(request.serviceFeeAmount || 0), 0),
    paidAmount: calculateEntityPaidAmount({
      partyNames: options.partyNames || [],
      requestNoSet
    })
  };
}

function renderEntitySummaryList(containerId, entities, emptyMessage) {
  const container = document.getElementById(containerId);
  if (!container) return;
  if (!entities.length) {
    container.innerHTML = `<div class="empty-state">${emptyMessage}</div>`;
    return;
  }

  container.innerHTML = entities.map((entity) => `
    <article class="document-item">
      <div>
        <strong>${entity.buttonHtml}</strong>
        <small>${escapeHtml(entity.metaLine)}</small>
        <small>
          مكتملة ${entity.metrics.completedCount} • معلقة ${entity.metrics.pendingCount} • مؤرشفة ${entity.metrics.archivedCount}
        </small>
        <small>${entity.amountSummaryHtml}</small>
      </div>
      <div class="document-actions">
        <span class="badge">${entity.metrics.totalCount} معاملة</span>
      </div>
    </article>
  `).join("");
}

function openUserDetails(userId) {
  const user = state.users.find((item) => item.id === userId);
  if (!user) return;
  const permissions = Object.entries(user.permissions || {}).map(([key, value]) => `
    <article class="preview-item">
      <span>${escapeHtml(key)}</span>
      <strong>${value ? "مفعل" : "ممنوع"}</strong>
    </article>
  `).join("");

  const html = `
    <section class="preview-sheet">
      <div class="preview-sheet-header">
        <div>
          <p class="eyebrow">User Permissions</p>
          <h4>${escapeHtml(user.name)}</h4>
        </div>
        <span class="badge">${escapeHtml(formatRoleLabel(user.role))}</span>
      </div>
      <div class="preview-grid">
        <article class="preview-item"><span>البريد</span><strong>${escapeHtml(user.email)}</strong></article>
        <article class="preview-item"><span>المرحلة المكلف بها</span><strong>${escapeHtml(formatStageLabel(user.stage))}</strong></article>
        <article class="preview-item"><span>صفحة البداية</span><strong>${escapeHtml(pageTitles[user.defaultPage] || user.defaultPage || "-")}</strong></article>
        ${permissions}
      </div>
    </section>
  `;

  openDetailsDialog(`صلاحيات المستخدم ${user.name}`, "User Access", html);
}

function getCustomTableById(tableId) {
  return state.customTables.find((item) => item.id === tableId) || null;
}

function openCustomTableDetails(tableId) {
  const table = getCustomTableById(tableId);
  if (!table) return;

  const columns = table.columns || [];
  const headers = columns.map((column) => `<th>${escapeHtml(column)}</th>`).join("");
  const rowsHtml = (table.rows || []).length
    ? table.rows.map((row) => `
      <tr>
        ${columns.map((column) => `<td>${escapeHtml(row[column] ?? "-")}</td>`).join("")}
        <td>
          <div class="row-actions">
            <button class="link-button" type="button" data-edit-custom-table-row="${table.id}:${row.id}">تعديل</button>
            <button class="link-button danger-link" type="button" data-delete-custom-table-row="${table.id}:${row.id}">حذف</button>
          </div>
        </td>
      </tr>
    `).join("")
    : `<tr><td colspan="${columns.length + 1}" class="empty-state">لا توجد سجلات في هذا الجدول بعد</td></tr>`;

  const html = `
    <section class="preview-sheet">
      <div class="preview-sheet-header">
        <div>
          <p class="eyebrow">Custom Table</p>
          <h4>${escapeHtml(table.name)}</h4>
        </div>
        <span class="badge">${(table.rows || []).length} سجل</span>
      </div>
      <div class="preview-grid">
        <article class="preview-item"><span>المعرف</span><strong>${escapeHtml(table.key)}</strong></article>
        <article class="preview-item"><span>الوصف</span><strong>${escapeHtml(table.description || "-")}</strong></article>
        <article class="preview-item"><span>الأعمدة</span><strong>${escapeHtml((table.columns || []).join(", ") || "-")}</strong></article>
        <article class="preview-item"><span>الحالة</span><strong>${table.active ? "مفعّل" : "متوقف"}</strong></article>
      </div>
      <div class="form-actions">
        <button class="primary-button" type="button" data-add-custom-table-row="${table.id}">إضافة سجل</button>
      </div>
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr>
              ${headers}
              <th>إجراءات</th>
            </tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
        </table>
      </div>
    </section>
  `;

  openDetailsDialog(`بيانات الجدول ${table.name}`, "Custom Table", html);
}

function openCustomTableRecordDialog(tableId, rowId = null) {
  const table = getCustomTableById(tableId);
  if (!table) return;
  currentCustomTableId = tableId;
  currentCustomTableRowId = rowId;

  const row = rowId ? (table.rows || []).find((item) => item.id === rowId) : null;
  const fields = document.getElementById("customTableRecordFields");
  const title = document.getElementById("customTableRecordDialogTitle");
  title.textContent = row ? `تعديل سجل في ${table.name}` : `إضافة سجل إلى ${table.name}`;
  fields.innerHTML = "";

  (table.columns || []).forEach((column) => {
    const label = document.createElement("label");
    label.innerHTML = `
      <span>${escapeHtml(column)}</span>
      <input type="text" name="${escapeHtml(column)}" value="${escapeHtml(row?.[column] ?? "")}" required>
    `;
    fields.appendChild(label);
  });

  document.getElementById("customTableRecordDialog")?.showModal();
}

function saveCustomTableRecord(event) {
  event.preventDefault();
  const table = getCustomTableById(currentCustomTableId);
  if (!table) return;
  const form = document.getElementById("customTableRecordForm");
  if (!form?.reportValidity()) return;

  const formData = Object.fromEntries(new FormData(form).entries());
  const payload = { id: currentCustomTableRowId || nextId(table.rows || []), ...formData };
  table.rows = Array.isArray(table.rows) ? table.rows : [];

  if (currentCustomTableRowId) {
    const index = table.rows.findIndex((row) => row.id === currentCustomTableRowId);
    if (index >= 0) table.rows[index] = payload;
  } else {
    table.rows.unshift(payload);
  }

  dataService.saveState(state);
  closeCustomTableRecordDialog();
  openCustomTableDetails(table.id);
  renderReferenceLists();
}

function deleteCustomTableRow(tableId, rowId) {
  const table = getCustomTableById(tableId);
  if (!table) return;
  const row = (table.rows || []).find((item) => item.id === rowId);
  if (!row) return;
  const confirmed = window.confirm("هل تريد حذف هذا السجل من الجدول؟");
  if (!confirmed) return;
  table.rows = (table.rows || []).filter((item) => item.id !== rowId);
  dataService.saveState(state);
  openCustomTableDetails(table.id);
  renderReferenceLists();
}

function hydrateForm(request) {
  setRequestFormBusy(false);
  document.getElementById("sellerCompanySelect").value = request.sellerCompanyId || "";
  document.getElementById("importerCompanySelect").value = request.importerCompanyId || "";
  syncAgentFromImporterSelection(request.importerCompanyId);
  if (!document.getElementById("agentInput").value) {
    document.getElementById("agentInput").value = request.agent || "";
  }
  document.getElementById("proformaInvoiceInput").value = request.proformaInvoice || "";
  document.getElementById("finalInvoiceInput").value = request.finalInvoice || "";
  document.getElementById("invoiceValueInput").value = request.invoiceValue || "";
  document.getElementById("blNumberInput").value = request.blNumber || "";
  document.getElementById("blDateInput").value = request.blDate || "";
  document.getElementById("originInput").value = request.origin || "";
  document.getElementById("cooNumberInput").value = request.cooNumber || "";
  document.getElementById("cooDateInput").value = request.cooDate || "";
  document.getElementById("commoditySelect").value = request.commodityId || "";
  document.getElementById("hsCodeInput").value = request.hsCode || "";
  document.getElementById("portSelect").value = request.portId || "";
  document.getElementById("bankSelect").value = request.bankId || "";
  document.getElementById("transactionTypeSelect").value = request.transactionType || "Cash";
  document.getElementById("serviceFeeRateInput").value = request.serviceFeeRate || 0;
  document.getElementById("serviceFeeAmountInput").value = request.serviceFeeAmount || 0;
  document.getElementById("financeNotesInput").value = request.financeNotes || "";
  document.getElementById("importPermitInput").value = request.importPermit || "";
  document.getElementById("notesInput").value = request.notes || "";
  renderCustomRequestFields(request);
  updateRequestFormContext(request);
  renderDocumentSections(request);
}

function clearForm() {
  setRequestFormBusy(false);
  currentEditRequestId = null;
  saveUiState();
  document.getElementById("requestForm").reset();
  document.getElementById("transactionTypeSelect").value = "Cash";
  document.getElementById("serviceFeeRateInput").value = "0";
  document.getElementById("serviceFeeAmountInput").value = "0";
  syncAgentFromImporterSelection();
  renderCustomRequestFields(null);
  updateRequestFormContext();
  renderDocumentSections(null);
}

function setRequestFormBusy(isBusy, mode = "draft") {
  const saveDraftButton = document.getElementById("saveDraftButton");
  const submitRequestButton = document.getElementById("submitRequestButton");
  const resetFormButton = document.getElementById("resetFormButton");

  [saveDraftButton, submitRequestButton, resetFormButton].forEach((button) => {
    if (!button) return;
    button.disabled = isBusy;
  });

  if (saveDraftButton) {
    saveDraftButton.textContent = isBusy && mode === "draft" ? "جارٍ الحفظ..." : "حفظ كمسودة";
  }
  if (submitRequestButton) {
    submitRequestButton.textContent = isBusy && mode === "submit" ? "جارٍ الإرسال..." : "إرسال للمرحلة التالية";
  }
}

function formatFileSize(bytes) {
  const value = Number(bytes || 0);
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(2)} MB`;
}

function setUploadProgress(definitionKey, partialState = {}) {
  uploadProgressState[definitionKey] = {
    ...(uploadProgressState[definitionKey] || {}),
    ...partialState
  };
  renderUploadProgress(definitionKey);
}

function clearUploadProgress(definitionKey) {
  stopUploadProgressAnimation(definitionKey);
  delete uploadProgressState[definitionKey];
  renderUploadProgress(definitionKey);
}

function startUploadProgressAnimation(definitionKey) {
  stopUploadProgressAnimation(definitionKey);
  uploadProgressTimers[definitionKey] = window.setInterval(() => {
    const currentState = uploadProgressState[definitionKey];
    if (!currentState || currentState.status !== "uploading") {
      stopUploadProgressAnimation(definitionKey);
      return;
    }

    const currentProgress = Number(currentState.progress || 0);
    if (currentProgress >= 90) return;

    const nextProgress =
      currentProgress < 30 ? currentProgress + 8 :
      currentProgress < 60 ? currentProgress + 5 :
      currentProgress + 2;

    uploadProgressState[definitionKey] = {
      ...currentState,
      progress: Math.min(90, nextProgress),
      statusText: currentProgress < 40 ? "جارٍ قراءة الملف" : "جارٍ رفع الملف"
    };
    renderUploadProgress(definitionKey);
  }, 220);
}

function stopUploadProgressAnimation(definitionKey) {
  if (!uploadProgressTimers[definitionKey]) return;
  clearInterval(uploadProgressTimers[definitionKey]);
  delete uploadProgressTimers[definitionKey];
}

function waitForUiPaint() {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(resolve);
    });
  });
}

function renderUploadProgress(definitionKey) {
  const statusBox = document.getElementById(`uploadStatus-${definitionKey}`);
  const fileNameEl = document.getElementById(`uploadStatusName-${definitionKey}`);
  const metaEl = document.getElementById(`uploadStatusMeta-${definitionKey}`);
  const progressBar = document.getElementById(`uploadProgressBar-${definitionKey}`);
  const progressText = document.getElementById(`uploadProgressText-${definitionKey}`);
  if (!statusBox || !fileNameEl || !metaEl || !progressBar || !progressText) return;

  const stateItem = uploadProgressState[definitionKey];
  if (!stateItem?.fileName) {
    statusBox.hidden = true;
    statusBox.style.display = "none";
    return;
  }

  statusBox.hidden = false;
  statusBox.style.display = "grid";
  fileNameEl.textContent = stateItem.fileName;
  metaEl.textContent = `${formatFileSize(stateItem.fileSize)} • ${stateItem.statusText || "جاهز للرفع"}`;
  progressBar.style.width = `${Math.max(0, Math.min(100, Number(stateItem.progress || 0)))}%`;
  progressText.textContent = `${Math.max(0, Math.min(100, Number(stateItem.progress || 0)))}%`;
  statusBox.classList.toggle("upload-status-error", stateItem.status === "error");
  statusBox.classList.toggle("upload-status-complete", stateItem.status === "complete");
  statusBox.classList.toggle("upload-status-uploading", stateItem.status === "uploading");
}

function bindDynamicUploadInputs() {
  getAllActiveDocumentDefinitions().forEach((definition) => {
    const input = document.getElementById(`uploadFile-${definition.key}`);
    if (!input || input.dataset.progressBound === "true") return;
    input.dataset.progressBound = "true";
    input.addEventListener("change", () => {
      const file = input.files?.[0];
      if (!file) {
        clearUploadProgress(definition.key);
        return;
      }
      setUploadProgress(definition.key, {
        fileName: file.name,
        fileSize: file.size,
        progress: 0,
        status: "ready",
        statusText: "جاهز للرفع"
      });
    });
  });
}

function gatherRequestFormData() {
  const sellerCompanyId = Number(document.getElementById("sellerCompanySelect").value);
  const importerCompanyId = Number(document.getElementById("importerCompanySelect").value);
  const commodityId = Number(document.getElementById("commoditySelect").value);
  const portId = Number(document.getElementById("portSelect").value);
  const bankId = Number(document.getElementById("bankSelect").value || 0);

  const sellerCompany = state.companies.find((item) => item.id === sellerCompanyId);
  const importerCompany = state.importerCompanies.find((item) => item.id === importerCompanyId);
  const importerAgent = state.agents.find((item) => item.id === Number(importerCompany?.agentId));
  const commodity = state.commodities.find((item) => item.id === commodityId);
  const port = state.ports.find((item) => item.id === portId);
  const bank = state.banks.find((item) => item.id === bankId);
  const invoiceValue = Number(document.getElementById("invoiceValueInput").value || 0);
  const serviceFeeRate = Number(document.getElementById("serviceFeeRateInput").value || 0);
  const customFields = Object.fromEntries(
    getCustomInputFieldDefinitions().map((field) => {
      const element = document.querySelector(`[data-custom-input-key="${field.key}"]`);
      return [field.key, field.inputType === "number" ? Number(element?.value || 0) : (element?.value || "")];
    })
  );

  return {
    sellerCompanyId,
    sellerCompanyName: sellerCompany?.name || "",
    importerCompanyId,
    importerCompanyName: importerCompany?.name || "",
    agent: document.getElementById("agentInput").value.trim() || importerCompany?.agentName || importerAgent?.name || "",
    proformaInvoice: document.getElementById("proformaInvoiceInput").value.trim(),
    finalInvoice: document.getElementById("finalInvoiceInput").value.trim(),
    invoiceValue,
    blNumber: document.getElementById("blNumberInput").value.trim(),
    blDate: document.getElementById("blDateInput").value,
    origin: document.getElementById("originInput").value.trim(),
    cooNumber: document.getElementById("cooNumberInput").value.trim(),
    cooDate: document.getElementById("cooDateInput").value,
    commodityId,
    commodityName: commodity?.name || "",
    hsCode: document.getElementById("hsCodeInput").value.trim(),
    portId,
    portName: port?.name || "",
    bankId: bank?.id || null,
    bankName: bank?.name || "",
    transactionType: document.getElementById("transactionTypeSelect").value,
    serviceFeeRate,
    serviceFeeAmount: calculateServiceFee(invoiceValue, serviceFeeRate),
    financeNotes: document.getElementById("financeNotesInput").value.trim(),
    importPermit: document.getElementById("importPermitInput").value.trim(),
    notes: document.getElementById("notesInput").value.trim(),
    customFields
  };
}

async function submitRequest(mode) {
  try {
    const formData = gatherRequestFormData();
    const existing = state.requests.find((request) => request.id === currentEditRequestId);
    const currentStage = existing?.stage || "DataEntry";
    const duplicateBl = state.requests.find((request) =>
      request.id !== existing?.id &&
      normalizeValue(request.blNumber) &&
      normalizeValue(request.blNumber) === normalizeValue(formData.blNumber)
    );

    if (duplicateBl) {
      const shouldOpen = window.confirm(`رقم البوليصة مرتبط مسبقاً بالطلب ${duplicateBl.requestNo}.\nهل تريد فتحه الآن؟`);
      if (shouldOpen) openRequestDetails(duplicateBl.id);
      return;
    }

    setRequestFormBusy(true, mode);
    const documents = await buildDocumentUploads(existing, currentStage);
    const nextStage = mode === "draft" ? currentStage : getNextStageName(currentStage);
    const nextStatus = mode === "draft" ? "Draft" : (nextStage === "Completed" ? "Completed" : "Submitted");

    const payload = {
      ...existing,
      ...formData,
      id: existing?.id || nextId(state.requests),
      requestNo: existing?.requestNo || nextRequestNo(),
      createdBy: state.currentUser.email,
      createdByName: existing?.createdByName || state.currentUser.name,
      createdAt: existing?.createdAt || new Date().toISOString(),
      archived: existing?.archived ?? false,
      documents,
      stage: nextStage,
      status: nextStatus,
      history: buildNextHistory(existing?.history || [], {
        action: existing ? (mode === "draft" ? "Updated Draft" : "Submitted") : (mode === "draft" ? "Created Draft" : "Created And Submitted"),
        fromStage: existing?.stage || null,
        toStage: nextStage,
        comment: mode === "draft" ? "تم حفظ الطلب" : `تم إرسال الطلب إلى ${nextStage}`,
        actor: state.currentUser.name,
        actorEmail: state.currentUser.email
      })
    };

    if (existing) {
      const index = state.requests.findIndex((request) => request.id === existing.id);
      state.requests[index] = payload;
    } else {
      state.requests.unshift(payload);
    }

    await persistLocalOrRemote(payload);
    clearForm();
    resetRequestFilters();
    currentView = "requests";
    currentEditRequestId = null;
    saveUiState();
    renderApp();
    renderNavigation();
    renderRequestsTable();
    alert(mode === "draft" ? "تم حفظ الطلب كمسودة بنجاح." : `تم إرسال الطلب بنجاح إلى ${nextStage}.`);
  } catch (error) {
    console.error(error);
    alert("حدث خطأ أثناء معالجة الطلب. حاول مرة أخرى.");
  } finally {
    setRequestFormBusy(false, mode);
  }
}

async function persistLocalOrRemote(payload) {
  if (appConfig.dataMode === "supabase") {
    await dataService.upsertRequest(payload);
    return;
  }
  dataService.saveState(state);
}

function buildNextHistory(history, entry) {
  return [
    ...(history || []),
    {
      id: (crypto.randomUUID && crypto.randomUUID()) || `hist-${Date.now()}-${Math.random()}`,
      createdAt: new Date().toISOString(),
      ...entry
    }
  ];
}

async function archiveRequest(id) {
  const request = state.requests.find((item) => item.id === id);
  if (!request || request.archived) return;
  if (!state.currentUser.permissions?.archiveRequests) {
    alert("ليس لديك صلاحية أرشفة الطلبات.");
    return;
  }
  const reason = promptRequiredNote(`سبب أرشفة الطلب ${request.requestNo}`, "تمت الأرشفة بطلب إداري");
  if (reason === null) return;
  request.archived = true;
  request.archivedAt = new Date().toISOString();
  request.archiveReason = reason;
  request.updatedAt = request.archivedAt;
  request.history = buildNextHistory(request.history, {
    action: "Archived",
    fromStage: request.stage,
    toStage: request.stage,
    comment: reason || "تمت الأرشفة",
    actor: state.currentUser.name,
    actorEmail: state.currentUser.email
  });
  await persistLocalOrRemote(request);
  renderApp();
}

async function deleteRequest(id) {
  const request = state.requests.find((item) => item.id === id);
  if (!request) return;
  if (!state.currentUser.permissions?.deleteRequests) {
    alert("ليس لديك صلاحية حذف الطلبات.");
    return;
  }
  const reason = promptRequiredNote(`سبب حذف الطلب ${request.requestNo}`, "حذف إداري");
  if (reason === null) return;
  const settlement = hasRequestFinancialExposure(request);
  if (settlement.locked) {
    alert(`لا يمكن حذف الطلب ${request.requestNo} لأنه مرتبط بذمم أو مطالبات مالية.\n${settlement.message}\nسيتم تحويله إلى الأرشيف بدلاً من الحذف.`);
    request.archived = true;
    request.archivedAt = new Date().toISOString();
    request.archiveReason = reason;
    request.updatedAt = request.archivedAt;
    request.history = buildNextHistory(request.history, {
      action: "Archived Instead Of Delete",
      fromStage: request.stage,
      toStage: request.stage,
      comment: `${reason} | سبب المنع المالي: ${settlement.message}`,
      actor: state.currentUser.name,
      actorEmail: state.currentUser.email
    });
    await persistLocalOrRemote(request);
    closeDetailsDialog();
    renderApp();
    return;
  }
  const confirmed = window.confirm(`سيتم حذف الطلب ${request.requestNo} نهائياً من القائمة الحالية.\nالمتابعة؟`);
  if (!confirmed) return;
  state.requests = state.requests.filter((item) => item.id !== id);
  await dataService.saveState(state);
  closeDetailsDialog();
  renderApp();
}

function nextId(collection) {
  return collection.length ? Math.max(...collection.map((item) => item.id)) + 1 : 1;
}

function nextRequestNo() {
  const base = 26000000001n;
  const numericValues = state.requests
    .map((item) => item.requestNo)
    .filter((value) => /^\d+$/.test(String(value)))
    .map((value) => BigInt(value));
  const max = numericValues.length ? numericValues.reduce((a, b) => a > b ? a : b) : base - 1n;
  return String(max + 1n);
}

function formatCurrency(value) {
  return `${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0
  }).format(value || 0)} جنيه`;
}

function formatUsd(value) {
  return `${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2
  }).format(value || 0)} دولار`;
}

function formatReceivableSummary(invoiceValue, stampingValue) {
  const parts = [];
  if (Number(invoiceValue || 0) > 0) parts.push(`فاتورة ${formatUsd(invoiceValue)}`);
  if (Number(stampingValue || 0) > 0) parts.push(`تختيم ${formatCurrency(stampingValue)}`);
  return parts.join(" • ") || `فاتورة ${formatUsd(0)}`;
}

function formatAed(value) {
  return `${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2
  }).format(value || 0)} درهم`;
}

function resolveAccountLabel(account) {
  const labels = {
    treasury_sdg: "خزينة الجنيه",
    treasury_aed: "خزينة الدرهم",
    bank_sdg: "الحساب البنكي بالجنيه",
    collections: "السداد والتحصيل",
    expenses: "المنصرفات"
  };
  return labels[account] || account || "-";
}

function statusClass(status) {
  return status.replace(/\s+/g, "-");
}

function openReferenceDialog(type, editId = null) {
  currentReferenceType = type;
  currentReferenceEditId = editId;
  const dialog = document.getElementById("referenceDialog");
  const title = document.getElementById("referenceDialogTitle");
  const fields = document.getElementById("referenceFields");
  const config = referenceConfigs[type];
  const existing = editId ? state[type]?.find((item) => item.id === editId) : null;
  title.textContent = editId ? (config.editTitle || config.title) : config.title;
  fields.innerHTML = "";

  config.fields.forEach((field) => {
    const label = document.createElement("label");
    label.innerHTML = buildReferenceFieldMarkup(field, existing);
    fields.appendChild(label);
  });

  dialog.showModal();
}

async function saveReference() {
  const form = document.getElementById("referenceForm");
  if (!form?.reportValidity()) return;
  const payload = normalizeReferencePayload(currentReferenceType, Object.fromEntries(new FormData(form).entries()));
  if (!currentReferenceType) return;

  const target = state[currentReferenceType];
  const isEdit = currentReferenceEditId !== null;
  const existingItem = isEdit ? target.find((item) => item.id === currentReferenceEditId) : null;
  const nowIso = new Date().toISOString();
  const newItem = {
    id: isEdit ? currentReferenceEditId : nextId(target),
    ...payload,
    createdAt: existingItem?.createdAt || nowIso,
    updatedAt: nowIso
  };

  if (currentReferenceType === "users") {
    const rolePermissions = getRoleDefinitionByName(newItem.role)?.permissions || {};
    newItem.password = payload.password || existingItem?.password || "123456";
    newItem.permissions = newItem.inheritsRolePermissions
      ? { ...getDefaultPermissions(), ...rolePermissions }
      : { ...getDefaultPermissions(), ...(payload.permissions || {}) };
    newItem.defaultPage = userCanAccessView(newItem.defaultPage, { ...newItem, permissions: getEffectivePermissions(newItem) })
      ? newItem.defaultPage
      : getAccessibleDefaultView(newItem);
  }
  if (currentReferenceType === "roles") {
    state.users = state.users.map((user) => {
      if (user.role !== newItem.name || user.inheritsRolePermissions !== true) return user;
      return {
        ...user,
        permissions: {
          ...getDefaultPermissions(),
          ...(newItem.permissions || {})
        }
      };
    });
    if (state.currentUser.role === newItem.name && state.currentUser.inheritsRolePermissions === true) {
      state.currentUser.permissions = {
        ...getDefaultPermissions(),
        ...(newItem.permissions || {})
      };
    }
  }
  if (currentReferenceType === "customTables") {
    newItem.rows = existingItem?.rows || [];
  }

  if (appConfig.dataMode === "supabase" && !isEdit) {
    const saved = await dataService.createReference(currentReferenceType, newItem);
    target.unshift({ ...normalizeReferenceFromSupabase(currentReferenceType, saved), createdAt: nowIso, updatedAt: nowIso });
  } else {
    if (isEdit) {
      const index = target.findIndex((item) => item.id === currentReferenceEditId);
      if (index >= 0) {
        const previousItem = target[index];
        target[index] = { ...target[index], ...newItem };
        if (currentReferenceType === "stages") {
          syncStageReferences(previousItem.name, newItem.name);
        }
        if (currentReferenceType === "agents") {
          syncAgentReferences(previousItem.id, newItem.name);
        }
      }
      if (currentReferenceType === "users" && state.currentUser.id === currentReferenceEditId) {
        setCurrentUserFromRecord({
          ...state.currentUser,
          ...newItem
        });
        saveAuthSession();
      }
    } else {
      target.unshift(newItem);
    }
    if (["agents", "importerCompanies", "companies"].includes(currentReferenceType)) {
      reconcileOperationalReferences();
    }
    await dataService.saveState(state);
  }

  currentReferenceEditId = null;
  document.getElementById("referenceDialog").close();
  populateFormOptions();
  renderReferenceLists();
  renderDashboard();
  renderApp();
}

function syncStageReferences(previousName, nextName) {
  if (!previousName || !nextName || previousName === nextName) return;
  state.requests = state.requests.map((request) => ({
    ...request,
    stage: request.stage === previousName ? nextName : request.stage,
    history: (request.history || []).map((entry) => ({
      ...entry,
      fromStage: entry.fromStage === previousName ? nextName : entry.fromStage,
      toStage: entry.toStage === previousName ? nextName : entry.toStage
    })),
    documents: (request.documents || []).map((doc) => ({
      ...doc,
      stage: doc.stage === previousName ? nextName : doc.stage
    }))
  }));

  state.users = state.users.map((user) => ({
    ...user,
    stage: user.stage === previousName ? nextName : user.stage
  }));

  state.stages = state.stages.map((stage) => ({
    ...stage,
    next: stage.next === previousName ? nextName : stage.next
  }));

  if (state.currentUser.stage === previousName) {
    state.currentUser.stage = nextName;
  }
}

function syncAgentReferences(agentId, nextName) {
  if (!agentId) return;
  state.importerCompanies = state.importerCompanies.map((company) =>
    company.agentId === agentId ? { ...company, agentName: nextName || "" } : company
  );
}

function buildReferenceFieldMarkup(field, existing) {
  const rawValue = field.key in (existing?.permissions || {})
    ? existing.permissions[field.key]
    : existing?.[field.key];
  const displayValue = field.type === "password" ? "" : rawValue;
  const isRequired = field.required !== false;

  if (field.type === "select") {
    const options = field.optionsFromStages
      ? [{ value: "SystemAdmin", label: "مدير النظام" }, ...state.stages.map((stage) => ({ value: stage.name, label: stage.label || stage.name }))]
      : field.optionsFromRoles
        ? state.roles.filter((role) => role.active !== false).map((role) => ({ value: role.name, label: role.label || role.name }))
      : field.optionsFromDocumentCategories
        ? getDocumentCategoryOptions()
      : field.optionsFromDocumentNameSources
        ? getDocumentNameSourceOptions()
      : field.optionsFromInputFieldsBindKeys
        ? getInputFieldBindKeyOptions()
      : field.optionsFromAgents
        ? state.agents.map((agent) => ({ value: String(agent.id), label: agent.name }))
        : (field.options || []).map((option) => typeof option === "object" ? option : ({ value: String(option), label: String(option) }));
    return `
      <span>${field.label}</span>
      <select name="${field.key}" ${field.allowBlank ? "" : (isRequired ? "required" : "")}>
        ${field.allowBlank ? `<option value="">بدون</option>` : ""}
        ${options.map((option) => `<option value="${escapeHtml(option.value)}" ${String(rawValue || "") === option.value ? "selected" : ""}>${escapeHtml(option.label)}</option>`).join("")}
      </select>
    `;
  }

  if (field.type === "boolean") {
    const value = String(Boolean(rawValue));
    return `
      <span>${field.label}</span>
      <select name="${field.key}" ${isRequired ? "required" : ""}>
        <option value="true" ${value === "true" ? "selected" : ""}>نعم</option>
        <option value="false" ${value === "false" ? "selected" : ""}>لا</option>
      </select>
    `;
  }

  if (field.type === "textarea") {
    const textValue = Array.isArray(rawValue) ? rawValue.join(", ") : (rawValue || "");
    return `
      <span>${field.label}</span>
      <textarea name="${field.key}" rows="3" placeholder="${escapeHtml(field.placeholder || "")}" ${isRequired ? "required" : ""}>${escapeHtml(textValue)}</textarea>
    `;
  }

  return `
    <span>${field.label}</span>
    <input type="${field.type}" name="${field.key}" value="${escapeHtml(displayValue || "")}" ${field.type === "number" ? 'min="0" step="1"' : ""} ${isRequired ? "required" : ""}>
  `;
}

function normalizeReferencePayload(type, payload) {
  if (type === "users") return {
    name: payload.name.trim(),
    email: payload.email.trim(),
    password: payload.password?.trim() || "",
    role: payload.role,
    stage: payload.stage,
    inheritsRolePermissions: payload.inheritsRolePermissions === "true",
    defaultPage: payload.defaultPage || "dashboard",
    permissions: {
      adminPanel: payload.adminPanel === "true",
      manageUsers: payload.manageUsers === "true",
      manageStages: payload.manageStages === "true",
      archiveRequests: payload.archiveRequests === "true",
      deleteRequests: payload.deleteRequests === "true",
      editAllRequests: payload.editAllRequests === "true",
      readOnly: payload.readOnly === "true",
      accessDashboard: payload.accessDashboard === "true",
      accessRequests: payload.accessRequests === "true",
      accessNewRequest: payload.accessNewRequest === "true",
      accessReferences: payload.accessReferences === "true",
      accessAccounts: payload.accessAccounts === "true",
      accessReports: payload.accessReports === "true",
      accessArchive: payload.accessArchive === "true",
      accessWorkflow: payload.accessWorkflow === "true"
    }
  };
  if (type === "roles") return {
    name: payload.name.trim(),
    label: payload.label.trim(),
    description: payload.description?.trim() || "",
    allowedStages: splitCommaValues(payload.allowedStages),
    visibleSections: splitCommaValues(payload.visibleSections),
    editableSections: splitCommaValues(payload.editableSections),
    visibleFields: splitCommaValues(payload.visibleFields),
    editableFields: splitCommaValues(payload.editableFields),
    permissions: {
      adminPanel: payload.adminPanel === "true",
      manageUsers: payload.manageUsers === "true",
      manageStages: payload.manageStages === "true",
      archiveRequests: payload.archiveRequests === "true",
      deleteRequests: payload.deleteRequests === "true",
      editAllRequests: payload.editAllRequests === "true",
      readOnly: payload.readOnly === "true",
      accessDashboard: payload.accessDashboard === "true",
      accessRequests: payload.accessRequests === "true",
      accessNewRequest: payload.accessNewRequest === "true",
      accessReferences: payload.accessReferences === "true",
      accessAccounts: payload.accessAccounts === "true",
      accessReports: payload.accessReports === "true",
      accessArchive: payload.accessArchive === "true",
      accessWorkflow: payload.accessWorkflow === "true"
    },
    active: payload.active === "true"
  };
  if (type === "documentCategories") return {
    key: payload.key.trim(),
    label: payload.label.trim(),
    description: payload.description?.trim() || "",
    active: payload.active === "true"
  };
  if (type === "documentNameSources") return {
    key: payload.key.trim(),
    label: payload.label.trim(),
    bindKey: payload.bindKey?.trim() || "",
    description: payload.description?.trim() || "",
    active: payload.active === "true"
  };
  if (type === "stages") return {
    name: payload.name.trim(),
    label: payload.label.trim(),
    order: Number(payload.order || 0),
    next: payload.next || null,
    viewFields: splitCommaValues(payload.viewFields),
    editableFields: splitCommaValues(payload.editableFields),
    requiredDocuments: splitCommaValues(payload.requiredDocuments),
    optionalDocuments: splitCommaValues(payload.optionalDocuments),
    active: payload.active === "true"
  };
  if (type === "documentTypes") return {
    key: payload.key.trim(),
    label: payload.label.trim(),
    category: payload.category,
    nameSource: payload.nameSource,
    requiredStages: splitCommaValues(payload.requiredStages),
    optionalStages: splitCommaValues(payload.optionalStages),
    allowCustomTitle: payload.allowCustomTitle === "true",
    active: payload.active === "true"
  };
  if (type === "inputFields") return {
    key: payload.key.trim(),
    label: payload.label.trim(),
    mode: payload.mode,
    bindKey: payload.bindKey || payload.key.trim(),
    inputType: payload.inputType,
    section: payload.section,
    placeholder: payload.placeholder?.trim() || "",
    sortOrder: Number(payload.sortOrder || 0),
    required: payload.required === "true",
    active: payload.active === "true"
  };
  if (type === "customTables") return {
    key: payload.key.trim(),
    name: payload.name.trim(),
    description: payload.description?.trim() || "",
    columns: splitCommaValues(payload.columns),
    active: payload.active === "true"
  };
  if (type === "agents") return {
    name: payload.name.trim(),
    phone: payload.phone.trim(),
    email: payload.email.trim(),
    openingBalance: Number(payload.openingBalance || 0),
    outstandingAmount: Number(payload.outstandingAmount || 0),
    serviceFeeBalance: Number(payload.serviceFeeBalance || 0),
    notes: payload.notes?.trim() || ""
  };
  if (type === "importerCompanies") {
    const agent = state.agents.find((item) => item.id === Number(payload.agentId));
    return {
      name: payload.name.trim(),
      country: payload.country.trim(),
      agentId: payload.agentId ? Number(payload.agentId) : null,
      agentName: agent?.name || ""
    };
  }
  return payload;
}

function splitCommaValues(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

async function deleteReferenceRecord(type, id) {
  const record = state[type]?.find((item) => item.id === id);
  if (!record) return;
  const label = record.name || record.email || record.id;
  if (type === "users" && state.currentUser.id === id) {
    alert("لا يمكن حذف المستخدم الحالي من نفس الجلسة.");
    return;
  }
  if (type === "stages") {
    const inRequests = state.requests.some((request) => request.stage === record.name);
    const inUsers = state.users.some((user) => user.stage === record.name);
    if (inRequests || inUsers) {
      alert("لا يمكن حذف مرحلة مرتبطة بطلبات أو مستخدمين.");
      return;
    }
  }
  if (type === "documentTypes") {
    const inUse = state.requests.some((request) => (request.documents || []).some((doc) => doc.definitionKey === record.key));
    if (inUse) {
      alert("لا يمكن حذف تعريف مستند مرتبط بمستندات مرفوعة.");
      return;
    }
  }
  if (type === "documentCategories") {
    const inUse = state.documentTypes.some((item) => item.category === record.key);
    if (inUse) {
      alert("لا يمكن حذف نوع مستند مرتبط بتعريفات مستندات.");
      return;
    }
  }
  if (type === "documentNameSources") {
    const inUse = state.documentTypes.some((item) => item.nameSource === record.key);
    if (inUse) {
      alert("لا يمكن حذف مصدر اسم مرتبط بتعريفات مستندات.");
      return;
    }
  }
  const blockingRule = getReferenceDeletionBlock(type, id);
  if (blockingRule.locked) {
    const reason = promptRequiredNote(`هذا السجل مرتبط بذمم أو مطالبات ولا يمكن حذفه نهائياً.\nاكتب سبب الأرشفة لـ ${label}`);
    if (reason === null) return;
    archiveReferenceRecord(type, id, reason, blockingRule.message);
    return;
  }
  const confirmed = window.confirm(`هل تريد حذف هذا السجل: ${label}؟`);
  if (!confirmed) return;
  state[type] = state[type].filter((item) => item.id !== id);
  if (type === "agents") {
    state.importerCompanies = state.importerCompanies.map((company) =>
      company.agentId === id ? { ...company, agentId: null, agentName: "" } : company
    );
  }
  reconcileOperationalReferences();
  await dataService.saveState(state);
  populateFormOptions();
  renderApp();
}

function promptRequiredNote(message, defaultValue = "") {
  const note = window.prompt(message, defaultValue);
  if (note === null) return null;
  if (!String(note).trim()) {
    alert("يجب كتابة ملاحظة توضح السبب.");
    return null;
  }
  return String(note).trim();
}

function hasRequestFinancialExposure(request) {
  const invoiceAmount = Number(request.invoiceValue || 0);
  const serviceFeeAmount = Number(request.serviceFeeAmount || 0);
  const hasMoney = invoiceAmount > 0 || serviceFeeAmount > 0;
  const hasClaim = request.stage === "Completed" || request.transactionType === "Deferred";
  if (!hasMoney && !hasClaim) {
    return { locked: false, message: "" };
  }
  const reasons = [];
  if (invoiceAmount > 0) reasons.push(`قيمة فاتورة ${formatUsd(invoiceAmount)}`);
  if (serviceFeeAmount > 0) reasons.push(`تختيم ${formatCurrency(serviceFeeAmount)}`);
  if (request.stage === "Completed") reasons.push("الطلب مكتمل وداخل المطالبات");
  if (request.transactionType === "Deferred") reasons.push("معاملة دفع آجل مرتبطة بالتزامات");
  return { locked: true, message: reasons.join("، ") };
}

function getReferenceDeletionBlock(type, id) {
  if (type === "agents") {
    const agent = state.agents.find((item) => item.id === id);
    const linkedImporters = state.importerCompanies.filter((company) => company.agentId === id);
    const linkedRequests = state.requests.filter((request) => (request.agent || "") === (agent?.name || ""));
    const reasons = [];
    if (Number(agent?.openingBalance || 0) > 0) reasons.push(`رصيد افتتاحي ${formatCurrency(agent.openingBalance)}`);
    if (Number(agent?.outstandingAmount || 0) > 0) reasons.push(`مستحقات ${formatCurrency(agent.outstandingAmount)}`);
    if (Number(agent?.serviceFeeBalance || 0) > 0) reasons.push(`رسوم خدمات ${formatCurrency(agent.serviceFeeBalance)}`);
    if (linkedImporters.length) reasons.push(`مرتبط بـ ${linkedImporters.length} شركة مستوردة`);
    if (linkedRequests.length) reasons.push(`مرتبط بـ ${linkedRequests.length} طلب`);
    return { locked: reasons.length > 0, message: reasons.join("، ") };
  }

  if (type === "importerCompanies") {
    const linkedRequests = state.requests.filter((request) => request.importerCompanyId === id);
    const completed = linkedRequests.filter((request) => request.stage === "Completed");
    const openInvoice = linkedRequests.reduce((sum, request) => sum + Number(request.invoiceValue || 0), 0);
    const openStamping = linkedRequests.reduce((sum, request) => sum + Number(request.serviceFeeAmount || 0), 0);
    const reasons = [];
    if (linkedRequests.length) reasons.push(`مرتبطة بـ ${linkedRequests.length} طلب`);
    if (completed.length) reasons.push(`لديها ${completed.length} معاملة مكتملة`);
    if (openInvoice > 0) reasons.push(`ذمم فواتير ${formatUsd(openInvoice)}`);
    if (openStamping > 0) reasons.push(`تختيم ${formatCurrency(openStamping)}`);
    return { locked: reasons.length > 0, message: reasons.join("، ") };
  }

  if (type === "companies") {
    const linkedRequests = state.requests.filter((request) => request.sellerCompanyId === id);
    const totalInvoice = linkedRequests.reduce((sum, request) => sum + Number(request.invoiceValue || 0), 0);
    const reasons = [];
    if (linkedRequests.length) reasons.push(`مرتبطة بـ ${linkedRequests.length} طلب`);
    if (totalInvoice > 0) reasons.push(`قيمة فواتير ${formatUsd(totalInvoice)}`);
    return { locked: reasons.length > 0, message: reasons.join("، ") };
  }

  return { locked: false, message: "" };
}

function archiveReferenceRecord(type, id, reason, blockingMessage = "") {
  const recordIndex = state[type]?.findIndex((item) => item.id === id);
  if (recordIndex < 0) return;
  const nowIso = new Date().toISOString();
  state[type][recordIndex] = {
    ...state[type][recordIndex],
    archived: true,
    archivedAt: nowIso,
    archiveReason: reason,
    updatedAt: nowIso
  };
  if (type === "agents") {
    state.importerCompanies = state.importerCompanies.map((company) =>
      company.agentId === id ? { ...company, archived: company.archived ?? false } : company
    );
  }
  reconcileOperationalReferences();
  alert(`تمت أرشفة السجل بدلاً من حذفه لأنه مرتبط بحسابات أو مطالبات.\n${blockingMessage}`);
  dataService.saveState(state);
  populateFormOptions();
  renderApp();
}

function renderArchiveList() {
  const container = document.getElementById("archiveList");
  if (!container) return;

  const archivedEntries = [
    ...state.requests.filter((item) => item.archived).map((item) => ({
      entryType: "request",
      id: item.id,
      title: item.requestNo,
      subtitle: `${item.importerCompanyName || "-"} • ${item.stage || "-"}`,
      archivedAt: item.archivedAt || item.updatedAt,
      archiveReason: item.archiveReason || "بدون سبب",
      requestId: item.id
    })),
    ...state.companies.filter((item) => item.archived).map((item) => ({
      entryType: "reference",
      refType: "companies",
      id: item.id,
      title: item.name,
      subtitle: "شركة مصدرة",
      archivedAt: item.archivedAt || item.updatedAt,
      archiveReason: item.archiveReason || "بدون سبب"
    })),
    ...state.importerCompanies.filter((item) => item.archived).map((item) => ({
      entryType: "reference",
      refType: "importerCompanies",
      id: item.id,
      title: item.name,
      subtitle: `شركة مستوردة • ${item.agentName || "بدون وكيل"}`,
      archivedAt: item.archivedAt || item.updatedAt,
      archiveReason: item.archiveReason || "بدون سبب"
    })),
    ...state.agents.filter((item) => item.archived).map((item) => ({
      entryType: "reference",
      refType: "agents",
      id: item.id,
      title: item.name,
      subtitle: `وكيل • مستحقات ${formatCurrency(item.outstandingAmount || 0)}`,
      archivedAt: item.archivedAt || item.updatedAt,
      archiveReason: item.archiveReason || "بدون سبب"
    }))
  ].sort((a, b) => new Date(b.archivedAt || 0) - new Date(a.archivedAt || 0));

  if (!archivedEntries.length) {
    container.innerHTML = `<div class="empty-state">لا توجد عناصر مؤرشفة حالياً</div>`;
    return;
  }

  container.innerHTML = archivedEntries.map((entry) => `
    <article class="document-item archive-item">
      <div>
        <strong>${entry.entryType === "request"
          ? `<button class="inline-link" type="button" data-open-request="${entry.requestId}">${escapeHtml(entry.title)}</button>`
          : escapeHtml(entry.title)}</strong>
        <small>${escapeHtml(entry.subtitle)}</small>
        <small class="reference-audit">أرشف في ${escapeHtml(formatPreviewDate(entry.archivedAt))} • السبب: ${escapeHtml(entry.archiveReason)}</small>
      </div>
      <div class="document-actions">
        ${entry.entryType === "request"
          ? `<button class="ghost-button" type="button" data-restore-request="${entry.id}">استرجاع</button>`
          : `<button class="ghost-button" type="button" data-restore-reference="${entry.refType}:${entry.id}">استرجاع</button>`}
      </div>
    </article>
  `).join("");
}

function renderReports() {
  const activeRequests = state.requests.filter((request) => !request.archived);
  const completedRequests = activeRequests.filter((request) => request.stage === "Completed");
  const inProgressRequests = activeRequests.filter((request) => request.stage !== "Completed");
  const invoiceReceivables = completedRequests.reduce((sum, request) => sum + Number(request.invoiceValue || 0), 0);
  const stampingReceivables = completedRequests.reduce((sum, request) => sum + Number(request.serviceFeeAmount || 0), 0);

  const invoiceEl = document.getElementById("reportsInvoiceReceivables");
  const stampingEl = document.getElementById("reportsStampingReceivables");
  const progressEl = document.getElementById("reportsInProgressCount");
  const completedEl = document.getElementById("reportsCompletedCount");
  if (invoiceEl) invoiceEl.textContent = formatUsd(invoiceReceivables);
  if (stampingEl) stampingEl.textContent = formatCurrency(stampingReceivables);
  if (progressEl) progressEl.textContent = inProgressRequests.length;
  if (completedEl) completedEl.textContent = completedRequests.length;

  renderClaimsPanels("reportsCompletedClaimsList", "reportsDeferredClaimsList");

  const stageLoadList = document.getElementById("reportsStageLoadList");
  if (stageLoadList) {
    stageLoadList.innerHTML = state.stages.map((stage) => {
      const total = activeRequests.filter((request) => request.stage === stage.name).length;
      return `
        <article class="document-item">
          <div>
            <strong>${escapeHtml(stage.label)}</strong>
            <small>${escapeHtml(stage.name)}</small>
          </div>
          <div class="document-actions">
            <span class="badge">${total} طلب</span>
          </div>
        </article>
      `;
    }).join("") || `<div class="empty-state">لا توجد مراحل</div>`;
  }

  const financialSummary = document.getElementById("reportsFinancialSummary");
  if (financialSummary) {
    const deferredTotal = completedRequests
      .filter((request) => request.transactionType === "Deferred")
      .reduce((sum, request) => sum + Number(request.invoiceValue || 0), 0);
    const agentOutstanding = state.agents
      .filter((agent) => !agent.archived)
      .reduce((sum, agent) => sum + Number(agent.outstandingAmount || 0) + Number(agent.serviceFeeBalance || 0), 0);
    financialSummary.innerHTML = `
      <article class="document-item">
        <div>
          <strong>إجمالي ذمم الفواتير المكتملة</strong>
          <small>فقط الطلبات الجاهزة للمطالبة</small>
        </div>
        <div class="document-actions"><span class="badge">${escapeHtml(formatUsd(invoiceReceivables))}</span></div>
      </article>
      <article class="document-item">
        <div>
          <strong>إجمالي التختيم المكتمل</strong>
          <small>رسوم الخدمات القابلة للمطالبة</small>
        </div>
        <div class="document-actions"><span class="badge">${escapeHtml(formatCurrency(stampingReceivables))}</span></div>
      </article>
      <article class="document-item">
        <div>
          <strong>إجمالي الدفع الآجل المكتمل</strong>
          <small>ذمم مرتبطة بالبنوك</small>
        </div>
        <div class="document-actions"><span class="badge">${escapeHtml(formatUsd(deferredTotal))}</span></div>
      </article>
      <article class="document-item">
        <div>
          <strong>إجمالي ذمم الوكلاء</strong>
          <small>مستحقات + رصيد رسوم الخدمات</small>
        </div>
        <div class="document-actions"><span class="badge">${escapeHtml(formatCurrency(agentOutstanding))}</span></div>
      </article>
    `;
  }

  const agentsSummary = state.agents
    .filter((agent) => !agent.archived)
    .map((agent) => {
      const relatedRequests = state.requests.filter((request) => (request.agent || "") === agent.name);
      const metrics = buildRequestMetrics(relatedRequests, {
        partyNames: [agent.name],
        requestNoSet: new Set(relatedRequests.map((request) => request.requestNo).filter(Boolean))
      });
      return {
        buttonHtml: `<button class="inline-link" type="button" data-open-agent="${encodeURIComponent(agent.name)}">${escapeHtml(agent.name)}</button>`,
        metaLine: `${relatedRequests.length} معاملة • مستحقات ${formatCurrency(Number(agent.outstandingAmount || 0) + Number(agent.serviceFeeBalance || 0))}`,
        amountSummaryHtml: `مطالبات التختيم ${escapeHtml(formatCurrency(metrics.stampingReceivables))} • السداد المسجل ${escapeHtml(formatCurrency(metrics.paidAmount))}`,
        metrics
      };
    })
    .sort((a, b) => b.metrics.totalCount - a.metrics.totalCount || b.metrics.stampingReceivables - a.metrics.stampingReceivables);

  const importersSummary = state.importerCompanies
    .filter((company) => !company.archived)
    .map((company) => {
      const relatedRequests = state.requests.filter((request) => request.importerCompanyId === company.id);
      const metrics = buildRequestMetrics(relatedRequests, {
        partyNames: [company.name],
        requestNoSet: new Set(relatedRequests.map((request) => request.requestNo).filter(Boolean))
      });
      return {
        buttonHtml: `<button class="inline-link" type="button" data-open-company="importer:${company.id}">${escapeHtml(company.name)}</button>`,
        metaLine: `${company.agentName || "بدون وكيل"} • ${relatedRequests.length} معاملة`,
        amountSummaryHtml: `قيمة الفواتير ${escapeHtml(formatUsd(metrics.invoiceReceivables))} • سداد مسجل ${escapeHtml(formatUsd(metrics.paidAmount))}`,
        metrics
      };
    })
    .sort((a, b) => b.metrics.totalCount - a.metrics.totalCount || b.metrics.invoiceReceivables - a.metrics.invoiceReceivables);

  const exportersSummary = state.companies
    .filter((company) => !company.archived)
    .map((company) => {
      const relatedRequests = state.requests.filter((request) => request.sellerCompanyId === company.id);
      const metrics = buildRequestMetrics(relatedRequests, {
        partyNames: [company.name],
        requestNoSet: new Set(relatedRequests.map((request) => request.requestNo).filter(Boolean))
      });
      return {
        buttonHtml: `<button class="inline-link" type="button" data-open-company="exporter:${company.id}">${escapeHtml(company.name)}</button>`,
        metaLine: `${company.country || "-"} • ${relatedRequests.length} معاملة`,
        amountSummaryHtml: `قيمة الفواتير ${escapeHtml(formatUsd(metrics.invoiceReceivables))}`,
        metrics
      };
    })
    .sort((a, b) => b.metrics.totalCount - a.metrics.totalCount || b.metrics.invoiceReceivables - a.metrics.invoiceReceivables);

  renderEntitySummaryList("reportsAgentsSummary", agentsSummary, "لا توجد بيانات وكلاء لعرضها حالياً");
  renderEntitySummaryList("reportsImportersSummary", importersSummary, "لا توجد شركات مستوردة لعرضها حالياً");
  renderEntitySummaryList("reportsExportersSummary", exportersSummary, "لا توجد شركات مصدرة لعرضها حالياً");
}

function renderAccounts() {
  const entries = state.accountEntries || [];
  const treasuryBalance = calculateAccountBalance("treasury_sdg", "SDG");
  const treasuryAedBalance = calculateAccountBalance("treasury_aed", "AED");
  const completedRequests = state.requests.filter((request) => !request.archived && request.stage === "Completed");
  const invoiceReceivables = completedRequests.reduce((sum, request) => sum + Number(request.invoiceValue || 0), 0);
  const stampingReceivables = completedRequests.reduce((sum, request) => sum + Number(request.serviceFeeAmount || 0), 0);
  const collections = entries.filter((entry) => (entry.account === "collections" || entry.entryType === "collection") && (entry.currency || "SDG") === "SDG");
  const expenses = entries.filter((entry) => (entry.account === "expenses" || entry.entryType === "expense") && (entry.currency || "SDG") === "SDG");
  const aedMovements = entries.filter((entry) => entry.account === "treasury_aed" || entry.currency === "AED" || entry.entryType === "fxPurchase");
  const collectionsTotal = collections.reduce((sum, entry) => sum + Number(entry.amount || 0), 0);
  const expensesTotal = expenses.reduce((sum, entry) => sum + Number(entry.amount || 0), 0);

  const treasuryBalanceStat = document.getElementById("treasuryBalanceStat");
  const aedTreasuryBalanceStat = document.getElementById("aedTreasuryBalanceStat");
  const receivablesBalanceStat = document.getElementById("receivablesBalanceStat");
  const collectionsBalanceStat = document.getElementById("collectionsBalanceStat");
  const expensesBalanceStat = document.getElementById("expensesBalanceStat");
  if (treasuryBalanceStat) treasuryBalanceStat.textContent = formatCurrency(treasuryBalance);
  if (aedTreasuryBalanceStat) aedTreasuryBalanceStat.textContent = formatAed(treasuryAedBalance);
  if (receivablesBalanceStat) receivablesBalanceStat.textContent = `${formatUsd(invoiceReceivables)} • ${formatCurrency(stampingReceivables)}`;
  if (collectionsBalanceStat) collectionsBalanceStat.textContent = formatCurrency(collectionsTotal);
  if (expensesBalanceStat) expensesBalanceStat.textContent = formatCurrency(expensesTotal);

  renderAccountEntryList("treasuryMovementsList", entries.filter((entry) => ["treasury_sdg", "bank_sdg"].includes(entry.account) && (entry.currency || "SDG") === "SDG"), (entry) => `
    <strong>${escapeHtml(entry.title)}</strong>
    <small>${escapeHtml(resolveAccountLabel(entry.account))} • ${escapeHtml(formatPreviewDate(entry.createdAt))}</small>
    <small>${escapeHtml(entry.notes || "-")}</small>
  `, (entry) => `<span class="badge">${escapeHtml(entry.direction === "in" ? `+ ${formatCurrency(entry.amount)}` : `- ${formatCurrency(entry.amount)}`)}</span>`);

  renderAccountEntryList("aedTreasuryMovementsList", aedMovements, (entry) => `
    <strong>${escapeHtml(entry.title)}</strong>
    <small>${escapeHtml(resolveAccountLabel(entry.account))} • ${escapeHtml(formatPreviewDate(entry.createdAt))}</small>
    <small>${escapeHtml(entry.entryType === "fxPurchase" ? `شراء من ${resolveAccountLabel(entry.sourceAccount)} بمبلغ ${formatCurrency(entry.sourceAmount)}` : (entry.notes || "-"))}</small>
  `, (entry) => `<span class="badge">${escapeHtml(entry.direction === "in" ? `+ ${formatAed(entry.amount)}` : `- ${formatAed(entry.amount)}`)}</span>`);

  renderAccountEntryList("collectionsList", collections, (entry) => `
    <strong>${escapeHtml(entry.title)}</strong>
    <small>${escapeHtml(entry.partyName || "-")} ${entry.requestNo ? `• ${escapeHtml(entry.requestNo)}` : ""}</small>
    <small>${escapeHtml(entry.notes || "-")}</small>
  `, (entry) => `<span class="badge">${escapeHtml(formatCurrency(entry.amount))}</span>`);

  renderAccountEntryList("expensesList", expenses, (entry) => `
    <strong>${escapeHtml(entry.title)}</strong>
    <small>${escapeHtml(entry.partyName || "-")} • ${escapeHtml(formatPreviewDate(entry.createdAt))}</small>
    <small>${escapeHtml(entry.notes || "-")}</small>
  `, (entry) => `<span class="badge">${escapeHtml(formatCurrency(entry.amount))}</span>`);

  const receivablesList = document.getElementById("receivablesList");
  if (receivablesList) {
    if (!completedRequests.length) {
      receivablesList.innerHTML = `<div class="empty-state">لا توجد مطالبات مكتملة حالياً</div>`;
    } else {
      receivablesList.innerHTML = completedRequests.map((request) => `
        <article class="document-item">
          <div>
            <strong><button class="inline-link" type="button" data-open-request="${request.id}">${escapeHtml(request.requestNo)}</button></strong>
            <small>${escapeHtml(request.importerCompanyName || "-")} • ${escapeHtml(request.agent || "-")}</small>
            <small>${escapeHtml(formatReceivableSummary(request.invoiceValue || 0, request.serviceFeeAmount || 0))}</small>
          </div>
          <div class="document-actions">
            <span class="badge">${escapeHtml(formatUsd(request.invoiceValue || 0))}</span>
            <span class="badge">${escapeHtml(formatCurrency(request.serviceFeeAmount || 0))}</span>
          </div>
        </article>
      `).join("");
    }
  }
}

function calculateAccountBalance(account, currency = "SDG") {
  return (state.accountEntries || [])
    .filter((entry) => entry.account === account && (entry.currency || "SDG") === currency)
    .reduce((sum, entry) => sum + (entry.direction === "in" ? Number(entry.amount || 0) : -Number(entry.amount || 0)), 0);
}

async function saveAccountEntry(event) {
  event.preventDefault();
  const form = document.getElementById("accountEntryForm");
  if (!form?.reportValidity()) return;

  const entryType = document.getElementById("accountEntryTypeInput").value;
  const title = document.getElementById("accountEntryTitleInput").value.trim();
  const amount = Number(document.getElementById("accountEntryAmountInput").value || 0);
  const account = document.getElementById("accountEntryAccountInput").value;
  const currency = document.getElementById("accountEntryCurrencyInput").value || "SDG";
  const clientId = Number(document.getElementById("accountEntryClientInput").value || 0);
  const receivableRequestId = Number(document.getElementById("accountEntryReceivableInput").value || 0);
  const manualPartyName = document.getElementById("accountEntryPartyInput").value.trim();
  const requestNoInput = document.getElementById("accountEntryRequestNoInput").value.trim();
  const notes = document.getElementById("accountEntryNotesInput").value.trim();
  const nowIso = new Date().toISOString();
  const importer = state.importerCompanies.find((item) => item.id === clientId);
  const receivableRequest = state.requests.find((item) => item.id === receivableRequestId);
  const partyName = entryType === "collection" ? (importer?.name || "") : (entryType === "payment" ? (receivableRequest?.importerCompanyName || importer?.name || "") : manualPartyName);
  const requestNo = entryType === "payment" ? (receivableRequest?.requestNo || "") : requestNoInput;

  if (entryType === "fxPurchase") {
    const fxRate = Number(document.getElementById("accountEntryFxRateInput").value || 0);
    const aedAmount = Number(document.getElementById("accountEntryAedAmountInput").value || 0);
    if (!fxRate || !aedAmount) {
      alert("أدخل سعر الدرهم والمبلغ بالدرهم.");
      return;
    }
    state.accountEntries.unshift({
      id: nextId(state.accountEntries),
      entryType: "fxPurchaseOut",
      title: `${title} - سحب جنيه`,
      direction: "out",
      amount,
      currency: "SDG",
      account,
      partyName: partyName || "شراء عملة",
      requestNo,
      notes,
      createdAt: nowIso,
      updatedAt: nowIso
    });
    state.accountEntries.unshift({
      id: nextId(state.accountEntries),
      entryType: "fxPurchase",
      title,
      direction: "in",
      amount: aedAmount,
      currency: "AED",
      account: "treasury_aed",
      sourceAccount: account,
      sourceAmount: amount,
      fxRate,
      partyName: partyName || "شراء عملة",
      requestNo,
      notes,
      createdAt: nowIso,
      updatedAt: nowIso
    });
  } else {
    state.accountEntries.unshift({
      id: nextId(state.accountEntries),
      entryType,
      title,
      direction: entryType === "expense" || entryType === "payment" ? "out" : "in",
      amount,
      currency: entryType === "collection" ? "SDG" : currency,
      account,
      partyName,
      requestNo,
      notes,
      createdAt: nowIso,
      updatedAt: nowIso
    });
  }

  await dataService.saveState(state);
  closeAccountEntryDialog();
  renderApp();
}

function renderAccountEntryList(containerId, entries, bodyTemplate, badgeTemplate) {
  const container = document.getElementById(containerId);
  if (!container) return;
  if (!entries.length) {
    container.innerHTML = `<div class="empty-state">لا توجد حركة في هذا القسم</div>`;
    return;
  }
  container.innerHTML = entries
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .map((entry) => `
      <article class="document-item">
        <div>
          ${bodyTemplate(entry)}
        </div>
        <div class="document-actions">
          ${badgeTemplate(entry)}
        </div>
      </article>
    `).join("");
}

async function restoreRequest(id) {
  const request = state.requests.find((item) => item.id === id);
  if (!request || !request.archived) return;
  const reason = promptRequiredNote(`اكتب سبب استرجاع الطلب ${request.requestNo} بعد التسوية`, "تمت التسوية والاسترجاع");
  if (reason === null) return;
  request.archived = false;
  request.updatedAt = new Date().toISOString();
  request.history = buildNextHistory(request.history || [], {
    action: "Restored From Archive",
    fromStage: request.stage,
    toStage: request.stage,
    comment: reason,
    actor: state.currentUser.name,
    actorEmail: state.currentUser.email
  });
  await persistLocalOrRemote(request);
  renderApp();
}

async function restoreReferenceRecord(type, id) {
  const record = state[type]?.find((item) => item.id === id);
  if (!record || !record.archived) return;
  const reason = promptRequiredNote(`اكتب سبب استرجاع هذا السجل بعد التسوية`, "تمت التسوية والاسترجاع");
  if (reason === null) return;
  record.archived = false;
  record.updatedAt = new Date().toISOString();
  record.restoreReason = reason;
  await dataService.saveState(state);
  populateFormOptions();
  renderApp();
}

function normalizeReferenceFromSupabase(type, row) {
  if (type === "companies") return { id: row.id, name: row.name, agent: row.agent, country: row.country };
  if (type === "ports") return { id: row.id, name: row.name };
  if (type === "banks") return { id: row.id, name: row.name, branch: row.branch };
  if (type === "commodities") return { id: row.id, name: row.name, hsCode: row.hsCode ?? row.hs_code };
  if (["agents", "importerCompanies", "users", "roles", "stages", "documentTypes", "documentCategories", "documentNameSources", "inputFields", "customTables"].includes(type)) {
    return row;
  }
  return row;
}

function getReferenceFilterState(type) {
  return referenceFilters[type] || { search: "", from: "", to: "" };
}

function matchesReferenceFilters(type, item) {
  const filters = getReferenceFilterState(type);
  const search = String(filters.search || "").trim().toLowerCase();
  const searchableText = buildSearchableText(item);
  const latestActivity = item.updatedAt || item.createdAt || "";

  if (search && !searchableText.includes(search)) return false;
  if (filters.from && normalizeDateOnly(latestActivity) < filters.from) return false;
  if (filters.to && normalizeDateOnly(latestActivity) > filters.to) return false;
  return true;
}

function matchesDocumentsFilter(request, doc) {
  const search = String(documentsFilter.search || "").trim().toLowerCase();
  const documentName = resolveDocumentLinkedName(doc, request).toLowerCase();
  const haystack = [
    request.requestNo,
    request.importerCompanyName,
    doc.stage,
    documentName,
    getTemplateCategoryLabel(doc.category === "generated" ? doc.sourceCategory || "generated" : doc.category || "document")
  ].filter(Boolean).join(" ").toLowerCase();
  const uploadedDate = doc.uploadedAt || "";

  if (search && !haystack.includes(search)) return false;
  if (documentsFilter.from && normalizeDateOnly(uploadedDate) < documentsFilter.from) return false;
  if (documentsFilter.to && normalizeDateOnly(uploadedDate) > documentsFilter.to) return false;
  return true;
}

function buildSearchableText(item) {
  return Object.values(item || {})
    .flatMap((value) => flattenSearchValue(value))
    .join(" ")
    .toLowerCase();
}

function getInputFieldDefinitions() {
  return (state.inputFields || [])
    .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0));
}

function roleAllowsSection(sectionKey) {
  return true;
}

function roleAllowsEditSection(sectionKey) {
  const permissions = getEffectivePermissions();
  return !permissions.readOnly;
}

function roleAllowsField(fieldKey) {
  return true;
}

function roleAllowsEditField(fieldKey) {
  const permissions = getEffectivePermissions();
  return !permissions.readOnly;
}

function getCustomInputFieldDefinitions() {
  return getInputFieldDefinitions().filter((item) => item.active && (item.mode === "custom" || item.section === "custom"));
}

function getStaticInputFieldDefinitions() {
  return getInputFieldDefinitions().filter((item) => item.mode !== "custom");
}

function applyInputFieldDefinitions() {
  getStaticInputFieldDefinitions().forEach((field) => {
    const wrapper = document.querySelector(`[data-field-key="${field.bindKey}"]`);
    if (!wrapper) return;
    const label = wrapper.querySelector("span");
    const input = getManagedFieldElement(field.bindKey);
    wrapper.hidden = !field.active;
    if (label) label.textContent = field.label;
    if (input && !input.readOnly) {
      if (field.placeholder !== undefined && "placeholder" in input) input.placeholder = field.placeholder || "";
      if (field.required) input.setAttribute("required", "required");
      else input.removeAttribute("required");
      const canEdit = !getEffectivePermissions().readOnly;
      input.disabled = !canEdit;
      if ("readOnly" in input && input.tagName !== "SELECT") input.readOnly = !canEdit;
    }
  });
  renderCustomRequestFields(state.requests.find((item) => item.id === currentEditRequestId) || null);
}

function getManagedFieldElement(bindKey) {
  const wrapper = document.querySelector(`[data-field-key="${bindKey}"]`);
  if (!wrapper) return null;
  return wrapper.querySelector("input, select, textarea");
}

function renderCustomRequestFields(request = null) {
  const panel = document.getElementById("customFieldsPanel");
  const container = document.getElementById("dynamicRequestFields");
  if (!panel || !container) return;
  const fields = getCustomInputFieldDefinitions();
  if (!fields.length) {
    panel.hidden = true;
    container.innerHTML = "";
    return;
  }
  panel.hidden = false;
  container.innerHTML = "";
  fields.forEach((field) => {
    const value = request?.customFields?.[field.key] ?? "";
    const canEdit = !getEffectivePermissions().readOnly;
    const label = document.createElement("label");
    label.className = field.inputType === "textarea" ? "full-span" : "";
    label.innerHTML = `
      <span>${escapeHtml(field.label)}</span>
      ${field.inputType === "textarea"
        ? `<textarea data-custom-input-key="${field.key}" rows="3" placeholder="${escapeHtml(field.placeholder || "")}" ${field.required ? "required" : ""} ${canEdit ? "" : "readonly disabled"}>${escapeHtml(value)}</textarea>`
        : `<input data-custom-input-key="${field.key}" type="${field.inputType}" value="${escapeHtml(value)}" placeholder="${escapeHtml(field.placeholder || "")}" ${field.required ? "required" : ""} ${canEdit ? "" : "readonly disabled"}>`}
    `;
    container.appendChild(label);
  });
}

function flattenSearchValue(value) {
  if (value === null || value === undefined) return [];
  if (Array.isArray(value)) return value.flatMap((item) => flattenSearchValue(item));
  if (typeof value === "object") return Object.values(value).flatMap((item) => flattenSearchValue(item));
  return [String(value)];
}

function normalizeDateOnly(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function renderTemplateLibrary() {
  const container = document.getElementById("generationTemplatesList");
  if (!container) return;

  container.innerHTML = "";
  const templates = state.generationTemplates || [];

  if (!templates.length) {
    container.textContent = "لم يتم رفع أي قالب توليد بعد";
    container.classList.add("empty-state");
    return;
  }

  container.classList.remove("empty-state");
  templates.forEach((template) => {
    const item = document.createElement("article");
    item.className = "document-item";
    item.innerHTML = `
      <div>
        <strong>${template.title}</strong>
        <small>${getTemplateCategoryLabel(template.category)} • ${template.fileName}</small>
      </div>
      <div class="document-actions">
        <span class="badge">DOCX</span>
      </div>
    `;
    container.appendChild(item);
  });
}

async function saveGenerationTemplate() {
  const titleInput = document.getElementById("generationTemplateTitleInput");
  const categorySelect = document.getElementById("generationTemplateCategorySelect");
  const fileInput = document.getElementById("generationTemplateFileInput");

  const title = titleInput.value.trim();
  const category = categorySelect.value;
  const file = fileInput.files?.[0];

  if (!title) {
    alert("اكتب اسم القالب أولاً.");
    return;
  }

  if (!file) {
    alert("اختر ملف DOCX للقالب.");
    return;
  }

  if (!file.name.toLowerCase().endsWith(".docx")) {
    alert("نوع الملف يجب أن يكون DOCX.");
    return;
  }

  const dataUrl = await readFileAsDataUrl(file);
  const nextTemplate = {
    id: (crypto.randomUUID && crypto.randomUUID()) || `tpl-${Date.now()}-${Math.random()}`,
    title,
    category,
    fileName: file.name,
    mimeType: file.type || "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    dataUrl,
    uploadedAt: new Date().toISOString()
  };

  state.generationTemplates = [
    ...(state.generationTemplates || []).filter((item) => item.category !== category),
    nextTemplate
  ];

  await dataService.saveState(state);

  titleInput.value = "";
  categorySelect.value = "proformaInvoice";
  fileInput.value = "";
  renderTemplateLibrary();
  renderDocumentSections(state.requests.find((item) => item.id === currentEditRequestId) || null);
}

function getTemplateCategoryLabel(category) {
  return getDocumentCategoryLabel(category);
}

function findGenerationTemplateForCategory(category) {
  return (state.generationTemplates || []).find((item) => item.category === category) || null;
}

function calculateServiceFee(invoiceValue, ratePerThousand) {
  const usdValue = Number(invoiceValue || 0);
  const rate = Number(ratePerThousand || 0);
  return usdValue > 0 && rate > 0 ? (usdValue / 1000) * rate : 0;
}

function syncFinancialCalculation() {
  const invoiceValue = Number(document.getElementById("invoiceValueInput").value || 0);
  const rate = Number(document.getElementById("serviceFeeRateInput").value || 0);
  document.getElementById("serviceFeeAmountInput").value = calculateServiceFee(invoiceValue, rate);
}

function normalizeValue(value) {
  return String(value || "").trim().toLowerCase();
}

function getCurrentEditingStage() {
  const request = state.requests.find((item) => item.id === currentEditRequestId);
  return request?.stage || "DataEntry";
}

function getStageMeta(stageName) {
  return state.stages.find((stage) => stage.name === stageName) || state.stages[0];
}

function getNextStageName(stageName) {
  return getStageMeta(stageName)?.next || stageName;
}

function updateRequestFormContext(request = null) {
  const stageName = request?.stage || getCurrentEditingStage();
  const currentMeta = getStageMeta(stageName);
  const nextMeta = getStageMeta(getNextStageName(stageName));
  const currentEl = document.getElementById("currentFormStage");
  const nextEl = document.getElementById("nextFormStage");
  if (currentEl) currentEl.textContent = currentMeta?.name || "DataEntry";
  if (nextEl) nextEl.textContent = nextMeta?.name || stageName;
  const financeSection = document.getElementById("financeReviewSection");
  if (financeSection) financeSection.hidden = false;
  renderDynamicDocumentUploads(stageName, request);
}

function getStageDocumentDefinitions(stageName) {
  const activeDocumentTypes = (state.documentTypes || []).filter((item) => item.active);
  const required = activeDocumentTypes
    .filter((item) => (item.requiredStages || []).includes(stageName))
    .map((item) => ({ ...item, requirement: "required" }));
  const optional = activeDocumentTypes
    .filter((item) => !(item.requiredStages || []).includes(stageName) && (item.optionalStages || []).includes(stageName))
    .map((item) => ({ ...item, requirement: "optional" }));
  return [...required, ...optional];
}

function getAllActiveDocumentDefinitions() {
  return (state.documentTypes || []).filter((item) => item.active);
}

function renderDynamicDocumentUploads(stageName, request = null) {
  const container = document.getElementById("dynamicDocumentUploads");
  if (!container) return;

  const definitions = getStageDocumentDefinitions(stageName);
  container.innerHTML = "";

  if (!definitions.length) {
    container.innerHTML = `<div class="empty-state full-span">لا توجد مستندات معرفة لهذه المرحلة حالياً</div>`;
    return;
  }

  definitions.forEach((definition) => {
    clearUploadProgress(definition.key);
    const wrapper = document.createElement("div");
    wrapper.className = "dynamic-upload-card";
    const currentName = resolveDocumentDefinitionName(definition, request);
    const canEditDocuments = !getEffectivePermissions().readOnly;
    wrapper.innerHTML = `
      <label class="${definition.allowCustomTitle ? "" : "full-span"}">
        <span>${escapeHtml(definition.label)} ${definition.requirement === "required" ? "(مطلوب)" : "(اختياري)"}</span>
        ${definition.allowCustomTitle ? `<input id="uploadTitle-${definition.key}" type="text" placeholder="اسم المستند" ${canEditDocuments ? "" : "readonly disabled"}>` : `<div class="upload-name-hint">${escapeHtml(currentName || "سيأخذ الاسم من الحقل المرتبط")}</div>`}
        <input id="uploadFile-${definition.key}" type="file" ${canEditDocuments ? "" : "disabled"} accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.xls,.xlsx">
        <div class="upload-status" id="uploadStatus-${definition.key}" hidden>
          <div class="upload-progress-track upload-progress-track-top">
            <div class="upload-progress-bar" id="uploadProgressBar-${definition.key}"></div>
          </div>
          <div class="upload-status-head">
            <strong id="uploadStatusName-${definition.key}">-</strong>
            <span id="uploadProgressText-${definition.key}">0%</span>
          </div>
          <small id="uploadStatusMeta-${definition.key}">جاهز للرفع</small>
        </div>
      </label>
    `;
    container.appendChild(wrapper);
    renderUploadProgress(definition.key);
  });

  bindDynamicUploadInputs();
}

function renderDocumentSections(request) {
  const previousContainer = document.getElementById("previousStageDocuments");
  const currentContainer = document.getElementById("currentStageDocuments");
  if (!previousContainer || !currentContainer) return;

  const stageName = request?.stage || "DataEntry";
  const currentOrder = getStageMeta(stageName)?.order || 1;
  const documents = request?.documents || [];
  const previousDocs = documents.filter((doc) => {
    const docOrder = getStageMeta(doc.stage)?.order;
    return docOrder ? docOrder < currentOrder : false;
  });
  const currentDocs = documents.filter((doc) => {
    if (!doc.stage) return true;
    const docOrder = getStageMeta(doc.stage)?.order;
    if (!docOrder) return true;
    return doc.stage === stageName || docOrder === currentOrder;
  });

  previousContainer.innerHTML = "";
  currentContainer.innerHTML = "";

  if (!previousDocs.length) {
    previousContainer.textContent = "لا توجد مستندات من مراحل سابقة";
    previousContainer.classList.add("empty-state");
  } else {
    previousContainer.classList.remove("empty-state");
    previousDocs.forEach((doc) => previousContainer.appendChild(createDocumentItem(doc)));
  }

  if (!currentDocs.length) {
    currentContainer.textContent = "لا توجد مستندات مرفوعة لهذه المرحلة بعد";
    currentContainer.classList.add("empty-state");
  } else {
    currentContainer.classList.remove("empty-state");
    currentDocs.forEach((doc) => currentContainer.appendChild(createDocumentItem(doc)));
  }

  attachDynamicEvents();
  normalizeDocumentDigits();
}

function renderClaimsPanels(completedTargetId = "completedClaimsList", deferredTargetId = "deferredClaimsList") {
  const completedClaimsList = document.getElementById(completedTargetId);
  const deferredClaimsList = document.getElementById(deferredTargetId);
  if (!completedClaimsList || !deferredClaimsList) return;

  const completedRequests = state.requests.filter((request) => !request.archived && request.stage === "Completed");
  completedClaimsList.innerHTML = "";
  deferredClaimsList.innerHTML = "";

  if (!completedRequests.length) {
    completedClaimsList.innerHTML = `<div class="request-item"><div><h4>لا توجد مطالبات مكتملة</h4><div class="request-meta">ستظهر هنا فقط الطلبات المكتملة الجاهزة للمطالبة</div></div></div>`;
    deferredClaimsList.innerHTML = `<div class="request-item"><div><h4>لا توجد معاملات دفع آجل مكتملة</h4><div class="request-meta">يتم العرض بعد اكتمال الطلبات فقط</div></div></div>`;
    return;
  }

  completedRequests.forEach((request) => {
    const item = document.createElement("article");
    item.className = "request-item";
    item.innerHTML = `
      <div>
        <h4>${request.requestNo} • ${request.importerCompanyName}</h4>
        <div class="request-meta">قيد على الشركة المستوردة بقيمة ${formatUsd(request.invoiceValue)} • قيد على الوكيل ${request.agent || "-"} بتختيم ${formatCurrency(request.serviceFeeAmount || 0)}</div>
      </div>
      <div>
        <span class="status-pill status-Completed">Completed</span>
      </div>
    `;
    completedClaimsList.appendChild(item);
  });

  const deferredMap = new Map();
  completedRequests
    .filter((request) => request.transactionType === "Deferred")
    .forEach((request) => {
      const key = `${request.importerCompanyName}__${request.bankName || "بدون بنك"}`;
      const current = deferredMap.get(key) || {
        importerCompanyName: request.importerCompanyName,
        bankName: request.bankName || "بدون بنك",
        invoiceValue: 0,
        count: 0
      };
      current.invoiceValue += Number(request.invoiceValue || 0);
      current.count += 1;
      deferredMap.set(key, current);
    });

  if (!deferredMap.size) {
    deferredClaimsList.innerHTML = `<div class="request-item"><div><h4>لا توجد مطالبات دفع آجل مكتملة</h4><div class="request-meta">المعاملات النقدية لا تظهر هنا</div></div></div>`;
    return;
  }

  [...deferredMap.values()].forEach((itemData) => {
    const item = document.createElement("article");
    item.className = "request-item";
    item.innerHTML = `
      <div>
        <h4>${itemData.importerCompanyName}</h4>
        <div class="request-meta">${itemData.count} فاتورة مكتملة • البنك: ${itemData.bankName}</div>
      </div>
      <div>
        <span class="status-pill status-Completed">${formatUsd(itemData.invoiceValue)}</span>
      </div>
    `;
    deferredClaimsList.appendChild(item);
  });
}

function createDocumentItem(doc) {
  const wrapper = document.createElement("article");
  wrapper.className = "document-item";
  const documentName = resolveDocumentLinkedName(doc);
  const canOpen = Boolean(doc.dataUrl);
  const canPreview = doc.category === "generated" && Boolean(doc.previewHtml);
  const canGenerate = doc.category !== "generated" && Boolean(findGenerationTemplateForCategory(doc.category));
  wrapper.innerHTML = `
    <div>
      <strong>${documentName}</strong>
      <small>${doc.stage} • ${doc.fileName}</small>
    </div>
    <div class="document-actions">
      ${canPreview ? `<button class="ghost-button" type="button" data-preview-generated-doc="${doc.id}">معاينة</button>` : `<button class="ghost-button" type="button" ${canOpen ? `data-preview-doc="${doc.id}"` : "disabled"}>معاينة</button>`}
      ${canGenerate ? `<button class="secondary-button" type="button" data-generate-from-doc="${doc.id}">توليد</button>` : ""}
      <button class="ghost-button" type="button" ${canOpen ? `data-open-doc="${doc.id}"` : "disabled"}>عرض</button>
      <button class="primary-button" type="button" ${canOpen ? `data-download-doc="${doc.id}"` : "disabled"}>تنزيل</button>
    </div>
  `;
  return wrapper;
}

async function buildDocumentUploads(existing, stageName) {
  const priorDocuments = existing?.documents ? [...existing.documents] : [];
  const uploadedDocs = [];
  for (const definition of getStageDocumentDefinitions(stageName)) {
    const input = document.getElementById(`uploadFile-${definition.key}`);
    const file = input?.files?.[0];
    if (!file) continue;
    const customTitle = document.getElementById(`uploadTitle-${definition.key}`)?.value.trim();
    const title = resolveDocumentDefinitionName(definition, existing, customTitle);
    try {
      setUploadProgress(definition.key, {
        fileName: file.name,
        fileSize: file.size,
        progress: 10,
        status: "uploading",
        statusText: "بدء تجهيز الملف"
      });
      startUploadProgressAnimation(definition.key);
      await waitForUiPaint();
      const dataUrl = await readFileAsDataUrl(file, (progress) => {
        setUploadProgress(definition.key, {
          fileName: file.name,
          fileSize: file.size,
          progress: Math.max(15, progress),
          status: "uploading",
          statusText: progress >= 100 ? "جاري إنهاء الرفع" : progress < 40 ? "جارٍ قراءة الملف" : "جارٍ رفع الملف"
        });
      });
      stopUploadProgressAnimation(definition.key);
      uploadedDocs.push({
        id: (crypto.randomUUID && crypto.randomUUID()) || `doc-${Date.now()}-${Math.random()}`,
        title,
        category: definition.category,
        definitionKey: definition.key,
        stage: stageName,
        fileName: `${sanitizeFileTitle(title)}.${getFileExtension(file.name)}`,
        originalFileName: file.name,
        mimeType: file.type || "application/octet-stream",
        dataUrl,
        uploadedAt: new Date().toISOString()
      });
      setUploadProgress(definition.key, {
        fileName: file.name,
        fileSize: file.size,
        progress: 100,
        status: "complete",
        statusText: "تم رفع الملف"
      });
    } catch (error) {
      stopUploadProgressAnimation(definition.key);
      setUploadProgress(definition.key, {
        fileName: file.name,
        fileSize: file.size,
        progress: 0,
        status: "error",
        statusText: "فشل رفع الملف"
      });
      throw error;
    }
  }

  return [...priorDocuments, ...uploadedDocs];
}

function resolveDocumentDefinitionName(definition, request = null, customTitle = "") {
  const fieldSources = {
    proformaInvoice: document.getElementById("proformaInvoiceInput")?.value.trim() || request?.proformaInvoice,
    finalInvoice: document.getElementById("finalInvoiceInput")?.value.trim() || request?.finalInvoice,
    blNumber: document.getElementById("blNumberInput")?.value.trim() || request?.blNumber,
    cooNumber: document.getElementById("cooNumberInput")?.value.trim() || request?.cooNumber,
    importPermit: document.getElementById("importPermitInput")?.value.trim() || request?.importPermit,
    customTitle
  };
  const sourceMeta = getDocumentNameSourceMeta(definition.nameSource);
  const sourceKey = sourceMeta?.bindKey || definition.nameSource;
  if (sourceKey && fieldSources[sourceKey]) return fieldSources[sourceKey];
  if (definition.nameSource === "customTitle" && customTitle) return customTitle;
  return definition.label || definition.key;
}

function findRequestByDocumentId(documentId) {
  return state.requests.find((request) => (request.documents || []).some((doc) => doc.id === documentId)) || null;
}

function resolveDocumentLinkedName(doc, request = null) {
  const linkedRequest = request || findRequestByDocumentId(doc.id);
  if (!linkedRequest) return doc.title || doc.fileName || "مستند";
  if (doc.category === "generated") return doc.title || doc.fileName || "مستند مولد";
  const definition = (state.documentTypes || []).find((item) => item.key === doc.definitionKey || item.category === doc.category);
  if (!definition) return doc.title || doc.fileName || "مستند";
  return resolveDocumentDefinitionName(definition, linkedRequest, doc.title) || doc.title || doc.fileName || "مستند";
}

function resolveDocumentStoredValueName(doc, request = null) {
  const linkedRequest = request || findRequestByDocumentId(doc.id);
  if (!linkedRequest) return doc.title || doc.fileName || "مستند";

  const key = doc.definitionKey || doc.category || "";
  const explicitValueMap = {
    proformaInvoice: linkedRequest.proformaInvoice,
    finalInvoice: linkedRequest.finalInvoice,
    bl: linkedRequest.blNumber,
    blNumber: linkedRequest.blNumber,
    coo: linkedRequest.cooNumber,
    cooNumber: linkedRequest.cooNumber,
    importPermit: linkedRequest.importPermit
  };

  const explicitValue = explicitValueMap[key];
  if (String(explicitValue || "").trim()) {
    return String(explicitValue).trim();
  }

  const definition = (state.documentTypes || []).find((item) => item.key === doc.definitionKey || item.category === doc.category);
  if (!definition) return doc.title || doc.fileName || "مستند";

  const fieldValueMap = {
    proformaInvoice: linkedRequest.proformaInvoice,
    finalInvoice: linkedRequest.finalInvoice,
    blNumber: linkedRequest.blNumber,
    cooNumber: linkedRequest.cooNumber,
    importPermit: linkedRequest.importPermit
  };

  const sourceMeta = getDocumentNameSourceMeta(definition.nameSource);
  const sourceKey = sourceMeta?.bindKey || definition.nameSource;
  const fieldValue = fieldValueMap[sourceKey];
  if (String(fieldValue || "").trim()) {
    return String(fieldValue).trim();
  }

  if (definition.nameSource === "customTitle" && String(doc.title || "").trim()) {
    return String(doc.title).trim();
  }

  return doc.title || doc.fileName || definition.label || "مستند";
}

function sanitizeFileTitle(value) {
  return String(value || "document")
    .trim()
    .replace(/[\\/:*?"<>|]+/g, "-")
    .replace(/\s+/g, "_");
}

function getFileExtension(fileName) {
  const parts = String(fileName).split(".");
  return parts.length > 1 ? parts.pop() : "file";
}

function readFileAsDataUrl(file, onProgress = null) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    if (onProgress) onProgress(10);
    reader.onload = () => {
      if (onProgress) onProgress(100);
      resolve(reader.result);
    };
    reader.onerror = () => reject(reader.error);
    reader.onprogress = (event) => {
      if (!onProgress) return;
      if (!event.lengthComputable) {
        onProgress(60);
        return;
      }
      const progress = Math.round((event.loaded / event.total) * 100);
      onProgress(progress);
    };
    reader.readAsDataURL(file);
  });
}

function readBlobAsDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

function dataUrlToBlob(dataUrl) {
  const [meta, content] = String(dataUrl || "").split(",");
  if (!meta || !content) throw new Error("Invalid data URL");
  const mimeMatch = meta.match(/data:(.*?);base64/);
  const mimeType = mimeMatch?.[1] || "application/octet-stream";
  const binary = atob(content);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return new Blob([bytes], { type: mimeType });
}

async function generateDocumentFromTemplate(documentId) {
  const sourceDocument = getEditingRequestDocument(documentId);
  const request = buildCurrentTemplateRequest();

  if (!sourceDocument) {
    alert("لم يتم العثور على المستند المطلوب.");
    return;
  }

  const template = findGenerationTemplateForCategory(sourceDocument.category);
  if (!template) {
    alert("لا يوجد قالب توليد مرفوع لهذا النوع من المستندات بعد.");
    return;
  }

  const validationIssues = validateGenerationRequest(request);
  if (validationIssues.length) {
    alert(`لا يمكن توليد المستند قبل إكمال هذه البيانات:\n- ${validationIssues.join("\n- ")}`);
    return;
  }

  if (!window.JSZip) {
    alert("مكتبة توليد المستندات غير محملة.");
    return;
  }

  try {
    const bundle = extractBase64FromDataUrl(template.dataUrl);
    const xml = buildBoundInvoiceXml(request);
    const zip = await window.JSZip.loadAsync(base64ToUint8Array(bundle));
    zip.file("customXml/item2.xml", xml);

    const blob = await zip.generateAsync({
      type: "blob",
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    });

    const fileName = buildGeneratedTemplateFileName(request, sourceDocument, template);
    downloadBlob(blob, fileName);

    const existing = state.requests.find((item) => item.id === currentEditRequestId);
    if (existing) {
      const generatedDoc = await buildGeneratedTemplateDocument(existing.stage, template, sourceDocument, request, fileName, blob);
      const index = state.requests.findIndex((item) => item.id === existing.id);
      if (index >= 0) {
        state.requests[index] = {
          ...state.requests[index],
          ...request,
          documents: upsertGeneratedDocument(state.requests[index].documents || [], generatedDoc)
        };
        await persistLocalOrRemote(state.requests[index]);
        renderDashboard();
        renderRequestsTable();
        renderDocumentSections(state.requests[index]);
      }
    }
  } catch (error) {
    console.error(error);
    alert("تعذر توليد المستند من القالب الحالي. تأكد أن القالب من نفس نوع Word XML binding المستخدم.");
  }
}

function previewGeneratedDocument(documentId) {
  const generatedDoc = findStoredDocument(documentId);
  if (!generatedDoc?.previewHtml) {
    alert("معاينة هذا المستند غير متاحة.");
    return;
  }
  openTemplatePreview(generatedDoc.title || "معاينة المستند", generatedDoc.previewHtml);
}

function previewStoredDocument(documentId) {
  const documentItem = findStoredDocument(documentId);
  if (!documentItem?.dataUrl) {
    alert("تعذر معاينة هذا المستند.");
    return;
  }

  const mimeType = String(documentItem.mimeType || "").toLowerCase();
  const title = documentItem.title || documentItem.fileName || "معاينة المستند";
  let html = "";

  if (mimeType.startsWith("image/")) {
    html = `
      <section class="preview-sheet">
        <div class="preview-sheet-header">
          <div>
            <p class="eyebrow">Document Preview</p>
            <h4>${escapeHtml(title)}</h4>
          </div>
          <span class="badge">${escapeHtml(documentItem.fileName || "-")}</span>
        </div>
        <div class="asset-preview-frame">
          <img class="asset-preview-image" src="${documentItem.dataUrl}" alt="${escapeHtml(title)}">
        </div>
      </section>
    `;
    openTemplatePreview(title, html);
    return;
  }

  if (mimeType === "application/pdf") {
    html = `
      <section class="preview-sheet">
        <div class="preview-sheet-header">
          <div>
            <p class="eyebrow">PDF Preview</p>
            <h4>${escapeHtml(title)}</h4>
          </div>
          <span class="badge">${escapeHtml(documentItem.fileName || "-")}</span>
        </div>
        <iframe class="asset-preview-frame" src="${documentItem.dataUrl}" title="${escapeHtml(title)}"></iframe>
      </section>
    `;
    openTemplatePreview(title, html);
    return;
  }

  html = `
    <section class="preview-sheet">
      <div class="preview-sheet-header">
        <div>
          <p class="eyebrow">Document Preview</p>
          <h4>${escapeHtml(title)}</h4>
        </div>
        <span class="badge">${escapeHtml(documentItem.fileName || "-")}</span>
      </div>
      <section class="preview-section">
        <h5>المعاينة المباشرة غير متاحة لهذا النوع</h5>
        <p>هذا الملف من نوع مكتبي مثل Word أو Excel، لذلك المتصفح لا يعرضه داخلياً بشكل ثابت.</p>
        <p>استخدم زر عرض لفتحه في تبويب جديد أو زر تنزيل لمراجعته على الجهاز.</p>
      </section>
    </section>
  `;
  openTemplatePreview(title, html);
}

function getEditingRequestDocument(documentId) {
  const request = state.requests.find((item) => item.id === currentEditRequestId);
  return request?.documents?.find((doc) => doc.id === documentId) || null;
}

function findStoredDocument(documentId) {
  for (const request of state.requests) {
    const documentItem = request.documents?.find((doc) => doc.id === documentId);
    if (documentItem) return documentItem;
  }
  return null;
}

function findRequestInvoiceDocument(request) {
  if (!request) return null;
  const documents = request.documents || [];
  const preferredKeys = ["finalInvoice", "proformaInvoice"];
  for (const key of preferredKeys) {
    const exactMatch = documents.find((doc) => doc.definitionKey === key);
    if (exactMatch) return exactMatch;
  }
  const fallbackCategories = ["finalInvoice", "proformaInvoice", "invoice"];
  return documents.find((doc) => fallbackCategories.includes(doc.category) || fallbackCategories.includes(doc.sourceCategory)) || null;
}

function openRequestInvoicePreview(requestId) {
  const request = state.requests.find((item) => item.id === requestId);
  if (!request) return;
  const invoiceDocument = findRequestInvoiceDocument(request);
  if (!invoiceDocument) {
    alert("لا يوجد مستند فاتورة مرفوع لهذا الطلب حتى الآن.");
    openRequestDetails(requestId);
    return;
  }
  if (invoiceDocument.category === "generated" && invoiceDocument.previewHtml) {
    previewGeneratedDocument(invoiceDocument.id);
    return;
  }
  previewStoredDocument(invoiceDocument.id);
}

function openStoredDocument(documentId) {
  const documentItem = findStoredDocument(documentId);
  if (!documentItem?.dataUrl) {
    alert("تعذر فتح هذا المستند.");
    return;
  }

  try {
    const blob = dataUrlToBlob(documentItem.dataUrl);
    const url = URL.createObjectURL(blob);
    window.open(url, "_blank", "noopener,noreferrer");
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  } catch (error) {
    console.error(error);
    alert("تعذر فتح هذا المستند.");
  }
}

function downloadStoredDocument(documentId) {
  const documentItem = findStoredDocument(documentId);
  if (!documentItem?.dataUrl) {
    alert("تعذر تنزيل هذا المستند.");
    return;
  }

  try {
    const blob = dataUrlToBlob(documentItem.dataUrl);
    const linkedRequest = findRequestByDocumentId(documentId);
    const linkedName = resolveDocumentStoredValueName(documentItem, linkedRequest);
    const extension = getFileExtension(documentItem.fileName || documentItem.originalFileName || "file");
    downloadBlob(blob, `${sanitizeFileTitle(linkedName)}.${extension}`);
  } catch (error) {
    console.error(error);
    alert("تعذر تنزيل هذا المستند.");
  }
}

async function buildGeneratedTemplateDocument(stageName, template, sourceDocument, request, fileName, blob) {
  return {
    id: (crypto.randomUUID && crypto.randomUUID()) || `doc-${Date.now()}-${Math.random()}`,
    title: `${template.title} • ${sourceDocument.title}`,
    category: "generated",
    templateKey: template.id,
    sourceCategory: sourceDocument.category,
    stage: stageName,
    fileName,
    originalFileName: fileName,
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    previewHtml: buildGeneratedDocumentPreview(fileName, template, sourceDocument, request),
    dataUrl: await readBlobAsDataUrl(blob),
    uploadedAt: new Date().toISOString()
  };
}

function upsertGeneratedDocument(documents, nextDocument) {
  return [
    ...documents.filter((doc) => !(doc.category === "generated" && doc.templateKey === nextDocument.templateKey && doc.sourceCategory === nextDocument.sourceCategory && doc.stage === nextDocument.stage)),
    nextDocument
  ];
}

function validateGenerationRequest(request) {
  const issues = [];
  if (!request.sellerCompanyName) issues.push("حدد الشركة البائعة");
  if (!request.importerCompanyName) issues.push("حدد الشركة المستوردة");
  if (!request.finalInvoice && !request.proformaInvoice) issues.push("أدخل رقم فاتورة نهائية أو مبدئية");
  if (!request.blNumber) issues.push("أدخل رقم البوليصة");
  if (!request.invoiceValue) issues.push("أدخل قيمة الفاتورة");
  return issues;
}

function extractBase64FromDataUrl(dataUrl) {
  return String(dataUrl || "").split(",")[1] || "";
}

function buildGeneratedTemplateFileName(request, sourceDocument, template) {
  const stem = sanitizeFileTitle(sourceDocument.title || request.requestNo || sourceDocument.category);
  const suffix = sanitizeFileTitle(template.title || getTemplateCategoryLabel(template.category));
  return `${stem}-${suffix}.docx`;
}

function buildGeneratedDocumentPreview(fileName, template, sourceDocument, request) {
  return `
    <section class="preview-sheet">
      <div class="preview-sheet-header">
        <div>
          <p class="eyebrow">Generated Document</p>
          <h4>${escapeHtml(template.title)}</h4>
        </div>
        <span class="badge">${escapeHtml(fileName)}</span>
      </div>
      <div class="preview-grid">
        <article class="preview-item">
          <span>نوع المستند</span>
          <strong>${escapeHtml(getTemplateCategoryLabel(sourceDocument.category))}</strong>
        </article>
        <article class="preview-item">
          <span>المستند المصدر</span>
          <strong>${escapeHtml(sourceDocument.title || "-")}</strong>
        </article>
        <article class="preview-item">
          <span>الشركة المستوردة</span>
          <strong>${escapeHtml(request.importerCompanyName || "-")}</strong>
        </article>
        <article class="preview-item">
          <span>رقم الطلب</span>
          <strong>${escapeHtml(request.requestNo || "-")}</strong>
        </article>
      </div>
      <section class="preview-section">
        <h5>ملاحظة</h5>
        <p>هذه معاينة تشغيلية للمستند المولد من القالب المرفوع في لوحة التحكم.</p>
      </section>
    </section>
  `;
}

function base64ToUint8Array(base64) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function buildCurrentTemplateRequest() {
  const existing = state.requests.find((item) => item.id === currentEditRequestId);
  return {
    ...existing,
    ...gatherRequestFormData(),
    requestNo: existing?.requestNo || nextRequestNo(),
    stage: existing?.stage || "DataEntry",
    status: existing?.status || "Draft",
    createdAt: existing?.createdAt || new Date().toISOString(),
    createdBy: existing?.createdBy || state.currentUser.email,
    documents: existing?.documents || []
  };
}

function openTemplatePreview(title, html) {
  const dialog = document.getElementById("templatePreviewDialog");
  const titleEl = document.getElementById("templatePreviewTitle");
  const bodyEl = document.getElementById("templatePreviewBody");
  titleEl.textContent = title;
  bodyEl.innerHTML = html;
  normalizeDocumentDigits(bodyEl);
  dialog.showModal();
}

function closeTemplatePreview() {
  document.getElementById("templatePreviewDialog").close();
}

function buildBoundInvoicePreview(request) {
  const seller = state.companies.find((item) => item.id === request.sellerCompanyId);
  const importer = state.importerCompanies.find((item) => item.id === request.importerCompanyId);
  const bank = state.banks.find((item) => item.id === request.bankId);
  const exporterAddress = [seller?.country].filter(Boolean).join(" - ") || request.sellerCompanyName;
  const consigneeAddress = importer?.country || "";
  const bankLabel = [request.bankName || bank?.name, bank?.branch].filter(Boolean).join(" - ");

  return `
    <section class="preview-sheet">
      <div class="preview-sheet-header">
        <div>
          <p class="eyebrow">Commercial Invoice</p>
          <h4>Invoice Template Preview</h4>
        </div>
        <span class="badge">${escapeHtml(request.requestNo)}</span>
      </div>

      <div class="preview-grid">
        <article class="preview-item">
          <span>رقم الفاتورة</span>
          <strong>${escapeHtml(request.finalInvoice || request.requestNo)}</strong>
        </article>
        <article class="preview-item">
          <span>تاريخ الفاتورة</span>
          <strong>${escapeHtml(formatPreviewDate(request.createdAt))}</strong>
        </article>
        <article class="preview-item">
          <span>رقم الفاتورة المبدئية</span>
          <strong>${escapeHtml(request.proformaInvoice || "-")}</strong>
        </article>
        <article class="preview-item">
          <span>رقم البوليصة</span>
          <strong>${escapeHtml(request.blNumber || "-")}</strong>
        </article>
      </div>

      <div class="preview-grid">
        <article class="preview-item">
          <span>الشركة البائعة</span>
          <strong>${escapeHtml(request.sellerCompanyName || "-")}</strong>
        </article>
        <article class="preview-item">
          <span>عنوان/بيانات البائع</span>
          <strong>${escapeHtml(exporterAddress || "-")}</strong>
        </article>
        <article class="preview-item">
          <span>الشركة المستوردة</span>
          <strong>${escapeHtml(request.importerCompanyName || "-")}</strong>
        </article>
        <article class="preview-item">
          <span>عنوان المستورد</span>
          <strong>${escapeHtml(consigneeAddress || "-")}</strong>
        </article>
      </div>

      <div class="preview-grid">
        <article class="preview-item">
          <span>السلعة</span>
          <strong>${escapeHtml(request.commodityName || "-")}</strong>
        </article>
        <article class="preview-item">
          <span>HS Code</span>
          <strong>${escapeHtml(request.hsCode || "-")}</strong>
        </article>
        <article class="preview-item">
          <span>المنشأ</span>
          <strong>${escapeHtml(request.origin || "-")}</strong>
        </article>
        <article class="preview-item">
          <span>قيمة الفاتورة</span>
          <strong>${escapeHtml(formatUsd(request.invoiceValue))}</strong>
        </article>
      </div>

      <div class="preview-grid">
        <article class="preview-item">
          <span>ميناء الوصول</span>
          <strong>${escapeHtml(request.portName || "-")}</strong>
        </article>
        <article class="preview-item">
          <span>البنك</span>
          <strong>${escapeHtml(bankLabel || "-")}</strong>
        </article>
        <article class="preview-item">
          <span>شهادة المنشأ</span>
          <strong>${escapeHtml(request.cooNumber || "-")}</strong>
        </article>
        <article class="preview-item">
          <span>تاريخ شهادة المنشأ</span>
          <strong>${escapeHtml(formatPreviewDate(request.cooDate))}</strong>
        </article>
      </div>

      <section class="preview-section">
        <h5>شروط الدفع</h5>
        <div class="preview-note">${escapeHtml(resolvePaymentTerm(request.transactionType, request.blDate || request.createdAt))}</div>
      </section>

      <section class="preview-section">
        <h5>ملاحظة</h5>
        <p>هذه معاينة تشغيلية للمحتوى الذي سيدخل في ملف Word. التنسيق النهائي يبقى مطابقاً للقالب الأصلي عند التوليد.</p>
      </section>
    </section>
  `;
}

function buildBoundInvoiceXml(request) {
  const seller = state.companies.find((item) => item.id === request.sellerCompanyId);
  const importer = state.importerCompanies.find((item) => item.id === request.importerCompanyId);
  const bank = state.banks.find((item) => item.id === request.bankId);
  const invoiceValue = formatTemplateAmount(request.invoiceValue);
  const paymentTerm = resolvePaymentTerm(request.transactionType, request.blDate || request.createdAt);
  const exporterAddress = [seller?.country].filter(Boolean).join(" - ") || request.sellerCompanyName;
  const consigneeAddress = importer?.country || "";
  const bankLabel = [request.bankName || bank?.name, bank?.branch].filter(Boolean).join(" - ");
  const billDate = formatTemplateDate(request.blDate || request.createdAt);
  const invoiceDate = formatTemplateDate(request.createdAt);
  const proformaDate = formatTemplateDate(request.createdAt);
  const cooDate = formatTemplateDate(request.cooDate);

  return `<?xml version="1.0" encoding="UTF-8"?><ALLINONE>
    <INVOICE><INVONO>${escapeXml(request.finalInvoice || request.requestNo)}</INVONO><DATE>${escapeXml(invoiceDate)}</DATE></INVOICE>
    <PROINVOICE><PRONO>${escapeXml(request.proformaInvoice || request.finalInvoice || request.requestNo)}</PRONO><PRODATE>${escapeXml(proformaDate)}</PRODATE></PROINVOICE>
    <EXPORTER><TO>${escapeXml(request.sellerCompanyName)}</TO><EXADD>${escapeXml(exporterAddress)}</EXADD></EXPORTER>
    <CONSIGNEE><CONSIGNEETO>${escapeXml(request.importerCompanyName)}</CONSIGNEETO><CONADDRESS>${escapeXml(consigneeAddress)}</CONADDRESS></CONSIGNEE>
    <SNO><SN1>1</SN1><SN2></SN2><SN3></SN3><SN4></SN4></SNO>
    <DESCRIPTIONS><DEC1>${escapeXml(request.commodityName || "GOODS")}</DEC1><DEC2></DEC2><DEC3></DEC3><DEC4></DEC4></DESCRIPTIONS>
    <QTY><QTY1></QTY1><QTY2></QTY2><QTY3></QTY3><QTY4></QTY4></QTY>
    <UNITEPRICE><UNITE1></UNITE1><UNITE2></UNITE2><UNITE3></UNITE3><UNITE4></UNITE4></UNITEPRICE>
    <TOTALAMOUNT><AMOUNT1>${escapeXml(invoiceValue)}</AMOUNT1><AMOUNT2></AMOUNT2><AMOUNT3></AMOUNT3><AMOUNT4></AMOUNT4></TOTALAMOUNT>
    <TOTAL><LASTAMOUNT>${escapeXml(invoiceValue)}</LASTAMOUNT></TOTAL>
    <CANDF><CNF>${escapeXml(request.portName || "")}</CNF></CANDF>
    <QTYTOTAL><LASTQTY></LASTQTY></QTYTOTAL>
    <ORIGIN><ORIGINCOUNTRY>${escapeXml(request.origin || "")}</ORIGINCOUNTRY></ORIGIN>
    <MARKS><MARK>${escapeXml(request.hsCode || "")}</MARK></MARKS>
    <QTYTYPE><TYPE>UNITS</TYPE></QTYTYPE>
    <AMOUNTTYPE><TOTALAMOUNTTYPE>USD</TOTALAMOUNTTYPE></AMOUNTTYPE>
    <ORIGINNO><ORINO>${escapeXml(request.cooNumber || "")}</ORINO></ORIGINNO>
    <ORIGINDATE><ORIDATE>${escapeXml(cooDate)}</ORIDATE></ORIGINDATE>
    <BILLNO><NO>${escapeXml(request.blNumber || "")}</NO></BILLNO>
    <BILLDATE><DATE>${escapeXml(billDate)}</DATE></BILLDATE>
    <PORTOFLOADING><PORT>${escapeXml(seller?.country || "")}</PORT></PORTOFLOADING>
    <PORTDIS><PORT>${escapeXml(request.portName || "")}</PORT></PORTDIS>
    <BILLFROM><COUNTRY>Copy of Original Bill of Lading</COUNTRY></BILLFROM>
    <BILLBY><BY>BY SEA</BY></BILLBY>
    <NETWEIGHT><NET></NET></NETWEIGHT>
    <GROSSWEIGHT><NET></NET></GROSSWEIGHT>
    <TERMOFPAYMENT><TERM>${escapeXml(paymentTerm)}</TERM></TERMOFPAYMENT>
    <ACCOUNT><ACC>${escapeXml(bankLabel || "")}</ACC></ACCOUNT>
    <ACCOUNT><ACC>${escapeXml(request.bankName || "")}</ACC></ACCOUNT>
  </ALLINONE>`;
}

function formatTemplateDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.toISOString().slice(0, 10)}T00:00:00`;
}

function formatTemplateAmount(value) {
  const number = Number(value || 0);
  return number ? number.toFixed(2) : "0.00";
}

function resolvePaymentTerm(transactionType, baselineDate) {
  if (transactionType === "Deferred") {
    const date = new Date(baselineDate || Date.now());
    if (!Number.isNaN(date.getTime())) {
      date.setDate(date.getDate() + 180);
      return `D/A 180 DAYS FROM BILL OF EXCHANGE DATE`;
    }
    return "D/A 180 DAYS FROM BILL OF EXCHANGE DATE";
  }
  if (transactionType === "LC") return "LETTER OF CREDIT";
  return "CASH AGAINST DOCUMENTS";
}

function escapeXml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatPreviewDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(date);
}

function toEnglishDigits(value) {
  return String(value ?? "")
    .replace(/[٠-٩]/g, (digit) => String(arabicIndicDigits.indexOf(digit)))
    .replace(/[۰-۹]/g, (digit) => String(easternArabicDigits.indexOf(digit)));
}

function normalizeDocumentDigits(root = document.body) {
  if (!root) return;

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const textNodes = [];

  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (!node?.nodeValue?.trim()) continue;
    if (node.parentElement?.closest("script, style")) continue;
    textNodes.push(node);
  }

  textNodes.forEach((node) => {
    node.nodeValue = toEnglishDigits(node.nodeValue);
  });

  root.querySelectorAll?.("input, textarea").forEach((element) => {
    if (element.placeholder) {
      element.placeholder = toEnglishDigits(element.placeholder);
    }
    if (element.value && !element.matches(":focus")) {
      element.value = toEnglishDigits(element.value);
    }
    element.setAttribute("lang", "en");
  });

  root.querySelectorAll?.("option").forEach((option) => {
    option.textContent = toEnglishDigits(option.textContent);
  });
}

boot();
