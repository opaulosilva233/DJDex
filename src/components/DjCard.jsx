import { Pencil, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const fallbackImageDataUrl =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160" viewBox="0 0 160 160"><rect width="160" height="160" rx="80" fill="%23e2e8f0"/><circle cx="80" cy="64" r="28" fill="%2394a3b8"/><path d="M28 136c11-21 31-32 52-32s41 11 52 32" fill="%2394a3b8"/></svg>'

export default function DjCard({ set, djs = [], festivais = [], onDelete }) {
  const navigate = useNavigate()
  const dj = djs.find((entry) => entry.id === set.djId)
  const festival = festivais.find((entry) => entry.id === set.festivalId)
  const djImagemSrc = dj?.imagem || '/images/default-dj.png'

  function handleImageError(event) {
    if (event.currentTarget.dataset.fallbackApplied !== 'true') {
      event.currentTarget.dataset.fallbackApplied = 'true'
      event.currentTarget.src = fallbackImageDataUrl
    }
  }

  return (
    <div className="w-[280px] box-border rounded-xl border border-gray-200 bg-white p-4 text-gray-900 shadow-sm transition-colors dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100">
      <div className="mb-3 space-y-3">
        <img
          src={djImagemSrc}
          alt={dj?.nome ?? 'DJ'}
          onError={handleImageError}
          className="h-20 w-20 rounded-full object-cover ring-2 ring-slate-200 dark:ring-slate-700"
        />
        <div>
          <h2 className="m-0 text-gray-900 dark:text-gray-100">{dj?.nome ?? 'DJ desconhecido'}</h2>
          <p className="m-0 text-sm text-gray-500 dark:text-gray-300">{dj?.genero ?? 'Sem género definido'}</p>
        </div>
      </div>
      <p className="text-gray-900 dark:text-gray-100"><strong>Festival:</strong> {festival?.nome ?? 'Festival desconhecido'}</p>
      <p className="text-gray-900 dark:text-gray-100"><strong>Local:</strong> {festival?.local ?? 'Local desconhecido'}</p>
      <p className="text-gray-900 dark:text-gray-100"><strong>Ano:</strong> {festival?.ano ?? 'Ano desconhecido'}</p>
      <p className="text-gray-900 dark:text-gray-100"><strong>Data:</strong> {set.data}</p>
      <p className="text-gray-900 dark:text-gray-100"><strong>Hora:</strong> {set.hora}</p>
      {set.avaliacao !== undefined && set.avaliacao !== null && (
        <p className="text-gray-900 dark:text-gray-100">⭐ {set.avaliacao}/10</p>
      )}

      <div style={{ display: 'flex', gap: '8px' }}>
        <button type="button" onClick={() => navigate(`/editar/${set.id}`)}>
          <Pencil size={16} />
        </button>
        <button type="button" onClick={() => onDelete(set.id)}>
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  )
}