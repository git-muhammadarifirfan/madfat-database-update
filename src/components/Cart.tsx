import React, { useState, useCallback, useMemo } from 'react';
import { X, Trash2, ShoppingBag, Send, AlertCircle, ShoppingCart, Plus, Minus, FileText } from 'lucide-react';
import { CartItem } from '../types';
import { createTransactionInSheets, fetchTransactionsFromSheets, getSheetsUrl } from '../api';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onUpdateNotes: (productId: string, notes: string) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  triggerNotification: (text: string, type?: 'success' | 'error') => void;
}

function Cart({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onUpdateNotes,
  onRemoveItem,
  onClearCart,
  triggerNotification,
}: CartProps) {
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [validationError, setValidationError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    type: 'remove' | 'clear';
    itemId?: string;
    itemName?: string;
  }>({
    isOpen: false,
    type: 'remove'
  });

  const totalAmount = useMemo(
    () => cartItems.reduce(
      (acc, item) => acc + item.product.price * item.quantity,
      0
    ),
    [cartItems]
  );

  const formatPrice = useCallback((value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }, []);

  const sendWhatsAppForInvoice = useCallback((inv: any, items: typeof cartItems) => {
    const adminWhatsAppNumber = '6281234567890';

    let message = `*KONFIRMASI PESANAN MADFAT* ⚡\n`;
    message += `===============================\n`;
    message += `🧾 No Order: *${inv.orderId}*\n`;
    message += `👤 Nama: ${inv.customerName}\n`;
    message += `📧 Email: ${inv.customerEmail}\n`;
    message += `📅 Tanggal: ${inv.createdAt} WIB\n`;
    message += `===============================\n\n`;
    message += `*Rincian Pesanan:*\n`;

    items.forEach((item, index) => {
      message += `${index + 1}. *${item.product.name}* (${item.quantity}x)\n`;
      if (item.notes.trim()) {
        message += `   • Catatan: _"${item.notes.trim()}"_\n`;
      }
      message += `   • Subtotal: ${formatPrice(item.product.price * item.quantity)}\n\n`;
    });

    message += `===============================\n`;
    message += `*TOTAL:* *${formatPrice(inv.totalAmount)}*\n`;
    message += `===============================\n\n`;
    message += `Mohon konfirmasi pesanan saya ya admin. Terima kasih! 🙏`;

    window.open(`https://wa.me/${adminWhatsAppNumber}?text=${encodeURIComponent(message)}`, '_blank');
  }, [formatPrice]);

  const handleCheckout = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerEmail.trim()) {
      setValidationError('Silakan masukkan Nama Lengkap dan Email Anda untuk checkout.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      setValidationError('Silakan masukkan alamat Email yang valid.');
      return;
    }
    setValidationError('');

    setIsSubmitting(true);

    // Generate sequential order ID (#001, #002, ...) based on existing transaction count
    let orderId: string;
    const sheetsUrl = getSheetsUrl();
    if (sheetsUrl) {
      try {
        const existing = await fetchTransactionsFromSheets(sheetsUrl);
        const nextNum = (existing.length || 0) + 1;
        orderId = `#${String(nextNum).padStart(3, '0')}`;
      } catch {
        orderId = `#${Date.now().toString().slice(-4)}`; // fallback
      }
    } else {
      orderId = `#${Date.now().toString().slice(-4)}`;
    }
    const dateStr = new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });

    // Snapshot items BEFORE clearing cart (closure safety)
    const itemsSnapshot = [...cartItems];
    const itemsSummary = itemsSnapshot.map(item => `${item.product.name} (${item.quantity}x)`).join(', ');

    const newInvoice = {
      orderId,
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim(),
      items: itemsSummary,
      totalAmount,
      status: 'PENDING',
      createdAt: dateStr
    };

    // 1. Submit to Google Sheets (if configured)
    if (sheetsUrl) {
      try {
        await createTransactionInSheets(sheetsUrl, newInvoice);
      } catch (err: any) {
        console.error('Failed to record transaction to Google Sheets:', err);
        triggerNotification(`Gagal menyimpan transaksi ke Google Sheets: ${err.message || err}`, 'error');
        setIsSubmitting(false);
        return; // Abort checkout flow so user knows it failed and can see why
      }
    }

    setIsSubmitting(false);

    // Clear cart and close drawer
    onClearCart();
    onClose();

    // Trigger success notification
    triggerNotification(`Pesanan ${orderId} berhasil dibuat! Menghubungkan ke WhatsApp...`, 'success');

    // Reset checkout fields
    setCustomerName('');
    setCustomerEmail('');

    // Open WhatsApp redirect (use snapshot)
    sendWhatsAppForInvoice(newInvoice, itemsSnapshot);
  }, [cartItems, customerName, customerEmail, totalAmount, sendWhatsAppForInvoice, onClearCart, onClose, triggerNotification]);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-obsidian z-90 cursor-pointer transition-opacity duration-300 ${isOpen ? 'opacity-50 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
      />

      {/* Cart Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:max-w-md bg-surface z-100 shadow-2xl flex flex-col border-l-4 border-obsidian transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 bg-cream-warm border-b-2 border-obsidian flex justify-between items-center relative shrink-0">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-blaze-orange" />
            <h2 className="font-hero text-base sm:text-xl font-bold text-obsidian uppercase tracking-wide">
              Keranjangmu
            </h2>
            {cartItems.length > 0 && (
              <span className="ml-1 bg-obsidian text-white text-xs font-mono font-bold px-2 py-0.5 rounded-full">
                {cartItems.length}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full border-2 border-obsidian bg-white hover:bg-blaze-orange hover:text-white transition-colors duration-200 cursor-pointer"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Cart Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6 noise-overlay bg-surface">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-16 space-y-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-cream-warm rounded-full border-2 border-obsidian flex items-center justify-center brutalist-shadow">
                <ShoppingBag className="w-8 h-8 sm:w-10 sm:h-10 text-blaze-orange" />
              </div>
              <div>
                <h3 className="font-hero text-base sm:text-lg font-bold text-obsidian">Keranjang Kosong</h3>
                <p className="text-xs sm:text-sm text-on-surface-variant max-w-xs mt-1">
                  Kamu belum memilih layanan premium atau bundle website apa pun. Yuk belanja dulu!
                </p>
              </div>
              <button
                onClick={() => {
                  onClose();
                  window.history.pushState({}, '', '/produk');
                  window.dispatchEvent(new PopStateEvent('popstate'));
                }}
                className="px-5 py-2 bg-blaze-orange text-white rounded-full font-tag text-xs font-bold border-2 border-obsidian alert-btn"
              >
                Mulai Belanja
              </button>
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4 max-h-[36vh] sm:max-h-none overflow-y-auto pr-1">
              {cartItems.map((item) => (
                <div
                  key={item.product.id}
                  className="p-3 sm:p-4 bg-white border-2 border-obsidian rounded-xl brutalist-shadow-gold flex flex-col space-y-2 sm:space-y-3 relative"
                >
                  {/* Product Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-cream-warm border border-obsidian flex items-center justify-center font-tag text-[10px] sm:text-xs font-black text-blaze-orange">
                        {item.product.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-hero text-xs sm:text-sm font-bold text-obsidian line-clamp-1">
                          {item.product.name}
                        </h4>
                        <p className="text-tag font-tag text-[10px] sm:text-xs font-bold text-blaze-orange italic">
                          {formatPrice(item.product.price)}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setConfirmModal({ isOpen: true, type: 'remove', itemId: item.product.id, itemName: item.product.name })}
                      className="text-on-surface-variant hover:text-red-500 transition-colors p-1 cursor-pointer"
                      title="Hapus item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Quantity Selector */}
                  <div className="flex items-center justify-between pt-1 border-t border-dashed border-sand-gold/30">
                    <div className="flex items-center border-2 border-obsidian rounded-lg bg-surface overflow-hidden">
                      <button
                        onClick={() => {
                          if (item.quantity === 1) {
                            setConfirmModal({ isOpen: true, type: 'remove', itemId: item.product.id, itemName: item.product.name });
                          } else {
                            onUpdateQuantity(item.product.id, item.quantity - 1);
                          }
                        }}
                        className="px-1.5 py-0.5 bg-cream-warm hover:bg-blaze-orange hover:text-white transition-colors cursor-pointer border-r border-obsidian"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 py-0.5 font-mono text-[10px] sm:text-xs font-black select-none text-obsidian">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                        className="px-1.5 py-0.5 bg-cream-warm hover:bg-blaze-orange hover:text-white transition-colors cursor-pointer border-l border-obsidian"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="font-tag text-[10px] sm:text-xs font-extrabold text-obsidian italic">
                      Sbtl: {formatPrice(item.product.price * item.quantity)}
                    </div>
                  </div>

                  {/* Notes / Catatan Input */}
                  <div className="space-y-0.5">
                    <label className="flex items-center gap-1 font-tag text-[8px] sm:text-[9px] font-bold text-on-surface-variant uppercase tracking-wider">
                      <FileText className="w-2.5 h-2.5 text-blaze-orange" />
                      Catatan (Email login / Deskripsi Custom):
                    </label>
                    <input
                      type="text"
                      value={item.notes}
                      onChange={(e) => onUpdateNotes(item.product.id, e.target.value)}
                      placeholder="user@email.com / req tema..."
                      className="w-full text-[10px] sm:text-xs px-2 py-1 border border-sand-gold bg-surface-container-lowest text-obsidian rounded focus:outline-none focus:border-blaze-orange transition-colors"
                    />
                  </div>
                </div>
              ))}

              <div className="flex justify-end">
                <button
                  onClick={() => setConfirmModal({ isOpen: true, type: 'clear' })}
                  className="font-tag text-[9px] sm:text-[10px] text-on-surface-variant hover:text-red-500 font-bold underline transition-colors cursor-pointer bg-transparent border-none p-0 outline-none"
                >
                  Kosongkan Keranjang
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Checkout Details Form */}
        {cartItems.length > 0 && (
          <div className="p-4 sm:p-6 bg-white border-t-4 border-obsidian space-y-3 sm:space-y-4 shrink-0">
            <div className="flex justify-between items-center font-tag font-black">
              <span className="text-xs sm:text-sm text-obsidian uppercase">TOTAL TRANSFER</span>
              <span className="text-lg sm:text-xl text-blaze-orange font-hero italic">
                {formatPrice(totalAmount)}
              </span>
            </div>

            <form onSubmit={handleCheckout} className="space-y-2 sm:space-y-3">
              <div className="space-y-0.5">
                <label className="block font-tag text-[9px] sm:text-[10px] font-black text-obsidian uppercase">
                  NAMA LENGKAP:
                </label>
                <input
                  required
                  type="text"
                  placeholder="Masukkan nama Anda..."
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm border-2 border-obsidian rounded-xl bg-surface focus:outline-none focus:bg-cream-warm/30 focus:border-blaze-orange transition-all duration-200"
                />
              </div>

              <div className="space-y-0.5">
                <label className="block font-tag text-[9px] sm:text-[10px] font-black text-obsidian uppercase">
                  EMAIL PENERIMA:
                </label>
                <input
                  required
                  type="email"
                  placeholder="contoh: budi@gmail.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm border-2 border-obsidian rounded-xl bg-surface focus:outline-none focus:bg-cream-warm/30 focus:border-blaze-orange transition-all duration-200"
                />
              </div>

              {validationError && (
                <div className="p-2 bg-red-50 border border-red-200 text-red-600 rounded-lg flex items-start gap-1 text-[10px] sm:text-xs">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                  <span>{validationError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-blaze-orange text-white rounded-full font-tag text-xs font-black tracking-wide brutalist-shadow-dark border-2 border-obsidian hover:translate-y-[-2px] hover:bg-[#FF7A30] duration-200 transition-all flex items-center justify-center gap-2 cursor-pointer uppercase disabled:opacity-50"
              >
                <span>{isSubmitting ? 'MEMPROSES...' : 'PESAN SEKARANG'}</span>
                <Send className="w-3.5 h-3.5 fill-current" />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[200] bg-black/50 flex items-center justify-center p-4">
          <div className="bg-[#fff8f2] border-3 border-obsidian rounded-2xl p-6 max-w-sm w-full brutalist-shadow">
            <h3 className="font-hero text-lg font-black text-obsidian uppercase mb-2">Konfirmasi</h3>
            <p className="font-sans text-xs sm:text-sm text-[#5F5B57] mb-6 leading-relaxed">
              {confirmModal.type === 'remove'
                ? `Apakah Anda yakin ingin menghapus "${confirmModal.itemName}" dari keranjang?`
                : 'Apakah Anda yakin ingin mengosongkan seluruh isi keranjang belanja?'}
            </p>
            <div className="flex gap-3 justify-end font-tag text-xs font-bold">
              <button
                onClick={() => setConfirmModal({ isOpen: false, type: 'remove' })}
                className="px-4 py-2 border-2 border-obsidian rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                BATAL
              </button>
              <button
                onClick={() => {
                  if (confirmModal.type === 'remove' && confirmModal.itemId) {
                    onRemoveItem(confirmModal.itemId);
                  } else if (confirmModal.type === 'clear') {
                    onClearCart();
                  }
                  setConfirmModal({ isOpen: false, type: 'remove' });
                }}
                className="px-4 py-2 bg-red-500 text-white border-2 border-obsidian rounded-lg hover:bg-red-600 cursor-pointer"
              >
                YA, HAPUS
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Cart;
