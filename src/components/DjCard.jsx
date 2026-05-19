import { Pencil, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function DjCard({ set, onDelete }) {
  const navigate = useNavigate()

  return (
    <div className="w-[280px] box-border rounded-xl border border-gray-200 bg-white p-4 text-gray-900 shadow-sm transition-colors dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100">
      <h2 style={{ marginTop: 0 }}>{set.nome}</h2>
      <p><strong>Festival:</strong> {set.festival}</p>
      <p><strong>Local:</strong> {set.local}</p>
      <p><strong>Data:</strong> {set.data}</p>
      <p><strong>Hora:</strong> {set.hora}</p>
      {set.avaliacao !== undefined && set.avaliacao !== null && (
        <p>⭐ {set.avaliacao}/10</p>
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