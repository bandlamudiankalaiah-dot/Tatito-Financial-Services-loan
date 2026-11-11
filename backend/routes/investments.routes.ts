import { Router } from 'express';
import type { Request, Response } from 'express';
import { dbRepository, logAudit } from '../../database/db.ts';
import { requireAuth, type AuthenticatedRequest } from '../middleware/auth.ts';
import { marketDataAdapter, mutualFundAdapter } from '../../integrations/index.ts';

const router = Router();

// ================= STOCKS & WATCHLIST =================

// GET /api/investments/stocks
router.get('/stocks', async (req: Request, res: Response) => {
  const quotes = await marketDataAdapter.getQuotes();
  res.json(quotes);
});

// GET /api/investments/watchlist
router.get('/watchlist', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userWatch = await dbRepository.investments.getWatchlist(req.user!.userId);
    res.json(userWatch);
  } catch (err: any) {
    if (err.statusCode === 503) {
      return res.status(503).json({ error: 'Service Unavailable', detail: err.message });
    }
    res.status(500).json({ error: 'Internal Error', detail: err.message });
  }
});

// POST /api/investments/watchlist/toggle
router.post('/watchlist/toggle', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { symbol } = req.body;
    if (!symbol) return res.status(400).json({ error: 'Symbol required' });

    const result = await dbRepository.investments.toggleWatchlist(req.user!.userId, symbol);
    return res.json({
      symbol: result.symbol,
      watched: result.watched,
      message: result.watched ? 'Added to watchlist' : 'Removed from watchlist'
    });
  } catch (err: any) {
    if (err.statusCode === 503) {
      return res.status(503).json({ error: 'Service Unavailable', detail: err.message });
    }
    return res.status(500).json({ error: 'Internal Error', detail: err.message });
  }
});

// POST /api/investments/stocks/order (Simulated trade execution)
router.post('/stocks/order', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { symbol, order_type, quantity } = req.body;
    const user = await dbRepository.users.findById(req.user!.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      return res.status(400).json({ error: 'Bad Request', detail: 'Positive quantity required' });
    }

    const quote = await marketDataAdapter.getQuote(symbol);
    if (!quote) return res.status(404).json({ error: 'Stock quote not found' });

    const totalValue = Math.round(qty * quote.price);
    const type = (order_type || 'BUY').toUpperCase();
    const currentBalance = parseFloat(user.wallet_balance || 0);

    if (type === 'BUY') {
      if (currentBalance < totalValue) {
        return res.status(400).json({
          error: 'Insufficient Balance',
          detail: `Required ₹${totalValue.toLocaleString('en-IN')}, available in wallet ₹${currentBalance.toLocaleString('en-IN')}`
        });
      }
      await dbRepository.users.updateWallet(user.id, currentBalance - totalValue);
      await dbRepository.investments.upsertHolding(user.id, quote.symbol, quote.name, 'equity', qty, totalValue, quote.price);
    } else if (type === 'SELL') {
      const holdings = await dbRepository.investments.getPortfolioByUser(user.id);
      const existing = holdings.find((p: any) => p.asset_symbol === quote.symbol);
      const currentQty = existing ? Number(existing.quantity) : 0;
      if (!existing || currentQty < qty) {
        return res.status(400).json({
          error: 'Insufficient Holdings',
          detail: `You own ${currentQty} shares of ${quote.symbol}`
        });
      }
      await dbRepository.users.updateWallet(user.id, currentBalance + totalValue);
      await dbRepository.investments.upsertHolding(user.id, quote.symbol, quote.name, 'equity', -qty, -totalValue, quote.price);
    }

    const orderRef = `ORD-${Date.now()}`;
    await dbRepository.investments.createStockOrder({
      order_ref: orderRef,
      user_id: user.id,
      symbol: quote.symbol,
      order_type: type,
      quantity: qty,
      executed_price: quote.price,
      total_order_value: totalValue,
      status: 'EXECUTED'
    });

    await dbRepository.notifications.create({
      user_id: user.id,
      title: `Order Executed: ${type} ${qty} ${quote.symbol}`,
      message: `Filled at ₹${quote.price} (Total: ₹${totalValue.toLocaleString('en-IN')}). Ref: ${orderRef}`,
      category: 'investments'
    });

    logAudit(user.id, 'STOCK_ORDER', 'stock_orders', orderRef, { symbol: quote.symbol, type, qty, totalValue });

    const updatedWallet = type === 'BUY' ? currentBalance - totalValue : currentBalance + totalValue;

    return res.json({
      status: 'EXECUTED',
      order_reference: orderRef,
      symbol: quote.symbol,
      order_type: type,
      quantity: qty,
      executed_price: quote.price,
      total_value: totalValue,
      wallet_balance: updatedWallet,
      is_simulated: true,
      execution_mode: 'SANDBOX_PROTOTYPE',
      message: 'Trade executed successfully on simulated exchange [DEMO SANDBOX]'
    });
  } catch (err: any) {
    if (err.statusCode === 503) {
      return res.status(503).json({ error: 'Service Unavailable', detail: err.message });
    }
    console.error('Stock order error:', err);
    return res.status(500).json({ error: 'Internal Error', detail: err.message });
  }
});

