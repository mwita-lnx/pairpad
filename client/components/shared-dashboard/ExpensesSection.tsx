'use client'

import { useState } from 'react'
import { sharedDashboard } from '@/lib/api'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/lib/store'

interface Expense {
  id: number
  title: string
  description: string
  category: string
  amount: string
  paid_by: string
  split_type: string
  expense_date: string
  created_at: string
}

interface ExpensesSectionProps {
  expenses: Expense[]
  livingSpaceId: number
  otherUser: any
  onUpdate: () => void
}

export default function ExpensesSection({ expenses, livingSpaceId, otherUser, onUpdate }: ExpensesSectionProps) {
  const { user } = useAuthStore()
  const [showAddModal, setShowAddModal] = useState(false)
  const [newExpense, setNewExpense] = useState({
    title: '',
    description: '',
    category: 'groceries',
    amount: '',
    split_type: 'equal',
    expense_date: new Date().toISOString().slice(0, 16),
  })
  const [loading, setLoading] = useState(false)

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      const expenseData: any = {
        living_space: livingSpaceId,
        title: newExpense.title,
        description: newExpense.description,
        category: newExpense.category,
        amount: parseFloat(newExpense.amount),
        split_type: newExpense.split_type,
        expense_date: newExpense.expense_date,
      }

      // paid_by defaults to current user in backend if not provided
      await sharedDashboard.createExpense(expenseData)
      toast.success('Expense added successfully!')
      setShowAddModal(false)
      setNewExpense({
        title: '',
        description: '',
        category: 'groceries',
        amount: '',
        split_type: 'equal',
        expense_date: new Date().toISOString().slice(0, 16),
      })
      onUpdate()
    } catch (error) {
      console.error('Failed to create expense:', error)
      toast.error('Failed to add expense')
    } finally {
      setLoading(false)
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'rent': return '🏠'
      case 'utilities': return '💡'
      case 'groceries': return '🛒'
      case 'supplies': return '📦'
      case 'maintenance': return '🔧'
      case 'internet': return '🌐'
      default: return '💰'
    }
  }

  const totalExpenses = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0)
  const myExpenses = expenses.filter(exp => exp.paid_by === user?.username)
  const totalPaidByMe = myExpenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0)

  return (
    <div className="bg-white rounded-3xl shadow-lg p-6 border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[#484848]">Expenses</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[#5d41ab] text-white px-4 py-2 rounded-2xl font-medium hover:bg-[#4c2d87] transition-all hover:scale-105"
        >
          + Add Expense
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-br from-purple-50 to-white border-2 border-purple-100 rounded-2xl p-4">
          <div className="text-sm text-gray-600 mb-1">Total Expenses</div>
          <div className="text-2xl font-bold text-[#5d41ab]">${totalExpenses.toFixed(2)}</div>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-white border-2 border-blue-100 rounded-2xl p-4">
          <div className="text-sm text-gray-600 mb-1">I Paid</div>
          <div className="text-2xl font-bold text-blue-600">${totalPaidByMe.toFixed(2)}</div>
        </div>
      </div>

      {/* Expenses List */}
      {expenses.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">💰</div>
          <p className="text-gray-500">No expenses recorded yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {expenses.map((expense) => (
            <div
              key={expense.id}
              className="border-2 border-gray-100 rounded-2xl p-4 hover:border-[#5d41ab] transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="text-2xl">{getCategoryIcon(expense.category)}</div>
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h4 className="font-bold text-[#484848]">{expense.title}</h4>
                      <p className="text-xs text-gray-500 capitalize">{expense.category}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-[#5d41ab]">${parseFloat(expense.amount).toFixed(2)}</div>
                      <div className="text-xs text-gray-500 capitalize">
                        {expense.split_type === 'equal' ? 'Split Equally' : expense.split_type}
                      </div>
                    </div>
                  </div>
                  {expense.description && (
                    <p className="text-sm text-gray-600 mb-2">{expense.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>Paid by: {expense.paid_by}</span>
                    <span>📅 {new Date(expense.expense_date).toLocaleDateString()}</span>
                  </div>
                  {expense.split_type === 'equal' && (
                    <div className="mt-2 bg-purple-50 border border-purple-200 rounded-xl p-2 text-sm">
                      <span className="font-medium">Your share: </span>
                      <span className="text-[#5d41ab] font-bold">
                        ${(parseFloat(expense.amount) / 2).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-[#484848] mb-6">Add New Expense</h3>
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#484848] mb-2">Title</label>
                <input
                  type="text"
                  value={newExpense.title}
                  onChange={(e) => setNewExpense({ ...newExpense, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-[#5d41ab] outline-none text-[#484848]"
                  placeholder="e.g., Grocery shopping"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#484848] mb-2">Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newExpense.amount}
                  onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-[#5d41ab] outline-none text-[#484848]"
                  placeholder="0.00"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#484848] mb-2">Category</label>
                <select
                  value={newExpense.category}
                  onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-[#5d41ab] outline-none text-[#484848]"
                >
                  <option value="groceries">Groceries</option>
                  <option value="utilities">Utilities</option>
                  <option value="rent">Rent</option>
                  <option value="supplies">Supplies</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="internet">Internet</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#484848] mb-2">Split Type</label>
                <select
                  value={newExpense.split_type}
                  onChange={(e) => setNewExpense({ ...newExpense, split_type: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-[#5d41ab] outline-none text-[#484848]"
                >
                  <option value="equal">Split Equally (50/50)</option>
                  <option value="custom">Custom Split</option>
                  <option value="percentage">Percentage Split</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#484848] mb-2">Description</label>
                <textarea
                  value={newExpense.description}
                  onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-[#5d41ab] outline-none text-[#484848]"
                  rows={2}
                  placeholder="Optional details..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#484848] mb-2">Date</label>
                <input
                  type="datetime-local"
                  value={newExpense.expense_date}
                  onChange={(e) => setNewExpense({ ...newExpense, expense_date: e.target.value })}
                  className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-[#5d41ab] outline-none text-[#484848]"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-[#5d41ab] text-white py-3 rounded-2xl font-medium hover:bg-[#4c2d87] transition-all disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add Expense'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-gray-200 text-[#484848] py-3 rounded-2xl font-medium hover:bg-gray-300 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
