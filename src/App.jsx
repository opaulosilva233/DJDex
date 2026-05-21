import { useEffect, useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import './App.css'
import Navbar from './components/Navbar'
import AddSetPage from './pages/AddSetPage'
import Home from './pages/Home'
import SetList from './pages/SetList'
import Stats from './pages/Stats'
import { djSets } from './data/mockData'

export default function App() {
  const [sets, setSets] = useState(() => {
    if (typeof window === 'undefined') {
      return djSets
    }

    const storedSets = window.localStorage.getItem('ravedex_sets')

    if (!storedSets) {
      return djSets
    }

    try {
      const parsedSets = JSON.parse(storedSets)
      return Array.isArray(parsedSets) ? parsedSets : djSets
    } catch {
      return djSets
    }
  })

  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window === 'undefined') {
      return true
    }

    const storedTheme = window.localStorage.getItem('ravedex_theme')

    if (storedTheme === null) {
      return true
    }

    try {
      return JSON.parse(storedTheme)
    } catch {
      return true
    }
  })
  useEffect(() => {
    window.localStorage.setItem('ravedex_sets', JSON.stringify(sets))
  }, [sets])

  useEffect(() => {
    window.localStorage.setItem('ravedex_theme', JSON.stringify(darkMode))
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

  function handleAddSet(novoSet) {
    setSets((currentSets) => [novoSet, ...currentSets])
  }

  function handleImportData(importedSets) {
    setSets(importedSets)
  }

  function handleEditSet(updatedSet) {
    setSets((currentSets) =>
      currentSets.map((set) => (set.id === updatedSet.id ? updatedSet : set)),
    )
  }

  function handleDeleteSet(id) {
    setSets((currentSets) => currentSets.filter((set) => set.id !== id))
  }

  function toggleDarkMode(e) {
    if (typeof document.startViewTransition !== 'function') {
      setDarkMode((currentDarkMode) => !currentDarkMode)
      return
    }

    const { clientX, clientY } = e
    const endRadius = Math.hypot(
      Math.max(clientX, window.innerWidth - clientX),
      Math.max(clientY, window.innerHeight - clientY),
    )

    const transition = document.startViewTransition(() => {
      setDarkMode((currentDarkMode) => !currentDarkMode)
    })

    transition.ready.then(() => {
      document.documentElement.animate(
        {
          clipPath: [`circle(0px at ${clientX}px ${clientY}px)`, `circle(${endRadius}px at ${clientX}px ${clientY}px)`],
        },
        {
          duration: 500,
          easing: 'ease-in-out',
          pseudoElement: '::view-transition-new(root)',
        },
      )
    })
  }

  return (
    <BrowserRouter>
      <div className="app-shell h-screen overflow-hidden bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
        <Navbar
          sets={sets}
          handleImportData={handleImportData}
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
        />

        <div className="app-main flex-1 overflow-hidden flex flex-col min-h-0">
          <div className="flex-1 min-h-0 overflow-hidden">
            <Routes>
              <Route path="/" element={<Home sets={sets} />} />
              <Route
                path="/lista"
                element={<SetList sets={sets} onDeleteSet={handleDeleteSet} />}
              />
              <Route path="/estatisticas" element={<Stats sets={sets} />} />
              <Route
                path="/adicionar"
                element={<AddSetPage handleAddSet={handleAddSet} />}
              />
              <Route
                path="/editar/:id"
                element={
                  <AddSetPage
                    sets={sets}
                    handleAddSet={handleAddSet}
                    handleEditSet={handleEditSet}
                  />
                }
              />
            </Routes>
          </div>
        </div>
      </div>
    </BrowserRouter>
  )
}
