import React, { useState, useMemo, useEffect } from "react";
import {
  PieChart, Pie, Cell, Tooltip,
  LineChart, Line, XAxis, YAxis, CartesianGrid
} from "recharts";
import "./App.css";

/* ---------------- SAMPLE DATA ---------------- */
const sampleData = [
  { id: 1, date: "2026-03-01", amount: 5000, category: "Salary", type: "income" },
  { id: 2, date: "2026-03-02", amount: 200, category: "Food", type: "expense" },
  { id: 3, date: "2026-03-03", amount: 1000, category: "Freelance", type: "income" },
  { id: 4, date: "2026-03-04", amount: 300, category: "Transport", type: "expense" },
];

export default function App() {

  /* ---------------- STATE ---------------- */
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem("tx");
    return saved ? JSON.parse(saved) : sampleData;
  });

  const [role, setRole] = useState("viewer");
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [darkMode, setDarkMode] = useState(false);

  /* ---------------- PERSISTENCE ---------------- */
  useEffect(() => {
    localStorage.setItem("tx", JSON.stringify(transactions));
  }, [transactions]);

  /* ---------------- SUMMARY ---------------- */
  const summary = useMemo(() => {
    let income = 0, expense = 0;
    transactions.forEach(t => {
      if (t.type === "income") income += t.amount;
      else expense += t.amount;
    });
    return { income, expense, balance: income - expense };
  }, [transactions]);

  /* ---------------- FILTER ---------------- */
  const filtered = useMemo(() => {
    return transactions
      .filter(t => filterType === "all" || t.type === filterType)
      .filter(t => t.category.toLowerCase().includes(search.toLowerCase()));
  }, [transactions, search, filterType]);

  /* ---------------- INSIGHTS ---------------- */
  const highestCategory = useMemo(() => {
    const map = {};
    transactions.forEach(t => {
      if (t.type === "expense") {
        map[t.category] = (map[t.category] || 0) + t.amount;
      }
    });
    return Object.entries(map).sort((a,b)=>b[1]-a[1])[0];
  }, [transactions]);

  /* ---------------- CHART DATA ---------------- */
  const pieData = [
    { name: "Income", value: summary.income },
    { name: "Expense", value: summary.expense }
  ];

  const lineData = transactions.map(t => ({
    date: t.date,
    balance: t.type === "income" ? t.amount : -t.amount
  }));

  /* ---------------- ACTIONS ---------------- */
  const addTransaction = () => {
    const newTx = {
      id: Date.now(),
      date: new Date().toISOString().slice(0,10),
      amount: 100,
      category: "Misc",
      type: "expense"
    };
    setTransactions([...transactions, newTx]);
  };

  const deleteTransaction = (id) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const editTransaction = (id) => {
    const updated = transactions.map(t =>
      t.id === id ? { ...t, amount: t.amount + 50 } : t
    );
    setTransactions(updated);
  };

  /* ---------------- UI ---------------- */
  return (
    <div className={darkMode ? "container dark" : "container"}>

      {/* HEADER */}
      <div className="header">
        <h1>Financial Dashboard</h1>
        <button onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? "☀️ Light" : "🌙 Dark"}
        </button>
      </div>

      {/* ROLE SWITCH */}
      <select value={role} onChange={e=>setRole(e.target.value)}>
        <option value="viewer">Viewer</option>
        <option value="admin">Admin</option>
      </select>

      {/* SUMMARY */}
      <div className="cards">
        <Card title="Balance" value={summary.balance} />
        <Card title="Income" value={summary.income} />
        <Card title="Expenses" value={summary.expense} />
      </div>

      {/* CHARTS */}
      <div className="charts">
        <div>
          <h3>Spending Breakdown</h3>
          <PieChart width={300} height={250}>
            <Pie data={pieData} dataKey="value" outerRadius={80}>
              {pieData.map((_, i) => <Cell key={i} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </div>

        <div>
          <h3>Balance Trend</h3>
          <LineChart width={400} height={250} data={lineData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="balance" />
          </LineChart>
        </div>
      </div>

      {/* INSIGHTS */}
      <div className="section">
        <h2>Insights</h2>
        {highestCategory ? (
          <p>Highest Spending: {highestCategory[0]} (₹{highestCategory[1]})</p>
        ) : <p>No data</p>}
      </div>

      {/* FILTERS */}
      <div className="filters">
        <input
          placeholder="Search category"
          value={search}
          onChange={e=>setSearch(e.target.value)}
        />

        <select value={filterType} onChange={e=>setFilterType(e.target.value)}>
          <option value="all">All</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>

        {role === "admin" && (
          <button onClick={addTransaction}>Add</button>
        )}
      </div>

      {/* TRANSACTIONS TABLE */}
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Amount</th>
            <th>Category</th>
            <th>Type</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {filtered.length ? filtered.map(t => (
            <tr key={t.id}>
              <td>{t.date}</td>
              <td>₹{t.amount}</td>
              <td>{t.category}</td>
              <td>{t.type}</td>
              <td>
                {role === "admin" && (
                  <>
                    <button onClick={() => editTransaction(t.id)}>Edit</button>
                    <button onClick={() => deleteTransaction(t.id)}>Delete</button>
                  </>
                )}
              </td>
            </tr>
          )) : (
            <tr><td colSpan="5">No Data</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

/* ---------------- CARD COMPONENT ---------------- */
function Card({ title, value }) {
  return (
    <div className="card">
      <h3>{title}</h3>
      <p>₹{value}</p>
    </div>
  );
}