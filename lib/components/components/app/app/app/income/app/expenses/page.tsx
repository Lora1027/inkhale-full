// ---------------------------------------------------------------------------------
// FILE: app/expenses/page.tsx
// ---------------------------------------------------------------------------------
'use client';
import AuthGuard from '@/components/AuthGuard';
import { supabase } from '@/lib/supabaseClient';
import { useEffect, useMemo, useState } from 'react';
import { Filters, FiltersState, applyFilters } from '@/components/Filters';

export default function Page(){
  return <AuthGuard><Expenses/></AuthGuard>;
}

function Expenses(){
  const [rows, setRows] = useState<any[]>([]);
  const [f, _setF] = useState<FiltersState>({ text:'', categories:[], methods:[], min:'', max:'', from:null, to:null });
  const setF = (u: Partial<FiltersState>) => _setF(prev => ({ ...prev, ...u }));

  useEffect(()=>{ (async ()=>{
    const { data } = await supabase.from('transactions').select('*').eq('type','expense').order('date', { ascending: true });
    setRows(data || []);
  })(); },[]);

  const categories = useMemo(()=> Array.from(new Set(rows.map(r=> r.category).filter(Boolean))), [rows]);
  const methods = useMemo(()=> Array.from(new Set(rows.map(r=> r.method).filter(Boolean))), [rows]);
  const filtered = useMemo(()=> applyFilters(rows, f), [rows, f]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Expenses</h1>
      <Filters f={f} setF={setF} categories={categories} methods={methods} />
      <Table rows={filtered} />
    </div>
  );
}

function Table({ rows }:{ rows:any[] }){
  return (
    <div className="overflow-x-auto rounded-2xl shadow bg-white">
      <table className="min-w-full">
        <thead className="text-left text-sm text-gray-500">
          <tr>
            <th className="p-3">Date</th>
            <th className="p-3">Category</th>
            <th className="p-3">Method</th>
            <th className="p-3">Note</th>
            <th className="p-3">Amount</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id} className="border-t text-sm">
              <td className="p-3">{new Date(r.date).toLocaleDateString()}</td>
              <td className="p-3">{r.category}</td>
              <td className="p-3">{r.method}</td>
              <td className="p-3">{r.note}</td>
              <td className="p-3 font-semibold">₱{Number(r.amount).toLocaleString()}</td>
            </tr>
          ))}
          {rows.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-sm text-gray-500">No results.</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
