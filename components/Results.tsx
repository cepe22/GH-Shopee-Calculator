import React from 'react';
import { CalculationResult, Mode } from '../types';
import { formatCurrency, formatPercent } from '../utils';
import { AlertTriangle, CheckCircle2, TrendingUp, TrendingDown, Download, Share2 } from 'lucide-react';

interface ResultsProps {
  result: CalculationResult;
  mode: Mode;
  onExport: () => void;
  onShare: () => void;
}

export const Results = ({ result, mode, onExport, onShare }: ResultsProps) => {
  const isProfitPositive = result.netProfit > 0;
  
  return (
    <div className="space-y-6">
      
      {/* 1. Hero Card */}
      <div className={`p-6 rounded-xl text-white shadow-lg ${isProfitPositive ? 'bg-gradient-to-br from-orange-500 to-red-600' : 'bg-gray-700'}`}>
        <div className="flex justify-between items-start mb-2">
          <span className="text-orange-100 text-sm font-medium">
            {mode === Mode.TARGET_PROFIT ? 'Rekomendasi Harga Jual' : 'Estimasi Harga Jual'}
          </span>
          <span className="bg-white/20 px-2 py-0.5 rounded text-xs">
            {mode === Mode.TARGET_PROFIT ? 'Target Mode' : 'Given Price'}
          </span>
        </div>
        <div className="text-3xl font-bold mb-4 tracking-tight">
          {formatCurrency(result.sellingPrice)}
        </div>
        
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/20">
          <div>
            <div className="text-orange-100 text-xs">Profit Bersih</div>
            <div className={`text-lg font-bold flex items-center gap-1 ${result.netProfit < 0 ? 'text-red-200' : ''}`}>
              {formatCurrency(result.netProfit)}
            </div>
          </div>
          <div>
            <div className="text-orange-100 text-xs">Margin Bersih</div>
            <div className="text-lg font-bold">{formatPercent(result.netMargin * 100)}</div>
          </div>
        </div>
      </div>

      {/* 2. Breakdown Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 font-semibold text-gray-700 flex justify-between items-center">
          <span>Rincian Biaya</span>
          <span className="text-xs font-normal text-gray-500">per item</span>
        </div>
        <div className="divide-y divide-gray-100">
          {result.breakdown.map((item, idx) => (
            <div key={idx} className={`flex justify-between px-4 py-2.5 text-sm ${item.label === 'Profit Bersih' ? 'bg-orange-50 font-bold text-gray-900' : 'text-gray-600'}`}>
              <span className={item.isDeduction ? 'pl-2 border-l-2 border-red-200' : ''}>
                {item.label}
              </span>
              <span className={item.isDeduction ? 'text-red-600' : 'text-gray-900'}>
                {item.isDeduction && '- '}{formatCurrency(item.value)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Safety Insights */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
        <h4 className="text-blue-900 font-semibold text-sm mb-3 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> Analisis Keamanan Profit
        </h4>
        <div className="space-y-3">
           <div className="flex justify-between items-center text-sm">
             <span className="text-blue-800">Max Diskon Voucher Aman</span>
             <span className={`font-mono font-bold ${result.maxVoucherPercent < 0 ? 'text-red-600' : 'text-green-600'}`}>
               {result.maxVoucherPercent > 0 ? `< ${formatPercent(result.maxVoucherPercent)}` : 'Tidak aman'}
             </span>
           </div>
           <div className="flex justify-between items-center text-sm">
             <span className="text-blue-800">Max Budget Iklan (ROAS)</span>
             <span className={`font-mono font-bold ${result.maxAdsPercent < 0 ? 'text-red-600' : 'text-green-600'}`}>
               {result.maxAdsPercent > 0 ? `< ${formatPercent(result.maxAdsPercent)}` : 'Over budget'}
             </span>
           </div>
           <div className="text-xs text-blue-600 pt-2 border-t border-blue-200 mt-2">
             *Batas aman agar tetap mencapai target profit Anda.
           </div>
        </div>
      </div>

      {/* 4. BEP */}
      <div className="flex items-center gap-3 bg-gray-100 p-3 rounded-lg text-sm text-gray-600">
        <TrendingUp className="w-4 h-4 text-gray-500" />
        <span>Break-even Point (Profit Rp 0):</span>
        <span className="font-bold text-gray-800 ml-auto">{formatCurrency(result.breakEvenPrice)}</span>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button 
          onClick={onExport}
          className="flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-gray-300 rounded-lg text-gray-700 text-sm font-medium hover:bg-gray-50 active:scale-95 transition-transform"
        >
          <Download className="w-4 h-4" /> CSV
        </button>
        <button 
          onClick={onShare}
          className="flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-gray-300 rounded-lg text-gray-700 text-sm font-medium hover:bg-gray-50 active:scale-95 transition-transform"
        >
          <Share2 className="w-4 h-4" /> Copy Text
        </button>
      </div>

    </div>
  );
};