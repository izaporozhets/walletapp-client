import React, { useEffect, useState } from 'react';
import API from './api';
import { Wallet, Transaction } from './types';
import { v4 as uuidv4 } from 'uuid';
import './App.css';

function App() {
  // состояния
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);

  const [depositId, setDepositId] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawId, setWithdrawId] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [fromId, setFromId] = useState('');
  const [toId, setToId] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [walletId, setWalletId] = useState('');
  const [timestamp, setTimestamp] = useState('');
  const [historicalBalance, setHistoricalBalance] = useState<number | null>(null);

  // ошибки
  const [depositError, setDepositError] = useState('');
  const [withdrawError, setWithdrawError] = useState('');
  const [transferError, setTransferError] = useState('');
  const [balanceError, setBalanceError] = useState('');

  const fetchWallets = async () => {
    const res = await API.get('/wallet/all');
    setWallets(res.data);
  };

  const fetchTransactions = async () => {
    const res = await API.get('/transactions/all');
    setTransactions(res.data);
  };

  const deposit = async () => {
    try {
      setDepositError('');
      await API.post('/wallet/deposit', {
        walletId: depositId,
        amount: depositAmount,
        requestId: uuidv4(),
      });
      fetchWallets();
      fetchTransactions();
    } catch (e: any) {
      setDepositError(e.response?.data?.message || 'Deposit failed');
    }
  };

  const withdraw = async () => {
    try {
      setWithdrawError('');
      await API.post('/wallet/withdraw', {
        walletId: withdrawId,
        amount: withdrawAmount,
        requestId: uuidv4(),
      });
      fetchWallets();
      fetchTransactions();
    } catch (e: any) {
      setWithdrawError(e.response?.data?.message || 'Withdraw failed');
    }
  };

  const transfer = async () => {
    try {
      setTransferError('');
      await API.post('/wallet/transfer', {
        fromWalletId: fromId,
        toWalletId: toId,
        amount: transferAmount,
        requestId: uuidv4(),
      });
      fetchWallets();
      fetchTransactions();
    } catch (e: any) {
      setTransferError(e.response?.data?.message || 'Transfer failed');
    }
  };

  const getHistoricalBalance = async () => {
    try {
      setBalanceError('');
      const res = await API.get('/wallet/balance-at', {
        params: {
          walletId: walletId,
          timestamp,
        },
      });
      setHistoricalBalance(res.data.balance);
    } catch (e: any) {
      setBalanceError(e.response?.data?.message || 'Failed to get balance');
      setHistoricalBalance(null);
    }
  };

  useEffect(() => {
    fetchWallets();
    fetchTransactions();
  }, []);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="container">
      <div className="column">
        <section>
          <h2>Wallets</h2>
          <ul>
            {wallets.map(w => (
              <li key={w.id}>
                <b onClick={() => copyToClipboard(w.id)} style={{ cursor: 'pointer' }}>{w.id}</b>: {w.balance}
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h3>Deposit</h3>
          <input placeholder="Wallet ID" value={depositId} onChange={e => setDepositId(e.target.value)} />
          <input placeholder="Amount" value={depositAmount} onChange={e => setDepositAmount(e.target.value)} />
          <button onClick={deposit} disabled={!depositId || !depositAmount}>Deposit</button>
          {depositError && <div className="error">{depositError}</div>}
        </section>

        <section>
          <h3>Withdraw</h3>
          <input placeholder="Wallet ID" value={withdrawId} onChange={e => setWithdrawId(e.target.value)} />
          <input placeholder="Amount" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} />
          <button onClick={withdraw} disabled={!withdrawId || !withdrawAmount}>Withdraw</button>
          {withdrawError && <div className="error">{withdrawError}</div>}
        </section>

        <section>
          <h3>Transfer</h3>
          <input placeholder="From ID" value={fromId} onChange={e => setFromId(e.target.value)} />
          <input placeholder="To ID" value={toId} onChange={e => setToId(e.target.value)} />
          <input placeholder="Amount" value={transferAmount} onChange={e => setTransferAmount(e.target.value)} />
          <button onClick={transfer} disabled={!fromId || !toId || !transferAmount}>Transfer</button>
          {transferError && <div className="error">{transferError}</div>}
        </section>

        <section>
          <h3>Historical Balance</h3>
          
          <input
            placeholder="Wallet ID"
            value={walletId}
            onChange={e => setWalletId(e.target.value)}
          />

          <input
            type="datetime-local"
            value={timestamp}
            onChange={e => setTimestamp(e.target.value)}
          />

          <button
            onClick={async () => {
              try {
                setBalanceError('');
                const isoTimestamp = new Date(timestamp).toISOString();
                const res = await API.get(`/wallet/${walletId}/balance-at`, {
                  params: {
                    timestamp: isoTimestamp,
                  },
                });
                setHistoricalBalance(res.data);
              } catch (e: any) {
                setBalanceError(e.response?.data?.message || 'Failed to get balance');
                setHistoricalBalance(null);
              }
            }}
            disabled={!walletId || !timestamp}
          >
            Check
          </button>

          {balanceError && <div className="error">{balanceError}</div>}
          {historicalBalance !== null && (
            <p><b>Balance at {timestamp}:</b> {historicalBalance}</p>
          )}
        </section>
      </div>

      {/* Transactions */}
      <div className="column">

        <section>
  <h3>Backend Protection Tests</h3>
  <button
    onClick={async () => {
      const from = wallets[0]?.id;
      const to = wallets[1]?.id;
      const amount = '10';
      const sameRequestId = uuidv4();

      if (from && to) {
        try {
          await API.post('/wallet/transfer', {
            fromWalletId: from,
            toWalletId: to,
            amount,
            requestId: sameRequestId,
          });

          await API.post('/wallet/transfer', {
            fromWalletId: from,
            toWalletId: to,
            amount,
            requestId: sameRequestId,
          });

          fetchWallets();
          fetchTransactions();
        } catch (e: any) {
          alert('Duplicate transfer error: ' + (e.response?.data?.message || e.message));
        }
      }
    }}
  >
    Test Duplicate Transfer (Same Request ID)
  </button>

  <button
    onClick={() => {
      const id = wallets[0]?.id;
      const amount = '5';
      if (!id) return;

      for (let i = 0; i < 4; i++) {
        API.post('/wallet/withdraw', {
          walletId: id,
          amount,
          requestId: uuidv4(),
        }).catch(err => {
          console.error('Parallel withdraw error', err.response?.data?.message || err.message);
        });
      }

      setTimeout(() => {
        fetchWallets();
        fetchTransactions();
      }, 1000);
    }}
    style={{ marginLeft: 10 }}
  >
    Test Parallel Withdraws
  </button>
</section>

        <section>
          <h2>Transactions</h2>
          <ul className="transaction-list">
            {transactions.map(t => (
              <li key={t.id} onClick={() => setSelectedTx(t)}>
                [{t.type}] Wallet: {t.walletId}, Amount: <b>{t.amount}</b>, Status: <i>{t.status}</i>
              </li>
            ))}
          </ul>
        </section>

        {selectedTx && (
          <div className="modal">
            <div className="modal-content">
              <h4>Transaction Details</h4>
              <p><b>ID:</b> {selectedTx.id}</p>
              <p><b>Wallet:</b> {selectedTx.walletId}</p>
              <p><b>Type:</b> {selectedTx.type}</p>
              <p><b>Amount:</b> {selectedTx.amount}</p>
              <p><b>Status:</b> {selectedTx.status}</p>
              <p><b>Created:</b> {selectedTx.createdAt}</p>
              <p><b>Updated:</b> {selectedTx.updatedAt}</p>
              <button onClick={() => setSelectedTx(null)}>Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;