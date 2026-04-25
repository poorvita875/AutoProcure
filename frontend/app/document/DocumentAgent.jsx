"use client"

import React, { useMemo, useRef, useState } from "react"
import { LightRays } from "@/components/ui/LightRays"

const MAX_BYTES = 10 * 1024 * 1024
const SUPPORTED_EXT = ["pdf", "xls", "xlsx", "jpg", "jpeg", "png"]

const makeMockExtracted = () => {
  const lineItems = [
    { id: "li1", item: "Steel Rods", qty: 500, unitPrice: 250, total: 125000 },
    { id: "li2", item: "SKF 6205 Bearings", qty: 100, unitPrice: 185, total: 18500 },
    { id: "li3", item: "Packing & Handling", qty: 1, unitPrice: 1200, total: 1200 },
  ]
  const subtotal = lineItems.reduce((sum, li) => sum + li.total, 0)
  const gst = Math.round(subtotal * 0.18)
  const totalAmount = subtotal + gst

  return {
    vendor: "ABC Steels Pvt Ltd",
    invoiceNo: "INV-2024-0315",
    date: "March 15, 2024",
    dueDate: "March 30, 2024",
    amount: totalAmount,
    gst: "27AAECA1234F1ZV",
    poRef: "PO-2024-089",
    confidence: 98,
    lineItems,
    subtotal,
    gstAmount: gst,
    totalAmount,
  }
}

const seedRecentDocs = () => [
  {
    id: "d1",
    type: "invoice",
    filename: "invoice_xyz_electronics.pdf",
    vendor: "XYZ Electronics",
    date: "Today 10:30",
    status: "processed",
  },
  {
    id: "d2",
    type: "po",
    filename: "po_abc_steels_2024.pdf",
    vendor: "ABC Steels Pvt Ltd",
    date: "Yesterday",
    status: "processed",
  },
  {
    id: "d3",
    type: "contract",
    filename: "contract_mnr_logistics.pdf",
    vendor: "MNR Logistics",
    date: "Mar 20",
    status: "processed",
  },
]

const formatINR = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value)

function SectionCard({ num, label, rightSlot, children, entranceClass = "" }) {
  return (
    <section className={["rfq-step-card relative overflow-hidden", entranceClass].join(" ")}>
      <div className="rfq-step-watermark" aria-hidden="true">
        {num}
      </div>
      <div className="rfq-step-leftglow" aria-hidden="true" />
      <div className="flex items-center justify-between gap-3">
        <div className="rfq-section-label rfq-card-header">{label}</div>
        {rightSlot}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  )
}

function OutlinedButton({ children, onClick, ariaLabel, className = "" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      className={[
        "rfq-icon-btn font-mono uppercase tracking-[0.15em] text-[11px]",
        className,
      ].join(" ")}
    >
      {children}
    </button>
  )
}

function GradientButton({ children, onClick, ariaLabel, className = "", disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={[
        "rfq-generate-btn text-[12px] text-[#08111f] font-semibold tracking-[0.15em] uppercase",
        disabled ? "opacity-60 cursor-not-allowed" : "",
        className,
      ].join(" ")}
    >
      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
    </button>
  )
}