// ================= MUTUAL FUNDS & SIPS =================

// GET /api/investments/mutual-funds
router.get('/mutual-funds', async (req: Request, res: Response) => {
  try {
    const category = (req.query.category as string || 'all').toLowerCase();
    let funds = await dbRepository.investments.getMutualFunds();

    if (category !== 'all') {
      funds = funds.filter((f: any) => f.category.toLowerCase().includes(category));
    }
    res.json(funds);
  } catch (err: any) {
    if (err.statusCode === 503) {
      return res.status(503).json({ error: 'Service Unavailable', detail: err.message });
    }
    res.status(500).json({ error: 'Internal Error', detail: err.message });
  }
});

// GET /api/investments/sips
router.get('/sips', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userSips = await dbRepository.investments.getSips(req.user!.userId);
    res.json(userSips);
  } catch (err: any) {
    if (err.statusCode === 503) {
      return res.status(503).json({ error: 'Service Unavailable', detail: err.message });
    }
    res.status(500).json({ error: 'Internal Error', detail: err.message });
  }
});

// POST /api/investments/sips
router.post('/sips', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { fund_id, monthly_amount, debit_day } = req.body;
    const amt = parseFloat(monthly_amount);

    if (!amt || amt < 500) {
      return res.status(400).json({ error: 'Bad Request', detail: 'Minimum SIP amount is ₹500' });
    }

    const fund = (await dbRepository.investments.getFundById(parseInt(fund_id, 10))) || (await dbRepository.investments.getMutualFunds())[0];
    const mandateRef = `SIP-MANDATE-${Date.now()}`;

    const nextDate = new Date();
    nextDate.setMonth(nextDate.getMonth() + 1);
    nextDate.setDate(parseInt(debit_day, 10) || 10);

    const newSip = await dbRepository.investments.createSip({
      mandate_ref: mandateRef,
      user_id: req.user!.userId,
      fund_id: fund?.id || 1,
      monthly_amount: amt,
      debit_day: parseInt(debit_day, 10) || 10,
      next_debit_date: nextDate.toISOString().split('T')[0]
    });

    await dbRepository.notifications.create({
      user_id: req.user!.userId,
      title: 'SIP Mandate Authorized',
      message: `₹${amt.toLocaleString('en-IN')}/mo in ${fund?.fund_name || 'Mutual Fund'}. Auto-debit on ${newSip.debit_day}th of every month.`,
      category: 'investments'
    });

    logAudit(req.user!.userId, 'REGISTER_SIP', 'sips', mandateRef, { fund: fund?.fund_name, amount: amt });

    return res.status(201).json({
      ...newSip,
      fund_name: fund?.fund_name,
      is_simulated: true,
      compliance_note: 'Simulated e-NACH mandate sandbox demo [No real bank auto-debit]',
      message: 'SIP Mandate successfully authorized in sandbox environment'
    });
  } catch (err: any) {
    if (err.statusCode === 503) {
      return res.status(503).json({ error: 'Service Unavailable', detail: err.message });
    }
    console.error('SIP registration error:', err);
    return res.status(500).json({ error: 'Internal Error', detail: err.message });
  }
});

// DELETE /api/investments/sips/:id
router.delete('/sips/:id', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const sipId = parseInt(req.params.id, 10);
    await dbRepository.investments.deleteSip(sipId, req.user!.userId);
    return res.json({ message: 'SIP mandate paused/cancelled successfully' });
  } catch (err: any) {
    if (err.statusCode === 503) {
      return res.status(503).json({ error: 'Service Unavailable', detail: err.message });
    }
    return res.status(500).json({ error: 'Internal Error', detail: err.message });
  }
});

// ================= PORTFOLIO & DEMAT =================

