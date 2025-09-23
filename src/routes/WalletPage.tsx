import React, { useState } from 'react';
import { Wallet, Plus, ArrowUpRight, ArrowDownLeft, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';

const WalletPage: React.FC = () => {
  const [balance] = useState(250000); // Mock balance
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');

  // Mock transaction data
  const transactions = [
    {
      id: '1',
      type: 'topup',
      amount: 100000,
      description: 'Top Up via Bank Transfer',
      createdAt: '2024-01-15T10:30:00Z',
      status: 'success'
    },
    {
      id: '2',
      type: 'payment',
      amount: -75000,
      description: 'Pembayaran Servis Montir',
      createdAt: '2024-01-14T15:45:00Z',
      status: 'success'
    },
    {
      id: '3',
      type: 'payment',
      amount: -25000,
      description: 'Pembelian Oli Mesin',
      createdAt: '2024-01-13T09:20:00Z',
      status: 'success'
    },
  ];

  const handleTopUp = () => {
    const amount = parseInt(topUpAmount);
    if (!amount || amount < 10000) {
      toast.error('Minimal top up Rp 10.000');
      return;
    }
    
    // Mock payment process
    toast.success(`Top up Rp ${amount.toLocaleString('id-ID')} berhasil!`);
    setShowTopUpModal(false);
    setTopUpAmount('');
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'topup':
        return <ArrowDownLeft size={20} className="text-green-600" />;
      case 'payment':
        return <ArrowUpRight size={20} className="text-red-600" />;
      default:
        return <CreditCard size={20} className="text-gray-600" />;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'topup':
        return 'text-green-600';
      case 'payment':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Wallet Balance */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 mb-8 shadow-lg text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Wallet size={24} />
                <span className="text-lg font-medium">Saldo MontirKu</span>
              </div>
              <div className="text-3xl font-bold">
                Rp {balance.toLocaleString('id-ID')}
              </div>
            </div>
            <button
              onClick={() => setShowTopUpModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              <Plus size={20} />
              <span className="font-medium">Top Up</span>
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <button className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-shadow text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Plus size={24} className="text-green-600" />
            </div>
            <span className="font-medium">Top Up</span>
          </button>
          <button className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-shadow text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <ArrowUpRight size={24} className="text-blue-600" />
            </div>
            <span className="font-medium">Transfer</span>
          </button>
          <button className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-shadow text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <CreditCard size={24} className="text-purple-600" />
            </div>
            <span className="font-medium">Bayar</span>
          </button>
          <button className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-shadow text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Wallet size={24} className="text-orange-600" />
            </div>
            <span className="font-medium">Tarik</span>
          </button>
        </div>

        {/* Transaction History */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold">Riwayat Transaksi</h2>
          </div>
          
          <div className="divide-y">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-gray-100 rounded-full">
                      {getTransactionIcon(transaction.type)}
                    </div>
                    <div>
                      <h3 className="font-medium">{transaction.description}</h3>
                      <p className="text-sm text-gray-600">
                        {new Date(transaction.createdAt).toLocaleString('id-ID')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-bold text-lg ${getTransactionColor(transaction.type)}`}>
                      {transaction.amount > 0 ? '+' : ''}Rp {Math.abs(transaction.amount).toLocaleString('id-ID')}
                    </div>
                    <div className="text-sm text-green-600">Berhasil</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Up Modal */}
      {showTopUpModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Top Up Saldo</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jumlah Top Up
                </label>
                <input
                  type="number"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Minimal Rp 10.000"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[50000, 100000, 200000].map((amount) => (
                  <button
                    key={amount}
                    onClick={() => setTopUpAmount(amount.toString())}
                    className="py-2 px-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  >
                    {amount.toLocaleString('id-ID')}
                  </button>
                ))}
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Metode Pembayaran</h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="radio" name="payment" className="mr-2" defaultChecked />
                    <span className="text-sm">Bank Transfer</span>
                  </label>
                  <label className="flex items-center">
                    <input type="radio" name="payment" className="mr-2" />
                    <span className="text-sm">E-Wallet</span>
                  </label>
                  <label className="flex items-center">
                    <input type="radio" name="payment" className="mr-2" />
                    <span className="text-sm">Kartu Kredit</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowTopUpModal(false)}
                className="flex-1 py-3 border border-gray-300 rounded-lg font-bold hover:bg-gray-50 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleTopUp}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors"
              >
                Top Up
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletPage;