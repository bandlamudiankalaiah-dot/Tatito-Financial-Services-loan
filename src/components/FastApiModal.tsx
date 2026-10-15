import React, { useState } from 'react';
import { 
  Code2, 
  Terminal, 
  Check, 
  Copy, 
  X, 
  ExternalLink, 
  FolderTree, 
  FileCode, 
  Cpu, 
  Database
} from 'lucide-react';

interface FastApiModalProps {
  onClose: () => void;
}

export const FastApiModal: React.FC<FastApiModalProps> = ({ onClose }) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const fileTree = `backend/
├── main.py                  # FastAPI app, CORS, lifespan startup & database auto-seeding
├── database.py              # SQLAlchemy engine (SQLite / PostgreSQL) & SessionLocal
├── models.py                # ORM Models: User, Transaction, LoanApplication, LoanAccount, BlogPost
├── schemas.py               # Pydantic v2 validation models for Auth, Bills, Loans & Admin
├── auth_utils.py            # JWT tokens & bcrypt password hashing
├── seed_data.py             # Pre-seeds demo Kadapa users, sample loans & BBPS transactions
├── requirements.txt         # fastapi, uvicorn, sqlalchemy, pydantic, python-jose, passlib
├── README.md                # Step-by-step setup and launch commands
└── routers/
    ├── __init__.py
    ├── auth.py              # POST /api/auth/register, POST /api/auth/login, GET /api/auth/me
    ├── bills.py             # POST /api/bills/fetch, POST /api/bills/pay, GET /api/bills/history
    ├── loans.py             # POST /api/loans/apply, POST /api/loans/calculate-emi, /pay-emi
    ├── blogs.py             # GET /api/blogs/, GET /api/blogs/{slug}
    └── admin.py             # GET /api/admin/stats, PUT /api/admin/applications/{id}/status`;

  const sampleCommands = `# 1. Navigate to backend directory
cd backend

# 2. Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\\Scripts\\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Start the FastAPI server
uvicorn main:app --reload --port 8000 --host 0.0.0.0

# 5. Open Swagger Documentation:
# http://localhost:8000/docs`;

  const curlLoanApply = `curl -X POST "http://localhost:8000/api/loans/apply" \\
     -H "Authorization: Bearer <YOUR_JWT_TOKEN>" \\
     -H "Content-Type: application/json" \\
     -d '{
       "loan_type": "gold",
       "applicant_name": "Ramesh Kumar Chennur",
       "phone": "9876543210",
       "email": "ramesh@tatito.in",
       "pan_card": "ABCDE1234F",
       "aadhaar_last4": "8821",
       "monthly_income": 65000,
       "requested_amount": 300000,
       "tenure_months": 12,
       "purpose": "Working capital for Kadapa textile store"
     }'`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="bg-slate-950 text-slate-200 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-800 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">
                Python FastAPI Backend Architecture
              </h3>
              <p className="text-xs text-slate-400">
                Full-stack REST API with Pydantic v2 validation &amp; SQLAlchemy ORM
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-xs">
          {/* Quick Summary */}
          <div className="grid sm:grid-cols-3 gap-3 text-slate-300">
            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2 font-bold text-emerald-400 mb-1">
                <Cpu className="w-4 h-4" /> FastAPI Framework
              </div>
              <p className="text-[11px] text-slate-400">
                High-performance async ASGI server with OpenAPI / Swagger integration.
              </p>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2 font-bold text-teal-400 mb-1">
                <Database className="w-4 h-4" /> SQLAlchemy ORM
              </div>
              <p className="text-[11px] text-slate-400">
                SQLite / PostgreSQL ready with auto table creation &amp; seed data.
              </p>
            </div>

            <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2 font-bold text-amber-400 mb-1">
                <Terminal className="w-4 h-4" /> Modular Routers
              </div>
              <p className="text-[11px] text-slate-400">
                Separated auth, bills, loans, blogs, and admin review routes.
              </p>
            </div>
          </div>

          {/* File Tree */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-200 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                <FolderTree className="w-4 h-4 text-emerald-400" /> Backend Directory Structure
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(fileTree, 'tree')}
                className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                {copiedSection === 'tree' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSection === 'tree' ? 'Copied' : 'Copy Tree'}</span>
              </button>
            </div>
            <pre className="p-4 bg-slate-900 rounded-2xl border border-slate-800 font-mono text-[11px] text-emerald-300 overflow-x-auto leading-relaxed">
              {fileTree}
            </pre>
          </div>

          {/* Launch Commands */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-200 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                <Terminal className="w-4 h-4 text-emerald-400" /> Setup &amp; Launch Commands
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(sampleCommands, 'commands')}
                className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                {copiedSection === 'commands' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSection === 'commands' ? 'Copied' : 'Copy Commands'}</span>
              </button>
            </div>
            <pre className="p-4 bg-slate-900 rounded-2xl border border-slate-800 font-mono text-[11px] text-cyan-300 overflow-x-auto leading-relaxed">
              {sampleCommands}
            </pre>
          </div>

          {/* Sample cURL */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-200 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                <FileCode className="w-4 h-4 text-emerald-400" /> Sample API Endpoint: POST /api/loans/apply
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(curlLoanApply, 'curl')}
                className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                {copiedSection === 'curl' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSection === 'curl' ? 'Copied' : 'Copy cURL'}</span>
              </button>
            </div>
            <pre className="p-4 bg-slate-900 rounded-2xl border border-slate-800 font-mono text-[11px] text-amber-300 overflow-x-auto leading-relaxed">
              {curlLoanApply}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-900/80 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-400">
            Source files are located in <strong className="text-white">/backend</strong>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs rounded-xl cursor-pointer"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