// GET /api/investments/portfolio
router.get('/portfolio', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const holdings = await dbRepository.investments.getPortfolioByUser(req.user!.userId);
    const totalInvested = holdings.reduce((sum: number, h: any) => sum + parseFloat(h.invested_amount || 0), 0);
    const currentValuation = holdings.reduce((sum: number, h: any) => sum + parseFloat(h.current_valuation || 0), 0);
    const totalReturns = currentValuation - totalInvested;
    const returnsPct = totalInvested > 0 ? parseFloat(((totalReturns / totalInvested) * 100).toFixed(2)) : 0;

    // Asset category breakdown
    const allocation: Record<string, number> = { equity: 0, mutual_fund: 0, gold_etf: 0, sovereign_bond: 0 };
    holdings.forEach((h: any) => {
      const cat = h.category || 'equity';
      allocation[cat] = (allocation[cat] || 0) + parseFloat(h.current_valuation || 0);
    });

    return res.json({
      total_invested: totalInvested,
      current_valuation: currentValuation,
      total_returns: totalReturns,
      returns_percentage: returnsPct,
      holdings,
      allocation,
      is_simulated: true,
      note: 'Portfolio values reflect simulated prototype holdings'
    });
  } catch (err: any) {
    if (err.statusCode === 503) {
      return res.status(503).json({ error: 'Service Unavailable', detail: err.message });
    }
    return res.status(500).json({ error: 'Internal Error', detail: err.message });
  }
});

// GET /api/investments/demat
router.get('/demat', requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    let demat = await dbRepository.investments.getDemat(req.user!.userId);
    if (!demat) {
      demat = {
        client_code: 'TT-KDP-89104',
        dp_id: 'IN300128-10049281',
        depository: 'NSDL',
        status: 'active'
      };
    }
    res.json({
      ...demat,
      is_simulated: true,
      compliance_note: 'Simulated Depository Participant sandbox demo. Not a registered broker depository.'
    });
  } catch (err: any) {
    if (err.statusCode === 503) {
      return res.status(503).json({ error: 'Service Unavailable', detail: err.message });
    }
    return res.status(500).json({ error: 'Internal Error', detail: err.message });
  }
});

// GET /api/investments/orders (and /api/investments/stocks/orders)
router.get(['/orders', '/stocks/orders'], requireAuth, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const orders = await dbRepository.investments.getStockOrders(req.user!.userId);
    return res.json(orders);
  } catch (err: any) {
    if (err.statusCode === 503) {
      return res.status(503).json({ error: 'Service Unavailable', detail: err.message });
    }
    return res.status(500).json({ error: 'Internal Error', detail: err.message });
  }
});

// POST /api/investments/mutual-funds/sip-calculator (and /api/mutual-funds/sip-calculator)
router.post(['/mutual-funds/sip-calculator', '/sip-calculator'], (req: Request, res: Response) => {
  const { monthly_investment, expected_return_rate, tenure_years, mode, lumpsum_amount } = req.body;
  const isLumpsum = mode === 'lumpsum';
  const P = parseFloat(isLumpsum ? (lumpsum_amount || monthly_investment) : monthly_investment);
  const annualRate = parseFloat(expected_return_rate) || 15;
  const years = parseInt(tenure_years, 10) || 10;

  if (isNaN(P) || P <= 0 || years <= 0) {
    return res.status(400).json({ error: 'Bad Request', detail: 'Valid positive investment amount and tenure years required' });
  }

  let totalInvested = 0;
  let totalValue = 0;
  const yearlyBreakdown = [];

  if (isLumpsum) {
    totalInvested = P;
    const r = annualRate / 100;
    totalValue = Math.round(P * Math.pow(1 + r, years));
    for (let y = 1; y <= years; y++) {
      const val = Math.round(P * Math.pow(1 + r, y));
      yearlyBreakdown.push({
        year: y,
        invested: P,
        wealth: val,
        gain: val - P
      });
    }
  } else {
    const n = years * 12;
    const i = (annualRate / 12) / 100;
    totalInvested = P * n;
    totalValue = i > 0
      ? Math.round(P * ((Math.pow(1 + i, n) - 1) / i) * (1 + i))
      : totalInvested;

    for (let y = 1; y <= years; y++) {
      const months = y * 12;
      const inv = P * months;
      const val = i > 0 ? Math.round(P * ((Math.pow(1 + i, months) - 1) / i) * (1 + i)) : inv;
      yearlyBreakdown.push({
        year: y,
        invested: inv,
        wealth: val,
        gain: val - inv
      });
    }
  }

  return res.json({
    mode: isLumpsum ? 'lumpsum' : 'sip',
    monthly_investment: isLumpsum ? 0 : P,
    lumpsum_amount: isLumpsum ? P : 0,
    expected_return_rate: annualRate,
    tenure_years: years,
    total_invested: totalInvested,
    estimated_returns: Math.max(0, totalValue - totalInvested),
    total_value: totalValue,
    yearly_breakdown: yearlyBreakdown
  });
});

export default router;
