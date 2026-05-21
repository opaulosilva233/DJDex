import { Pencil, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function DjCard({ set, onDelete }) {
  const navigate = useNavigate()

  return (
    <div className="w-[280px] box-border rounded-xl border border-gray-200 bg-white p-4 text-gray-900 shadow-sm transition-colors dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100">
      <h2 className="m-0 text-gray-900 dark:text-gray-100">{set.nome}</h2>
      <p className="text-gray-900 dark:text-gray-100"><strong>Festival:</strong> {set.festival}</p>
      <p className="text-gray-900 dark:text-gray-100"><strong>Local:</strong> {set.local}</p>
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