function DropZone({
  isDragOver,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
  onBrowseClick,
}) {
  const badges = ["PDF", "EXCEL", "JPG", "PNG"]
  return (
    <div
      className={[
        "rfq-reticle",
        isDragOver ? "rfq-drop-over" : "",
      ].join(" ")}
    >
      <div
        className="rfq-dropzone"
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
        role="button"
        tabIndex={0}
        onClick={onBrowseClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onBrowseClick()
        }}
        aria-label="Drop document here or click to browse"
      >
        <div className="rfq-upload-icon" aria-hidden="true">
          ⬆
        </div>
        <div className="mt-3 text-[11px] font-mono uppercase tracking-[0.18em] text-slate-200">
          DROP DOCUMENT HERE
        </div>
        <div className="mt-2 text-[12px] text-slate-300 font-mono">
          or click to browse — PDF · EXCEL · JPG · PNG — Max 10MB
        </div>

        <div className="mt-4 flex flex-wrap gap-2 justify-center">
          {badges.map((b) => (
            <span key={b} className="rfq-chip select-none">
              {b}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <OutlinedButton ariaLabel="Browse files" onClick={onBrowseClick}>
          📁 BROWSE FILES
        </OutlinedButton>
        <OutlinedButton ariaLabel="Cloud storage" onClick={() => {}}>
          ☁️ CLOUD STORAGE
        </OutlinedButton>
        <OutlinedButton ariaLabel="Email import" onClick={() => {}}>
          📧 EMAIL IMPORT
        </OutlinedButton>
      </div>
    </div>
  )
}

function UploadingState({ filename, progress, durationMs }) {
  return (
    <div className="rounded-2xl border border-cyan-500/15 bg-[rgba(6,182,212,0.03)] backdrop-blur-[20px] p-6">
      <div className="rfq-section-label">UPLOADING</div>
      <div className="mt-2 text-[12px] text-slate-300 font-mono">{filename}</div>
      <div className="mt-4 rfq-progress-track" aria-label="Upload progress">
        <div
          className="rfq-progress-fill rfq-progress-anim"
          style={{
            "--fill": `${progress}%`,
            animationDuration: `${durationMs}ms`,
          }}
        />
      </div>
      <div className="mt-2 text-[11px] text-slate-300 font-mono uppercase tracking-[0.15em]">
        {progress}%
      </div>
    </div>
  )
}

function ProcessingState({ step }) {
  const steps = [
    "▶ READING DOCUMENT STRUCTURE...",
    "✓ EXTRACTING VENDOR INFORMATION",
    "✓ PARSING LINE ITEMS",
    "◉ CALCULATING TOTALS...",
  ]

  return (
    <div className="rounded-2xl border border-cyan-500/15 bg-[rgba(6,182,212,0.03)] backdrop-blur-[20px] p-6">
      <div className="flex items-center justify-center">
        <div className="rfq-radar" aria-hidden="true">
          <div className="rfq-radar-ring rfq-radar-ring-outer" />
          <div className="rfq-radar-ring rfq-radar-ring-mid" />
          <div className="rfq-radar-ping" />
          <div className="rfq-radar-dash" />
        </div>
      </div>

      <div className="mt-5 space-y-2">
        {steps.map((t, i) => {
          const isDone = i < step
          const isActive = i === step
          return (
            <div
              key={t}
              className={[
                "text-[11px] font-mono uppercase tracking-[0.15em] rfq-checklist-line",
                isDone ? "text-emerald-300" : isActive ? "text-cyan-200" : "text-slate-400",
              ].join(" ")}
              style={{ animationDelay: `${i * 350}ms` }}
            >
              {isDone ? (
                <span className="rfq-check-ico" aria-hidden="true">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M20 6L9 17l-5-5"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="rfq-check-path"
                    />
                  </svg>
                </span>
              ) : isActive ? (
                <span className="rfq-pulse-dot" aria-hidden="true" />
              ) : (
                <span className="inline-block w-[14px]" aria-hidden="true" />
              )}
              <span className="rfq-type-line">{t}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function KVRow({ label, value, onEdit, isEditing, onChange, onSave, index }) {
  return (
    <div
      className="rfq-kv-row group rfq-kv-anim"
      style={{ animationDelay: `${index * 35}ms` }}
    >
      <div className="rfq-kv-label">{label}</div>
      <div className="rfq-kv-value">
        {!isEditing ? (
          <div className="flex items-center justify-between gap-2">
            <span className="text-slate-200">{value}</span>
            <button
              type="button"
              className="rfq-pencil"
              onClick={onEdit}
              aria-label={`Edit ${label}`}
            >
              ✏️
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <input
              className="rfq-glass-input"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              aria-label={`Edit ${label} value`}
            />
            <OutlinedButton ariaLabel={`Save ${label}`} onClick={onSave}>
              ✓ SAVE
            </OutlinedButton>
          </div>
        )}
      </div>
    </div>
  )
}

function LineItemsCard({
  data,
  onEditRow,
  onDeleteRow,
  onAddRow,
  editingId,
  editingDraft,
  setEditingDraft,
  onSaveRow,
}) {
  return (
    <div className="rounded-2xl border border-cyan-500/15 bg-[rgba(6,182,212,0.03)] backdrop-blur-[20px] p-5">
      <div className="rfq-section-label text-cyan-200">
        ◆ LINE ITEMS DETECTED — {data.lineItems.length} ITEMS
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="text-cyan-200/90 font-mono uppercase tracking-[0.15em]">
              <th className="text-left py-2">Item</th>
              <th className="text-right py-2">Qty</th>
              <th className="text-right py-2">Unit Price</th>
              <th className="text-right py-2">Total</th>
              <th className="text-right py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.lineItems.map((li, idx) => {
              const isEditing = editingId === li.id
              const row = isEditing ? editingDraft : li
              return (
                <tr
                  key={li.id}
                  className="rfq-line-row group rfq-line-anim"
                  style={{ animationDelay: `${idx * 30}ms` }}
                >
                  <td className="py-2 pr-3 min-w-[220px]">
                    {isEditing ? (
                      <input
                        className="rfq-glass-input"
                        value={row.item}
                        onChange={(e) =>
                          setEditingDraft((p) => ({ ...p, item: e.target.value }))
                        }
                        aria-label="Edit line item name"
                      />
                    ) : (
                      <span className="text-slate-200">{li.item}</span>
                    )}
                  </td>
                  <td className="py-2 text-right">
                    {isEditing ? (
                      <input
                        className="rfq-glass-input text-right"
                        value={row.qty}
                        onChange={(e) =>
                          setEditingDraft((p) => ({
                            ...p,
                            qty: Number(e.target.value || 0),
                          }))
                        }
                        aria-label="Edit line item quantity"
                      />
                    ) : (
                      <span className="text-slate-200">{li.qty}</span>
                    )}
                  </td>
                  <td className="py-2 text-right">
                    {isEditing ? (
                      <input
                        className="rfq-glass-input text-right"
                        value={row.unitPrice}
                        onChange={(e) =>
                          setEditingDraft((p) => ({
                            ...p,
                            unitPrice: Number(e.target.value || 0),
                          }))
                        }
                        aria-label="Edit line item unit price"
                      />
                    ) : (
                      <span className="text-slate-200">{formatINR(li.unitPrice)}</span>
                    )}
                  </td>
                  <td className="py-2 text-right">
                    <span className="text-slate-200">
                      {formatINR(isEditing ? row.qty * row.unitPrice : li.total)}
                    </span>
                  </td>
                  <td className="py-2 text-right">
                    <div className="inline-flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition">
                      {!isEditing ? (
                        <>
                          <button
                            type="button"
                            className="rfq-mini-icon"
                            onClick={() => onEditRow(li)}
                            aria-label="Edit line item"
                          >
                            ✏️
                          </button>
                          <button
                            type="button"
                            className="rfq-mini-icon rfq-danger"
                            onClick={() => onDeleteRow(li.id)}
                            aria-label="Delete line item"
                          >
                            🗑️
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          className="rfq-mini-icon"
                          onClick={onSaveRow}
                          aria-label="Save line item"
                        >
                          ✓
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[12px] font-mono">
        <div className="text-slate-300">SUBTOTAL</div>
        <div className="text-right text-slate-200">{formatINR(data.subtotal)}</div>
        <div className="text-slate-300">GST (18%)</div>
        <div className="text-right text-slate-200">{formatINR(data.gstAmount)}</div>
        <div className="text-slate-300">TOTAL</div>
        <div className="text-right text-cyan-200 font-semibold rfq-text-glow">
          {formatINR(data.totalAmount)}
        </div>
      </div>

      <button
        type="button"
        className="mt-5 w-full rounded-xl border border-cyan-400/30 border-dashed bg-white/5 hover:bg-cyan-400/10 px-4 py-3 text-white font-medium outline-none focus:ring-2 focus:ring-cyan-400 rfq-glow-hover"
        onClick={onAddRow}
        aria-label="Add line item"
      >
        + ADD LINE ITEM
      </button>
    </div>
  )
}

function ErrorCard({ error, onRetry, onNew }) {
  return (
    <div className="rounded-2xl border border-rose-500/40 bg-[rgba(244,63,94,0.06)] backdrop-blur-[20px] p-6 shadow-[0_0_30px_rgba(244,63,94,0.12)]">
      <div className="text-[12px] font-mono uppercase tracking-[0.15em] text-rose-300">
        ⚠ EXTRACTION FAILED
      </div>
      <div className="mt-3 text-[12px] text-rose-200 font-mono whitespace-pre-wrap">
        {error}
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        <OutlinedButton ariaLabel="Retry" onClick={onRetry} className="border-rose-400/35">
          🔄 RETRY
        </OutlinedButton>
        <OutlinedButton ariaLabel="New file" onClick={onNew} className="border-rose-400/35">
          📁 NEW FILE
        </OutlinedButton>
      </div>
    </div>
  )
}

function RecentDocuments({
  docs,
  searchQuery,
  setSearchQuery,
  activeFilter,
  setActiveFilter,
}) {
  const filters = [
    { id: "all", label: "ALL" },
    { id: "invoice", label: "INVOICES" },
    { id: "po", label: "POs" },
    { id: "contract", label: "CONTRACTS" },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="rfq-section-label">DOCUMENT ARCHIVE</div>
        <div className="text-[11px] font-mono uppercase tracking-[0.15em] text-slate-300">
          <span className="rfq-chip">12 FILES</span>
        </div>
      </div>

      <div className="rfq-search-wrap">
        <span className="rfq-search-icon" aria-hidden="true">
          ⌕
        </span>
        <input
          className="rfq-search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="SEARCH DOCUMENTS..."
          aria-label="Search documents"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setActiveFilter(f.id)}
            className={[
              "rfq-chip font-mono uppercase tracking-[0.15em] text-[11px]",
              activeFilter === f.id ? "rfq-filter-active" : "",
            ].join(" ")}
            aria-label={`Filter: ${f.label}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="space-y-2 rfq-fade" key={`${activeFilter}_${searchQuery}`}>
        {docs.map((d, idx) => (
          <div
            key={d.id}
            className="rfq-doc-row"
            style={{ animationDelay: `${idx * 80}ms` }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className={["rfq-file-icon", `rfq-file-${d.type}`].join(" ")} aria-hidden="true">
                {d.type === "invoice" ? "PDF" : d.type === "po" ? "XLS" : "IMG"}
              </div>
              <div className="min-w-0">
                <div className="text-slate-200 truncate">{d.filename}</div>
                <div className="text-[12px] text-cyan-200/70 font-mono truncate">
                  {d.vendor}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-[12px] text-slate-300 font-mono">{d.date}</div>
              <div className={["rfq-status", `rfq-status-${d.status}`].join(" ")}>
                {d.status === "processed"
                  ? "✓ PROCESSED"
                  : d.status === "pending"
                    ? "⏳ PENDING"
                    : "✕ FAILED"}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function DocumentAgent() {
  const fileInputRef = useRef(null)

  const [uploadedFile, setUploadedFile] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadAnimMs, setUploadAnimMs] = useState(900)
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStep, setProcessingStep] = useState(0)
  const [extractedData, setExtractedData] = useState(null)
  const [, setIsEditing] = useState(false)
  const [recentDocuments, setRecentDocuments] = useState(seedRecentDocs())
  const [activeFilter, setActiveFilter] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [error, setError] = useState(null)

  const [isDragOver, setIsDragOver] = useState(false)

  const [editingField, setEditingField] = useState(null)
  const [draftFields, setDraftFields] = useState(null)

  const [editingLineId, setEditingLineId] = useState(null)
  const [editingLineDraft, setEditingLineDraft] = useState(null)

  const filteredDocs = useMemo(() => {
    return recentDocuments
      .filter((d) => (activeFilter === "all" ? true : d.type === activeFilter))
      .filter((d) => {
        const q = searchQuery.trim().toLowerCase()
        if (!q) return true
        return (
          d.filename.toLowerCase().includes(q) ||
          d.vendor.toLowerCase().includes(q)
        )
      })
  }, [recentDocuments, activeFilter, searchQuery])

  const resetAll = () => {
    setUploadedFile(null)
    setUploadProgress(0)
    setIsProcessing(false)
    setProcessingStep(0)
    setExtractedData(null)
    setIsEditing(false)
    setEditingField(null)
    setDraftFields(null)
    setEditingLineId(null)
    setEditingLineDraft(null)
    setError(null)
    setIsDragOver(false)
  }

  const validateFile = (file) => {
    if (!file) return "No file selected."
    if (file.size > MAX_BYTES) return "File too large. Max 10MB."
    const parts = file.name.split(".")
    const ext = (parts[parts.length - 1] || "").toLowerCase()
    if (!SUPPORTED_EXT.includes(ext)) return "Unsupported format. Use PDF/Excel/JPG/PNG."
    return null
  }

  const startPipeline = (file) => {
    const err = validateFile(file)
    if (err) {
      setError(`- ${err}\n- Please try again with a supported file.`)
      return
    }

    setUploadedFile(file)
    const dur = Math.round(500 + (Math.min(file.size, MAX_BYTES) / MAX_BYTES) * 1000)
    setUploadAnimMs(dur)
    setError(null)
    setExtractedData(null)
    setIsEditing(false)
    setEditingField(null)
    setDraftFields(null)
    setEditingLineId(null)
    setEditingLineDraft(null)

    // Upload simulation
    setUploadProgress(0)
    let p = 0
    const uploadTimer = window.setInterval(() => {
      p = Math.min(100, p + Math.floor(6 + Math.random() * 10))
      setUploadProgress(p)
      if (p >= 100) {
        window.clearInterval(uploadTimer)
        // Processing simulation
        setIsProcessing(true)
        setProcessingStep(0)

        const stepTimers = []
        for (let i = 0; i < 4; i++) {
          stepTimers.push(
            window.setTimeout(() => setProcessingStep(i), i * 700)
          )
        }

        window.setTimeout(() => {
          // deterministic fail if name contains "fail"
          if (file.name.toLowerCase().includes("fail")) {
            setIsProcessing(false)
            setError(
              "- Low quality scan detected\n- Missing required fields\n- Try a clearer PDF or image"
            )
            return
          }

          const mock = makeMockExtracted()
          setExtractedData(mock)
          setDraftFields({
            vendor: mock.vendor,
            invoiceNo: mock.invoiceNo,
            date: mock.date,
            dueDate: mock.dueDate,
            amount: String(mock.totalAmount),
            gst: mock.gst,
            poRef: mock.poRef,
          })
          setIsProcessing(false)

          setRecentDocuments((prev) => [
            {
              id: `d_${Date.now()}`,
              type: "invoice",
              filename: file.name,
              vendor: mock.vendor,
              date: "Just now",
              status: "processed",
            },
            ...prev,
          ])
        }, 4 * 700 + 600)
      }
    }, 140)
  }

  const onBrowse = () => fileInputRef.current?.click()

  const onPickFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    startPipeline(file)
    e.target.value = ""
  }

  const onDrop = (e) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (!file) return
    startPipeline(file)
  }

  const beginEditField = (key) => {
    if (!draftFields) return
    setIsEditing(true)
    setEditingField(key)
  }

  const saveField = () => {
    if (!extractedData || !draftFields) return
    setExtractedData((prev) => ({
      ...prev,
      vendor: draftFields.vendor,
      invoiceNo: draftFields.invoiceNo,
      date: draftFields.date,
      dueDate: draftFields.dueDate,
      gst: draftFields.gst,
      poRef: draftFields.poRef,
    }))
    setEditingField(null)
    setIsEditing(false)
  }

  const editLineRow = (li) => {
    setEditingLineId(li.id)
    setEditingLineDraft({ ...li })
  }

  const saveLineRow = () => {
    if (!extractedData || !editingLineDraft) return
    const updated = extractedData.lineItems.map((li) =>
      li.id === editingLineId
        ? {
            ...editingLineDraft,
            total: Number(editingLineDraft.qty) * Number(editingLineDraft.unitPrice),
          }
        : li
    )
    const subtotal = updated.reduce((s, li) => s + li.total, 0)
    const gstAmount = Math.round(subtotal * 0.18)
    const totalAmount = subtotal + gstAmount

    setExtractedData((prev) => ({
      ...prev,
      lineItems: updated,
      subtotal,
      gstAmount,
      totalAmount,
    }))
    setEditingLineId(null)
    setEditingLineDraft(null)
  }

  const deleteLineRow = (id) => {
    if (!extractedData) return
    const updated = extractedData.lineItems.filter((li) => li.id !== id)
    const subtotal = updated.reduce((s, li) => s + li.total, 0)
    const gstAmount = Math.round(subtotal * 0.18)
    const totalAmount = subtotal + gstAmount
    setExtractedData((prev) => ({
      ...prev,
      lineItems: updated,
      subtotal,
      gstAmount,
      totalAmount,
    }))
  }

  const addLineRow = () => {
    if (!extractedData) return
    const newRow = {
      id: `li_${Date.now()}`,
      item: "New Item",
      qty: 1,
      unitPrice: 0,
      total: 0,
    }
    const updated = [...extractedData.lineItems, newRow]
    setExtractedData((prev) => ({ ...prev, lineItems: updated }))
    editLineRow(newRow)
  }

  const confirmAndSave = () => {
    // mock save
    setIsEditing(false)
    setEditingField(null)
  }

  const showEmpty = !uploadedFile && !extractedData && !isProcessing && !error

  return (
    <div className="min-h-screen w-full text-white rfq-page">
      <div className="rfq-bg">
        <LightRays
          raysOrigin="top-center"
          raysColor="#a78bfa"
          raysSpeed={1.5}
          lightSpread={1.2}
          rayLength={1.8}
          followMouse={true}
          mouseInfluence={0.3}
          noiseAmount={0.03}
          distortion={0.08}
          className="z-0 opacity-60"
        />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 py-10 space-y-10">
        <header className="relative rfq-title-block">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="rfq-title">DOCUMENT AGENT</div>
              <div className="rfq-underline" aria-hidden="true" />
              <div className="text-slate-300 text-[12px] font-mono tracking-[0.18em] uppercase">
                AUTONOMOUS DOCUMENT READING SYSTEM v1.8
              </div>
            </div>
            <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.15em] text-emerald-300 mt-1">
              <span className="rfq-online-dot" aria-hidden="true" />
              SYSTEM ONLINE
            </div>
          </div>
          <div className="mt-6 rfq-hr" aria-hidden="true" />
        </header>

        <SectionCard
          num="01"
          label="UPLOAD ZONE"
          entranceClass="rfq-entrance rfq-entrance-1"
          rightSlot={
            <div className="text-[11px] font-mono uppercase tracking-[0.15em] text-slate-300">
              MAX SIZE: <span className="text-cyan-200">10MB</span>
            </div>
          }
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={onPickFile}
            aria-label="File input"
          />

          {showEmpty ? (
            <div className="space-y-4">
              <div className="rounded-2xl border border-cyan-500/15 bg-[rgba(6,182,212,0.03)] backdrop-blur-[20px] p-6">
                <div className="flex items-center justify-center">
                  <div className="rfq-doc-holo" aria-hidden="true" />
                </div>
                <div className="mt-5 text-center">
                  <div className="text-[11px] font-mono uppercase tracking-[0.18em] text-slate-200">
                    NO DOCUMENTS UPLOADED
                  </div>
                  <div className="mt-2 text-[12px] text-slate-300">
                    Upload invoices, POs, or contracts to begin AI extraction
                  </div>
                  <div className="mt-5">
                    <GradientButton ariaLabel="Upload first document" onClick={onBrowse}>
                      UPLOAD FIRST DOCUMENT
                    </GradientButton>
                  </div>
                </div>
              </div>

              <DropZone
                isDragOver={isDragOver}
                onDragEnter={(e) => {
                  e.preventDefault()
                  setIsDragOver(true)
                }}
                onDragLeave={(e) => {
                  e.preventDefault()
                  setIsDragOver(false)
                }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={onDrop}
                onBrowseClick={onBrowse}
              />
            </div>
          ) : error ? (
            <ErrorCard
              error={error}
              onRetry={() => {
                if (uploadedFile) startPipeline(uploadedFile)
              }}
              onNew={resetAll}
            />
          ) : uploadProgress < 100 ? (
            <UploadingState
              filename={uploadedFile?.name || "document"}
              progress={uploadProgress}
              durationMs={uploadAnimMs}
            />
          ) : isProcessing ? (
            <ProcessingState step={processingStep} />
          ) : (
            <DropZone
              isDragOver={isDragOver}
              onDragEnter={(e) => {
                e.preventDefault()
                setIsDragOver(true)
              }}
              onDragLeave={(e) => {
                e.preventDefault()
                setIsDragOver(false)
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={onDrop}
              onBrowseClick={onBrowse}
            />
          )}
        </SectionCard>

        <SectionCard
          num="02"
          label="EXTRACTION RESULTS"
          entranceClass="rfq-entrance rfq-entrance-2"
          rightSlot={
            extractedData ? (
              <div className="inline-flex items-center gap-3">
                <div className="inline-flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.15em] text-emerald-300">
                  <span className="rfq-blink-dot" aria-hidden="true" />
                  EXTRACTION COMPLETE
                </div>
                <span className="rfq-confidence">
                  {extractedData.confidence}% CONFIDENCE
                </span>
              </div>
            ) : (
              <div className="text-[11px] font-mono uppercase tracking-[0.15em] text-slate-400">
                WAITING FOR UPLOAD
              </div>
            )
          }
        >
          {!extractedData ? (
            <div className="text-[12px] text-slate-300 font-mono">
              Upload a document to view extraction results.
            </div>
          ) : (
            <div className="space-y-5 rfq-slide-up-fade">
              <div className="rounded-2xl border border-cyan-500/15 bg-[rgba(6,182,212,0.03)] backdrop-blur-[20px] p-5">
                <div className="rfq-kv">
                  {[
                    {
                      key: "vendor",
                      label: "Vendor Name",
                      value: draftFields.vendor,
                      editable: true,
                    },
                    {
                      key: "invoiceNo",
                      label: "Invoice Number",
                      value: draftFields.invoiceNo,
                      editable: true,
                    },
                    { key: "date", label: "Invoice Date", value: draftFields.date, editable: true },
                    {
                      key: "dueDate",
                      label: "Due Date",
                      value: draftFields.dueDate,
                      editable: true,
                    },
                    {
                      key: "total",
                      label: "Total Amount",
                      value: formatINR(extractedData.totalAmount),
                      editable: false,
                    },
                    { key: "gst", label: "GST Number", value: draftFields.gst, editable: true },
                    { key: "poRef", label: "PO Reference", value: draftFields.poRef, editable: true },
                  ].map((f, idx) => (
                    <KVRow
                      key={f.key}
                      index={idx}
                      label={f.label}
                      value={f.value}
                      isEditing={f.editable && editingField === f.key}
                      onEdit={() => f.editable && beginEditField(f.key)}
                      onChange={(v) => setDraftFields((p) => ({ ...p, [f.key]: v }))}
                      onSave={saveField}
                    />
                  ))}
                </div>
              </div>

              <LineItemsCard
                data={extractedData}
                onEditRow={editLineRow}
                onDeleteRow={deleteLineRow}
                onAddRow={addLineRow}
                editingId={editingLineId}
                editingDraft={editingLineDraft}
                setEditingDraft={setEditingLineDraft}
                onSaveRow={saveLineRow}
              />

              <div className="flex flex-wrap gap-2">
                <GradientButton ariaLabel="Confirm and save" onClick={confirmAndSave}>
                  ✓ CONFIRM & SAVE
                </GradientButton>
                <OutlinedButton ariaLabel="Edit" onClick={() => setIsEditing(true)}>
                  ✏️ EDIT
                </OutlinedButton>
                <OutlinedButton
                  ariaLabel="Discard"
                  onClick={resetAll}
                  className="border-rose-400/35 hover:bg-rose-400/10"
                >
                  ✕ DISCARD
                </OutlinedButton>
              </div>
            </div>
          )}
        </SectionCard>

        <SectionCard num="03" label="RECENT DOCUMENTS" entranceClass="rfq-entrance rfq-entrance-3">
          <RecentDocuments
            docs={filteredDocs}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
          />
        </SectionCard>
      </div>

      <style jsx global>{`
        /* Warm editorial animation system (Direction 2) */
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes riseIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideInLeft { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes underlineExpand { from { transform: scaleX(0); transform-origin: left; } to { transform: scaleX(1); transform-origin: left; } }
        @keyframes shimmerWarm { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes dotBounce { 0%,80%,100% { transform: translateY(0); opacity: 0.4; } 40% { transform: translateY(-4px); opacity: 1; } }
        @keyframes checkStroke { from { stroke-dashoffset: 20; opacity: 0; } to { stroke-dashoffset: 0; opacity: 1; } }
        @keyframes progressExpand { from { width: 0; } to { width: var(--fill); } }
        @keyframes popIn { 0% { opacity: 0; transform: scale(0.9); } 70% { transform: scale(1.02); } 100% { opacity: 1; transform: scale(1); } }
        @keyframes cursorBlink { 0%,100% { opacity: 1; } 50% { opacity: 0; } }

        .rfq-title-block { animation: riseIn 0.3s ease both; }
        .rfq-entrance { animation: riseIn 0.35s ease both; }
        .rfq-entrance-1 { animation-delay: 0.05s; }
        .rfq-entrance-2 { animation-delay: 0.12s; }
        .rfq-entrance-3 { animation-delay: 0.19s; }

        .rfq-card-header { position: relative; padding-bottom: 6px; }
        .rfq-card-header::after {
          content: "";
          position: absolute;
          left: 0;
          bottom: 0;
          height: 1px;
          width: 100%;
          background: rgba(226, 232, 240, 0.12);
          transform: scaleX(0);
          animation: underlineExpand 0.4s ease 0.1s both;
        }

        .rfq-icon-btn, .rfq-chip, .rfq-search, .rfq-glass-input {
          transition: background 180ms ease, color 180ms ease, border-color 180ms ease, box-shadow 200ms ease, transform 100ms ease;
        }
        .rfq-icon-btn:active { transform: scale(0.97); }
        .rfq-chip:active { transform: scale(0.94); }

        .rfq-progress-anim {
          width: var(--fill);
          animation-name: progressExpand;
          animation-timing-function: ease-out;
          animation-fill-mode: both;
        }

        /* Field rows: slideInLeft stagger 35ms × index (delay set inline) */
        .rfq-kv-anim { animation: slideInLeft 0.2s ease both; }
        /* Line item rows: slideInLeft stagger 30ms × index (delay set inline) */
        .rfq-line-anim { animation: slideInLeft 0.2s ease both; }
        /* Filter change: fadeIn 0.2s ease */
        .rfq-fade { animation: fadeIn 0.2s ease both; }

        .rfq-check-ico { display: inline-flex; width: 14px; justify-content: center; margin-right: 8px; }
        .rfq-check-path { stroke-dasharray: 20; stroke-dashoffset: 20; animation: checkStroke 0.3s ease forwards; }
        .rfq-type-line { display: inline-block; }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
        /* Reuse RFQ visual language + add Document-specific pieces */
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&family=Orbitron:wght@500;600;700&display=swap");

        .rfq-page {
          background: radial-gradient(circle at 50% 20%, #020818 0%, #000000 70%, #000000 100%);
          font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, "Helvetica Neue",
            Arial, "Noto Sans", "Liberation Sans", sans-serif;
          position: relative;
          overflow: hidden;
        }
        .rfq-bg { position: absolute; inset: 0; z-index: 0; pointer-events: none; }
        .rfq-stars {
          position: absolute;
          inset: -20%;
          background-image:
            radial-gradient(1px 1px at 10% 20%, rgba(255,255,255,0.8) 50%, transparent 51%),
            radial-gradient(1px 1px at 30% 80%, rgba(255,255,255,0.6) 50%, transparent 51%),
            radial-gradient(1px 1px at 70% 40%, rgba(255,255,255,0.7) 50%, transparent 51%),
            radial-gradient(1px 1px at 90% 70%, rgba(255,255,255,0.6) 50%, transparent 51%),
            radial-gradient(1px 1px at 55% 10%, rgba(255,255,255,0.65) 50%, transparent 51%),
            radial-gradient(1px 1px at 15% 55%, rgba(255,255,255,0.55) 50%, transparent 51%),
            radial-gradient(1px 1px at 85% 25%, rgba(255,255,255,0.65) 50%, transparent 51%),
            radial-gradient(1px 1px at 45% 65%, rgba(255,255,255,0.6) 50%, transparent 51%),
            radial-gradient(1px 1px at 62% 78%, rgba(255,255,255,0.55) 50%, transparent 51%),
            radial-gradient(1px 1px at 25% 35%, rgba(255,255,255,0.6) 50%, transparent 51%);
          background-repeat: repeat;
          background-size: 340px 340px;
          opacity: 0.25;
          animation: rfqStarDrift 26s linear infinite;
        }
        @keyframes rfqStarDrift { from { transform: translate3d(0,0,0); } to { transform: translate3d(-120px,140px,0); } }

        .rfq-mesh {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(6, 182, 212, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(6, 182, 212, 0.05) 1px, transparent 1px);
          background-size: 60px 60px;
          mask-image: radial-gradient(circle at 50% 30%, rgba(0,0,0,1), rgba(0,0,0,0.2) 70%, rgba(0,0,0,0));
        }
        .rfq-scanlines {
          position: absolute; inset: 0;
          background: repeating-linear-gradient(to bottom, rgba(255,255,255,0.02), rgba(255,255,255,0.02) 1px, transparent 1px, transparent 4px);
          opacity: 0.35;
          mix-blend-mode: overlay;
        }
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
        .rfq-orb { position: absolute; width: 420px; height: 420px; border-radius: 9999px; filter: blur(40px); opacity: 0.22; animation: float 6s ease-in-out infinite; }
        .rfq-orb-1 { top: -120px; left: -80px; background: radial-gradient(circle at 30% 30%, rgba(6,182,212,0.9), rgba(124,58,237,0.25) 60%, transparent 75%); }
        .rfq-orb-2 { top: 260px; right: -160px; background: radial-gradient(circle at 30% 30%, rgba(124,58,237,0.9), rgba(6,182,212,0.25) 60%, transparent 75%); animation-delay: 1.2s; }
        .rfq-orb-3 { bottom: -160px; left: 45%; transform: translateX(-50%); background: radial-gradient(circle at 30% 30%, rgba(6,182,212,0.7), rgba(124,58,237,0.25) 60%, transparent 75%); animation-delay: 2.2s; }

        .rfq-title {
          font-family: Orbitron, Inter, system-ui;
          font-size: 24px;
          font-weight: 700;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: #e2e8f0;
          text-shadow: 0 0 20px rgba(6, 182, 212, 0.18);
        }
        .rfq-underline { height: 2px; width: 100%; background: linear-gradient(90deg, transparent, #06b6d4, transparent); transform-origin: left; animation: rfqUnderline 700ms ease-out both; }
        @keyframes rfqUnderline { from { transform: scaleX(0); opacity: 0.3; } to { transform: scaleX(1); opacity: 1; } }
        .rfq-hr { height: 1px; width: 100%; background: linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.65), transparent); opacity: 0.75; }
        .rfq-section-label { font-size: 11px; letter-spacing: 0.15em; text-transform: uppercase; color: #e2e8f0; font-weight: 600; }

        @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0.35; } }
        .rfq-online-dot { width: 10px; height: 10px; border-radius: 9999px; background: #10b981; box-shadow: 0 0 12px rgba(16, 185, 129, 0.65); animation: blink 1s infinite; }
        .rfq-blink-dot { width: 8px; height: 8px; border-radius: 9999px; background: #10b981; box-shadow: 0 0 10px rgba(16, 185, 129, 0.55); animation: blink 1s infinite; }

        .rfq-step-card {
          background: rgba(6, 182, 212, 0.04);
          border: 1px solid rgba(6, 182, 212, 0.15);
          backdrop-filter: blur(20px);
          border-radius: 18px;
          padding: 18px;
          position: relative;
          z-index: 1;
          transition: transform 150ms ease, box-shadow 150ms ease, border-color 150ms ease;
          box-shadow: 0 0 0 1px rgba(6, 182, 212, 0.04), 0 18px 50px rgba(0,0,0,0.4);
        }
        .rfq-step-card:hover {
          transform: scale(1.005);
          border-color: rgba(6, 182, 212, 0.28);
          box-shadow: 0 0 30px rgba(6, 182, 212, 0.12), 0 22px 70px rgba(0,0,0,0.45);
        }
        .rfq-step-leftglow { position: absolute; inset: 10px auto 10px 10px; width: 4px; border-radius: 999px; background: linear-gradient(180deg, rgba(6,182,212,0.9), rgba(124,58,237,0.45)); box-shadow: 0 0 18px rgba(6, 182, 212, 0.4); }
        .rfq-step-watermark { position: absolute; top: 10px; right: 12px; font-family: Orbitron, Inter, system-ui; font-weight: 700; font-size: 42px; letter-spacing: 0.12em; color: rgba(6, 182, 212, 0.08); user-select: none; pointer-events: none; }

        .rfq-reticle { position: relative; }
        .rfq-reticle:before {
          content: "";
          position: absolute;
          inset: -8px;
          pointer-events: none;
          background:
            linear-gradient(#06b6d4, #06b6d4) left top/16px 1px no-repeat,
            linear-gradient(#06b6d4, #06b6d4) left top/1px 16px no-repeat,
            linear-gradient(#06b6d4, #06b6d4) right top/16px 1px no-repeat,
            linear-gradient(#06b6d4, #06b6d4) right top/1px 16px no-repeat,
            linear-gradient(#06b6d4, #06b6d4) left bottom/16px 1px no-repeat,
            linear-gradient(#06b6d4, #06b6d4) left bottom/1px 16px no-repeat,
            linear-gradient(#06b6d4, #06b6d4) right bottom/16px 1px no-repeat,
            linear-gradient(#06b6d4, #06b6d4) right bottom/1px 16px no-repeat;
          opacity: 0.22;
          filter: drop-shadow(0 0 10px rgba(6, 182, 212, 0.35));
        }

        .rfq-chip {
          font-size: 12px;
          color: #e2e8f0;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(6,182,212,0.25);
          border-radius: 999px;
          padding: 6px 10px;
          outline: none;
          transition: transform 140ms ease, box-shadow 140ms ease, border-color 140ms ease;
        }
        .rfq-chip:hover { transform: translateY(-2px); border-color: rgba(6,182,212,0.45); box-shadow: 0 0 18px rgba(6, 182, 212, 0.14); }

        .rfq-icon-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          border-radius: 12px;
          padding: 10px 12px;
          font-size: 12px;
          color: #e2e8f0;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(6, 182, 212, 0.25);
          outline: none;
          transition: background 140ms ease, box-shadow 140ms ease, transform 140ms ease, border-color 140ms ease;
        }
        .rfq-icon-btn:hover { background: rgba(6, 182, 212, 0.08); border-color: rgba(6, 182, 212, 0.5); box-shadow: 0 0 22px rgba(6, 182, 212, 0.14); transform: translateY(-1px); }
        .rfq-icon-btn:focus { box-shadow: 0 0 0 2px rgba(6, 182, 212, 0.6); }

        .rfq-generate-btn {
          position: relative;
          overflow: hidden;
          border-radius: 10px;
          padding: 14px 18px;
          color: #08111f;
          background: linear-gradient(135deg, #06b6d4, #7c3aed);
          box-shadow: 0 0 28px rgba(6, 182, 212, 0.22);
          outline: none;
          transition: transform 150ms ease, box-shadow 150ms ease, filter 150ms ease;
        }
        .rfq-generate-btn:before {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.32) 45%, transparent 65%);
          transform: translateX(-120%);
          animation: shimmer 2s linear infinite;
          opacity: 0.55;
        }
        .rfq-generate-btn:hover { transform: scale(1.03); box-shadow: 0 0 42px rgba(6, 182, 212, 0.28), 0 0 24px rgba(124, 58, 237, 0.15); filter: brightness(1.05); }
        .rfq-generate-btn:focus { box-shadow: 0 0 0 2px rgba(6, 182, 212, 0.7), 0 0 42px rgba(6, 182, 212, 0.2); }
        @keyframes shimmer { from { transform: translateX(-120%); } to { transform: translateX(120%); } }

        @keyframes pulse-ring { 0% { transform: scale(0.6); opacity: 0.9; } 100% { transform: scale(2.2); opacity: 0; } }
        @keyframes radar-spin { to { transform: rotate(360deg); } }
        .rfq-radar { position: relative; width: 120px; height: 120px; border-radius: 9999px; background: radial-gradient(circle at 50% 50%, rgba(6,182,212,0.10), rgba(6,182,212,0.02) 60%, transparent 75%); border: 1px solid rgba(6, 182, 212, 0.25); box-shadow: 0 0 28px rgba(6, 182, 212, 0.12); }
        .rfq-radar-ring { position: absolute; inset: 10px; border-radius: 9999px; border: 1px solid rgba(6, 182, 212, 0.18); }
        .rfq-radar-ring-mid { inset: 28px; opacity: 0.8; }
        .rfq-radar-ring-outer { inset: 10px; opacity: 0.6; }
        .rfq-radar-ping { position: absolute; inset: 0; border-radius: 9999px; border: 2px solid rgba(6,182,212,0.35); animation: pulse-ring 2s infinite; }
        .rfq-radar-dash { position: absolute; inset: -10px; border-radius: 9999px; border: 1px dashed rgba(6,182,212,0.25); animation: radar-spin 3s linear infinite; }

        @keyframes slide-up-fade { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        /* Extraction card: riseIn 0.3s ease both (Warm Editorial spec) */
        .rfq-slide-up-fade { animation: riseIn 0.3s ease both; }

        .rfq-dropzone {
          width: 100%;
          padding: 26px;
          border-radius: 12px;
          background: #020c1b;
          border: 2px dashed rgba(6,182,212,0.4);
          text-align: center;
          transition: border-color 160ms ease, background 160ms ease, box-shadow 160ms ease;
        }
        .rfq-upload-icon {
          width: 56px;
          height: 56px;
          margin: 0 auto;
          border-radius: 9999px;
          display: grid;
          place-items: center;
          color: #06b6d4;
          border: 1px solid rgba(6,182,212,0.25);
          box-shadow: 0 0 26px rgba(6,182,212,0.18);
          font-weight: 700;
          font-family: "JetBrains Mono", "Courier New", monospace;
        }
        .rfq-drop-over .rfq-dropzone {
          border-style: solid;
          border-color: rgba(6,182,212,1);
          background: rgba(6,182,212,0.08);
          box-shadow: 0 0 40px rgba(6,182,212,0.12);
        }

        /* Key-value table */
        .rfq-kv { display: grid; gap: 0; }
        .rfq-kv-row {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 12px;
          padding: 10px 0;
          border-bottom: 1px solid rgba(6,182,212,0.12);
        }
        .rfq-kv-row:last-child { border-bottom: none; }
        .rfq-kv-label {
          color: #64748b;
          font-size: 11px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          font-family: "JetBrains Mono", "Courier New", monospace;
        }
        .rfq-kv-value { color: #e2e8f0; font-size: 12px; }
        .rfq-pencil { opacity: 0; transition: opacity 140ms ease; }
        .group:hover .rfq-pencil { opacity: 1; }

        .rfq-glass-input {
          width: 100%;
          border-radius: 12px;
          background: rgba(6,182,212,0.03);
          border: 1px solid rgba(6,182,212,0.25);
          padding: 10px 12px;
          color: #e2e8f0;
          outline: none;
          font-family: "JetBrains Mono", "Courier New", monospace;
        }
        .rfq-glass-input:focus {
          border-color: rgba(6,182,212,1);
          box-shadow: 0 0 0 1px rgba(6,182,212,0.35), 0 0 24px rgba(6, 182, 212, 0.18);
        }

        .rfq-line-row { border-top: 1px solid rgba(6,182,212,0.10); }
        .rfq-line-row:hover { background: rgba(6,182,212,0.05); }
        .rfq-mini-icon { border: 1px solid rgba(6,182,212,0.25); background: rgba(255,255,255,0.02); border-radius: 10px; padding: 6px 8px; }
        .rfq-mini-icon:hover { background: rgba(6,182,212,0.10); box-shadow: 0 0 18px rgba(6,182,212,0.12); }
        .rfq-mini-icon.rfq-danger { border-color: rgba(244,63,94,0.35); }
        .rfq-mini-icon.rfq-danger:hover { background: rgba(244,63,94,0.12); box-shadow: 0 0 18px rgba(244,63,94,0.12); }

        .rfq-text-glow { text-shadow: 0 0 20px rgba(6, 182, 212, 0.25); }
        .rfq-glow-hover:hover { box-shadow: 0 0 24px rgba(6, 182, 212, 0.16); }

        .rfq-confidence {
          font-family: "JetBrains Mono", "Courier New", monospace;
          font-size: 11px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #06b6d4;
          background: rgba(6,182,212,0.08);
          border: 1px solid rgba(6,182,212,0.25);
          padding: 6px 10px;
          border-radius: 9999px;
          box-shadow: 0 0 22px rgba(6,182,212,0.10);
        }

        /* Search + filters */
        .rfq-search-wrap { position: relative; }
        .rfq-search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: rgba(6,182,212,0.8); font-family: "JetBrains Mono", "Courier New", monospace; }
        .rfq-search {
          width: 100%;
          border-radius: 14px;
          background: rgba(6,182,212,0.03);
          border: 1px solid rgba(6,182,212,0.2);
          padding: 12px 12px 12px 36px;
          color: #e2e8f0;
          outline: none;
          font-family: "JetBrains Mono", "Courier New", monospace;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          font-size: 11px;
        }
        .rfq-search:focus { border-color: rgba(6,182,212,1); box-shadow: 0 0 0 1px rgba(6,182,212,0.35), 0 0 24px rgba(6, 182, 212, 0.18); }
        .rfq-filter-active { background: linear-gradient(135deg, rgba(6,182,212,0.9), rgba(124,58,237,0.9)); color: #041018; border-color: rgba(6,182,212,0.65); }

        /* Recent rows */
        @keyframes row-stagger { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        .rfq-doc-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 12px 14px;
          border-radius: 16px;
          background: rgba(6, 182, 212, 0.03);
          border: 1px solid rgba(6,182,212,0.12);
          backdrop-filter: blur(18px);
          transition: transform 140ms ease, border-color 140ms ease, box-shadow 140ms ease;
          animation: row-stagger 0.5s ease-out both;
        }
        .rfq-doc-row:hover { transform: translateY(-2px); border-color: rgba(6,182,212,0.25); box-shadow: 0 0 26px rgba(6,182,212,0.10); }

        .rfq-file-icon {
          width: 44px; height: 44px; border-radius: 14px;
          display: grid; place-items: center;
          font-family: "JetBrains Mono", "Courier New", monospace;
          font-size: 12px;
          border: 1px solid rgba(255,255,255,0.08);
        }
        .rfq-file-invoice { box-shadow: 0 0 22px rgba(244,63,94,0.18); border-color: rgba(244,63,94,0.30); color: rgba(244,63,94,0.9); }
        .rfq-file-po { box-shadow: 0 0 22px rgba(16,185,129,0.16); border-color: rgba(16,185,129,0.30); color: rgba(16,185,129,0.9); }
        .rfq-file-contract { box-shadow: 0 0 22px rgba(6,182,212,0.16); border-color: rgba(6,182,212,0.30); color: rgba(6,182,212,0.9); }

        .rfq-status {
          font-family: "JetBrains Mono", "Courier New", monospace;
          font-size: 11px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          padding: 6px 10px;
          border-radius: 9999px;
          border: 1px solid rgba(255,255,255,0.10);
          background: rgba(255,255,255,0.03);
        }
        .rfq-status-processed { border-color: rgba(16,185,129,0.35); color: rgba(16,185,129,0.9); }
        .rfq-status-pending { border-color: rgba(245,158,11,0.35); color: rgba(245,158,11,0.95); }
        .rfq-status-failed { border-color: rgba(244,63,94,0.35); color: rgba(244,63,94,0.95); }

        /* Upload progress */
        .rfq-progress-track {
          width: 100%;
          height: 10px;
          border-radius: 9999px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(6,182,212,0.14);
          overflow: hidden;
        }
        .rfq-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, rgba(6,182,212,0.95), rgba(124,58,237,0.85));
          position: relative;
          transition: width 140ms ease;
          box-shadow: 0 0 18px rgba(6,182,212,0.18);
        }
        .rfq-progress-fill:after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.25) 45%, transparent 65%);
          animation: shimmer 1.8s linear infinite;
          opacity: 0.6;
        }

        /* Checklist steps: riseIn 0.2s ease, stagger 350ms per step (delay set inline) */
        .rfq-checklist-line { animation: riseIn 0.2s ease both; }
        .rfq-pulse-dot { display: inline-block; width: 6px; height: 6px; border-radius: 9999px; background: rgba(6,182,212,0.9); box-shadow: 0 0 14px rgba(6,182,212,0.35); margin-right: 8px; animation: blink 1s infinite; }

        /* Holographic doc icon (CSS only) */
        .rfq-doc-holo {
          width: 120px;
          height: 140px;
          border-radius: 16px;
          border: 1px solid rgba(6,182,212,0.25);
          position: relative;
          box-shadow: 0 0 30px rgba(6,182,212,0.12);
          background: linear-gradient(180deg, rgba(6,182,212,0.06), rgba(124,58,237,0.03));
        }
        .rfq-doc-holo:before {
          content: "";
          position: absolute;
          left: 16px;
          right: 16px;
          top: 24px;
          height: 8px;
          background: rgba(6,182,212,0.22);
          border-radius: 999px;
          box-shadow: 0 0 18px rgba(6,182,212,0.14);
        }
        .rfq-doc-holo:after {
          content: "";
          position: absolute;
          left: 16px;
          right: 28px;
          top: 44px;
          height: 8px;
          background: rgba(124,58,237,0.18);
          border-radius: 999px;
          box-shadow: 0 0 18px rgba(124,58,237,0.12);
        }
      `}</style>
    </div>
  )
}

