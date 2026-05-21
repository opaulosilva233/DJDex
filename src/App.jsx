import { useEffect, useState } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'

import './App.css'
import Navbar from './components/Navbar'
import AddSetPage from './pages/AddSetPage'
import AddDjPage from './pages/AddDjPage'
import AddFestivalPage from './pages/AddFestivalPage'
import Home from './pages/Home'
import SetList from './pages/SetList'
import Stats from './pages/Stats'
import { djs as initialDjs, festivais as initialFestivais, sets as initialSets } from './data/mockData'

const normalizeImageValue = (image) => (typeof image === 'string' && image.startsWith('data:image/') ? image : '')

const initialRelationalDjs = initialDjs.map((dj) => ({
  ...dj,
  imagem: normalizeImageValue(dj.imagem),
}))

const initialRelationalFestivais = initialFestivais.map((festival) => ({
  ...festival,
  imagem: normalizeImageValue(festival.imagem),
}))

const initialRelationalSets = initialSets.map((set) => ({ ...set }))

function readStoredCollection(storageKey, fallback) {
  if (typeof window === 'undefined') {
    return fallback
  }

  const storedCollection = window.localStorage.getItem(storageKey)

  if (!storedCollection) {
    return fallback
  }

  try {
    const parsedCollection = JSON.parse(storedCollection)
    return Array.isArray(parsedCollection) && parsedCollection.length > 0 ? parsedCollection : fallback
  } catch {
    return fallback
  }
}

export default function App() {
  const [djs, setDjs] = useState(() => readStoredCollection('ravedex_djs', initialRelationalDjs))
  const [festivais, setFestivais] = useState(() =>
    readStoredCollection('ravedex_festivais', initialRelationalFestivais),
  )
  const [sets, setSets] = useState(() => {
    return readStoredCollection('ravedex_sets', initialRelationalSets)
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
    window.localStorage.setItem('ravedex_djs', JSON.stringify(djs))
  }, [djs])

  useEffect(() => {
    window.localStorage.setItem('ravedex_festivais', JSON.stringify(festivais))
  }, [festivais])

  useEffect(() => {
    window.localStorage.setItem('ravedex_sets', JSON.stringify(sets))
  }, [sets])

  useEffect(() => {
    window.localStorage.setItem('ravedex_theme', JSON.stringify(darkMode))
    document.documentElement.classList.toggle('dark', darkMode)
  }, [darkMode])

  function handleAddDj(novoDj) {
    setDjs((currentDjs) => [novoDj, ...currentDjs])
  }

  function handleAddFestival(novoFestival) {
    setFestivais((currentFestivais) => [novoFestival, ...currentFestivais])
  }

  function handleAddSet(novoSet) {
    setSets((currentSets) => [novoSet, ...currentSets])
  }

  function handleImportAllData(importedData) {
    if (Array.isArray(importedData)) {
      setSets(importedData)
      return
    }

    if (!importedData || typeof importedData !== 'object') {
      return
    }

    setDjs(Array.isArray(importedData.djs) ? importedData.djs : [])
    setFestivais(Array.isArray(importedData.festivais) ? importedData.festivais : [])
    setSets(Array.isArray(importedData.sets) ? importedData.sets : [])
  }

  function handleEditSet(updatedSet) {
    setSets((currentSets) =>
      currentSets.map((set) => (set.id === updatedSet.id ? updatedSet : set)),
    )
  }

  function handleDeleteSet(id) {
    setSets((currentSets) => currentSets.filter((set) => set.id !== id))
  }

  function handleDeleteDj(id) {
    setDjs((currentDjs) => currentDjs.filter((dj) => dj.id !== id))
    setSets((currentSets) => currentSets.filter((set) => set.djId !== id))
  }

  function handleDeleteFestival(id) {
    setFestivais((currentFestivais) => currentFestivais.filter((festival) => festival.id !== id))
    setSets((currentSets) => currentSets.filter((set) => set.festivalId !== id))
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
          djs={djs}
          festivais={festivais}
          sets={sets}
          handleImportAllData={handleImportAllData}
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
        />

        <div className="app-main flex-1 overflow-hidden flex flex-col min-h-0">
          <div className="flex-1 min-h-0 overflow-hidden">
            <Routes>
                <Route
                  path="/"
                  element={
                    <Home
                      sets={sets}
                      djs={djs}
                      festivais={festivais}
                      handleDeleteSet={handleDeleteSet}
                      handleDeleteDj={handleDeleteDj}
                      handleDeleteFestival={handleDeleteFestival}
                    />
                  }
                />
              <Route
                path="/lista"
                element={
                  <SetList
                    sets={sets}
                    djs={djs}
                    festivais={festivais}
                    onDeleteSet={handleDeleteSet}
                  />
                }
              />
                <Route
                  path="/estatisticas"
                  element={
                    <Stats
                      sets={sets}
                      djs={djs}
                      festivais={festivais}
                      handleDeleteSet={handleDeleteSet}
                      handleDeleteDj={handleDeleteDj}
                      handleDeleteFestival={handleDeleteFestival}
                    />
                  }
                />
              <Route
                path="/adicionar"
                element={
                  <AddSetPage
                    sets={sets}
                    djs={djs}
                    festivais={festivais}
                    handleAddSet={handleAddSet}
                    handleEditSet={handleEditSet}
                  />
                }
              />
              <Route
                path="/editar/:id"
                element={
                  <AddSetPage
                    sets={sets}
                    djs={djs}
                    festivais={festivais}
                    handleAddSet={handleAddSet}
                    handleEditSet={handleEditSet}
                  />
                }
              />
              <Route
                path="/djs/adicionar"
                element={<AddDjPage djs={djs} handleAddDj={handleAddDj} handleDeleteDj={handleDeleteDj} />}
              />
              <Route
                path="/festivais/adicionar"
                element={
                  <AddFestivalPage
                    festivais={festivais}
                    handleAddFestival={handleAddFestival}
                    handleDeleteFestival={handleDeleteFestival}
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
