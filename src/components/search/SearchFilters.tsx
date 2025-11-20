'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Search, X, SlidersHorizontal } from 'lucide-react'

interface Category {
  id: string
  name: string
}

export default function SearchFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [categories, setCategories] = useState<Category[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [brand, setBrand] = useState('')
  const [minPrice, setMinPrice] = useState('')
  const [maxPrice, setMaxPrice] = useState('')
  const [tags, setTags] = useState('')
  const [sortBy, setSortBy] = useState('')

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch('/api/categories')
        if (!response.ok) throw new Error('Failed')
        const result = await response.json()
        const data = result.data || result.categories || result
        setCategories(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error('Error:', error)
        setCategories([])
      }
    }
    fetchCategories()
  }, [])

  useEffect(() => {
    setSearchTerm(searchParams.get('q') || '')
    setCategoryId(searchParams.get('categoryId') || '')
    setBrand(searchParams.get('brand') || '')
    setMinPrice(searchParams.get('minPrice') || '')
    setMaxPrice(searchParams.get('maxPrice') || '')
    setTags(searchParams.get('tags') || '')
    setSortBy(searchParams.get('sort') || '')
  }, [searchParams])

  const applyFilters = () => {
    const params = new URLSearchParams()
    if (searchTerm) params.set('q', searchTerm)
    if (categoryId) params.set('categoryId', categoryId)
    if (brand) params.set('brand', brand)
    if (minPrice) params.set('minPrice', minPrice)
    if (maxPrice) params.set('maxPrice', maxPrice)
    if (tags) params.set('tags', tags)
    if (sortBy) params.set('sort', sortBy)
    router.push(`/search?${params.toString()}`)
  }

  const clearFilters = () => {
    const query = searchParams.get('q')
    setCategoryId('')
    setBrand('')
    setMinPrice('')
    setMaxPrice('')
    setTags('')
    setSortBy('')
    if (query) router.push(`/search?q=${encodeURIComponent(query)}`)
    else router.push('/search')
  }

  return (
    <div className="mb-8 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 shadow-lg border border-gray-700">
      <div className="flex items-center gap-2 mb-4">
        <SlidersHorizontal className="w-5 h-5 text-red-500" />
        <h2 className="text-lg font-semibold text-gray-100">Filter Products</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="lg:col-span-2">
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Search</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-4 h-4" />
            <input type="text" placeholder="Search products..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
              className="w-full pl-10 pr-3 py-2 bg-gray-900/60 border border-gray-700 rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent hover:bg-gray-900/80 transition-all" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Category</label>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}
            className="w-full px-3 py-2 bg-gray-900/60 border border-gray-700 rounded-lg text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent hover:bg-gray-900/80 transition-all cursor-pointer">
            <option value="">All Categories</option>
            {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Brand</label>
          <input type="text" placeholder="Any brand" value={brand} onChange={(e) => setBrand(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
            className="w-full px-3 py-2 bg-gray-900/60 border border-gray-700 rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent hover:bg-gray-900/80 transition-all" />
        </div>

        <div className="lg:col-span-2 grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Min Price</label>
            <input type="number" placeholder="$0" value={minPrice} onChange={(e) => setMinPrice(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
              className="w-full px-3 py-2 bg-gray-900/60 border border-gray-700 rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent hover:bg-gray-900/80 transition-all" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Max Price</label>
            <input type="number" placeholder="$999+" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
              className="w-full px-3 py-2 bg-gray-900/60 border border-gray-700 rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent hover:bg-gray-900/80 transition-all" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mt-4">
        <div className="lg:col-span-2">
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Tags (comma separated)</label>
          <input type="text" placeholder="e.g. performance, racing" value={tags} onChange={(e) => setTags(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && applyFilters()}
            className="w-full px-3 py-2 bg-gray-900/60 border border-gray-700 rounded-lg text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent hover:bg-gray-900/80 transition-all" />
        </div>

        <div className="lg:col-span-2">
          <label className="block text-xs font-medium text-gray-400 mb-1.5">Sort By</label>
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-3 py-2 bg-gray-900/60 border border-gray-700 rounded-lg text-sm text-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent hover:bg-gray-900/80 transition-all cursor-pointer">
            <option value="">Relevance</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="name_asc">Name: A to Z</option>
            <option value="name_desc">Name: Z to A</option>
            <option value="newest">Newest First</option>
          </select>
        </div>

        <div className="lg:col-span-2 flex items-end gap-2">
          <button onClick={applyFilters}
            className="flex-1 px-6 py-2 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-600 text-white font-semibold rounded-lg shadow-lg transition-all duration-200 hover:shadow-red-500/50 active:scale-95">
            Apply Filters
          </button>
          <button onClick={clearFilters}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-200 font-medium rounded-lg transition-all duration-200 active:scale-95 flex items-center gap-2">
            <X className="w-4 h-4" />
            Clear
          </button>
        </div>
      </div>
    </div>
  )
}
