import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calculator, Package, Percent, Megaphone, Truck, 
  Target, Settings, Info, RotateCcw
} from 'lucide-react';

import { CalculatorState, FeeType, Mode, RoundingMode } from './types';
import { DEFAULT_STATE, ADS_PRESETS } from './constants';
import { calculateMetrics, solveForTarget } from './utils';
import { SectionHeader, InputGroup, NumberInput, Toggle } from './components/InputSection';
import { Results } from './components/Results';

export default function App() {
  // --- State Management ---
  const [state, setState] = useState<CalculatorState>(DEFAULT_STATE);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('shopeeCalcState');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setState({ ...DEFAULT_STATE, ...parsed });
      } catch (e) {
        console.error("Failed to load state", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('shopeeCalcState', JSON.stringify(state));
    }
  }, [state, isLoaded]);

  // Helper to update specific fields
  const update = (key: keyof CalculatorState, value: any) => {
    setState(prev => ({ ...prev, [key]: value }));
  };

  // --- Calculation Logic ---
  const result = useMemo(() => {
    if (state.mode === Mode.GIVEN_PRICE) {
      return calculateMetrics(state.manualPrice, state);
    } else {
      return solveForTarget(state);
    }
  }, [state]);

  // --- Handlers ---
  const handleExport = () => {
    const headers = ["Item", "Nilai"];
    const rows = result.breakdown.map(b => [b.label, b.value.toString()]);
    // Add summary
    rows.unshift(["--- SUMMARY ---", ""]);
    rows.unshift(["Net Profit", result.netProfit.toString()]);
    rows.unshift(["Selling Price", result.sellingPrice.toString()]);
    
    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${state.productName || 'product'}_calculation.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = () => {
    const text = `
🛒 *Shopee Pricing Calc*
Produk: ${state.productName}
Harga Jual: ${new Intl.NumberFormat('id-ID').format(result.sellingPrice)}

💰 Profit Bersih: ${new Intl.NumberFormat('id-ID').format(result.netProfit)}
📈 Margin: ${(result.netMargin * 100).toFixed(2)}%
    `.trim();
    navigator.clipboard.writeText(text);
    alert('Ringkasan berhasil disalin!');
  };

  if (!isLoaded) return null;

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-orange-600 text-white p-1.5 rounded-lg">
              <Calculator size={20} />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 leading-tight">ShopeeCalc</h1>
              <p className="text-xs text-gray-500">Safe Profit Calculator</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={() => {
              if (confirm('Reset semua input ke default?')) setState(DEFAULT_STATE);
            }}
            className="text-gray-400 hover:text-orange-600 transition-colors"
          >
            <RotateCcw size={18} />
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: INPUTS */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Mode Selector */}
          <div className="bg-white p-1 rounded-lg border border-gray-200 shadow-sm flex">
            <button
              type="button"
              onClick={() => update('mode', Mode.TARGET_PROFIT)}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-md transition-all ${state.mode === Mode.TARGET_PROFIT ? 'bg-orange-600 text-white shadow' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              Cari Harga Jual
            </button>
            <button
              type="button"
              onClick={() => update('mode', Mode.GIVEN_PRICE)}
              className={`flex-1 py-2.5 text-sm font-semibold rounded-md transition-all ${state.mode === Mode.GIVEN_PRICE ? 'bg-orange-600 text-white shadow' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              Cek Profit
            </button>
          </div>

          <div className="space-y-6">
            
            {/* 1. Product & Cost */}
            <section className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <SectionHeader title="Produk & HPP" icon={Package} />
              
              <InputGroup label="Nama Produk">
                 <input 
                  type="text" 
                  value={state.productName}
                  onChange={(e) => update('productName', e.target.value)}
                  className="block w-full rounded-md border-gray-300 py-2 px-3 border focus:border-orange-500 focus:ring-orange-500 sm:text-sm"
                  placeholder="Contoh: Kemeja Polos"
                 />
              </InputGroup>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputGroup label="HPP per Pcs" tooltip="Harga beli atau biaya produksi per unit">
                  <NumberInput 
                    value={state.cogs} 
                    onChange={(v) => update('cogs', v)} 
                    prefix="Rp" 
                  />
                </InputGroup>
                <InputGroup label="Biaya Packing" tooltip="Dus, bubble wrap, lakban, dll per unit">
                  <NumberInput 
                    value={state.packagingCost} 
                    onChange={(v) => update('packagingCost', v)} 
                    prefix="Rp" 
                  />
                </InputGroup>
              </div>

              {state.mode === Mode.GIVEN_PRICE && (
                <div className="mt-4 pt-4 border-t border-dashed border-gray-200 bg-orange-50/50 -mx-5 px-5 pb-1">
                   <InputGroup label="Rencana Harga Jual" tooltip="Harga yang akan ditampilkan di Shopee">
                    <NumberInput 
                      value={state.manualPrice} 
                      onChange={(v) => update('manualPrice', v)} 
                      prefix="Rp" 
                    />
                  </InputGroup>
                </div>
              )}
            </section>

            {/* 2. Platform Fees */}
            <section className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <SectionHeader title="Biaya Layanan Shopee" icon={Percent} />
              <div className="grid grid-cols-2 gap-4">
                <InputGroup label="Admin Fee" tooltip="Biaya Admin Star/Star+/Mall (biasanya 4-10%)">
                  <NumberInput 
                    value={state.adminFee} 
                    onChange={(v) => update('adminFee', v)} 
                    suffix="%" 
                  />
                </InputGroup>
                <InputGroup label="Payment Fee" tooltip="Biaya layanan transaksi / free shipping max (biasanya 4-5%)">
                  <NumberInput 
                    value={state.transactionFee} 
                    onChange={(v) => update('transactionFee', v)} 
                    suffix="%" 
                  />
                </InputGroup>
              </div>
              <InputGroup 
                label="Fee Lainnya" 
                rightElement={
                  <Toggle 
                    labelLeft="%" labelRight="Rp" 
                    isRight={state.otherPlatformFeeType === FeeType.RP}
                    onChange={(isRp) => update('otherPlatformFeeType', isRp ? FeeType.RP : FeeType.PERCENT)}
                  />
                }
              >
                <NumberInput 
                  value={state.otherPlatformFee} 
                  onChange={(v) => update('otherPlatformFee', v)} 
                  prefix={state.otherPlatformFeeType === FeeType.RP ? 'Rp' : undefined}
                  suffix={state.otherPlatformFeeType === FeeType.PERCENT ? '%' : undefined}
                />
              </InputGroup>
            </section>

            {/* 3. Ads & Marketing */}
            <section className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
              <SectionHeader title="Iklan & Marketing" icon={Megaphone} />
              
              <div className="mb-4">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">Quick Presets</label>
                <div className="flex gap-2">
                  {ADS_PRESETS.map((preset) => (
                    <button
                      type="button"
                      key={preset.value}
                      onClick={() => {
                        update('adsValue', preset.value);
                        update('adsMode', FeeType.PERCENT);
                      }}
                      className="text-xs py-1.5 px-3 rounded-full border border-gray-300 text-gray-900 hover:border-orange-500 hover:text-orange-600 transition-colors bg-gray-50"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <InputGroup 
                label="Budget Iklan" 
                tooltip="% dari omzet atau biaya per order (CPA)"
                rightElement={
                  <Toggle 
                    labelLeft="% Rev" labelRight="Rp/Ord" 
                    isRight={state.adsMode === FeeType.RP}
                    onChange={(isRp) => update('adsMode', isRp ? FeeType.RP : FeeType.PERCENT)}
                  />
                }
              >
                <NumberInput 
                  value={state.adsValue} 
                  onChange={(v) => update('adsValue', v)} 
                  prefix={state.adsMode === FeeType.RP ? 'Rp' : undefined}
                  suffix={state.adsMode === FeeType.PERCENT ? '%' : undefined}
                />
              </InputGroup>

              <div className="grid grid-cols-2 gap-4">
                <InputGroup label="Voucher Toko" tooltip="Diskon yang ditanggung penjual">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <NumberInput 
                         value={state.voucherValue}
                         onChange={(v) => update('voucherValue', v)}
                      />
                    </div>
                    <div className="w-20">
                      <select 
                        className="w-full h-full rounded-md border-gray-300 text-sm focus:border-orange-500 focus:ring-orange-500"
                        value={state.voucherType}
                        onChange={(e) => update('voucherType', e.target.value)}
                      >
                        <option value={FeeType.PERCENT}>%</option>
                        <option value={FeeType.RP}>Rp</option>
                      </select>
                    </div>
                  </div>
                </InputGroup>
                
                <InputGroup label="Affiliate/KOL" tooltip="Komisi affiliate (misal 5-10%)">
                  <NumberInput 
                    value={state.affiliateFee} 
                    onChange={(v) => update('affiliateFee', v)} 
                    suffix="%" 
                  />
                </InputGroup>
              </div>
            </section>

             {/* 4. Target */}
             <section className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
               <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                 <Target size={100} />
               </div>
              <SectionHeader title="Target Profit" icon={Target} />
              
              <InputGroup 
                label={state.mode === Mode.TARGET_PROFIT ? "Target Yang Diinginkan" : "Target (Untuk perbandingan)"}
                rightElement={
                  <Toggle 
                    labelLeft="% Margin" labelRight="Rp Profit" 
                    isRight={state.targetMode === FeeType.RP}
                    onChange={(isRp) => update('targetMode', isRp ? FeeType.RP : FeeType.PERCENT)}
                  />
                }
              >
                <NumberInput 
                  value={state.targetValue} 
                  onChange={(v) => update('targetValue', v)} 
                  prefix={state.targetMode === FeeType.RP ? 'Rp' : undefined}
                  suffix={state.targetMode === FeeType.PERCENT ? '%' : undefined}
                />
              </InputGroup>

              <InputGroup label="Cadangan Pajak (Optional)" tooltip="Simpanan untuk bayar pajak UMKM (0.5%)">
                 <NumberInput value={state.taxReserve} onChange={v => update('taxReserve', v)} suffix="%" />
              </InputGroup>
            </section>

            {/* 5. Optional / Logistics */}
            <details className="group bg-white rounded-xl border border-gray-200 shadow-sm">
              <summary className="flex items-center gap-2 p-5 cursor-pointer list-none font-medium text-gray-600 hover:text-gray-900">
                <Settings className="w-5 h-5" />
                <span>Pengaturan Lanjutan (Logistik & Overhead)</span>
                <span className="ml-auto text-xs text-gray-400 group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <div className="p-5 pt-0 border-t border-gray-100 mt-2 space-y-4">
                 <InputGroup label="Subsidi Ongkir (Seller)" tooltip="Jika seller menanggung sebagian ongkir">
                    <NumberInput value={state.shippingSubsidy} onChange={v => update('shippingSubsidy', v)} prefix="Rp" />
                 </InputGroup>
                 <InputGroup label="Biaya Overhead" tooltip="Gaji karyawan, listrik, dll dialokasikan ke produk">
                    <div className="flex gap-2">
                      <div className="flex-1">
                         <NumberInput value={state.overheadValue} onChange={v => update('overheadValue', v)} />
                      </div>
                      <select 
                        className="rounded-md border-gray-300 text-sm focus:border-orange-500"
                        value={state.overheadMode}
                        onChange={(e) => update('overheadMode', e.target.value)}
                      >
                         <option value={FeeType.PERCENT}>% Omzet</option>
                         <option value={FeeType.RP}>Rp/Pcs</option>
                      </select>
                    </div>
                 </InputGroup>
                 {state.mode === Mode.TARGET_PROFIT && (
                   <InputGroup label="Pembulatan Harga">
                      <select 
                        className="block w-full rounded-md border-gray-300 py-2 text-sm focus:border-orange-500 focus:ring-orange-500"
                        value={state.rounding}
                        onChange={(e) => update('rounding', e.target.value)}
                      >
                        <option value={RoundingMode.NONE}>Tanpa Pembulatan</option>
                        <option value={RoundingMode.NEAREST_500}>Ke Rp 500 terdekat</option>
                        <option value={RoundingMode.NEAREST_1000}>Ke Rp 1.000 terdekat</option>
                      </select>
                   </InputGroup>
                 )}
              </div>
            </details>

          </div>
        </div>

        {/* RIGHT COLUMN: OUTPUTS */}
        <div className="lg:col-span-5">
          <div className="sticky top-6">
            <Results 
              result={result} 
              mode={state.mode} 
              onExport={handleExport}
              onShare={handleShare}
            />
            
            <div className="mt-6 p-4 bg-gray-50 rounded-lg text-xs text-gray-500 leading-relaxed flex gap-2 items-start">
               <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
               <p>
                 Disclaimer: Angka ini adalah estimasi. Kebijakan biaya Shopee dapat berubah sewaktu-waktu.
                 Selalu cek detail fee terbaru di Seller Centre. Aplikasi ini tidak menyimpan data Anda di server (hanya di browser).
               </p>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}