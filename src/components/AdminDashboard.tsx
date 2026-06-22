import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Plus, Edit2, Trash2, Save, X, Upload, LogOut, Key, Settings, Loader,
  ArrowLeft, Printer, FileText, CheckCircle, RefreshCw, BarChart2, Shield,
  Lock, CreditCard, LayoutDashboard, ShoppingBag, Globe, AlertTriangle, Menu,
  Eye, EyeOff, DollarSign, Clock, TrendingUp
} from 'lucide-react';
import { DigitalProduct, WebsitePackage } from '../types';
import {
  compressImageToWebP,
  uploadImageToImgbb,
  upsertProductInSheets,
  deleteProductInSheets,
  DEFAULT_SHEETS_URL,
  DEFAULT_IMGBB_KEY,
  fetchTransactionsFromSheets,
  updateTransactionStatusInSheets,
  verifyAdminPinInSheets,
  updateAdminPinInSheets,
  upsertWebsitePackageInSheets,
  deleteWebsitePackageInSheets,
  verifyAdminLoginInSheets,
  verifyLoginOtpInSheets,
  sendResetOtpInSheets,
  resetPasswordOtpInSheets,
  updateAdminEmailInSheets,
  verifyAdminPassword
} from '../api';

interface AdminDashboardProps {
  products: DigitalProduct[];
  setProducts?: React.Dispatch<React.SetStateAction<DigitalProduct[]>>;
  websitePackages: WebsitePackage[];
  setWebsitePackages?: React.Dispatch<React.SetStateAction<WebsitePackage[]>>;
  onRefresh: () => Promise<void>;
  formatPrice: (value: number) => string;
  onClose: () => void;
  currentPath: string;
  triggerNotification: (text: string, type?: 'success' | 'error') => void;
}

const LazyImage = ({ src, alt, className }: { src: string; alt: string; className: string }) => {
  const [loaded, setLoaded] = useState(false);
  return (
    <div className={`relative overflow-hidden ${className} bg-cream-warm/40 border border-slate-100`}>
      {!loaded && (
        <div className="absolute inset-0 bg-[#FFF8F2] animate-pulse flex items-center justify-center">
          <span className="w-4.5 h-4.5 rounded-full border-2 border-dashed border-blaze-orange animate-spin" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        className={`${className} transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'} object-cover`}
      />
    </div>
  );
};

const ZigzagBorder = () => (
  <svg viewBox="0 0 100 10" className="w-full h-2 fill-obsidian block" preserveAspectRatio="none">
    <path d="M0,0 L5,10 L10,0 L15,10 L20,0 L25,10 L30,0 L35,10 L40,0 L45,10 L50,0 L55,10 L60,0 L65,10 L70,0 L75,10 L80,0 L85,10 L90,0 L95,10 L100,0 Z" />
  </svg>
);

const CuteStar = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#FCDFA6] stroke-obsidian stroke-[2.2] shrink-0">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" strokeLinejoin="round" />
  </svg>
);

const CuteSmiley = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={`${className} fill-[#FFD3E8] stroke-obsidian stroke-[2.2]`}>
    <circle cx="12" cy="12" r="10" />
    <path d="M8 14c1.5 2 4.5 2 6 0" strokeLinecap="round" />
    <circle cx="9" cy="9" r="1.5" fill="#1C1E1C" />
    <circle cx="15" cy="9" r="1.5" fill="#1C1E1C" />
  </svg>
);

// ── URL → Tab mapping ──────────────────────────────────────
type TabType = 'dashboard' | 'products' | 'packages' | 'orders' | 'settings';

function getTabFromPath(path: string): TabType {
  if (path === '/madfatdashboard/products') return 'products';
  if (path === '/madfatdashboard/packages') return 'packages';
  if (path === '/madfatdashboard/orders') return 'orders';
  if (path === '/madfatdashboard/settings') return 'settings';
  return 'dashboard';
}

function navigateToTab(tab: TabType) {
  const path = tab === 'dashboard' ? '/madfatdashboard' : `/madfatdashboard/${tab}`;
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
}

// ── Auto-generate sequential IDs ────────────────────────────────
function getNextProductId(existingProducts: DigitalProduct[]): string {
  const nums = existingProducts.map(p => {
    const m = p.id.match(/(\d+)$/);
    return m ? parseInt(m[1], 10) : 0;
  });
  const next = nums.length > 0 ? Math.max(...nums) + 1 : 1;
  return `prod-${String(next).padStart(3, '0')}`;
}

function getNextPackageId(existingPackages: WebsitePackage[]): string {
  const nums = existingPackages.map(p => {
    const numMatch = p.id.match(/(\d+)$/);
    if (numMatch) return parseInt(numMatch[1], 10);
    const letterMatch = p.id.match(/([a-z])$/);
    if (letterMatch) return letterMatch[1].charCodeAt(0) - 96; // a=1, b=2...
    return 0;
  });
  const next = nums.length > 0 ? Math.max(...nums) + 1 : 1;
  return `bundle-${String(next).padStart(3, '0')}`;
}

