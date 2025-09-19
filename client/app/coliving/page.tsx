'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useMatchStore } from '@/lib/store'

interface Task {
  id: string
  title: string
  assignee: string
  completed: boolean
  dueDate: string
  category: 'cleaning' | 'maintenance' | 'groceries' | 'bills' | 'other'
}

interface Expense {
  id: string
  description: string
  amount: number
  paidBy: string
  splitBetween: string[]
  date: string
  category: 'rent' | 'utilities' | 'groceries' | 'supplies' | 'other'
}

export default function CoLivingPage() {
  const { matches } = useMatchStore()

  // Mock data for demo
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Clean kitchen after dinner',
      assignee: 'You',
      completed: false,
      dueDate: '2024-01-20',
      category: 'cleaning'
    },
    {
      id: '2',
      title: 'Buy groceries for the week',
      assignee: 'Alice',
      completed: true,
      dueDate: '2024-01-19',
      category: 'groceries'
    },
    {
      id: '3',
      title: 'Pay electricity bill',
      assignee: 'You',
      completed: false,
      dueDate: '2024-01-25',
      category: 'bills'
    }
  ])

  const [expenses, setExpenses] = useState<Expense[]>([
    {
      id: '1',
      description: 'Electricity bill',
      amount: 120,
      paidBy: 'You',
      splitBetween: ['You', 'Alice'],
      date: '2024-01-15',
      category: 'utilities'
    },
    {
      id: '2',
      description: 'Groceries - weekly shopping',
      amount: 85,
      paidBy: 'Alice',
      splitBetween: ['You', 'Alice'],
      date: '2024-01-18',
      category: 'groceries'
    },
    {
      id: '3',
      description: 'Cleaning supplies',
      amount: 32,
      paidBy: 'You',
      splitBetween: ['You', 'Alice'],
      date: '2024-01-10',
      category: 'supplies'
    }
  ])

  const [newTask, setNewTask] = useState({ title: '', assignee: 'You', dueDate: '', category: 'cleaning' as Task['category'] })
  const [newExpense, setNewExpense] = useState({ description: '', amount: 0, paidBy: 'You', category: 'other' as Expense['category'] })
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [showExpenseForm, setShowExpenseForm] = useState(false)

  const toggleTask = (taskId: string) => {
    setTasks(tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ))
  }

  const addTask = () => {
    if (!newTask.title.trim()) return

    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      assignee: newTask.assignee,
      completed: false,
      dueDate: newTask.dueDate,
      category: newTask.category
    }

    setTasks([...tasks, task])
    setNewTask({ title: '', assignee: 'You', dueDate: '', category: 'cleaning' })
    setShowTaskForm(false)
  }

  const addExpense = () => {
    if (!newExpense.description.trim() || newExpense.amount <= 0) return

    const expense: Expense = {
      id: Date.now().toString(),
      description: newExpense.description,
      amount: newExpense.amount,
      paidBy: newExpense.paidBy,
      splitBetween: ['You', 'Alice'], // Default split
      date: new Date().toISOString().split('T')[0],
      category: newExpense.category
    }

    setExpenses([...expenses, expense])
    setNewExpense({ description: '', amount: 0, paidBy: 'You', category: 'other' })
    setShowExpenseForm(false)
  }

  const calculateBalance = () => {
    let yourTotal = 0
    let aliceTotal = 0

    expenses.forEach(expense => {
      const splitAmount = expense.amount / expense.splitBetween.length

      if (expense.paidBy === 'You') {
        yourTotal += expense.amount - splitAmount
        aliceTotal -= splitAmount
      } else {
        aliceTotal += expense.amount - splitAmount
        yourTotal -= splitAmount
      }
    })

    return { yourTotal, aliceTotal }
  }

  const { yourTotal, aliceTotal } = calculateBalance()

  if (matches.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Co-Living Dashboard</h1>
          <p className="text-gray-600">
            Manage shared tasks, expenses, and household coordination.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>No Roommates Yet</CardTitle>
            <CardDescription>
              Match with compatible roommates to start managing your shared living space.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/matches">
              <Button>Find Roommates</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Co-Living Dashboard</h1>
        <p className="text-gray-600">
          Manage your shared living space with Alice.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Tasks Section */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Shared Tasks</CardTitle>
                  <CardDescription>
                    Keep track of household responsibilities
                  </CardDescription>
                </div>
                <Button
                  onClick={() => setShowTaskForm(!showTaskForm)}
                  size="sm"
                >
                  Add Task
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {showTaskForm && (
                <div className="mb-6 p-4 border rounded-lg space-y-4">
                  <Input
                    placeholder="Task description"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <select
                      value={newTask.assignee}
                      onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                    >
                      <option value="You">You</option>
                      <option value="Alice">Alice</option>
                    </select>
                    <select
                      value={newTask.category}
                      onChange={(e) => setNewTask({ ...newTask, category: e.target.value as Task['category'] })}
                      className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                    >
                      <option value="cleaning">Cleaning</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="groceries">Groceries</option>
                      <option value="bills">Bills</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <Input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  />
                  <div className="flex gap-2">
                    <Button onClick={addTask} size="sm">Add</Button>
                    <Button variant="outline" onClick={() => setShowTaskForm(false)} size="sm">
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {tasks.map(task => (
                  <div
                    key={task.id}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      task.completed ? 'bg-green-50 border-green-200' : 'bg-white'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleTask(task.id)}
                        className="w-4 h-4 text-blue-600"
                      />
                      <div>
                        <p className={`font-medium ${task.completed ? 'line-through text-gray-500' : ''}`}>
                          {task.title}
                        </p>
                        <p className="text-sm text-gray-600">
                          Assigned to: {task.assignee} • Due: {task.dueDate} • {task.category}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Expenses Section */}
          <Card className="mt-8">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Shared Expenses</CardTitle>
                  <CardDescription>
                    Track and split household expenses
                  </CardDescription>
                </div>
                <Button
                  onClick={() => setShowExpenseForm(!showExpenseForm)}
                  size="sm"
                >
                  Add Expense
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {showExpenseForm && (
                <div className="mb-6 p-4 border rounded-lg space-y-4">
                  <Input
                    placeholder="Expense description"
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      type="number"
                      placeholder="Amount"
                      value={newExpense.amount || ''}
                      onChange={(e) => setNewExpense({ ...newExpense, amount: parseFloat(e.target.value) || 0 })}
                    />
                    <select
                      value={newExpense.paidBy}
                      onChange={(e) => setNewExpense({ ...newExpense, paidBy: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                    >
                      <option value="You">You</option>
                      <option value="Alice">Alice</option>
                    </select>
                  </div>
                  <select
                    value={newExpense.category}
                    onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value as Expense['category'] })}
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                  >
                    <option value="rent">Rent</option>
                    <option value="utilities">Utilities</option>
                    <option value="groceries">Groceries</option>
                    <option value="supplies">Supplies</option>
                    <option value="other">Other</option>
                  </select>
                  <div className="flex gap-2">
                    <Button onClick={addExpense} size="sm">Add</Button>
                    <Button variant="outline" onClick={() => setShowExpenseForm(false)} size="sm">
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                {expenses.map(expense => (
                  <div key={expense.id} className="flex items-center justify-between p-4 rounded-lg border">
                    <div>
                      <p className="font-medium">{expense.description}</p>
                      <p className="text-sm text-gray-600">
                        ${expense.amount} • Paid by {expense.paidBy} • {expense.date} • {expense.category}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${(expense.amount / expense.splitBetween.length).toFixed(2)}</p>
                      <p className="text-sm text-gray-600">per person</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Balance Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Balance Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>You owe:</span>
                  <span className={`font-medium ${yourTotal < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    ${Math.abs(yourTotal).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Alice owes:</span>
                  <span className={`font-medium ${aliceTotal < 0 ? 'text-red-600' : 'text-green-600'}`}>
                    ${Math.abs(aliceTotal).toFixed(2)}
                  </span>
                </div>
                <hr />
                <div className="flex justify-between font-medium">
                  <span>Net balance:</span>
                  <span className={yourTotal > 0 ? 'text-green-600' : 'text-red-600'}>
                    {yourTotal > 0 ? 'You are owed' : 'You owe'} ${Math.abs(yourTotal).toFixed(2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* House Rules */}
          <Card>
            <CardHeader>
              <CardTitle>House Rules</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>🔇 Quiet hours: 10 PM - 8 AM</li>
                <li>🧹 Clean up after yourself</li>
                <li>🚫 No smoking indoors</li>
                <li>🐕 Pets allowed with discussion</li>
                <li>👥 Overnight guests OK with notice</li>
              </ul>
              <Button variant="outline" size="sm" className="mt-4 w-full">
                Edit Rules
              </Button>
            </CardContent>
          </Card>

          {/* Calendar */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>
                  <p className="font-medium">Jan 25</p>
                  <p className="text-gray-600">Electricity bill due</p>
                </div>
                <div>
                  <p className="font-medium">Jan 28</p>
                  <p className="text-gray-600">Weekly cleaning</p>
                </div>
                <div>
                  <p className="font-medium">Feb 1</p>
                  <p className="text-gray-600">Rent due</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}