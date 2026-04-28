create table if not exists users (
  id bigint generated always as identity primary key,
  name text not null,
  email text not null unique,
  role text not null,
  stage_name text not null,
  created_at timestamptz default now()
);

create table if not exists stages (
  id bigint generated always as identity primary key,
  name text not null unique,
  label text not null,
  order_no integer not null,
  next_stage text
);

create table if not exists companies (
  id bigint generated always as identity primary key,
  name text not null unique,
  agent text,
  country text,
  created_at timestamptz default now()
);

create table if not exists ports (
  id bigint generated always as identity primary key,
  name text not null unique,
  created_at timestamptz default now()
);

create table if not exists banks (
  id bigint generated always as identity primary key,
  name text not null,
  branch text,
  created_at timestamptz default now()
);

create table if not exists commodities (
  id bigint generated always as identity primary key,
  name text not null unique,
  hs_code text,
  created_at timestamptz default now()
);

create table if not exists requests (
  id bigint primary key,
  request_no text not null unique,
  seller_company_id bigint references companies(id) on delete set null,
  seller_company_name text not null,
  importer_company_id bigint references companies(id) on delete set null,
  importer_company_name text not null,
  agent text,
  proforma_invoice text,
  final_invoice text,
  invoice_value numeric(14,2) default 0,
  bl_number text,
  bl_date date,
  origin text,
  coo_number text,
  coo_date date,
  commodity_id bigint references commodities(id) on delete set null,
  commodity_name text,
  hs_code text,
  port_id bigint references ports(id) on delete set null,
  port_name text,
  bank_id bigint references banks(id) on delete set null,
  bank_name text,
  transaction_type text,
  service_fee_rate numeric(14,2) default 0,
  service_fee_amount numeric(14,2) default 0,
  finance_notes text,
  import_permit text,
  notes text,
  documents jsonb default '[]'::jsonb,
  stage_name text not null,
  status text not null,
  created_by text not null,
  created_at timestamptz default now()
);

insert into stages (name, label, order_no, next_stage)
values
  ('DataEntry', 'إدخال البيانات', 1, 'InvoiceReview'),
  ('InvoiceReview', 'مراجعة الفاتورة', 2, 'FinanceReview'),
  ('FinanceReview', 'المراجعة المالية', 3, 'BankProcessing'),
  ('BankProcessing', 'إجراءات البنك', 4, 'Completed'),
  ('Completed', 'مكتمل', 5, null)
on conflict (name) do nothing;

insert into users (name, email, role, stage_name)
values
  ('Ahmed Hassan', 'ahmed@baharsawken.com', 'Data Entry', 'DataEntry')
on conflict (email) do nothing;
