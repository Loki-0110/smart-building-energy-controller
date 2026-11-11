
import { useEffect, useMemo, useState } from 'react'
import { Pencil, Plus, RefreshCw, Search, Trash2, X, ChevronLeft, ChevronRight } from 'lucide-react'
import Notice from './Notice'
import Loading from './Loading'
import DataTable from './DataTable'
import { errorMessage } from '../api/client'
import { rowsFrom } from '../utils/format'

export default function CrudPage({
  title,
  singular,
  eyebrow,
  description,
  icon: Icon,
  api,
  idKey,
  fields,
  columns,
  emptyText,
  lookup = [],
  paginated = false,
  pageSize = 10
}) {
  const [rows, setRows] = useState([])
  const [options, setOptions] = useState({})
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState(null)
  const [dialog, setDialog] = useState(null)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  const blank = () => Object.fromEntries(
    fields.map(f => [
      f.name,
      f.default ?? (f.type === 'checkbox' ? false : '')
    ])
  )

  const [form, setForm] = useState(blank)

  const load = async ({
    preserveNotice = false,
    targetPage = page
  } = {}) => {
    setLoading(true)

    try {
      const results = await Promise.all([
        paginated
          ? api.list(targetPage, pageSize)
          : api.list(),
        ...lookup.map(x => x.load())
      ])

      const responseData = results[0].data

      if (paginated && Array.isArray(responseData?.content)) {
        setRows(responseData.content)
        setPage(responseData.number ?? targetPage)
        setTotalPages(responseData.totalPages ?? 0)
        setTotalElements(responseData.totalElements ?? 0)
      } else {
        setRows(rowsFrom(responseData))
        setTotalPages(0)
        setTotalElements(0)
      }

      const next = {}
      lookup.forEach((x, i) => {
        next[x.name] = rowsFrom(results[i + 1].data)
      })
      setOptions(next)

      if (!preserveNotice) setNotice(null)
    } catch (e) {
      setNotice({
        type: 'error',
        message: errorMessage(e)
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load({ targetPage: 0 })
  }, [])

  const openCreate = () => {
    setForm(blank())
    setDialog({ mode: 'create' })
    setNotice(null)
  }

  const openEdit = row => {
    const values = {}

    fields.forEach(f => {
      let v = row[f.name]

      if (f.type === 'datetime-local' && v) {
        v = String(v).slice(0, 16)
      }

      values[f.name] =
        v ?? f.default ?? (f.type === 'checkbox' ? false : '')
    })

    setForm(values)
    setDialog({ mode: 'edit', row })
    setNotice(null)
  }

  const submit = async e => {
    e.preventDefault()
    setSaving(true)

    try {
      const payload = {}

      fields.forEach(f => {
        let v = form[f.name]

        if (f.type === 'number') {
          v = v === '' ? null : Number(v)
        }

        if (f.type === 'checkbox') {
          v = Boolean(v)
        }

        if (f.type === 'datetime-local' && v) {
          v = v.length === 16 ? `${v}:00` : v
        }

        payload[f.name] = v
      })

      if (dialog.mode === 'edit') {
        await api.update(dialog.row[idKey], payload)
      } else {
        await api.create(payload)
      }

      setNotice({
        type: 'success',
        message: `${singular || title.slice(0, -1)} ${
          dialog.mode === 'edit' ? 'updated' : 'created'
        } successfully.`
      })

      const nextPage = dialog.mode === 'create' ? 0 : page

      setDialog(null)
      await load({
        preserveNotice: true,
        targetPage: nextPage
      })
    } catch (e) {
      setNotice({
        type: 'error',
        message: errorMessage(e)
      })
    } finally {
      setSaving(false)
    }
  }

  const remove = async row => {
    const id = row[idKey]

    if (!window.confirm(
      `Delete this record (${id})? This action cannot be undone.`
    )) return

    try {
      await api.remove(id)

      setNotice({
        type: 'success',
        message: `Record ${id} deleted.`
      })

      await load({ preserveNotice: true })
    } catch (e) {
      setNotice({
        type: 'error',
        message: errorMessage(e)
      })
    }
  }

  const allColumns = useMemo(
    () => [
      ...columns,
      {
        key: 'actions',
        label: 'Actions',
        render: row => (
          <div className="table-actions">
            <button
              className="action-button"
              title="Edit"
              onClick={() => openEdit(row)}
            >
              <Pencil size={15} />
            </button>

            <button
              className="action-button danger-action"
              title="Delete"
              onClick={() => remove(row)}
            >
              <Trash2 size={15} />
            </button>
          </div>
        )
      }
    ],
    [columns, rows]
  )

  const goToPage = nextPage => {
    if (
      nextPage < 0 ||
      nextPage >= totalPages ||
      loading
    ) return

    load({ targetPage: nextPage })
  }

  const filteredCount = search
    ? rows.filter(row =>
        JSON.stringify(row).toLowerCase().includes(search.toLowerCase())
      ).length
    : rows.length

  return (
    <div className="stack-lg">
      <div className="page-actions">
        <div>
          <span className="eyebrow">{eyebrow}</span>
          <h2>{title}</h2>
          <p className="muted">{description}</p>
        </div>

        <div className="button-row">
          <button
            className="button secondary"
            onClick={() => load()}
            disabled={loading}
          >
            <RefreshCw size={16} /> Refresh
          </button>

          <button className="button primary" onClick={openCreate}>
            <Plus size={16} /> Add {singular || title.slice(0, -1)}
          </button>
        </div>
      </div>

      <Notice notice={notice} onClose={() => setNotice(null)} />

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h3>{title} directory</h3>
            <p>
              {paginated
                ? `${totalElements} total record(s) from the backend`
                : `${rows.length} record(s) from the backend`}
            </p>
          </div>

          {Icon && <Icon size={21} className="muted-icon" />}
        </div>

        <div className="toolbar">
          <div className="search-box">
            <Search size={16} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={`Search ${title.toLowerCase()}...`}
            />
          </div>

          <span className="muted">
            {search ? `${filteredCount} matches on this page` : ''}
          </span>
        </div>

        {loading ? (
          <Loading />
        ) : (
          <>
            <DataTable
              columns={allColumns}
              rows={rows}
              search={search}
              empty={emptyText}
            />

            {paginated && (
              <div className="pagination">
                <span className="muted">
                  {totalElements === 0
                    ? 'No records'
                    : `Showing ${page * pageSize + 1}–${Math.min(
                        (page + 1) * pageSize,
                        totalElements
                      )} of ${totalElements} records`}
                </span>

                <div className="pagination-controls">
                  <button
                    className="button secondary"
                    onClick={() => goToPage(page - 1)}
                    disabled={page === 0 || loading}
                  >
                    <ChevronLeft size={16} />
                    Previous
                  </button>

                  <span className="pagination-page">
                    Page {totalPages === 0 ? 0 : page + 1} of {totalPages}
                  </span>

                  <button
                    className="button secondary"
                    onClick={() => goToPage(page + 1)}
                    disabled={page >= totalPages - 1 || loading}
                  >
                    Next
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </section>

      {dialog && (
        <div
          className="modal-backdrop"
          onMouseDown={e => {
            if (e.target === e.currentTarget) setDialog(null)
          }}
        >
          <form className="modal modal-wide" onSubmit={submit}>
            <div className="modal-heading">
              <div>
                <span className="eyebrow">
                  {dialog.mode === 'edit' ? 'UPDATE RECORD' : 'NEW RECORD'}
                </span>
                <h3>
                  {dialog.mode === 'edit'
                    ? `Edit ${singular || title.slice(0, -1)}`
                    : `Add ${singular || title.slice(0, -1)}`}
                </h3>
              </div>

              <button
                type="button"
                className="icon-button"
                onClick={() => setDialog(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="form-grid">
              {fields.map(f => (
                <label
                  key={f.name}
                  className={f.type === 'checkbox' ? 'check-label' : ''}
                >
                  {f.type === 'checkbox' ? (
                    <>
                      <input
                        type="checkbox"
                        checked={Boolean(form[f.name])}
                        onChange={e =>
                          setForm(p => ({
                            ...p,
                            [f.name]: e.target.checked
                          }))
                        }
                      />
                      {f.label}
                    </>
                  ) : (
                    <>
                      {f.label}

                      {f.type === 'select' ? (
                        <select
                          required={f.required !== false}
                          value={form[f.name]}
                          onChange={e =>
                            setForm(p => ({
                              ...p,
                              [f.name]: e.target.value
                            }))
                          }
                        >
                          <option value="">Select…</option>

                          {(f.options || options[f.optionsFrom] || []).map(o =>
                            typeof o === 'string' ? (
                              <option key={o} value={o}>{o}</option>
                            ) : (
                              <option
                                key={o[f.optionValue || 'value']}
                                value={o[f.optionValue || 'value']}
                              >
                                {o[f.optionLabel || 'label']}
                              </option>
                            )
                          )}
                        </select>
                      ) : (
                        <input
                          type={f.type || 'text'}
                          min={f.min}
                          max={f.max}
                          step={f.step}
                          required={f.required !== false}
                          value={form[f.name]}
                          placeholder={f.placeholder || ''}
                          onChange={e =>
                            setForm(p => ({
                              ...p,
                              [f.name]: e.target.value
                            }))
                          }
                        />
                      )}
                    </>
                  )}
                </label>
              ))}
            </div>

            <div className="form-actions">
              <button
                className="button secondary"
                type="button"
                onClick={() => setDialog(null)}
              >
                Cancel
              </button>

              <button className="button primary" disabled={saving}>
                {saving
                  ? 'Saving…'
                  : dialog.mode === 'edit'
                    ? 'Save changes'
                    : 'Create record'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