export default function AdminDashboard({
  products,
  setProducts,
  websitePackages,
  setWebsitePackages,
  onRefresh,
  formatPrice,
  onClose,
  currentPath,
  triggerNotification
}: AdminDashboardProps) {
  // Navigation: derive tab from URL, stay in sync
  const [activeTab, setActiveTab] = useState<TabType>(getTabFromPath(currentPath));

  // Keep tab in sync if currentPath changes (e.g. browser back)
  useEffect(() => {
    setActiveTab(getTabFromPath(currentPath));
  }, [currentPath]);

  const switchTab = (tab: TabType) => {
    setActiveTab(tab);
    navigateToTab(tab);
    setSelectedProductIds([]);
    setSelectedPackageIds([]);
    setIsProductBulkMode(false);
    setIsPackageBulkMode(false);
  };

  // Security Verification
  const [isPasswordVerified, setIsPasswordVerified] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [pin, setPin] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');

  // Gmail Auth & Reset states
  const [loginMethod, setLoginMethod] = useState<'password' | 'gmail'>('password');
  const [gmailInput, setGmailInput] = useState<string>('');
  const [gmailOtp, setGmailOtp] = useState<string>('');
  const [otpSent, setOtpSent] = useState<boolean>(false);

  const [showForgotPassword, setShowForgotPassword] = useState<boolean>(false);
  const [resetEmail, setResetEmail] = useState<string>('');
  const [resetOtp, setResetOtp] = useState<string>('');
  const [resetOtpSent, setResetOtpSent] = useState<boolean>(false);
  const [resetNewPassword, setResetNewPassword] = useState<string>('');

  const [adminEmailSetting, setAdminEmailSetting] = useState<string>(
    localStorage.getItem('madfat_admin_email') || ''
  );

  // Settings password visibility eye toggle state
  const [showNewPassword, setShowNewPassword] = useState<boolean>(false);
  const [showSheetsUrl, setShowSheetsUrl] = useState<boolean>(false);
  const [showImgbbKey, setShowImgbbKey] = useState<boolean>(false);

  // Settings password change states
  const [newPasswordInput, setNewPasswordInput] = useState<string>('');
  const [changePasswordOtp, setChangePasswordOtp] = useState<string>('');
  const [changePasswordOtpSent, setChangePasswordOtpSent] = useState<boolean>(false);
  const [changePasswordError, setChangePasswordError] = useState<string>('');

  // Settings
  const [sheetsUrl, setSheetsUrl] = useState<string>(
    localStorage.getItem('madfat_sheets_url') || import.meta.env.VITE_SHEETS_API_URL || DEFAULT_SHEETS_URL || ''
  );
  const [imgbbKey, setImgbbKey] = useState<string>(
    localStorage.getItem('madfat_imgbb_key') || import.meta.env.VITE_IMGBB_API_KEY || DEFAULT_IMGBB_KEY || ''
  );
  const [newPinInput, setNewPinInput] = useState<string>('');

  // CRUD / Modals
  const [isProductModalOpen, setIsProductModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [isPackageModalOpen, setIsPackageModalOpen] = useState<boolean>(false);
  const [editingPackage, setEditingPackage] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);

  // Bulk action states
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [selectedPackageIds, setSelectedPackageIds] = useState<string[]>([]);
  const [isProductBulkMode, setIsProductBulkMode] = useState<boolean>(false);
  const [isPackageBulkMode, setIsPackageBulkMode] = useState<boolean>(false);

  // Mobile Navigation Drawer Toggle
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Transactions / Orders (Cached locally for instant load times)
  const [transactions, setTransactions] = useState<any[]>(() => {
    try {
      const cached = localStorage.getItem('madfat_cached_transactions');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [loadingTransactions, setLoadingTransactions] = useState<boolean>(false);
  const [printingTransaction, setPrintingTransaction] = useState<any | null>(null);
  const prevTransactionsCount = useRef<number>(0);

  // Strict Confirmation Modal
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    actionType: 'delete_product' | 'delete_package' | 'save_settings' | 'change_pin' | 'reveal_sheets_url' | 'reveal_imgbb_key' | 'logout' | 'bulk_delete_products' | 'bulk_delete_packages';
    targetId?: string;
    payload?: any;
  } | null>(null);

  // Clear selections when bulk mode is disabled
  useEffect(() => {
    if (!isProductBulkMode) {
      setSelectedProductIds([]);
    }
  }, [isProductBulkMode]);

  useEffect(() => {
    if (!isPackageBulkMode) {
      setSelectedPackageIds([]);
    }
  }, [isPackageBulkMode]);

  // Chart Animation trigger
  const [chartAnimated, setChartAnimated] = useState<boolean>(false);
  useEffect(() => {
    if (activeTab === 'dashboard') {
      const t = setTimeout(() => setChartAnimated(true), 150);
      return () => clearTimeout(t);
    } else {
      setChartAnimated(false);
    }
  }, [activeTab]);

  // Auto Login Session check
  useEffect(() => {
    const savedAuth = localStorage.getItem('madfat_admin_auth');
    if (savedAuth === 'true') {
      setIsPasswordVerified(true);
      setIsAuthenticated(true);
    }
  }, []);

  const loadTransactions = async () => {
    if (!sheetsUrl) return;
    const adminPassword = localStorage.getItem('madfat_admin_password') || password;
    try {
      setLoadingTransactions(true);
      const data = await fetchTransactionsFromSheets(sheetsUrl, adminPassword);
      const safeData = Array.isArray(data) ? data : [];
      if (prevTransactionsCount.current > 0 && safeData.length > prevTransactionsCount.current) {
        triggerNotification('Pemberitahuan: Ada transaksi/order masuk baru!', 'success');
      }
      prevTransactionsCount.current = safeData.length;
      setTransactions(safeData);
      localStorage.setItem('madfat_cached_transactions', JSON.stringify(safeData));
    } catch (e) {
      console.error('Failed to load transactions:', e);
      // Fallback: keep existing state instead of clearing it
    } finally {
      setLoadingTransactions(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadTransactions();
      const interval = setInterval(() => {
        loadTransactions();
      }, 10000); // auto refresh every 10 seconds
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, sheetsUrl]);

  // Refresh data on tab change to ensure fresh content is loaded
  useEffect(() => {
    if (isAuthenticated) {
      onRefresh();
      loadTransactions();
    }
  }, [activeTab]);

  // Auth: Password Verification
  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError('');
    try {
      const isValid = await verifyAdminPassword(sheetsUrl, password);
      if (isValid) {
        setIsPasswordVerified(true);
        setLoginError('');
        triggerNotification('Password valid. Masukkan PIN keamanan.', 'success');
      } else {
        setLoginError('Password salah. Silakan coba lagi.');
        triggerNotification('Password salah!', 'error');
      }
    } catch (err) {
      // Offline fallback verification
      const correctPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'madfat123';
      if (password === correctPassword) {
        setIsPasswordVerified(true);
        setLoginError('');
        triggerNotification('Password valid (Offline). Masukkan PIN keamanan.', 'success');
      } else {
        setLoginError('Password salah. Silakan coba lagi.');
        triggerNotification('Password salah!', 'error');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Auth: Send Login OTP to Gmail
  const handleSendLoginOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gmailInput || !password) return;
    setIsLoading(true);
    setLoginError('');
    try {
      const res = await verifyAdminLoginInSheets(sheetsUrl, gmailInput, password);
      if (res.status === 'otp_sent') {
        setOtpSent(true);
        triggerNotification('Kredensial valid. OTP login telah dikirim ke Gmail Anda.', 'success');
      } else {
        setLoginError(res.message || 'Gmail atau Password admin salah.');
        triggerNotification('Gagal masuk!', 'error');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Terjadi kesalahan saat menghubungi server.');
      triggerNotification('Koneksi Gagal!', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Auth: Verify Login OTP
  const handleVerifyLoginOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gmailOtp) return;
    setIsLoading(true);
    setLoginError('');
    try {
      const res = await verifyLoginOtpInSheets(sheetsUrl, gmailInput, gmailOtp);
      if (res.status === 'success') {
        setIsPasswordVerified(true);
        setIsAuthenticated(true);
        if (res.password) {
          setPassword(res.password);
          localStorage.setItem('madfat_admin_password', res.password);
        }
        if (res.pin) {
          setPin(res.pin);
          localStorage.setItem('madfat_admin_pin', res.pin);
        }
        localStorage.setItem('madfat_admin_auth', 'true');
        if (gmailInput) {
          localStorage.setItem('madfat_admin_email', gmailInput);
        }
        setLoginError('');
        triggerNotification('Berhasil masuk ke panel admin!', 'success');
      } else {
        setLoginError(res.message || 'OTP salah atau kedaluwarsa.');
        triggerNotification('OTP tidak valid!', 'error');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Gagal memverifikasi OTP.');
      triggerNotification('Koneksi Gagal!', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Auth: Send Reset Password OTP
  const handleSendResetOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;
    setIsLoading(true);
    setLoginError('');
    try {
      const res = await sendResetOtpInSheets(sheetsUrl, resetEmail);
      if (res.status === 'success') {
        setResetOtpSent(true);
        triggerNotification('OTP reset password telah dikirim ke Gmail Anda.', 'success');
      } else {
        setLoginError(res.message || 'Email tidak terdaftar sebagai admin.');
        triggerNotification('Gagal mengirim OTP!', 'error');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Terjadi kesalahan saat menghubungi server.');
      triggerNotification('Koneksi Gagal!', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Auth: Reset Password using OTP
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetOtp || !resetNewPassword) return;
    setIsLoading(true);
    setLoginError('');
    try {
      const res = await resetPasswordOtpInSheets(sheetsUrl, resetEmail, resetOtp, resetNewPassword);
      if (res.status === 'success') {
        setShowForgotPassword(false);
        setResetEmail('');
        setResetOtp('');
        setResetOtpSent(false);
        setResetNewPassword('');
        triggerNotification('Password berhasil diubah. Silakan login kembali.', 'success');
      } else {
        setLoginError(res.message || 'OTP salah atau gagal mengubah password.');
        triggerNotification('Gagal reset password!', 'error');
      }
    } catch (err: any) {
      setLoginError(err.message || 'Gagal memproses reset password.');
      triggerNotification('Koneksi Gagal!', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Auth: Send Reset Password OTP from Settings
  const handleSettingsSendResetOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailToUse = adminEmailSetting || localStorage.getItem('madfat_admin_email') || gmailInput;
    if (!emailToUse) {
      alert('Email admin tidak terdeteksi. Silakan simpan Gmail Admin terlebih dahulu.');
      return;
    }
    setIsLoading(true);
    setChangePasswordError('');
    try {
      const res = await sendResetOtpInSheets(sheetsUrl, emailToUse);
      if (res.status === 'success') {
        setChangePasswordOtpSent(true);
        triggerNotification('OTP ganti password telah dikirim ke Gmail Anda.', 'success');
      } else {
        setChangePasswordError(res.message || 'Gagal mengirim OTP.');
        triggerNotification('Gagal mengirim OTP!', 'error');
      }
    } catch (err: any) {
      setChangePasswordError(err.message || 'Koneksi Gagal!');
      triggerNotification('Koneksi Gagal!', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Auth: Reset Password using OTP from Settings
  const handleSettingsResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailToUse = adminEmailSetting || localStorage.getItem('madfat_admin_email') || gmailInput;
    if (!changePasswordOtp || !newPasswordInput || !emailToUse) return;
    setIsLoading(true);
    setChangePasswordError('');
    try {
      const res = await resetPasswordOtpInSheets(sheetsUrl, emailToUse, changePasswordOtp, newPasswordInput);
      if (res.status === 'success') {
        setChangePasswordOtpSent(false);
        setChangePasswordOtp('');
        setNewPasswordInput('');
        // Update current password in memory and localStorage
        setPassword(newPasswordInput);
        localStorage.setItem('madfat_admin_password', newPasswordInput);
        triggerNotification('Password admin berhasil diubah!', 'success');
      } else {
        setChangePasswordError(res.message || 'OTP salah atau gagal mengubah password.');
        triggerNotification('Gagal ganti password!', 'error');
      }
    } catch (err: any) {
      setChangePasswordError(err.message || 'Gagal mengubah password.');
      triggerNotification('Koneksi Gagal!', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Auth: PIN Verification Auto Trigger
  const verifyPinCode = async (pinValue: string) => {
    setIsLoading(true);
    try {
      const isValid = await verifyAdminPinInSheets(sheetsUrl, password, pinValue);
      if (isValid) {
        setIsAuthenticated(true);
        localStorage.setItem('madfat_admin_auth', 'true');
        localStorage.setItem('madfat_admin_password', password);
        localStorage.setItem('madfat_admin_pin', pinValue);
        setLoginError('');
        triggerNotification('Berhasil masuk ke panel admin!', 'success');
      } else {
        setLoginError('PIN keamanan tidak valid.');
        triggerNotification('PIN salah!', 'error');
        setPin(''); // Clear on fail
      }
    } catch (err: any) {
      // Offline fallback verification
      if (pinValue === '300319') {
        setIsAuthenticated(true);
        localStorage.setItem('madfat_admin_auth', 'true');
        localStorage.setItem('madfat_admin_password', password);
        localStorage.setItem('madfat_admin_pin', pinValue);
        setLoginError('');
        triggerNotification('Berhasil masuk ke panel admin (Offline)!', 'success');
      } else {
        setLoginError('PIN salah / gagal verifikasi database.');
        triggerNotification('PIN salah!', 'error');
        setPin(''); // Clear on fail
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handlePinChange = async (val: string) => {
    const sanitized = val.replace(/\D/g, '');
    setPin(sanitized);
    if (sanitized.length === 6) {
      await verifyPinCode(sanitized);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setIsPasswordVerified(false);
    setPassword('');
    setPin('');
    localStorage.removeItem('madfat_admin_auth');
    localStorage.removeItem('madfat_admin_password');
    localStorage.removeItem('madfat_admin_pin');
    triggerNotification('Berhasil logout dari portal admin.', 'success');
  };

  // Actions trigger with strict confirmation
  const triggerStrictAction = (
    title: string,
    message: string,
    actionType: 'delete_product' | 'delete_package' | 'save_settings' | 'change_pin' | 'reveal_sheets_url' | 'reveal_imgbb_key' | 'logout' | 'bulk_delete_products' | 'bulk_delete_packages',
    targetId?: string,
    payload?: any
  ) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      actionType,
      targetId,
      payload
    });
  };

  const handleConfirmAction = async () => {
    if (!confirmModal) return;
    const { actionType, targetId, payload } = confirmModal;
    setConfirmModal(null);

    if (actionType === 'reveal_sheets_url') {
      setShowSheetsUrl(true);
      return;
    }
    if (actionType === 'reveal_imgbb_key') {
      setShowImgbbKey(true);
      return;
    }

    const adminPassword = localStorage.getItem('madfat_admin_password') || password;
    const adminPinCode = localStorage.getItem('madfat_admin_pin') || pin;

    try {
      if (actionType === 'delete_product' && targetId) {
        if (setProducts) {
          setProducts(prev => prev.filter(p => p.id !== targetId));
        }
        triggerNotification('Produk digital berhasil dihapus!', 'success');
        setIsLoading(false);
        deleteProductInSheets(sheetsUrl, adminPassword, adminPinCode, targetId).then(() => {
          onRefresh();
        }).catch(err => {
          console.error(err);
          triggerNotification('Sinkronisasi hapus produk gagal!', 'error');
        });
      } else if (actionType === 'delete_package' && targetId) {
        if (setWebsitePackages) {
          setWebsitePackages(prev => prev.filter(p => p.id !== targetId));
        }
        triggerNotification('Paket website berhasil dihapus!', 'success');
        setIsLoading(false);
        deleteWebsitePackageInSheets(sheetsUrl, adminPassword, adminPinCode, targetId).then(() => {
          onRefresh();
        }).catch(err => {
          console.error(err);
          triggerNotification('Sinkronisasi hapus paket gagal!', 'error');
        });
      } else if (actionType === 'bulk_delete_products' && payload?.ids) {
        const ids = payload.ids as string[];
        if (setProducts) {
          setProducts(prev => prev.filter(p => !ids.includes(p.id)));
        }
        setSelectedProductIds([]);
        triggerNotification(`${ids.length} produk digital berhasil dihapus!`, 'success');
        setIsLoading(false);
        (async () => {
          for (let i = 0; i < ids.length; i++) {
            await deleteProductInSheets(sheetsUrl, adminPassword, adminPinCode, ids[i]);
          }
          onRefresh();
        })().catch(err => {
          console.error(err);
          triggerNotification('Sinkronisasi hapus masal gagal!', 'error');
        });
      } else if (actionType === 'bulk_delete_packages' && payload?.ids) {
        const ids = payload.ids as string[];
        if (setWebsitePackages) {
          setWebsitePackages(prev => prev.filter(p => !ids.includes(p.id)));
        }
        setSelectedPackageIds([]);
        triggerNotification(`${ids.length} paket website berhasil dihapus!`, 'success');
        setIsLoading(false);
        (async () => {
          for (let i = 0; i < ids.length; i++) {
            await deleteWebsitePackageInSheets(sheetsUrl, adminPassword, adminPinCode, ids[i]);
          }
          onRefresh();
        })().catch(err => {
          console.error(err);
          triggerNotification('Sinkronisasi hapus masal gagal!', 'error');
        });
      } else if (actionType === 'save_settings') {
        setIsLoading(true);
        localStorage.setItem('madfat_sheets_url', sheetsUrl);
        localStorage.setItem('madfat_imgbb_key', imgbbKey);
        localStorage.setItem('madfat_admin_email', adminEmailSetting);
        if (adminEmailSetting) {
          await updateAdminEmailInSheets(sheetsUrl, adminPassword, adminPinCode, adminEmailSetting);
        }
        await onRefresh();
        triggerNotification('Pengaturan API & Email berhasil disimpan!', 'success');
      } else if (actionType === 'change_pin' && payload) {
        await updateAdminPinInSheets(sheetsUrl, adminPassword, adminPinCode, payload);
        localStorage.setItem('madfat_admin_pin', payload);
        setNewPinInput('');
        triggerNotification('PIN keamanan berhasil diubah!', 'success');
      } else if (actionType === 'logout') {
        handleLogout();
      }
    } catch (err: any) {
      alert('Aksi Gagal: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Update transaction status
  const handleUpdateStatus = async (id: string, newStatus: string) => {
    const adminPassword = localStorage.getItem('madfat_admin_password') || password;
    const adminPinCode = localStorage.getItem('madfat_admin_pin') || pin;
    
    // Optimistic UI Update
    setTransactions(prev => prev.map(tx => tx.orderId === id ? { ...tx, status: newStatus.toUpperCase() } : tx));
    triggerNotification('Status order berhasil diperbarui!', 'success');
    
    try {
      await updateTransactionStatusInSheets(sheetsUrl, adminPassword, adminPinCode, id, newStatus);
      loadTransactions();
    } catch (err: any) {
      console.error(err);
      triggerNotification('Gagal mensinkronisasikan status order!', 'error');
    }
  };

  // Product CRUD saves
  const handleSaveProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    const adminPassword = localStorage.getItem('madfat_admin_password') || password;
    const adminPinCode = localStorage.getItem('madfat_admin_pin') || pin;

    const prodToSave = { ...editingProduct };

    // Optimistic UI Update
    if (setProducts) {
      setProducts(prev => {
        const exists = prev.some(p => p.id === prodToSave.id);
        if (exists) {
          return prev.map(p => p.id === prodToSave.id ? prodToSave : p);
        } else {
          return [...prev, prodToSave];
        }
      });
    }
    setIsProductModalOpen(false);
    setEditingProduct(null);
    triggerNotification('Produk berhasil disimpan!', 'success');

    try {
      await upsertProductInSheets(sheetsUrl, adminPassword, adminPinCode, prodToSave);
      onRefresh();
    } catch (err: any) {
      console.error(err);
      triggerNotification('Gagal mensinkronisasikan produk!', 'error');
    }
  };

  // Image upload
  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!imgbbKey) {
      alert('Mohon isi API Key ImgBB di halaman pengaturan terlebih dahulu.');
      return;
    }
    try {
      setUploadingImage(true);
      const webpBlob = await compressImageToWebP(file, 0.85, 450);
      const url = await uploadImageToImgbb(webpBlob, imgbbKey);
      setEditingProduct((prev: any) => prev ? { ...prev, image: url } : null);
      triggerNotification('Gambar berhasil diunggah!', 'success');
    } catch (err: any) {
      alert('Gagal upload gambar: ' + err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  // Package CRUD saves
  const handleSavePackageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPackage) return;
    const adminPassword = localStorage.getItem('madfat_admin_password') || password;
    const adminPinCode = localStorage.getItem('madfat_admin_pin') || pin;

    const pkgToSave = { ...editingPackage };

    // Optimistic UI Update
    if (setWebsitePackages) {
      setWebsitePackages(prev => {
        const exists = prev.some(p => p.id === pkgToSave.id);
        if (exists) {
          return prev.map(p => p.id === pkgToSave.id ? pkgToSave : p);
        } else {
          return [...prev, pkgToSave];
        }
      });
    }
    setIsPackageModalOpen(false);
    setEditingPackage(null);
    triggerNotification('Paket website berhasil disimpan!', 'success');

    try {
      await upsertWebsitePackageInSheets(sheetsUrl, adminPassword, adminPinCode, pkgToSave);
      onRefresh();
    } catch (err: any) {
      console.error(err);
      triggerNotification('Gagal mensinkronisasikan paket website!', 'error');
    }
  };

  // Dashboard calculations
  const stats = useMemo(() => {
    let revenue = 0;
    let pendingCount = 0;
    let successCount = 0;
    let cancelledCount = 0;
    const itemSales: Record<string, number> = {};

    const safeTransactions = Array.isArray(transactions) ? transactions : [];

    safeTransactions.forEach(tx => {
      if (tx.status === 'SUCCESS') {
        revenue += Number(tx.totalAmount) || 0;
        successCount++;
      } else if (tx.status === 'PENDING') {
        pendingCount++;
      } else if (tx.status === 'CANCELLED') {
        cancelledCount++;
      }

      // Simple parse item names to count popularity
      if (tx.items) {
        const parts = tx.items.split(',');
        parts.forEach((p: string) => {
          const match = p.match(/(.*?)\s*\((\d+)x\)/);
          if (match) {
            const name = match[1].trim();
            const qty = parseInt(match[2], 10) || 1;
            itemSales[name] = (itemSales[name] || 0) + qty;
          } else {
            const name = p.trim();
            if (name) {
              itemSales[name] = (itemSales[name] || 0) + 1;
            }
          }
        });
      }
    });

    const popularItems = Object.entries(itemSales)
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    return {
      revenue,
      pendingCount,
      successCount,
      cancelledCount,
      totalOrders: safeTransactions.length,
      popularItems
    };
  }, [transactions]);

  // -------------------------------------------------------------
  // RENDER: PASSWORD LOGIN STAGE
  // -------------------------------------------------------------
  if (!isAuthenticated) {
    if (showForgotPassword) {
      return (
        <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-6 select-none font-sans">
          <div className="w-full max-w-md bg-white border border-orange-100/50 rounded-2xl p-8 shadow-xl shadow-orange-100/20">
            <div className="flex items-center justify-between mb-8">
              <button
                onClick={() => {
                  setShowForgotPassword(false);
                  setResetOtpSent(false);
                  setLoginError('');
                }}
                className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase hover:text-blaze-orange transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" /> Kembali Login
              </button>
              <span className="text-lg font-hero font-bold text-blaze-orange tracking-tight">RESET PASSWORD</span>
            </div>

            <div className="text-center mb-6">
              <h2 className="text-xl font-hero font-bold text-slate-800 uppercase">RESET PASSWORD</h2>
              <p className="text-xs text-slate-500 font-medium mt-1">
                {!resetOtpSent
                  ? "Masukkan Gmail admin terdaftar untuk menerima kode verifikasi reset password."
                  : "Masukkan kode OTP yang dikirim ke Gmail beserta password baru Anda."}
              </p>
            </div>

            {!resetOtpSent ? (
              <form onSubmit={handleSendResetOtp} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">Gmail Admin</label>
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blaze-orange/20 focus:border-blaze-orange transition-all text-obsidian"
                    placeholder="namaadmin@gmail.com"
                  />
                </div>

                {loginError && (
                  <p className="text-xs font-semibold text-[#B91C1C] bg-[#FEE2E2]/60 border border-[#B91C1C]/25 rounded-xl p-2.5">
                    {loginError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-blaze-orange hover:bg-blaze-orange/90 text-white rounded-xl text-xs font-semibold tracking-wider uppercase transition-all duration-200 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? 'MENGIRIM OTP...' : 'KIRIM KODE VERIFIKASI'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPasswordSubmit} className="space-y-5">
                <div className="bg-orange-50/50 border border-orange-100 rounded-xl p-3 mb-2 text-center">
                  <span className="text-[10px] font-semibold text-blaze-orange uppercase">Email Tujuan:</span>
                  <p className="text-xs font-mono font-bold text-slate-700">{resetEmail}</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">Kode OTP 6-Digit</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={resetOtp}
                    onChange={(e) => setResetOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-center text-lg tracking-[0.2em] font-mono focus:outline-none focus:ring-2 focus:ring-blaze-orange/20 focus:border-blaze-orange transition-all text-obsidian"
                    placeholder="000000"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">Password Baru</label>
                  <input
                    type="password"
                    required
                    value={resetNewPassword}
                    onChange={(e) => setResetNewPassword(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blaze-orange/20 focus:border-blaze-orange transition-all text-obsidian font-mono"
                    placeholder="••••••••"
                  />
                </div>

                {loginError && (
                  <p className="text-xs font-semibold text-[#B91C1C] bg-[#FEE2E2]/60 border border-[#B91C1C]/25 rounded-xl p-2.5">
                    {loginError}
                  </p>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setResetOtpSent(false)}
                    className="w-1/3 py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-xl text-xs font-semibold uppercase transition-all duration-200 cursor-pointer"
                  >
                    Kembali
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-2/3 py-3 bg-blaze-orange hover:bg-blaze-orange/90 text-white rounded-xl text-xs font-semibold tracking-wider uppercase transition-all duration-200 shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {isLoading ? 'PROSES...' : 'RESET PASSWORD'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center p-6 select-none font-sans">
        <div className="w-full max-w-md bg-white border border-orange-100/50 rounded-2xl p-8 shadow-xl shadow-orange-100/20">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={onClose}
              className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase hover:text-blaze-orange transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> Kembali
            </button>
            <span className="text-lg font-hero font-bold text-blaze-orange tracking-tight">MADFAT</span>
          </div>

          <div className="text-center mb-6">
            <h2 className="text-xl font-hero font-bold text-slate-800 uppercase">LOGIN PORTAL</h2>
            <p className="text-xs text-slate-500 font-medium mt-1">
              {!otpSent
                ? "Masukkan Gmail admin dan password untuk menerima kode OTP verifikasi."
                : "Masukkan kode verifikasi OTP yang dikirim langsung ke Gmail Anda."}
            </p>
          </div>

          <form onSubmit={otpSent ? handleVerifyLoginOtp : handleSendLoginOtp} className="space-y-5">
            {!otpSent ? (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">Gmail Admin</label>
                  <input
                    type="email"
                    required
                    value={gmailInput}
                    onChange={(e) => setGmailInput(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blaze-orange/20 focus:border-blaze-orange transition-all text-obsidian"
                    placeholder="admin@gmail.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">Password Admin</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blaze-orange/20 focus:border-blaze-orange transition-all text-obsidian font-mono"
                    placeholder="••••••••"
                  />
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="bg-orange-50/50 border border-orange-100 rounded-xl p-3 text-center">
                  <span className="text-[10px] font-semibold text-blaze-orange uppercase">Kode OTP Dikirim Ke:</span>
                  <p className="text-xs font-mono font-bold text-slate-700">{gmailInput}</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">Masukkan OTP 6-Digit</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={gmailOtp}
                    onChange={(e) => setGmailOtp(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl bg-white text-center text-lg tracking-[0.2em] font-mono focus:outline-none focus:ring-2 focus:ring-blaze-orange/20 focus:border-blaze-orange transition-all text-obsidian"
                    placeholder="000000"
                  />
                </div>
              </div>
            )}

            {loginError && (
              <p className="text-xs font-semibold text-[#B91C1C] bg-[#FEE2E2]/60 border border-[#B91C1C]/25 rounded-xl p-2.5">
                {loginError}
              </p>
            )}

            <div className="flex gap-3">
              {otpSent && (
                <button
                  type="button"
                  onClick={() => setOtpSent(false)}
                  className="w-1/3 py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-xl text-xs font-semibold uppercase transition-all duration-200 cursor-pointer"
                >
                  Kembali
                </button>
              )}
              <button
                type="submit"
                disabled={isLoading}
                className={`py-3 text-white rounded-xl text-xs font-semibold tracking-wider uppercase transition-all duration-200 shadow-sm cursor-pointer disabled:opacity-50 ${otpSent ? 'w-2/3 bg-blaze-orange hover:bg-blaze-orange/90' : 'w-full bg-blaze-orange hover:bg-blaze-orange/90'
                  }`}
              >
                {isLoading ? 'MEMPROSES...' : otpSent ? 'VERIFIKASI OTP' : 'LOGIN'}
              </button>
            </div>

            {!otpSent && (
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(true);
                    setResetOtpSent(false);
                    setResetEmail('');
                    setLoginError('');
                  }}
                  className="text-xs font-semibold text-blaze-orange hover:underline uppercase tracking-wide cursor-pointer"
                >
                  Lupa Password?
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    );
  }


  // -------------------------------------------------------------
  // RENDER: MAIN ADMIN PORTAL (MINIMALIST MODERN)
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#FAF8F5] flex flex-col md:flex-row select-none font-sans text-obsidian relative overflow-hidden">

      {/* Mobile Top Header */}
      <div className="md:hidden bg-white border-b border-orange-100/40 p-4 flex justify-between items-center print:hidden z-30 shrink-0 shadow-sm">
        <span className="font-hero text-base font-bold tracking-tight uppercase"><span className="text-blaze-orange font-extrabold">MADFAT</span> <span className="text-slate-750">PANEL</span></span>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 border border-slate-200 bg-[#FAF8F5] rounded-lg text-obsidian cursor-pointer active:scale-95 transition-all"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Backdrop Overlay on Mobile */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Sidebar Nav (Modern SaaS Left Bar) */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white text-obsidian shrink-0 flex flex-col justify-between border-r border-orange-100/30 p-6 print:hidden transition-transform duration-300 ease-in-out shadow-sm
        md:static md:translate-x-0
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <span className="font-hero text-md font-bold tracking-tight text-slate-800 uppercase">MADFAT <span className="text-blaze-orange">PANEL</span></span>
            <span className="bg-orange-50 border border-orange-100 text-[8px] font-semibold px-2.5 py-0.5 rounded-full text-blaze-orange font-mono uppercase">v2.0</span>
          </div>

          <nav className="space-y-1.5">
            {[
              { id: 'dashboard', label: 'Ringkasan', icon: LayoutDashboard },
              { id: 'products', label: 'Produk Digital', icon: ShoppingBag },
              { id: 'packages', label: 'Paket Website', icon: Globe },
              { id: 'orders', label: 'Manajemen Order', icon: CreditCard },
              { id: 'settings', label: 'Pengaturan', icon: Settings },
            ].map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => { switchTab(tab.id as TabType); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold uppercase transition-all duration-200 cursor-pointer ${isActive
                      ? 'bg-blaze-orange text-white shadow-md shadow-blaze-orange/10'
                      : 'bg-transparent text-slate-600 hover:text-blaze-orange hover:bg-orange-50/50'
                    }`}
                >
                  <TabIcon className="w-4 h-4" /> {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="mt-8 pt-6 border-t border-dashed border-orange-100/60 space-y-3">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Balik Belanja
          </button>
          <button
            onClick={() => triggerStrictAction(
              'LOGOUT DARI PORTAL?',
              'Apakah Anda yakin ingin logout? Anda harus memasukkan Password dan PIN kembali untuk mengakses portal admin.',
              'logout'
            )}
            className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-650 border border-red-100 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
          >
            <LogOut className="w-3.5 h-3.5" /> Log Out
          </button>
        </div>
      </aside>

      {/* Main Content Area (Clean Body Layout) */}
      <main className="flex-1 p-6 md:p-10 max-w-7xl mx-auto w-full print:p-0 overflow-y-auto">

        {/* TAB: DASHBOARD / STATISTICS */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="font-hero text-xl sm:text-2xl font-bold text-slate-800 uppercase tracking-tight">RINGKASAN PORTAL</h1>
                <p className="font-sans text-[11px] text-slate-500 font-medium mt-0.5">Analisis metrik penjualan produk dan performa bisnis Anda.</p>
              </div>
              <button
                onClick={() => {
                  onRefresh();
                  loadTransactions();
                }}
                className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-650 rounded-xl cursor-pointer transition-colors shadow-sm"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {/* Metrik Grid: 2 columns on mobile, 4 on desktop */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-100/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-400 text-[10px] font-semibold uppercase block truncate">Pendapatan Bersih</span>
                  <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-500 shrink-0">
                    <DollarSign className="w-3.5 h-3.5" />
                  </div>
                </div>
                <span className="text-sm sm:text-base font-bold text-slate-800 block mt-2 truncate font-sans">{formatPrice(stats.revenue)}</span>
                <span className="text-[9px] text-slate-400 font-medium block mt-0.5">Metrik Lunas</span>
              </div>
              
              <div className="bg-white border border-slate-100/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-400 text-[10px] font-semibold uppercase block truncate">Total Transaksi</span>
                  <div className="p-1.5 bg-indigo-50 rounded-lg text-indigo-500 shrink-0">
                    <ShoppingBag className="w-3.5 h-3.5" />
                  </div>
                </div>
                <span className="text-sm sm:text-base font-bold text-slate-800 block mt-2 truncate font-sans">{stats.totalOrders} Order</span>
                <span className="text-[9px] text-slate-400 font-medium block mt-0.5">Seluruh Transaksi</span>
              </div>

              <div className="bg-white border border-slate-100/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-400 text-[10px] font-semibold uppercase block truncate">Berhasil (SUCCESS)</span>
                  <div className="p-1.5 bg-green-50 rounded-lg text-green-500 shrink-0">
                    <CheckCircle className="w-3.5 h-3.5" />
                  </div>
                </div>
                <span className="text-sm sm:text-base font-bold text-green-600 block mt-2 truncate font-sans">{stats.successCount} Lunas</span>
                <span className="text-[9px] text-slate-400 font-medium block mt-0.5">Selesai Diproses</span>
              </div>

              <div className="bg-white border border-slate-100/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all duration-200">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-slate-400 text-[10px] font-semibold uppercase block truncate">Pending / Proses</span>
                  <div className="p-1.5 bg-amber-50 rounded-lg text-amber-500 shrink-0">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                </div>
                <span className="text-sm sm:text-base font-bold text-amber-600 block mt-2 truncate font-sans">{stats.pendingCount} Transaksi</span>
                <span className="text-[9px] text-slate-400 font-medium block mt-0.5">Menunggu Konfirmasi</span>
              </div>
            </div>

            {/* Chart & Popularity Row */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Sales Status Chart */}
              <div className="bg-white border border-slate-100 rounded-2xl p-5 lg:col-span-6 space-y-4 shadow-sm">
                <div className="flex items-center gap-1.5">
                  <div className="p-1.5 bg-orange-50 text-blaze-orange rounded-lg">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <h3 className="font-hero text-xs font-semibold text-slate-800 uppercase tracking-wider">PERSENTASE STATUS TRANSAKSI</h3>
                </div>

                {stats.totalOrders > 0 ? (
                  (() => {
                    const successPercent = (stats.successCount / stats.totalOrders) * 100;
                    const pendingPercent = (stats.pendingCount / stats.totalOrders) * 100;
                    const cancelledPercent = (stats.cancelledCount / stats.totalOrders) * 100;

                    // SVG Circle dimensions
                    const radius = 50;
                    const circumference = 2 * Math.PI * radius;

                    return (
                      <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-2">
                        {/* Beautiful Animated SVG Donut Chart */}
                        <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
                          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                            {/* Background Circle */}
                            <circle
                              cx="60"
                              cy="60"
                              r={radius}
                              className="stroke-slate-100"
                              strokeWidth="10"
                              fill="transparent"
                            />
                            {/* Success Segment */}
                            <circle
                              cx="60"
                              cy="60"
                              r={radius}
                              className="stroke-green-500 transition-all duration-1000 ease-out"
                              strokeWidth="10"
                              fill="transparent"
                              strokeDasharray={`${chartAnimated ? (successPercent / 100) * circumference : 0} ${circumference}`}
                              strokeDashoffset="0"
                              strokeLinecap="round"
                            />
                            {/* Pending Segment */}
                            <circle
                              cx="60"
                              cy="60"
                              r={radius}
                              className="stroke-amber-400 transition-all duration-1000 ease-out"
                              strokeWidth="10"
                              fill="transparent"
                              strokeDasharray={`${chartAnimated ? (pendingPercent / 100) * circumference : 0} ${circumference}`}
                              strokeDashoffset="0"
                              transform={`rotate(${successPercent * 3.6} 60 60)`}
                              strokeLinecap="round"
                            />
                            {/* Cancelled Segment */}
                            <circle
                              cx="60"
                              cy="60"
                              r={radius}
                              className="stroke-red-500 transition-all duration-1000 ease-out"
                              strokeWidth="10"
                              fill="transparent"
                              strokeDasharray={`${chartAnimated ? (cancelledPercent / 100) * circumference : 0} ${circumference}`}
                              strokeDashoffset="0"
                              transform={`rotate(${(successPercent + pendingPercent) * 3.6} 60 60)`}
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute flex flex-col items-center justify-center">
                            <span className="text-base font-bold text-slate-800 font-sans">{stats.totalOrders}</span>
                            <span className="text-[8px] text-slate-400 font-semibold uppercase font-sans">Transaksi</span>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 text-[10px] font-semibold uppercase text-slate-650 w-full sm:w-auto">
                          <div className="flex items-center justify-between sm:justify-start gap-2 bg-green-50/50 border border-green-200/30 px-3 py-1 rounded-xl">
                            <span className="w-2 h-2 bg-green-500 rounded-full" />
                            <span className="font-sans">Sukses: {stats.successCount} ({Math.round(successPercent)}%)</span>
                          </div>
                          <div className="flex items-center justify-between sm:justify-start gap-2 bg-amber-50/50 border border-amber-200/30 px-3 py-1 rounded-xl">
                            <span className="w-2 h-2 bg-amber-400 rounded-full" />
                            <span className="font-sans">Pending: {stats.pendingCount} ({Math.round(pendingPercent)}%)</span>
                          </div>
                          <div className="flex items-center justify-between sm:justify-start gap-2 bg-red-50/50 border border-red-200/30 px-3 py-1 rounded-xl">
                            <span className="w-2 h-2 bg-red-500 rounded-full" />
                            <span className="font-sans">Batal: {stats.cancelledCount} ({Math.round(cancelledPercent)}%)</span>
                          </div>
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <p className="text-xs text-slate-500 italic font-semibold">Belum ada data untuk kalkulasi chart.</p>
                )}
              </div>

              {/* Popular items list with Animated Horizontal Bar Chart */}
              <div className="bg-white border border-slate-100 rounded-2xl p-5 lg:col-span-6 space-y-4 shadow-sm">
                <div className="flex items-center gap-1.5">
                  <div className="p-1.5 bg-orange-50 text-blaze-orange rounded-lg">
                    <BarChart2 className="w-4 h-4" />
                  </div>
                  <h3 className="font-hero text-xs font-semibold text-slate-800 uppercase tracking-wider">PRODUK TERLARIS (TOP 5)</h3>
                </div>

                {stats.popularItems.length > 0 ? (
                  (() => {
                    const maxQty = Math.max(...stats.popularItems.map(item => item.qty)) || 1;
                    return (
                      <div className="space-y-3.5">
                        {stats.popularItems.map((item, idx) => {
                          const percent = (item.qty / maxQty) * 100;
                          return (
                            <div key={idx} className="space-y-1">
                              <div className="flex justify-between items-center text-[10px] sm:text-xs font-semibold text-slate-700">
                                <span className="uppercase truncate max-w-[200px] sm:max-w-xs">{item.name}</span>
                                <span className="text-slate-400 font-medium font-sans">{item.qty} Terjual</span>
                              </div>
                              <div className="w-full bg-slate-50 h-2 rounded-full overflow-hidden border border-slate-100/50">
                                <div
                                  className="bg-gradient-to-r from-orange-400 to-blaze-orange h-full rounded-full transition-all duration-1000 ease-out"
                                  style={{ width: chartAnimated ? `${percent}%` : '0%' }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()
                ) : (
                  <p className="text-xs text-slate-500 italic font-semibold">Belum ada rekaman data transaksi produk.</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB: DIGITAL PRODUCTS CATALOG */}
        {activeTab === 'products' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-hero text-2xl sm:text-3xl font-bold text-slate-800 uppercase tracking-tight">KATALOG PRODUK DIGITAL</h1>
                <p className="font-sans text-xs text-slate-500 font-medium mt-1">Kelola data list akun digital premium dan harga jual.</p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => setIsProductBulkMode(!isProductBulkMode)}
                  className={`px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold uppercase transition-all duration-200 shadow-sm cursor-pointer ${
                    isProductBulkMode
                      ? 'bg-amber-50 border-amber-200 text-amber-800'
                      : 'bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  {isProductBulkMode ? 'Selesai Bulk' : 'Aksi Massal'}
                </button>

                <button
                  onClick={() => {
                    setEditingProduct({
                      id: getNextProductId(products),
                      name: '',
                      category: 'streaming',
                      price: 0,
                      sub: '',
                      description: '',
                      icon: 'Star',
                      color: 'bg-indigo-600',
                      hot: false,
                      bestSeller: false,
                      image: ''
                    });
                    setIsProductModalOpen(true);
                  }}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-blaze-orange hover:bg-blaze-orange/90 text-white rounded-xl text-xs font-semibold uppercase transition-all duration-200 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" /> {isLoading ? 'MEMPROSES...' : 'Tambah Produk Baru'}
                </button>
              </div>
            </div>

            {/* Products Table/Card View */}
            {products.length === 0 ? (
              <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center shadow-sm">
                <p className="text-xs text-slate-500 font-semibold uppercase mb-3">Katalog kosong.</p>
              </div>
            ) : (
              <>
                {/* Desktop View */}
                <div className="hidden md:block overflow-x-auto rounded-2xl bg-white border border-slate-100 shadow-sm">
                  <table className="w-full border-collapse text-left text-xs font-sans text-obsidian min-w-[900px]">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 border-b border-slate-100">
                        {isProductBulkMode && (
                          <th className="p-3.5 text-center w-12">
                            <input
                              type="checkbox"
                              className="w-4 h-4 rounded border border-slate-200 text-blaze-orange focus:ring-0 focus:ring-offset-0 cursor-pointer accent-blaze-orange"
                              checked={products.length > 0 && selectedProductIds.length === products.length}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedProductIds(products.map(p => p.id));
                                } else {
                                  setSelectedProductIds([]);
                                }
                              }}
                            />
                          </th>
                        )}
                        <th className="p-3.5 font-semibold uppercase text-slate-500 tracking-wider text-[10px]">ID</th>
                        <th className="p-3.5 font-semibold uppercase text-slate-500 tracking-wider text-[10px]">Gambar</th>
                        <th className="p-3.5 font-semibold uppercase text-slate-500 tracking-wider text-[10px]">Nama Produk</th>
                        <th className="p-3.5 font-semibold uppercase text-slate-500 tracking-wider text-[10px]">Kategori</th>
                        <th className="p-3.5 font-semibold uppercase text-slate-500 tracking-wider text-[10px]">Harga</th>
                        <th className="p-3.5 font-semibold uppercase text-slate-500 tracking-wider text-[10px]">Sub / Tag</th>
                        <th className="p-3.5 font-semibold uppercase text-slate-500 tracking-wider text-[10px]">Deskripsi</th>
                        <th className="p-3.5 font-semibold uppercase text-slate-500 tracking-wider text-[10px]">Promosi</th>
                        <th className="p-3.5 font-semibold uppercase text-slate-500 tracking-wider text-[10px] text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {products.map((product) => (
                        <tr key={product.id} className="hover:bg-slate-50/60 transition-colors">
                          {isProductBulkMode && (
                            <td className="p-3 text-center w-12">
                              <input
                                type="checkbox"
                                className="w-4 h-4 rounded border border-slate-200 text-blaze-orange focus:ring-0 focus:ring-offset-0 cursor-pointer accent-blaze-orange"
                                checked={selectedProductIds.includes(product.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedProductIds(prev => [...prev, product.id]);
                                  } else {
                                    setSelectedProductIds(prev => prev.filter(id => id !== product.id));
                                  }
                                }}
                              />
                            </td>
                          )}
                          <td className="p-3 font-mono font-semibold text-slate-400">{product.id}</td>
                          <td className="p-3">
                            {product.image ? (
                              <LazyImage src={product.image} alt={product.name} className="w-10 h-10 rounded-lg" />
                            ) : (
                              <span className="text-slate-400 font-bold text-base">★</span>
                            )}
                          </td>
                          <td className="p-3 font-semibold text-slate-700 uppercase">{product.name}</td>
                          <td className="p-3">
                            <span className="bg-orange-50/50 text-blaze-orange text-[9px] font-semibold px-2.5 py-1 rounded-full uppercase whitespace-nowrap">
                              {product.category}
                            </span>
                          </td>
                          <td className="p-3 font-bold text-blaze-orange font-mono">{formatPrice(product.price)}</td>
                          <td className="p-3 text-slate-500 font-medium max-w-[120px] truncate">{product.sub}</td>
                          <td className="p-3 text-slate-500 font-medium max-w-[200px] truncate">{product.description}</td>
                          <td className="p-3 space-x-1">
                            {product.hot && <span className="bg-red-500 text-white text-[8px] font-bold px-2 py-0.5 rounded-full border border-orange-200">HOT</span>}
                            {product.bestSeller && <span className="bg-yellow-500 text-obsidian text-[8px] font-bold px-2 py-0.5 rounded-full border border-orange-200">BEST</span>}
                          </td>
                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => {
                                  setEditingProduct({ ...product });
                                  setIsProductModalOpen(true);
                                }}
                                className="p-2 bg-slate-50 border border-slate-200 rounded-xl hover:bg-blaze-orange hover:text-white hover:border-blaze-orange transition-all cursor-pointer shadow-sm"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => triggerStrictAction(
                                  'HAPUS PRODUK DIGITAL?',
                                  `Apakah Anda yakin ingin menghapus "${product.name}"? Aksi ini tidak dapat dibatalkan di database Google Sheets.`,
                                  'delete_product',
                                  product.id
                                )}
                                className="p-2 bg-slate-50 border border-slate-200 rounded-xl hover:bg-red-500 hover:text-white hover:border-red-500 transition-all cursor-pointer shadow-sm"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile View */}
                <div className="block md:hidden space-y-4">
                  {products.map((product) => (
                    <div key={product.id} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-start gap-4">
                      {isProductBulkMode && (
                        <div className="pt-1.5 shrink-0">
                          <input
                            type="checkbox"
                            className="w-5 h-5 rounded border border-slate-200 text-blaze-orange focus:ring-0 focus:ring-offset-0 cursor-pointer accent-blaze-orange"
                            checked={selectedProductIds.includes(product.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedProductIds(prev => [...prev, product.id]);
                              } else {
                                setSelectedProductIds(prev => prev.filter(id => id !== product.id));
                              }
                            }}
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-semibold text-slate-400">{product.id}</span>
                          <span className="bg-orange-50 text-blaze-orange text-[10px] font-semibold px-2.5 py-0.5 rounded-full uppercase whitespace-nowrap">
                            {product.category}
                          </span>
                        </div>
                        <div className="flex gap-3 items-center">
                          {product.image ? (
                            <LazyImage src={product.image} alt={product.name} className="w-12 h-12 rounded-lg shrink-0" />
                          ) : (
                            <div className="w-12 h-12 rounded-lg border border-slate-100 bg-slate-50/50 flex items-center justify-center font-bold text-xl text-slate-400">★</div>
                          )}
                          <div className="min-w-0">
                            <h4 className="font-bold text-sm text-slate-700 uppercase truncate">{product.name}</h4>
                            <p className="font-bold text-blaze-orange text-xs font-mono mt-0.5">{formatPrice(product.price)}</p>
                          </div>
                        </div>
                        {product.sub && <p className="text-[11px] text-slate-500 font-medium truncate">{product.sub}</p>}
                        {product.description && <p className="text-[10px] text-slate-500 line-clamp-2">{product.description}</p>}
                        <div className="flex items-center justify-between pt-2 border-t border-dashed border-slate-100">
                          <div className="flex gap-1">
                            {product.hot && <span className="bg-red-500 text-white text-[8px] font-bold px-2 py-0.5 rounded-full border border-orange-200">HOT</span>}
                            {product.bestSeller && <span className="bg-yellow-500 text-obsidian text-[8px] font-bold px-2 py-0.5 rounded-full border border-orange-200">BEST</span>}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                  setEditingProduct({ ...product });
                                  setIsProductModalOpen(true);
                                }}
                              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-semibold uppercase hover:bg-blaze-orange hover:text-white hover:border-blaze-orange transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                            >
                              <Edit2 className="w-3.5 h-3.5" /> Edit
                            </button>
                            <button
                              onClick={() => triggerStrictAction(
                                'HAPUS PRODUK DIGITAL?',
                                `Apakah Anda yakin ingin menghapus "${product.name}"? Aksi ini tidak dapat dibatalkan di database Google Sheets.`,
                                'delete_product',
                                product.id
                              )}
                              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-semibold uppercase hover:bg-red-500 hover:text-white hover:border-red-500 transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Hapus
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB: WEBSITE PACKAGES CATALOG */}
        {activeTab === 'packages' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-hero text-2xl sm:text-3xl font-bold text-slate-800 uppercase tracking-tight">KATALOG JASA WEBSITE</h1>
                <p className="font-sans text-xs text-slate-500 font-medium mt-1">Kelola paket bundles pembuatan website dan penawarannya.</p>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  onClick={() => setIsPackageBulkMode(!isPackageBulkMode)}
                  className={`px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold uppercase transition-all duration-200 shadow-sm cursor-pointer ${
                    isPackageBulkMode
                      ? 'bg-amber-50 border-amber-200 text-amber-800'
                      : 'bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  {isPackageBulkMode ? 'Selesai Bulk' : 'Aksi Massal'}
                </button>

                <button
                  onClick={() => {
                    setEditingPackage({
                      id: getNextPackageId(websitePackages),
                      name: '',
                      categoryName: 'CUSTOM PROJECT',
                      price: 0,
                      priceText: 'Rp 0',
                      sub: '',
                      features: [],
                      isFeatured: false,
                      badge: '',
                      btnText: 'PILIH PAKET'
                    });
                    setIsPackageModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blaze-orange hover:bg-blaze-orange/90 text-white rounded-xl text-xs font-semibold uppercase transition-all duration-200 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" /> {isLoading ? 'MEMPROSES...' : 'Tambah Paket Baru'}
                </button>
              </div>
            </div>

            {/* Website Packages Table/Card View */}
            {websitePackages.length === 0 ? (
              <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center shadow-sm">
                <p className="text-xs text-slate-500 font-semibold uppercase">Katalog paket kosong.</p>
              </div>
            ) : (
              <>
                {/* Desktop View */}
                <div className="hidden md:block overflow-x-auto rounded-2xl bg-white border border-slate-100 shadow-sm">
                  <table className="w-full border-collapse text-left text-xs font-sans text-obsidian min-w-[900px]">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 border-b border-slate-100">
                        {isPackageBulkMode && (
                          <th className="p-3.5 text-center w-12">
                            <input
                              type="checkbox"
                              className="w-4 h-4 rounded border border-orange-200 text-blaze-orange focus:ring-0 focus:ring-offset-0 cursor-pointer accent-blaze-orange"
                              checked={websitePackages.length > 0 && selectedPackageIds.length === websitePackages.length}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedPackageIds(websitePackages.map(p => p.id));
                                } else {
                                  setSelectedPackageIds([]);
                                }
                              }}
                            />
                          </th>
                        )}
                        <th className="p-3.5 font-semibold uppercase text-slate-500 tracking-wider text-[10px] whitespace-nowrap w-24">ID</th>
                        <th className="p-3.5 font-semibold uppercase text-slate-500 tracking-wider text-[10px]">Kategori</th>
                        <th className="p-3.5 font-semibold uppercase text-slate-500 tracking-wider text-[10px]">Nama Paket</th>
                        <th className="p-3.5 font-semibold uppercase text-slate-500 tracking-wider text-[10px]">Harga (Teks)</th>
                        <th className="p-3.5 font-semibold uppercase text-slate-500 tracking-wider text-[10px]">Deskripsi</th>
                        <th className="p-3.5 font-semibold uppercase text-slate-500 tracking-wider text-[10px]">Fitur</th>
                        <th className="p-3.5 font-semibold uppercase text-slate-500 tracking-wider text-[10px]">Featured</th>
                        <th className="p-3.5 font-semibold uppercase text-slate-500 tracking-wider text-[10px]">Badge</th>
                        <th className="p-3.5 font-semibold uppercase text-slate-500 tracking-wider text-[10px]">Tombol</th>
                        <th className="p-3.5 font-semibold uppercase text-slate-500 tracking-wider text-[10px] text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {websitePackages.map((pkg) => (
                        <tr key={pkg.id} className="hover:bg-slate-50/60 transition-colors border-b border-slate-100 last:border-b-0">
                          {isPackageBulkMode && (
                            <td className="p-3 text-center w-12">
                              <input
                                type="checkbox"
                                className="w-4 h-4 rounded border border-orange-200 text-blaze-orange focus:ring-0 focus:ring-offset-0 cursor-pointer accent-blaze-orange"
                                checked={selectedPackageIds.includes(pkg.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedPackageIds(prev => [...prev, pkg.id]);
                                  } else {
                                    setSelectedPackageIds(prev => prev.filter(id => id !== pkg.id));
                                  }
                                }}
                              />
                            </td>
                          )}
                          <td className="p-3 font-mono font-semibold text-slate-400 whitespace-nowrap">{pkg.id}</td>
                          <td className="p-3">
                            <span className="bg-orange-50/50 text-blaze-orange text-[9px] font-semibold px-2.5 py-1 rounded-full uppercase whitespace-nowrap">
                              {pkg.categoryName}
                            </span>
                          </td>
                          <td className="p-3 font-semibold text-slate-700 uppercase">{pkg.name}</td>
                          <td className="p-3 font-bold text-blaze-orange font-mono">{pkg.priceText}</td>
                          <td className="p-3 text-slate-500 font-medium max-w-[150px] truncate">{pkg.sub}</td>
                          <td className="p-3 text-slate-500 font-medium max-w-[200px] truncate">
                            {Array.isArray(pkg.features) ? pkg.features.join(', ') : (typeof pkg.features === 'string' ? pkg.features : '')}
                          </td>
                          <td className="p-3">
                            {pkg.isFeatured ? (
                              <span className="bg-yellow-50 text-yellow-700 text-[9px] font-semibold px-2.5 py-0.5 rounded-full border border-yellow-200">TRUE</span>
                            ) : (
                              <span className="text-slate-400 font-semibold uppercase">FALSE</span>
                            )}
                          </td>
                          <td className="p-3 font-semibold uppercase text-slate-700">{pkg.badge || '-'}</td>
                          <td className="p-3 font-semibold uppercase text-slate-700">{pkg.btnText || '-'}</td>
                          <td className="p-3 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => {
                                  setEditingPackage({ ...pkg });
                                  setIsPackageModalOpen(true);
                                }}
                                className="p-2 bg-slate-50 border border-slate-200 rounded-xl hover:bg-blaze-orange hover:text-white hover:border-blaze-orange transition-all cursor-pointer shadow-sm"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => triggerStrictAction(
                                  'HAPUS PAKET WEBSITE?',
                                  `Apakah Anda yakin ingin menghapus paket "${pkg.name}" dari katalog? Aksi ini permanen di Google Sheets.`,
                                  'delete_package',
                                  pkg.id
                                )}
                                className="p-2 bg-slate-50 border border-slate-200 rounded-xl hover:bg-red-500 hover:text-white hover:border-red-500 transition-all cursor-pointer shadow-sm"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile View */}
                <div className="block md:hidden space-y-4">
                  {websitePackages.map((pkg) => (
                    <div key={pkg.id} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm flex items-start gap-4">
                      {isPackageBulkMode && (
                        <div className="pt-1.5 shrink-0">
                          <input
                            type="checkbox"
                            className="w-5 h-5 rounded border border-slate-200 text-blaze-orange focus:ring-0 focus:ring-offset-0 cursor-pointer accent-blaze-orange"
                            checked={selectedPackageIds.includes(pkg.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                  setSelectedPackageIds(prev => [...prev, pkg.id]);
                                } else {
                                  setSelectedPackageIds(prev => prev.filter(id => id !== pkg.id));
                                }
                            }}
                          />
                        </div>
                      )}
                      <div className="flex-1 min-w-0 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-semibold text-slate-400">{pkg.id}</span>
                          <span className="bg-orange-50 text-blaze-orange text-[10px] font-semibold px-2.5 py-0.5 rounded-full uppercase whitespace-nowrap">
                            {pkg.categoryName}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-slate-700 uppercase">{pkg.name}</h4>
                          <p className="font-bold text-blaze-orange text-xs font-mono mt-0.5">{pkg.priceText}</p>
                        </div>
                        {pkg.sub && <p className="text-[11px] text-slate-500 font-medium">{pkg.sub}</p>}
                        {pkg.features && (
                          <div className="text-[10px] text-slate-500 font-medium">
                            <span className="font-semibold text-slate-700 uppercase block text-[9px] mb-0.5">Fitur:</span>
                            {Array.isArray(pkg.features) ? pkg.features.join(', ') : (typeof pkg.features === 'string' ? pkg.features : '')}
                          </div>
                        )}
                        <div className="flex items-center justify-between pt-2 border-t border-dashed border-slate-100">
                          <div className="flex gap-1.5 items-center">
                            {pkg.isFeatured ? (
                              <span className="bg-yellow-50 text-yellow-750 text-[8px] font-semibold px-2 py-0.5 rounded-full">FEATURED</span>
                            ) : (
                              <span className="text-[9px] font-semibold text-slate-400 uppercase">REGULAR</span>
                            )}
                            {pkg.badge && <span className="bg-orange-50/50 text-blaze-orange text-[8px] font-semibold px-2 py-0.5 rounded-full">{pkg.badge}</span>}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingPackage({ ...pkg });
                                setIsPackageModalOpen(true);
                              }}
                              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-semibold uppercase hover:bg-blaze-orange hover:text-white hover:border-blaze-orange transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                            >
                              <Edit2 className="w-3.5 h-3.5" /> Edit
                            </button>
                            <button
                              onClick={() => triggerStrictAction(
                                'HAPUS PAKET WEBSITE?',
                                `Apakah Anda yakin ingin menghapus paket "${pkg.name}" dari katalog? Aksi ini permanen di Google Sheets.`,
                                'delete_package',
                                pkg.id
                              )}
                              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-semibold uppercase hover:bg-red-500 hover:text-white hover:border-red-500 transition-all cursor-pointer flex items-center gap-1 shadow-sm"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Hapus
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB: ORDER MANAGEMENT */}
        {activeTab === 'orders' && (
          <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="font-hero text-2xl sm:text-3xl font-bold text-slate-800 uppercase tracking-tight">MANAJEMEN TRANSAKSI</h1>
                <p className="font-sans text-xs text-slate-500 font-medium mt-1">Kelola status pembayaran dan cetak nota belanja pelanggan.</p>
              </div>

              <button
                onClick={loadTransactions}
                disabled={loadingTransactions}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold uppercase transition-all duration-200 shadow-sm cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingTransactions ? 'animate-spin' : ''}`} /> {loadingTransactions ? 'MEMPROSES...' : 'Refresh Data'}
              </button>
            </div>

            {/* Orders Table/Card View */}
            {transactions.length === 0 ? (
              <div className="bg-white border border-slate-100 rounded-2xl p-12 text-center shadow-sm">
                {loadingTransactions ? (
                  <div className="flex flex-col items-center justify-center gap-2 py-4">
                    <span className="w-6 h-6 rounded-full border-2 border-dashed border-blaze-orange animate-spin" />
                    <p className="text-xs text-slate-500 font-semibold uppercase mt-2">Memuat data transaksi...</p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 font-semibold uppercase">Belum ada transaksi terekam.</p>
                )}
              </div>
            ) : (
              <>
                {/* Desktop View */}
                <div className="hidden md:block overflow-x-auto rounded-2xl bg-white border border-slate-100 shadow-sm">
                  <table className="w-full border-collapse text-left text-xs font-sans text-obsidian min-w-[900px]">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 border-b border-slate-100">
                        <th className="p-3.5 font-semibold uppercase text-slate-500 tracking-wider text-[10px]">Invoice ID</th>
                        <th className="p-3.5 font-semibold uppercase text-slate-500 tracking-wider text-[10px]">Tanggal</th>
                        <th className="p-3.5 font-semibold uppercase text-slate-500 tracking-wider text-[10px]">Pelanggan</th>
                        <th className="p-3.5 font-semibold uppercase text-slate-500 tracking-wider text-[10px]">Email</th>
                        <th className="p-3.5 font-semibold uppercase text-slate-500 tracking-wider text-[10px]">Layanan</th>
                        <th className="p-3.5 font-semibold uppercase text-slate-500 tracking-wider text-[10px]">Total Transfer</th>
                        <th className="p-3.5 font-semibold uppercase text-slate-500 tracking-wider text-[10px]">Status</th>
                        <th className="p-3.5 font-semibold uppercase text-slate-500 tracking-wider text-[10px] text-center">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {transactions.map((tx: any) => {
                        let statusBg = 'bg-yellow-50 border border-yellow-250 text-yellow-800';
                        if (tx.status === 'SUCCESS') statusBg = 'bg-green-50 border border-green-250 text-green-800';
                        if (tx.status === 'CANCELLED') statusBg = 'bg-red-50 border border-red-250 text-red-800';

                        return (
                          <tr key={tx.orderId} className="hover:bg-slate-50/60 transition-colors border-b border-slate-100 last:border-b-0">
                            <td className="p-3 font-mono">
                              <span className="bg-orange-50/60 px-2.5 py-1 border border-orange-200/40 rounded font-semibold text-blaze-orange font-mono">
                                {tx.orderId}
                              </span>
                            </td>
                            <td className="p-3 font-semibold font-mono text-slate-400">{tx.createdAt}</td>
                            <td className="p-3 font-semibold text-slate-700 uppercase">{tx.customerName}</td>
                            <td className="p-3 font-mono text-slate-500">{tx.customerEmail}</td>
                            <td className="p-3 font-semibold text-slate-700 max-w-[200px] truncate" title={tx.items}>{tx.items}</td>
                            <td className="p-3 font-bold text-blaze-orange font-mono">{formatPrice(tx.totalAmount)}</td>
                            <td className="p-3">
                              <span className={`text-[9px] font-semibold px-2.5 py-1 rounded-full uppercase ${statusBg}`}>
                                {tx.status}
                              </span>
                            </td>
                            <td className="p-3 text-center">
                              <div className="flex items-center justify-center gap-2">
                                <select
                                  value={tx.status}
                                  disabled={isLoading}
                                  onChange={(e) => handleUpdateStatus(tx.orderId, e.target.value)}
                                  className="px-2.5 py-1 border border-slate-200 rounded-xl bg-white text-[9px] font-semibold uppercase focus:outline-none cursor-pointer text-slate-700 font-sans shadow-sm"
                                >
                                  <option value="PENDING">PENDING</option>
                                  <option value="SUCCESS">SUCCESS</option>
                                  <option value="CANCELLED">CANCELLED</option>
                                </select>

                                <button
                                  onClick={() => setPrintingTransaction(tx)}
                                  className="p-1.5 bg-slate-50 border border-slate-200 rounded-xl hover:bg-blaze-orange hover:text-white hover:border-blaze-orange transition-all cursor-pointer shadow-sm active:scale-95"
                                >
                                  <Printer className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile View */}
                <div className="block md:hidden space-y-4">
                  {transactions.map((tx: any) => {
                    let statusBg = 'bg-yellow-50 border border-yellow-250 text-yellow-800';
                    if (tx.status === 'SUCCESS') statusBg = 'bg-green-50 border border-green-250 text-green-800';
                    if (tx.status === 'CANCELLED') statusBg = 'bg-red-50 border border-red-250 text-red-800';

                    return (
                      <div key={tx.orderId} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="bg-orange-50/60 px-2.5 py-1 border border-orange-200/40 rounded font-semibold text-blaze-orange font-mono text-xs">
                            {tx.orderId}
                          </span>
                          <span className="font-semibold font-mono text-[10px] text-slate-400">{tx.createdAt}</span>
                        </div>
                        <div className="space-y-1 text-xs text-slate-600">
                          <div><span className="font-semibold text-slate-700 uppercase">Pelanggan:</span> {tx.customerName}</div>
                          <div><span className="font-semibold text-slate-700 uppercase">Email:</span> {tx.customerEmail}</div>
                          <div><span className="font-semibold text-slate-700 uppercase">Layanan:</span> {tx.items}</div>
                          <div><span className="font-semibold text-slate-700 uppercase">Total:</span> <span className="font-bold text-blaze-orange font-mono">{formatPrice(tx.totalAmount)}</span></div>
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-dashed border-slate-100">
                          <div>
                            <span className={`text-[9px] font-semibold px-2.5 py-1 rounded-full uppercase border ${statusBg}`}>
                              {tx.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <select
                              value={tx.status}
                              disabled={isLoading}
                              onChange={(e) => handleUpdateStatus(tx.orderId, e.target.value)}
                              className="px-2.5 py-1 border border-slate-200 rounded-xl bg-white text-[10px] font-semibold uppercase focus:outline-none cursor-pointer text-slate-700 font-sans shadow-sm"
                            >
                              <option value="PENDING">PENDING</option>
                              <option value="SUCCESS">SUCCESS</option>
                              <option value="CANCELLED">CANCELLED</option>
                            </select>

                            <button
                              onClick={() => setPrintingTransaction(tx)}
                              className="p-2 bg-slate-50 border border-slate-200 rounded-xl hover:bg-blaze-orange hover:text-white hover:border-blaze-orange transition-all cursor-pointer shadow-sm"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* TAB: SETTINGS & SECURITY */}
        {activeTab === 'settings' && (
          <div className="space-y-8 max-w-xl">
            <div>
              <h1 className="font-hero text-2xl sm:text-3xl font-bold text-slate-800 uppercase tracking-tight">PENGATURAN</h1>
              <p className="font-sans text-xs text-slate-500 font-medium mt-1">Konfigurasi endpoint database Google Sheets, ImgBB, dan keamanan akun.</p>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm space-y-6">
              {/* Connection Settings Form */}
              <div className="space-y-4">
                <h3 className="font-hero text-sm font-semibold text-slate-800 uppercase border-b border-slate-100 pb-2">Koneksi Database & API</h3>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">URL Google Sheets Web App</label>
                  <div className="flex gap-2">
                    <input
                      type={showSheetsUrl ? "text" : "password"}
                      value={sheetsUrl}
                      onChange={(e) => setSheetsUrl(e.target.value)}
                      className="flex-1 px-3 py-2 border border-slate-200 rounded-xl bg-white text-xs text-obsidian focus:outline-none focus:ring-2 focus:ring-blaze-orange/20 focus:border-blaze-orange font-mono"
                      placeholder="https://script.google.com/macros/s/.../exec"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!showSheetsUrl) {
                          triggerStrictAction(
                            'LIHAT DATA SENSITIF?',
                            'Apakah Anda yakin ingin melihat URL Google Sheets Web App? Data ini bersifat rahasia.',
                            'reveal_sheets_url'
                          );
                        } else {
                          setShowSheetsUrl(false);
                        }
                      }}
                      className="px-3 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-xl flex items-center justify-center cursor-pointer transition-colors shadow-sm"
                    >
                      {showSheetsUrl ? <EyeOff className="w-4 h-4 text-slate-500" /> : <Eye className="w-4 h-4 text-slate-500" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">API Key ImgBB (Upload Gambar)</label>
                  <div className="flex gap-2">
                    <input
                      type={showImgbbKey ? "text" : "password"}
                      value={imgbbKey}
                      onChange={(e) => setImgbbKey(e.target.value)}
                      className="flex-1 px-3 py-2 border border-slate-200 rounded-xl bg-white text-xs text-obsidian focus:outline-none focus:ring-2 focus:ring-blaze-orange/20 focus:border-blaze-orange font-mono"
                      placeholder="Masukkan token ImgBB API Key"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!showImgbbKey) {
                          triggerStrictAction(
                            'LIHAT DATA SENSITIF?',
                            'Apakah Anda yakin ingin melihat API Key ImgBB? Data ini bersifat rahasia.',
                            'reveal_imgbb_key'
                          );
                        } else {
                          setShowImgbbKey(false);
                        }
                      }}
                      className="px-3 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-xl flex items-center justify-center cursor-pointer transition-colors shadow-sm"
                    >
                      {showImgbbKey ? <EyeOff className="w-4 h-4 text-slate-500" /> : <Eye className="w-4 h-4 text-slate-500" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Gmail Admin Terdaftar (Untuk OTP & Reset)</label>
                  <input
                    type="email"
                    value={adminEmailSetting}
                    onChange={(e) => setAdminEmailSetting(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-xs text-obsidian focus:outline-none focus:ring-2 focus:ring-blaze-orange/20 focus:border-blaze-orange font-mono"
                    placeholder="namaadmin@gmail.com"
                  />
                  <p className="text-[10px] text-slate-400 font-medium mt-1">
                    *Kosongkan untuk otomatis menggunakan Gmail pemilik Web App Google Apps Script.
                  </p>
                </div>

                <button
                  onClick={() => triggerStrictAction(
                    'SIMPAN KONFIGURASI PENGATURAN?',
                    'Menyimpan konfigurasi URL Google Sheets, ImgBB key, atau Email Admin yang salah dapat menyebabkan kegagalan sinkronisasi dan login. Pastikan data sudah benar.',
                    'save_settings'
                  )}
                  disabled={isLoading}
                  className="px-4 py-2.5 bg-blaze-orange hover:bg-blaze-orange/90 text-white rounded-xl text-xs font-semibold tracking-wider uppercase transition-all duration-200 shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? 'MEMPROSES...' : 'Simpan Konfigurasi'}
                </button>
              </div>

              {/* Password Change Form via OTP */}
              <div className="space-y-4 border-t border-dashed border-slate-150 pt-6">
                <h3 className="font-hero text-sm font-semibold text-slate-800 uppercase border-b border-dashed border-slate-100 pb-2 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-blaze-orange" /> GANTI PASSWORD ADMIN VIA OTP
                </h3>

                {!changePasswordOtpSent ? (
                  <form onSubmit={handleSettingsSendResetOtp} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Gmail Admin Terdaftar</label>
                      <input
                        type="email"
                        readOnly
                        value={adminEmailSetting || localStorage.getItem('madfat_admin_email') || gmailInput || ''}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-xs text-slate-500 font-mono focus:outline-none cursor-not-allowed"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Password Baru</label>
                      <div className="flex gap-2">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          required
                          value={newPasswordInput}
                          onChange={(e) => setNewPasswordInput(e.target.value)}
                          className="flex-1 px-3 py-2 border border-slate-200 rounded-xl bg-white text-xs text-obsidian font-mono focus:outline-none"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="px-3 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-xl flex items-center justify-center cursor-pointer transition-colors shadow-sm"
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4 text-slate-500" /> : <Eye className="w-4 h-4 text-slate-500" />}
                        </button>
                      </div>
                    </div>

                    {changePasswordError && (
                      <p className="text-xs font-semibold text-[#B91C1C] bg-[#FEE2E2]/60 border border-[#B91C1C]/25 rounded-xl p-2">
                        {changePasswordError}
                      </p>
                    )}

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-4 py-2.5 bg-blaze-orange hover:bg-blaze-orange/90 text-white rounded-xl text-xs font-semibold tracking-wider uppercase transition-all duration-200 shadow-sm cursor-pointer disabled:opacity-50"
                    >
                      {isLoading ? 'MENGIRIM OTP...' : 'Kirim OTP Ganti Password'}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleSettingsResetPasswordSubmit} className="space-y-4">
                    <div className="bg-orange-50/50 border border-orange-100 rounded-xl p-3 text-center">
                      <span className="text-[10px] font-semibold text-blaze-orange uppercase">Email Tujuan OTP:</span>
                      <p className="text-xs font-mono font-bold text-slate-700">{adminEmailSetting || localStorage.getItem('madfat_admin_email') || gmailInput}</p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-600 uppercase mb-1">Masukkan Kode OTP 6-Digit</label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        value={changePasswordOtp}
                        onChange={(e) => setChangePasswordOtp(e.target.value.replace(/\D/g, ''))}
                        className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-center text-sm font-mono tracking-[0.3em] focus:outline-none text-obsidian"
                        placeholder="000000"
                      />
                    </div>

                    {changePasswordError && (
                      <p className="text-xs font-semibold text-[#B91C1C] bg-[#FEE2E2]/60 border border-[#B91C1C]/25 rounded-xl p-2">
                        {changePasswordError}
                      </p>
                    )}

                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setChangePasswordOtpSent(false);
                          setChangePasswordOtp('');
                          setChangePasswordError('');
                        }}
                        className="px-4 py-2 bg-slate-50 border border-slate-200 text-slate-600 font-semibold text-xs uppercase rounded-xl hover:bg-slate-100 transition-all cursor-pointer shadow-sm"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 py-2.5 bg-blaze-orange text-white rounded-xl hover:bg-blaze-orange/90 transition-all cursor-pointer font-semibold text-xs uppercase shadow-sm disabled:opacity-50"
                      >
                        {isLoading ? 'MEMPROSES...' : 'Verifikasi & Ganti Password'}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* -------------------------------------------------------------
          MODAL: ADD/EDIT PRODUCT
         ------------------------------------------------------------- */}
      {isProductModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6 overflow-y-auto">
          <div className="w-full max-w-xl bg-white border-t sm:border border-slate-100 rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 shadow-xl relative my-0 sm:my-8 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-3">
              <h2 className="font-hero text-sm font-semibold text-slate-850 uppercase">
                {editingProduct.name ? 'UBAH DATA PRODUK' : 'TAMBAH PRODUK DIGITAL'}
              </h2>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProductSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-650 uppercase mb-1">Product ID</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.id || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, id: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 font-mono bg-white focus:outline-none focus:ring-2 focus:ring-blaze-orange/20 focus:border-blaze-orange"
                    placeholder="Contoh: netflix-premium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-650 uppercase mb-1">Nama Produk</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blaze-orange/20 focus:border-blaze-orange"
                    placeholder="Contoh: Spotify Premium 1 Bulan"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-650 uppercase mb-1">Kategori</label>
                  <select
                    value={editingProduct.category || 'streaming'}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-850 bg-white focus:outline-none focus:ring-2 focus:ring-blaze-orange/20 focus:border-blaze-orange"
                  >
                    <option value="streaming">Streaming</option>
                    <option value="gaming">Gaming</option>
                    <option value="education">Education</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-650 uppercase mb-1">Harga (Angka)</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.price || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 font-mono bg-white focus:outline-none focus:ring-2 focus:ring-blaze-orange/20 focus:border-blaze-orange"
                    placeholder="Contoh: 35000"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-650 uppercase mb-1">Sub/Tag Deskripsi Singkat</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.sub || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, sub: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blaze-orange/20 focus:border-blaze-orange"
                    placeholder="UHD 4K Resolution & Anti Limit"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-650 uppercase mb-1">Gambar Produk</label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={editingProduct.image || ''}
                      onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                      className="flex-1 px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-850 bg-white focus:outline-none focus:ring-2 focus:ring-blaze-orange/20 focus:border-blaze-orange"
                      placeholder="https://..."
                    />
                    <label className="px-3 py-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-xl text-xs font-semibold uppercase cursor-pointer shrink-0 transition-colors flex items-center gap-1.5 text-slate-700 shadow-sm">
                      <Upload className="w-3.5 h-3.5" />
                      {uploadingImage ? 'UPLOADING...' : 'Upload'}
                      <input type="file" accept="image/*" className="hidden" onChange={handleProductImageUpload} disabled={uploadingImage} />
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-650 uppercase mb-1">Deskripsi Lengkap</label>
                <textarea
                  required
                  rows={3}
                  value={editingProduct.description || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blaze-orange/20 focus:border-blaze-orange"
                  placeholder="Deskripsi spesifikasi produk digital..."
                />
              </div>

              <div className="flex gap-4 py-1">
                <label className="flex items-center gap-2 text-xs font-semibold uppercase cursor-pointer select-none text-slate-700">
                  <input
                    type="checkbox"
                    checked={!!editingProduct.hot}
                    onChange={(e) => setEditingProduct({ ...editingProduct, hot: e.target.checked })}
                    className="accent-blaze-orange w-4 h-4 rounded border-slate-300 focus:ring-blaze-orange/20"
                  />
                  Tandai sebagai Produk HOT
                </label>
                <label className="flex items-center gap-2 text-xs font-semibold uppercase cursor-pointer select-none text-slate-700">
                  <input
                    type="checkbox"
                    checked={!!editingProduct.bestSeller}
                    onChange={(e) => setEditingProduct({ ...editingProduct, bestSeller: e.target.checked })}
                    className="accent-blaze-orange w-4 h-4 rounded border-slate-300 focus:ring-blaze-orange/20"
                  />
                  Tandai sebagai Best Seller
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading || uploadingImage}
                className="w-full py-2.5 bg-blaze-orange hover:bg-blaze-orange/90 text-white rounded-xl text-xs font-semibold tracking-wider uppercase transition-all duration-200 shadow-sm cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <Save className="w-4 h-4" /> {isLoading ? 'MENYIMPAN...' : 'Simpan Data Produk'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          MODAL: ADD/EDIT WEBSITE PACKAGE
         ------------------------------------------------------------- */}
      {isPackageModalOpen && editingPackage && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-6 overflow-y-auto">
          <div className="w-full max-w-xl bg-white border-t sm:border border-slate-100 rounded-t-3xl sm:rounded-2xl p-5 sm:p-6 shadow-xl relative my-0 sm:my-8 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-3">
              <h2 className="font-hero text-sm font-semibold text-slate-850 uppercase">
                {editingPackage.name ? 'UBAH PAKET WEBSITE' : 'TAMBAH PAKET WEBSITE'}
              </h2>
              <button
                onClick={() => setIsPackageModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePackageSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-650 uppercase mb-1">Package ID</label>
                  <input
                    type="text"
                    required
                    value={editingPackage.id || ''}
                    onChange={(e) => setEditingPackage({ ...editingPackage, id: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 font-mono bg-white focus:outline-none focus:ring-2 focus:ring-blaze-orange/20 focus:border-blaze-orange"
                    placeholder="Contoh: bundle-a"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-650 uppercase mb-1">Nama Paket</label>
                  <input
                    type="text"
                    required
                    value={editingPackage.name || ''}
                    onChange={(e) => setEditingPackage({ ...editingPackage, name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blaze-orange/20 focus:border-blaze-orange"
                    placeholder="Contoh: LANDING PAGE BASIC"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-650 uppercase mb-1">Kategori Tag</label>
                  <input
                    type="text"
                    required
                    value={editingPackage.categoryName || ''}
                    onChange={(e) => setEditingPackage({ ...editingPackage, categoryName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blaze-orange/20 focus:border-blaze-orange"
                    placeholder="Contoh: BASIC PACKAGE"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-650 uppercase mb-1">Harga Base (Angka)</label>
                  <input
                    type="number"
                    required
                    value={editingPackage.price || ''}
                    onChange={(e) => setEditingPackage({ ...editingPackage, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 font-mono bg-white focus:outline-none focus:ring-2 focus:ring-blaze-orange/20 focus:border-blaze-orange"
                    placeholder="Contoh: 300000"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-650 uppercase mb-1">Harga Tampilan (Teks)</label>
                  <input
                    type="text"
                    required
                    value={editingPackage.priceText || ''}
                    onChange={(e) => setEditingPackage({ ...editingPackage, priceText: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blaze-orange/20 focus:border-blaze-orange"
                    placeholder="Contoh: Rp 300K - 550K"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-650 uppercase mb-1">Tombol Teks / Badge</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={editingPackage.btnText || ''}
                      onChange={(e) => setEditingPackage({ ...editingPackage, btnText: e.target.value })}
                      className="px-2.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blaze-orange/20 focus:border-blaze-orange"
                      placeholder="Btn: PILIH PAKET"
                    />
                    <input
                      type="text"
                      value={editingPackage.badge || ''}
                      onChange={(e) => setEditingPackage({ ...editingPackage, badge: e.target.value })}
                      className="px-2.5 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blaze-orange/20 focus:border-blaze-orange"
                      placeholder="Badge: POPULER"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-650 uppercase mb-1">Deskripsi Ringkas</label>
                <textarea
                  required
                  rows={2}
                  value={editingPackage.sub || ''}
                  onChange={(e) => setEditingPackage({ ...editingPackage, sub: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blaze-orange/20 focus:border-blaze-orange"
                  placeholder="Keterangan singkat paket..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-650 uppercase mb-1">Fitur Utama (Pisahkan dengan koma `,` )</label>
                <textarea
                  required
                  rows={3}
                  value={Array.isArray(editingPackage.features) ? editingPackage.features.join(', ') : editingPackage.features || ''}
                  onChange={(e) => setEditingPackage({ ...editingPackage, features: e.target.value.split(',').map(f => f.trim()) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs text-slate-800 font-mono bg-white focus:outline-none focus:ring-2 focus:ring-blaze-orange/20 focus:border-blaze-orange"
                  placeholder="Contoh: SEO Friendly, Domain .com Gratis, Custom CSS"
                />
              </div>

              <div className="py-1">
                <label className="flex items-center gap-2 text-xs font-semibold uppercase cursor-pointer select-none text-slate-700">
                  <input
                    type="checkbox"
                    checked={!!editingPackage.isFeatured}
                    onChange={(e) => setEditingPackage({ ...editingPackage, isFeatured: e.target.checked })}
                    className="accent-blaze-orange w-4 h-4 rounded border-slate-300 focus:ring-blaze-orange/20"
                  />
                  Tandai Paket Unggulan (Featured)
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-blaze-orange hover:bg-blaze-orange/90 text-white rounded-xl text-xs font-semibold tracking-wider uppercase transition-all duration-200 shadow-sm cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                <Save className="w-4 h-4" /> {isLoading ? 'MENYIMPAN...' : 'Simpan Data Paket'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          FLOATING BULK ACTIONS BAR
         ------------------------------------------------------------- */}
      {(selectedProductIds.length > 0 || selectedPackageIds.length > 0) && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-2rem)] max-w-md bg-white border border-slate-100 p-4 rounded-2xl shadow-xl flex items-center justify-between gap-4 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="flex flex-col">
            <span className="font-hero text-xs font-semibold text-slate-800 uppercase">
              {selectedProductIds.length > 0 ? `${selectedProductIds.length} Produk` : `${selectedPackageIds.length} Paket`} Terpilih
            </span>
            <span className="text-[10px] text-slate-400 font-semibold uppercase mt-0.5">Aksi Massal Terpilih</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setSelectedProductIds([]);
                setSelectedPackageIds([]);
                setIsProductBulkMode(false);
                setIsPackageBulkMode(false);
              }}
              className="px-3 py-1.5 border border-slate-200 text-slate-650 rounded-xl hover:bg-slate-50 text-[10px] font-semibold uppercase cursor-pointer transition-colors"
            >
              Batal
            </button>
            <button
              onClick={() => {
                if (selectedProductIds.length > 0) {
                  triggerStrictAction(
                    'HAPUS BULK PRODUK?',
                    `Apakah Anda yakin ingin menghapus ${selectedProductIds.length} produk terpilih? Tindakan ini akan menghapus data permanen di Google Sheets.`,
                    'bulk_delete_products',
                    undefined,
                    { ids: selectedProductIds }
                  );
                } else if (selectedPackageIds.length > 0) {
                  triggerStrictAction(
                    'HAPUS BULK PAKET?',
                    `Apakah Anda yakin ingin menghapus ${selectedPackageIds.length} paket website terpilih? Tindakan ini akan menghapus data permanen di Google Sheets.`,
                    'bulk_delete_packages',
                    undefined,
                    { ids: selectedPackageIds }
                  );
                }
              }}
              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-[10px] font-semibold uppercase cursor-pointer transition-colors shadow-sm"
            >
              Hapus ({selectedProductIds.length > 0 ? selectedProductIds.length : selectedPackageIds.length})
            </button>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          MODAL: CONFIRM ACTIONS
         ------------------------------------------------------------- */}
      {confirmModal?.isOpen && (
        <div className="fixed inset-0 z-[110] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-slate-100 rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="font-sans text-sm font-semibold text-slate-850 uppercase mb-2">{confirmModal.title}</h3>
            <p className="text-xs font-medium text-slate-500 mb-6 leading-relaxed uppercase">{confirmModal.message}</p>
            <div className="flex gap-2.5 justify-end text-xs font-semibold uppercase">
              <button
                onClick={() => setConfirmModal(null)}
                className="px-4 py-2 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-700 cursor-pointer transition-all active:scale-95"
              >
                BATAL
              </button>
              <button
                onClick={handleConfirmAction}
                disabled={isLoading}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl cursor-pointer transition-all active:scale-95 disabled:opacity-50"
              >
                {isLoading ? 'MEMPROSES...' : 'YA, KONFIRMASI'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PRINT SLIP NOTIFICATION (CUTE RECEIPTS REDESIGN) */}
      {printingTransaction && (() => {
        // Parse items dynamically to get unit price and subtotal
        const itemsList = printingTransaction.items ? printingTransaction.items.split(',') : [];
        const totalAmount = Number(printingTransaction.totalAmount) || 0;

        const parsedItems = itemsList.map((itemStr: string) => {
          const trimmed = itemStr.trim();
          const match = trimmed.match(/(.*?)\s*\((\d+)x\)/);
          let name = trimmed;
          let qty = 1;
          if (match) {
            name = match[1].trim();
            qty = parseInt(match[2], 10) || 1;
          }

          let unitPrice = 0;
          const foundProduct = products.find(p => p.name.toLowerCase() === name.toLowerCase() || p.id.toLowerCase() === name.toLowerCase() || p.name.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(p.name.toLowerCase()));
          const foundPackage = websitePackages.find(p => p.name.toLowerCase() === name.toLowerCase() || p.id.toLowerCase() === name.toLowerCase() || p.name.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(p.name.toLowerCase()));

          if (foundProduct) {
            unitPrice = foundProduct.price;
          } else if (foundPackage) {
            unitPrice = foundPackage.price;
          } else {
            if (itemsList.length === 1) {
              unitPrice = totalAmount / qty;
            } else {
              unitPrice = 0;
            }
          }

          const subtotal = unitPrice * qty;
          return { name, qty, unitPrice, subtotal };
        });

        // Distribute or fix unitPrice if it resolved to 0 and we have a totalAmount
        const totalSubtotal = parsedItems.reduce((acc: number, curr: any) => acc + curr.subtotal, 0);
        if (totalSubtotal === 0 && totalAmount > 0 && parsedItems.length > 0) {
          const splitAmount = Math.round(totalAmount / parsedItems.length);
          parsedItems.forEach((item: any) => {
            item.unitPrice = Math.round(splitAmount / item.qty);
            item.subtotal = item.unitPrice * item.qty;
          });
        }

        return (
          <div className="print-receipt-modal-container fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 print:p-0 print:static print:bg-white print:z-0 overflow-y-auto">
            <style>{`
              @media print {
                html, body {
                  visibility: hidden !important;
                  background: white !important;
                  height: auto !important;
                  min-height: 100% !important;
                  margin: 0 !important;
                  padding: 0 !important;
                }
                #root, .route-content, main, .min-h-screen {
                  visibility: hidden !important;
                  height: auto !important;
                  min-height: auto !important;
                  padding: 0 !important;
                  margin: 0 !important;
                  transform: none !important;
                  perspective: none !important;
                }
                .print-receipt-modal-container {
                  visibility: visible !important;
                  position: fixed !important;
                  left: 0 !important;
                  top: 0 !important;
                  width: 100vw !important;
                  height: 100vh !important;
                  background: white !important;
                  z-index: 9999999 !important;
                  display: flex !important;
                  justify-content: center !important;
                  align-items: flex-start !important;
                  padding-top: 1.5cm !important;
                  margin: 0 !important;
                }
                .print-receipt-content,
                .print-receipt-content * {
                  visibility: visible !important;
                }
                .print-receipt-content {
                  position: relative !important;
                  left: auto !important;
                  top: auto !important;
                  transform: none !important;
                  width: 16cm !important;
                  max-width: 16cm !important;
                  border: 1px solid #1e293b !important;
                  background: #ffffff !important;
                  box-shadow: none !important;
                  padding: 1.5cm !important;
                  box-sizing: border-box !important;
                  border-radius: 0px !important;
                  margin: 0 auto !important;
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }
                /* Spacious PDF Print Overrides */
                .print-receipt-content .invoice-header {
                  padding-bottom: 24px !important;
                  margin-bottom: 32px !important;
                  border-bottom: 1.5px solid #334155 !important;
                }
                .print-receipt-content .invoice-header h1 {
                  font-size: 1.875rem !important; /* text-3xl */
                }
                .print-receipt-content .billing-grid {
                  padding-bottom: 32px !important;
                  margin-bottom: 32px !important;
                  gap: 32px !important;
                  font-size: 13px !important;
                  border-bottom: 1px dashed #64748b !important;
                }
                .print-receipt-content .billing-grid div {
                  font-size: 13px !important;
                }
                .print-receipt-content .billing-grid span.font-hero {
                  font-size: 10px !important;
                  font-weight: bold !important;
                }
                .print-receipt-content .billing-grid span.font-mono {
                  font-size: 13px !important;
                  padding-left: 6px !important;
                  padding-right: 6px !important;
                }
                .print-receipt-content .details-section {
                  padding-bottom: 32px !important;
                  margin-bottom: 16px !important;
                }
                .print-receipt-content .details-section > span {
                  font-size: 10px !important;
                  font-weight: bold !important;
                }
                .print-receipt-content .details-table td .unit-price-label {
                  font-size: 11px !important;
                  font-style: italic !important;
                }
                .print-receipt-content .details-table {
                  border: 1px solid #334155 !important;
                  font-size: 13.5px !important;
                }
                .print-receipt-content .details-table th,
                .print-receipt-content .details-table td {
                  padding: 16px !important;
                  border: 1px solid #334155 !important;
                }
                .print-receipt-content .divider-line {
                  margin-bottom: 32px !important;
                  border-bottom: 1.5px solid #334155 !important;
                }
                .print-receipt-content .total-box {
                  padding: 20px !important;
                  margin-bottom: 32px !important;
                  border: 1.5px solid #334155 !important;
                  border-radius: 16px !important;
                  background-color: #f8fafc !important;
                }
                .print-receipt-content .total-box span {
                  font-size: 16px !important;
                }
                .print-receipt-content .thankyou-footer {
                  padding-top: 16px !important;
                  font-size: 11px !important;
                }
                .print-hidden,
                .print-hidden * {
                  display: none !important;
                  visibility: hidden !important;
                }
                @page {
                  size: A4 portrait;
                  margin: 0 !important;
                }
              }
            `}</style>
            
            <div className="print-receipt-content bg-white border border-slate-300 rounded-2xl p-6 max-w-sm w-full shadow-xl print:shadow-none print:border print:border-slate-800 print:max-w-[640px] print:my-0 relative font-mono text-[11px] text-slate-950 overflow-hidden my-8">
              {/* Header block with close button */}
              <div className="flex justify-between items-center pb-2 print-hidden mb-4 border-b border-dashed border-slate-200">
                <span className="font-hero text-[10px] font-bold uppercase text-slate-700">Nota Belanja Lunas</span>
                <button onClick={() => setPrintingTransaction(null)} className="p-1.5 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-50 cursor-pointer transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Invoice Header */}
              <div className="invoice-header grid grid-cols-2 pb-4 border-b border-slate-300 mb-4 items-center">
                <div>
                  <h1 className="font-hero text-lg font-bold text-slate-950 uppercase tracking-tight">INVOICE</h1>
                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[8px] font-extrabold px-2 py-0.5 rounded-full uppercase mt-1 inline-block">
                    LUNAS / PAID
                  </span>
                </div>
                <div className="text-right">
                  <div className="flex justify-end items-center gap-1">
                    <span className="font-hero text-sm font-bold text-slate-950 tracking-tight">MADFAT STORE</span>
                  </div>
                  <span className="text-[8px] font-bold text-slate-700 uppercase block mt-0.5">Digital Store & Web Dev</span>
                </div>
              </div>

              {/* Info Billing Grid */}
              <div className="billing-grid grid grid-cols-2 gap-4 pb-4 border-b border-dashed border-slate-350 mb-4 text-[10px]">
                <div>
                  <span className="font-hero text-[8px] font-extrabold text-slate-700 uppercase block mb-1">DITERBITKAN UNTUK:</span>
                  <div className="font-extrabold text-slate-950 uppercase">{printingTransaction.customerName}</div>
                  <div className="text-slate-800 text-[9px] font-semibold mt-0.5">{printingTransaction.customerEmail}</div>
                </div>
                <div>
                  <span className="font-hero text-[8px] font-extrabold text-slate-700 uppercase block mb-1">METADATA NOTA:</span>
                  <div className="font-extrabold text-slate-950">INV ID: <span className="bg-slate-50 px-2 py-0.5 border border-slate-300 rounded font-mono text-[10px] font-extrabold">{printingTransaction.orderId.startsWith('#') ? printingTransaction.orderId : `#${printingTransaction.orderId}`}</span></div>
                  <div className="text-slate-800 text-[9px] font-semibold mt-1">Tanggal: {printingTransaction.createdAt}</div>
                </div>
              </div>

              {/* Items Detail */}
              <div className="details-section pb-4 mb-2">
                <span className="font-hero text-[8px] font-extrabold text-slate-700 uppercase block mb-2">DETAIL PEMBELIAN:</span>
                <table className="details-table w-full text-left text-[10px] border border-slate-300 border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-300">
                      <th className="p-2 font-bold uppercase border-r border-slate-300 text-slate-900 tracking-tight">DESKRIPSI LAYANAN / ITEM</th>
                      <th className="p-2 font-bold uppercase text-right w-1/3 text-slate-900 tracking-tight">HARGA</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsedItems.map((item: any, idx: number) => (
                      <tr key={idx} className="border-b border-slate-300 last:border-b-0">
                        <td className="p-2 border-r border-slate-300 align-top text-slate-950">
                          <div className="font-bold">{idx + 1}. {item.name} ({item.qty}x)</div>
                          <div className="unit-price-label text-[10px] text-slate-700 font-mono font-medium italic mt-0.5">
                            Harga Satuan: {formatPrice(item.unitPrice)}
                          </div>
                        </td>
                        <td className="p-2 text-right align-top font-mono text-slate-950 font-bold">
                          {formatPrice(item.subtotal)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Divider Line */}
              <div className="divider-line border-b border-slate-300 mb-4" />

              {/* Total Box */}
              <div className="total-box flex justify-between items-center bg-slate-50 border border-slate-350 p-3 rounded-xl mb-4">
                <span className="font-hero text-xs font-bold uppercase text-slate-700">TOTAL DIKIRIM (PAID):</span>
                <span className="text-xs sm:text-sm font-bold text-blaze-orange font-mono">
                  {formatPrice(printingTransaction.totalAmount)}
                </span>
              </div>

               {/* Thank you footer */}
              <div className="thankyou-footer text-center pt-2 text-[10px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                *** Terima kasih telah berbelanja di Madfat Store ***
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-2 mt-6 print-hidden font-semibold uppercase text-[9px] border-t border-dashed border-slate-100 pt-3">
                <button 
                  onClick={() => {
                    const originalTitle = document.title;
                    document.title = `${printingTransaction.orderId} - ${printingTransaction.customerName}`;
                    window.print();
                    setTimeout(() => {
                      document.title = originalTitle;
                    }, 100);
                  }}
                  className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl cursor-pointer transition-colors shadow-sm"
                >
                  Cetak Nota
                </button>
                <button 
                  onClick={() => setPrintingTransaction(null)}
                  className="px-3.5 py-2 bg-blaze-orange hover:bg-blaze-orange/90 text-white rounded-xl cursor-pointer transition-colors shadow-sm"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
