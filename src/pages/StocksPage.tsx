import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StockQuote, StockOrder, PortfolioSummary } from '../types';
import { 
  TrendingUp, TrendingDown, Search, Star,
  ArrowUpRight, ArrowDownRight, ShieldAlert,
  Wallet
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid 
} from 'recharts';

type TimeframeKey = '1D' | '1W' | '1M' | '3M' | '1Y' | '5Y';

export const StocksPage: React.FC = () => {
  const { user, isAuthenticated, refreshUser } = useAuth();
  const [stocks, setStocks] = useState<StockQuote[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [orders, setOrders] = useState<StockOrder[]>([]);
  const [selectedStock, setSelectedStock] = useState<StockQuote | null>(null);
  const [timeframe, setTimeframe] = useState<TimeframeKey>('1D');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sectorFilter, setSectorFilter] = useState<string>('ALL');
  const [watchlistOnly, setWatchlistOnly] = useState<boolean>(false);
  const [bottomTab, setBottomTab] = useState<'holdings' | 'orders'>('holdings');
  const [orderModalOpen, setOrderModalOpen] = useState<boolean>(false);
  const [orderType, setOrderType] = useState<'BUY' | 'SELL'>('BUY');
  const [orderQty, setOrderQty] = useState<number>(10);
  const [orderLoading, setOrderLoading] = useState<boolean>(false);
  const [orderMessage, setOrderMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadData = async () => {
    try {
      const [stocksData, portData, watchData, ordersData] = await Promise.all([
        api.getStocks(),
        isAuthenticated ? api.getPortfolio().catch(() => null) : Promise.resolve(null),
        isAuthenticated ? api.getWatchlist().catch(() => []) : Promise.resolve([]),
        isAuthenticated ? api.getStockOrders().catch(() => []) : Promise.resolve([]),
      ]);
      if (Array.isArray(stocksData)) {
        setStocks(stocksData);
        if (!selectedStock && stocksData.length > 0) {
          setSelectedStock(stocksData[0]);
        } else if (selectedStock) {
          const updated = stocksData.find(s => s.symbol === selectedStock.symbol);
          if (updated) setSelectedStock(updated);
        }
      }
      if (portData) setPortfolio(portData);
      if (Array.isArray(watchData)) setWatchlist(watchData);
      if (Array.isArray(ordersData)) setOrders(ordersData);
    } catch (err) {
      console.error('Failed to load stocks data:', err);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000); // 10s live quote polling
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  const sectors = ['ALL', ...Array.from(new Set(stocks.map(s => s.sector)))];

  const filteredStocks = stocks.filter(s => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.sector.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSector = sectorFilter === 'ALL' || s.sector === sectorFilter;
    const matchesWatchlist = !watchlistOnly || watchlist.includes(s.symbol);
    return matchesSearch && matchesSector && matchesWatchlist;
  });

  const handleToggleWatch = async (e: React.MouseEvent, symbol: string) => {
    e.stopPropagation();
    if (!isAuthenticated) return;
    try {
      const res = await api.toggleWatchlist(symbol);
      if (res.watched) {
        setWatchlist(prev => [...prev, symbol]);
      } else {
        setWatchlist(prev => prev.filter(s => s !== symbol));
      }
    } catch (err) {
      console.error('Failed to toggle watchlist:', err);
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStock) return;
    setOrderLoading(true);
    setOrderMessage(null);

    try {
      await api.placeStockOrder({
        symbol: selectedStock.symbol,
        order_type: orderType,
        quantity: Number(orderQty),
        price: selectedStock.price,
      });

      setOrderMessage({
        type: 'success',
        text: `Successfully executed ${orderType} order for ${orderQty} units of ${selectedStock.symbol} at ₹${selectedStock.price}.`,
      });

      await loadData();
      await refreshUser();
      setTimeout(() => {
        setOrderModalOpen(false);
        setOrderMessage(null);
      }, 1500);
    } catch (err: any) {
      setOrderMessage({
        type: 'error',
        text: err.message || 'Order execution failed. Please verify wallet balance.',
      });
    } finally {
      setOrderLoading(false);
    }
  };

  const rawSeries = selectedStock?.timeframes?.[timeframe] || selectedStock?.sparkline || [];
  const chartData = rawSeries.map((price, idx) => ({
    time: timeframe === '1D' ? `10:${String(idx * 5).padStart(2, '0')}` : `${timeframe} #${idx + 1}`,
    price,
  }));

  const formatINR = (val: number) => '₹' + Number(val).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Explicit Compliance Banner for Demo Data */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong>DEMO DATA &amp; TRADING SIMULATION:</strong> Stock quotes, multi-timeframe curves, and execution orders operate strictly as simulated training data. No live capital is debited to external stock exchanges (NSE/BSE). Live market trading requires authorized SEBI broker partner onboarding.
        </div>
      </div>

      {/* Header and Portfolio Summary Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <div className="text-xs font-semibold text-teal-600 uppercase tracking-wider mb-1">Equities Terminal &amp; Screener</div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Stock Market Simulator &amp; Watchlist
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Analyze 1D to 5Y multi-timeframe curves, filter by sector fundamentals, and execute instant simulated equity orders.
          </p>
        </div>

        {/* Wallet Balance Card */}
        <div className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-sm flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center">
            <Wallet className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-semibold uppercase">Trading Wallet</div>
            <div className="text-sm font-bold font-tabular text-slate-900">
              {formatINR(user?.wallet_balance || 24850)}
            </div>
          </div>
        </div>
      </div>

      {/* Market Benchmarks Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[11px] font-semibold text-slate-400 uppercase">NIFTY 50 (Demo)</div>
          <div className="text-lg font-bold font-tabular text-slate-900 mt-0.5">24,852.15</div>
          <div className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5 mt-1 font-tabular">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+142.30 (+0.58%)</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[11px] font-semibold text-slate-400 uppercase">SENSEX (Demo)</div>
          <div className="text-lg font-bold font-tabular text-slate-900 mt-0.5">81,410.80</div>
          <div className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5 mt-1 font-tabular">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+420.10 (+0.52%)</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[11px] font-semibold text-slate-400 uppercase">Portfolio Holdings</div>
          <div className="text-lg font-bold font-tabular text-slate-900 mt-0.5">
            {formatINR(portfolio?.current_valuation || 460636)}
          </div>
          <div className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5 mt-1 font-tabular">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+{portfolio?.returns_percentage || 9.7}% Overall</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="text-[11px] font-semibold text-slate-400 uppercase">Watchlist Count</div>
          <div className="text-lg font-bold font-tabular text-slate-900 mt-0.5">
            {watchlist.length} Tracked
          </div>
          <div className="text-xs text-slate-400 mt-1">NSE / BSE Bluechips</div>
        </div>
      </div>

      {/* Main Terminal Viewport: Left Ticker List & Screener (5 Cols) + Right Chart & Order View (7 Cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Watchlist & Stock Screener (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col h-[640px]">
          
          <div className="p-4 border-b border-slate-200 bg-slate-50/50 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Equity Screener &amp; Watchlist</span>
              <button
                type="button"
                onClick={() => setWatchlistOnly(!watchlistOnly)}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-md transition-colors flex items-center gap-1 ${
                  watchlistOnly ? 'bg-slate-900 text-amber-400' : 'bg-slate-200/70 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Star className="w-3 h-3 fill-current" />
                <span>{watchlistOnly ? 'Watchlist Only' : 'All Stocks'}</span>
              </button>
            </div>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search stocks by name, ticker, or sector..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
              />
            </div>
            {/* Sector Screener Filter */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {sectors.map(sec => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => setSectorFilter(sec)}
                  className={`px-2.5 py-1 text-[10px] font-semibold rounded-md whitespace-nowrap transition-colors ${
                    sectorFilter === sec ? 'bg-teal-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {sec}
                </button>
              ))}
            </div>
          </div>

          <div className="overflow-y-auto divide-y divide-slate-100 flex-1">
            {filteredStocks.map((stock) => {
              const isSelected = selectedStock?.symbol === stock.symbol;
              const isPositive = stock.change >= 0;
              const isWatched = watchlist.includes(stock.symbol);
              return (
                <div
                  key={stock.symbol}
                  onClick={() => setSelectedStock(stock)}
                  className={`p-3.5 flex justify-between items-center cursor-pointer transition-colors ${isSelected ? 'bg-teal-50/70 border-l-2 border-teal-600' : 'hover:bg-slate-50'}`}
                >
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={(e) => handleToggleWatch(e, stock.symbol)}
                      className={`p-1 rounded transition-colors ${isWatched ? 'text-amber-500' : 'text-slate-300 hover:text-slate-500'}`}
                      title={isWatched ? 'Remove from Watchlist' : 'Add to Watchlist'}
                    >
                      <Star className={`w-3.5 h-3.5 ${isWatched ? 'fill-current' : ''}`} />
                    </button>
                    <div>
                      <div className="font-bold text-xs text-slate-900">{stock.symbol}</div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[150px]">{stock.name}</div>
                      <div className="text-[9px] text-slate-400 font-medium">{stock.sector} · P/E {stock.pe_ratio}</div>
                    </div>
                  </div>
                  <div className="text-right font-tabular">
                    <div className="font-bold text-xs text-slate-900">
                      ₹{stock.price.toFixed(2)}
                    </div>
                    <div className={`text-[10px] font-semibold flex items-center justify-end gap-0.5 ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {isPositive ? '+' : ''}{stock.change.toFixed(2)} ({isPositive ? '+' : ''}{stock.change_percent.toFixed(2)}%)
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Right Column: Multi-Timeframe Chart Viewport & Fast Order Execution (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {selectedStock ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
              
              {/* Active Stock Header */}
              <div className="flex flex-wrap justify-between items-start gap-4 pb-6 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-extrabold text-slate-900">{selectedStock.symbol}</h2>
                    <span className="text-xs text-slate-500 font-medium">{selectedStock.name}</span>
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Sector: <span className="text-slate-700 font-medium">{selectedStock.sector}</span> · P/E: <span className="font-tabular font-medium text-slate-700">{selectedStock.pe_ratio}</span> · MCap: <span className="font-tabular font-medium text-slate-700">₹{selectedStock.market_cap_cr.toLocaleString('en-IN')} Cr</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl sm:text-3xl font-extrabold font-tabular text-slate-900">
                    ₹{selectedStock.price.toFixed(2)}
                  </div>
                  <div className={`text-xs font-semibold flex items-center justify-end gap-1 font-tabular ${selectedStock.change >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {selectedStock.change >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                    <span>{selectedStock.change >= 0 ? '+' : ''}{selectedStock.change.toFixed(2)} ({selectedStock.change_percent.toFixed(2)}%)</span>
                  </div>
                </div>
              </div>

              {/* Multi-Timeframe Selector & Chart Section */}
              <div className="space-y-3">
                <div className="flex flex-wrap justify-between items-center gap-2 text-xs text-slate-400">
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                    {(['1D', '1W', '1M', '3M', '1Y', '5Y'] as TimeframeKey[]).map((tf) => (
                      <button
                        key={tf}
                        type="button"
                        onClick={() => setTimeframe(tf)}
                        className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-colors ${
                          timeframe === tf ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {tf}
                      </button>
                    ))}
                  </div>
                  <span className="font-tabular">52W Range: ₹{selectedStock.low_52w} - ₹{selectedStock.high_52w}</span>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                      <XAxis dataKey="time" fontSize={10} stroke="#94A3B8" />
                      <YAxis domain={['auto', 'auto']} fontSize={10} stroke="#94A3B8" tickFormatter={v => `₹${v}`} />
                      <Tooltip 
                        formatter={(val: any) => [`₹${Number(val).toFixed(2)}`, `Price (${timeframe})`]}
                        contentStyle={{ borderRadius: '8px', fontSize: '11px' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="price" 
                        stroke={selectedStock.change >= 0 ? '#0D9488' : '#DC2626'} 
                        fill={selectedStock.change >= 0 ? '#CCFBF1' : '#FEE2E2'} 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Order Trigger Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                <button
                  onClick={() => {
                    setOrderType('BUY');
                    setOrderModalOpen(true);
                  }}
                  className="flex-1 py-2.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-1.5"
                >
                  <span>BUY {selectedStock.symbol}</span>
                </button>
                <button
                  onClick={() => {
                    setOrderType('SELL');
                    setOrderModalOpen(true);
                  }}
                  className="flex-1 py-2.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-sm flex items-center justify-center gap-1.5"
                >
                  <span>SELL {selectedStock.symbol}</span>
                </button>
              </div>

            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
              Select a stock from the watchlist to view multi-timeframe charts and order book.
            </div>
          )}

          {/* Bottom Tabbed Card: Holdings vs Order History */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex bg-slate-100 p-1 rounded-lg text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setBottomTab('holdings')}
                  className={`px-3 py-1 rounded-md transition-colors ${bottomTab === 'holdings' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600'}`}
                >
                  Active Holdings ({portfolio?.holdings?.length || 0})
                </button>
                <button
                  type="button"
                  onClick={() => setBottomTab('orders')}
                  className={`px-3 py-1 rounded-md transition-colors ${bottomTab === 'orders' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-600'}`}
                >
                  Order Book History ({orders.length})
                </button>
              </div>
              <span className="text-[11px] text-slate-400 font-tabular">Simulated Demat Ledger</span>
            </div>
            
            {bottomTab === 'holdings' ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                    <tr>
                      <th className="py-2 px-3">Asset</th>
                      <th className="py-2 px-3 text-right">Qty</th>
                      <th className="py-2 px-3 text-right">Avg Price</th>
                      <th className="py-2 px-3 text-right">Current Value</th>
                      <th className="py-2 px-3 text-right">Gain / Loss</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-tabular text-slate-700">
                    {portfolio?.holdings?.map((h) => {
                      const pnl = h.current_valuation - h.invested_amount;
                      const pnlPercent = (pnl / h.invested_amount) * 100;
                      const isPositive = pnl >= 0;
                      return (
                        <tr key={h.id} className="hover:bg-slate-50/50">
                          <td className="py-2.5 px-3">
                            <div className="font-bold text-slate-900">{h.asset_symbol}</div>
                            <div className="text-[10px] text-slate-400 capitalize">{h.category.replace('_', ' ')}</div>
                          </td>
                          <td className="py-2.5 px-3 text-right font-medium">{h.quantity}</td>
                          <td className="py-2.5 px-3 text-right text-slate-500">₹{Number(h.avg_buy_price).toFixed(2)}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-slate-900">₹{Number(h.current_valuation).toLocaleString('en-IN')}</td>
                          <td className={`py-2.5 px-3 text-right font-semibold ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {isPositive ? '+' : ''}₹{Math.round(pnl).toLocaleString('en-IN')} ({pnlPercent.toFixed(1)}%)
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                    <tr>
                      <th className="py-2 px-3">Order Ref</th>
                      <th className="py-2 px-3">Symbol</th>
                      <th className="py-2 px-3">Side</th>
                      <th className="py-2 px-3 text-right">Qty</th>
                      <th className="py-2 px-3 text-right">Exec Price</th>
                      <th className="py-2 px-3 text-right">Total Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-tabular text-slate-700">
                    {orders.map((ord) => (
                      <tr key={ord.id || ord.order_ref} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-mono text-[11px] font-semibold text-slate-900">{ord.order_ref}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">{ord.symbol}</td>
                        <td className={`py-2.5 px-3 font-bold ${ord.order_type === 'BUY' ? 'text-teal-700' : 'text-rose-700'}`}>
                          {ord.order_type}
                        </td>
                        <td className="py-2.5 px-3 text-right">{ord.quantity}</td>
                        <td className="py-2.5 px-3 text-right">₹{Number(ord.executed_price).toFixed(2)}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                          ₹{Number(ord.total_order_value).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Order Execution Modal */}
      {orderModalOpen && selectedStock && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-5 border border-slate-200">
            
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${orderType === 'BUY' ? 'bg-teal-50 text-teal-700' : 'bg-rose-50 text-rose-700'}`}>
                  {orderType} ORDER
                </span>
                <h3 className="font-extrabold text-slate-900 text-base mt-1">{selectedStock.symbol}</h3>
              </div>
              <button 
                onClick={() => setOrderModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-xs font-semibold p-1"
              >
                ✕
              </button>
            </div>

            {orderMessage && (
              <div className={`p-3 rounded-lg text-xs ${orderMessage.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'}`}>
                {orderMessage.text}
              </div>
            )}

            <form onSubmit={handlePlaceOrder} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Execution Price</label>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-bold font-tabular text-slate-900">
                  ₹{selectedStock.price.toFixed(2)} (Market Order)
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Quantity (Units)</label>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  required
                  value={orderQty}
                  onChange={e => setOrderQty(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none font-bold font-tabular text-slate-900"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 border border-slate-100 font-tabular">
                <div className="flex justify-between text-slate-500">
                  <span>Gross Order Value:</span>
                  <span className="font-bold text-slate-900">{formatINR(selectedStock.price * orderQty)}</span>
                </div>
                <div className="flex justify-between text-slate-500">
                  <span>Available Balance:</span>
                  <span>{formatINR(user?.wallet_balance || 24850)}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOrderModalOpen(false)}
                  className="flex-1 py-2 font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={orderLoading}
                  className={`flex-1 py-2 font-bold text-white rounded-lg transition-colors shadow-sm disabled:opacity-50 ${orderType === 'BUY' ? 'bg-teal-600 hover:bg-teal-700' : 'bg-slate-900 hover:bg-slate-800'}`}
                >
                  {orderLoading ? 'Executing...' : `Confirm ${orderType}`}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
