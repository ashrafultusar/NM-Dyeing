"use client";

import { useRouter } from "next/navigation";
import React, {
  useEffect,
  useState,
  use,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  FaArrowLeft,
  FaChevronDown,
  FaLock,
  FaCheckCircle,
  FaEdit,
  FaPrint,
} from "react-icons/fa";
import { toast } from "react-toastify";

import SaveInvoiceModal from "@/components/SaveInvoiceModal";
import CustomerSavedBillsTab from "@/components/customer/CustomerSavedBillsTab";
import InitialAmountModal from "@/components/customer/InitialAmountModal";
import CloseModal from "@/components/customer/CloseModal";
import LedgerTable from "@/components/customer/LedgerTable";
import SummaryFooter from "@/components/customer/SummaryFooter";
import { buildLedger, fmtDate } from "@/components/customer/ledgerUtils";
import LedgerPrint from "@/components/Print/ledger/LedgerPrint";

export default function CustomerProfileLedger({ params }) {
  const resolvedParams = use(params);
  const customerId = resolvedParams?.customerId;
  const router = useRouter();

  const [selectedView, setSelectedView] = useState("current");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [closeLoading, setCloseLoading] = useState(false);
  const [showInitialModal, setShowInitialModal] = useState(false);
  const [initialLoading, setInitialLoading] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);

  const printRef = useRef(null);

  const [customer, setCustomer] = useState(null);
  const [currentLedger, setCurrentLedger] = useState([]);
  const [openingBalance, setOpeningBalance] = useState(0);
  const [initialCharge, setInitialCharge] = useState(0);
  const [initialPayment, setInitialPayment] = useState(0);
  const [initialDate, setInitialDate] = useState(null);
  const [snapshots, setSnapshots] = useState([]);
  const [snapshotCache, setSnapshotCache] = useState({});
  const [pageLoading, setPageLoading] = useState(true);
  const [selectedRows, setSelectedRows] = useState([]);
  const [isSavingSelected, setIsSavingSelected] = useState(false);
  const [activeTab, setActiveTab] = useState("ledger");

  const fetchCurrentLedger = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/customers/ledger/${customerId}?_t=${Date.now()}`
      );
      const result = await res.json();
      if (result.success) {
        const {
          customer: c,
          billings,
          payments,
          openingBalance: ob = 0,
          initialCharge: ic = 0,
          initialPayment: ip = 0,
          initialDate: id = null,
          savedRecordIds = [],
        } = result.data;
        setCustomer(c);
        setOpeningBalance(ob);
        setInitialCharge(ic);
        setInitialPayment(ip);
        setInitialDate(id);
        setCurrentLedger(
          buildLedger(billings, payments, ob, ic, ip, savedRecordIds)
        );
      }
    } catch {
      toast.error("Failed to load ledger");
    }
  }, [customerId]);

  const fetchSnapshots = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/customers/ledger/${customerId}/snapshots?_t=${Date.now()}`
      );
      const result = await res.json();
      if (result.success) setSnapshots(result.snapshots);
    } catch {
      toast.error("Failed to load snapshots");
    }
  }, [customerId]);

  useEffect(() => {
    if (!customerId) return;
    Promise.all([fetchCurrentLedger(), fetchSnapshots()]).finally(() =>
      setPageLoading(false)
    );
  }, [customerId, fetchCurrentLedger, fetchSnapshots]);

  const loadSnapshot = useCallback(
    async (snapshotId) => {
      if (snapshotCache[snapshotId]) return;
      try {
        const res = await fetch(
          `/api/customers/ledger/${customerId}/snapshots/${snapshotId}?_t=${Date.now()}`
        );
        const result = await res.json();
        if (result.success)
          setSnapshotCache((prev) => ({
            ...prev,
            [snapshotId]: result.snapshot,
          }));
      } catch {
        toast.error("Failed to load snapshot");
      }
    },
    [customerId, snapshotCache]
  );

  useEffect(() => {
    if (selectedView !== "current") loadSnapshot(selectedView);
  }, [selectedView, loadSnapshot]);

  const handleSaveSelected = async (title, saveMode) => {
    if (!selectedRows.length) return;

    let payloadRecords = [...selectedRows];

    if (saveMode === "ledger") {
      try {
        const invRes = await fetch(
          `/api/customers/ledger/${customerId}/saved-invoices?view=${selectedView}&_t=${Date.now()}`
        );
        const invData = await invRes.json();
        const savedInvoices = invData.success ? invData.invoices : [];

        let bal = 0;
        let foundBalance = false;

        if (savedInvoices.length > 0) {
          const sortedInvoices = savedInvoices.sort(
            (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
          );
          const lastInvoice = sortedInvoices[0];

          if (lastInvoice.records && lastInvoice.records.length > 0) {
            const recordWithBalance = [...lastInvoice.records]
              .reverse()
              .find((r) => r.balance !== undefined && r.balance !== null);
            if (recordWithBalance) {
              bal = recordWithBalance.balance;
              foundBalance = true;
            }
          }
        }

        if (foundBalance) {
          let prevDueAmt = 0;
          let isCharge = true;

          if (bal < 0) {
            prevDueAmt = Math.abs(bal);
            isCharge = true;
          } else if (bal > 0) {
            prevDueAmt = bal;
            isCharge = false;
          }

          if (prevDueAmt > 0) {
            payloadRecords.unshift({
              date: new Date().toISOString(),
              description: isCharge
                ? "Previous Due"
                : "Previous Ledger Balance (Payment)",
              charge: isCharge ? prevDueAmt : 0,
              payment: isCharge ? 0 : prevDueAmt,
              provider: "SYSTEM",
              type: isCharge ? "debit" : "credit",
              companyName: customer?.companyName || "—",
            });
          }
        } else {
          if (initialCharge > 0 || initialPayment > 0) {
            payloadRecords.unshift({
              date: new Date().toISOString(),
              description:
                initialPayment > 0 && initialCharge === 0
                  ? "Previous Ledger Balance (Payment)"
                  : "Previous Ledger Balance / Due",
              charge: initialCharge > 0 ? initialCharge : 0,
              payment: initialPayment > 0 ? initialPayment : 0,
              provider: "SYSTEM",
              type: initialCharge > 0 ? "debit" : "credit",
              companyName: customer?.companyName || "—",
            });
          }
        }
      } catch (error) {
        console.error("Failed to fetch previous due:", error);
      }
    }

    setIsSavingSelected(true);
    const totalCharge = payloadRecords.reduce((a, b) => a + (b.charge || 0), 0);
    const totalPayment = payloadRecords.reduce(
      (a, b) => a + (b.payment || 0),
      0
    );

    try {
      const res = await fetch(
        `/api/customers/ledger/${customerId}/saved-invoices`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title,
            records: payloadRecords,
            totalCharge,
            totalPayment,
          }),
        }
      );
      const result = await res.json();
      if (result.success) {
        toast.success("Invoice সফলভাবে সেভ হয়েছে!");
        setSelectedRows([]);
        setShowSaveModal(false);
        await fetchCurrentLedger();
      } else {
        toast.error(result.message || "Failed to save selected bills");
      }
    } catch {
      toast.error("Server Error");
    } finally {
      setIsSavingSelected(false);
    }
  };

  const handleClose = async (title) => {
    setCloseLoading(true);
    try {
      const res = await fetch(`/api/customers/ledger/${customerId}/close`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success("Ledger সফলভাবে close হয়েছে!");
        setShowCloseModal(false);
        setSelectedView("current");
        setSnapshotCache({});
        await Promise.all([fetchCurrentLedger(), fetchSnapshots()]);
      } else {
        toast.error(result.message || "Close করতে সমস্যা হয়েছে");
      }
    } catch {
      toast.error("Server error");
    } finally {
      setCloseLoading(false);
    }
  };

  const handleSetInitialAmount = async (charge, payment, date) => {
    setInitialLoading(true);
    try {
      const res = await fetch(`/api/customers/${customerId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          initialCharge: charge,
          initialPayment: payment,
          initialDate: date,
        }),
      });
      const result = await res.json();
      if (result.success) {
        toast.success("Initial amount সেট হয়েছে!");
        setShowInitialModal(false);
        await fetchCurrentLedger();
      } else {
        toast.error(result.error || "সমস্যা হয়েছে");
      }
    } catch {
      toast.error("Server error");
    } finally {
      setInitialLoading(false);
    }
  };

  const handlePrint = () => {
    if (!printRef.current) return;
    const printArea = printRef.current.cloneNode(true);
    const tempDiv = document.createElement("div");
    tempDiv.className = "print-only";
    tempDiv.appendChild(printArea);
    document.body.appendChild(tempDiv);
    window.print();
    setTimeout(() => {
      document.body.removeChild(tempDiv);
    }, 500);
  };

  const isCurrentView = selectedView === "current";
  const activeSnapshot = isCurrentView ? null : snapshotCache[selectedView];
  const displayRows = isCurrentView
    ? currentLedger
    : activeSnapshot?.ledgerData ?? [];
  const displayOpeningBalance = isCurrentView
    ? openingBalance
    : activeSnapshot?.openingBalance ?? 0;
  const currentInitialCharge = isCurrentView
    ? initialCharge
    : activeSnapshot?.initialCharge ?? 0;
  const currentInitialPayment = isCurrentView
    ? initialPayment
    : activeSnapshot?.initialPayment ?? 0;
  const totalCharge = useMemo(
    () =>
      currentInitialCharge +
      displayRows.reduce((s, r) => s + (r.charge || 0), 0),
    [displayRows, currentInitialCharge]
  );
  const totalPayment = useMemo(
    () =>
      currentInitialPayment +
      displayRows.reduce((s, r) => s + (r.payment || 0), 0),
    [displayRows, currentInitialPayment]
  );
  const finalBalance = useMemo(
    () => displayOpeningBalance + totalPayment - totalCharge,
    [displayOpeningBalance, totalPayment, totalCharge]
  );
  const selectedLabel = isCurrentView
    ? "📂 Current Ledger"
    : snapshots.find((s) => s._id === selectedView)?.title ?? "Closed Ledger";
  if (pageLoading)
    return (
      <div className="p-10 text-center font-bold text-gray-500 animate-pulse uppercase">
        Generating Statement...
      </div>
    );

  return (
    <>
      {showCloseModal && (
        <CloseModal
          onClose={() => setShowCloseModal(false)}
          onConfirm={handleClose}
          loading={closeLoading}
        />
      )}
      {showInitialModal && (
        <InitialAmountModal
          initCharge={initialCharge}
          initPayment={initialPayment}
          initDate={initialDate}
          onClose={() => setShowInitialModal(false)}
          onConfirm={handleSetInitialAmount}
          loading={initialLoading}
        />
      )}
      {showSaveModal && (
        <SaveInvoiceModal
          onClose={() => setShowSaveModal(false)}
          onConfirm={handleSaveSelected}
          loading={isSavingSelected}
        />
      )}
      <div className="mt-10 md:mt-8 lg:mt-1 max-w-6xl mx-auto p-3 sm:p-6 min-h-screen ">
        <button
          onClick={() => router.back()}
          className=" flex items-center gap-2 bg-blue-100 px-2 py-1 rounded text-gray-600 hover:text-blue-600 font-bold text-sm mb-4 print:hidden cursor-pointer"
        >
          <FaArrowLeft size={14} /> BACK
        </button>
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden print:border-none print:shadow-none">
          <div className="border-b border-gray-100 bg-gray-50 flex print:hidden">
            <button
              onClick={() => setActiveTab("ledger")}
              className={`cursor-pointer flex-1 py-4 text-sm font-black uppercase tracking-wider transition-colors ${
                activeTab === "ledger"
                  ? "text-indigo-600 border-b-2 border-indigo-600 bg-white"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
            >
              Ledger Statement
            </button>
            <button
              onClick={() => setActiveTab("saved-bills")}
              className={`flex-1 cursor-pointer py-4 text-sm font-black uppercase tracking-wider transition-colors ${
                activeTab === "saved-bills"
                  ? "text-purple-600 border-b-2 border-purple-600 bg-white"
                  : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
              }`}
            >
              Saved Invoices
            </button>
          </div>

          <div className="p-5 sm:p-8 border-b border-gray-100 bg-white">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-black text-gray-900 uppercase">
                  {activeTab === "ledger"
                    ? "Ledger Statement"
                    : "Saved Bills / Invoices"}
                </h1>
                <div className="mt-4 space-y-1">
                  <p className="font-bold text-blue-600 text-lg">
                    {customer?.companyName}
                  </p>
                  <p className="text-xs text-gray-500 uppercase font-bold">
                    Owner: {customer?.ownerName} | Phone:{" "}
                    {customer?.phoneNumber}
                  </p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest">
                    {customer?.address}
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto print:hidden flex-wrap">
                {activeTab === "ledger" &&
                  isCurrentView &&
                  selectedRows.length > 0 && (
                    <button
                      onClick={() => setShowSaveModal(true)}
                      disabled={isSavingSelected}
                      className="flex cursor-pointer items-center gap-2 bg-indigo-600 text-white border border-indigo-700 rounded-xl px-4 py-2.5 text-xs font-bold hover:bg-indigo-700 transition w-full sm:w-auto whitespace-nowrap disabled:opacity-50 shadow-sm"
                    >
                      {isSavingSelected
                        ? "Saving..."
                        : `Save Selected (${selectedRows.length})`}
                    </button>
                  )}
                {activeTab === "ledger" && (
                  <div className="relative">
                    <button
                      onClick={() => setDropdownOpen((p) => !p)}
                      className="flex cursor-pointer items-center gap-2 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-bold text-gray-700 hover:bg-gray-50 transition w-full sm:w-auto whitespace-nowrap"
                    >
                      {selectedLabel}
                      <FaChevronDown
                        size={10}
                        className={`transition-transform ${
                          dropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {dropdownOpen && (
                      <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-100 z-40 py-1 overflow-hidden ">
                        <button
                          onClick={() => {
                            setSelectedView("current");
                            setDropdownOpen(false);
                          }}
                          className={`w-full text-left cursor-pointer px-4 py-2.5 text-xs font-bold hover:bg-blue-50 flex items-center gap-2 transition ${
                            isCurrentView
                              ? "text-blue-600 bg-blue-50"
                              : "text-gray-700"
                          }`}
                        >
                          📂 Current Ledger{" "}
                          {isCurrentView && (
                            <FaCheckCircle
                              size={10}
                              className="ml-auto text-blue-500"
                            />
                          )}
                        </button>
                        {snapshots.length > 0 && (
                          <>
                            <div className="border-t border-gray-100 my-1" />
                            <p className="px-4 py-1 text-[9px] text-gray-400 font-black uppercase tracking-widest cursor-pointer">
                              Closed Ledgers
                            </p>
                            {snapshots.map((snap) => (
                              <button
                                key={snap._id}
                                onClick={() => {
                                  setSelectedView(snap._id);
                                  setDropdownOpen(false);
                                }}
                                className={`w-full text-left px-4 py-2.5 hover:bg-gray-50 transition cursor-pointer flex items-start gap-2 ${
                                  selectedView === snap._id ? "bg-gray-50" : ""
                                }`}
                              >
                                <FaLock
                                  size={9}
                                  className="text-gray-400 mt-0.5 shrink-0"
                                />
                                <div>
                                  <p className="text-xs font-bold text-gray-800">
                                    {snap.title}
                                  </p>
                                  <p className="text-[10px] text-gray-400">
                                    {fmtDate(snap.closedAt)}
                                  </p>
                                </div>
                                {selectedView === snap._id && (
                                  <FaCheckCircle
                                    size={10}
                                    className="ml-auto text-blue-500 mt-0.5 shrink-0"
                                  />
                                )}
                              </button>
                            ))}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}
                {activeTab === "ledger" && isCurrentView && (
                  <button
                    onClick={() => setShowInitialModal(true)}
                    className="flex cursor-pointer items-center gap-2 bg-indigo-500 text-white px-4 py-2.5 rounded-xl text-xs font-black hover:bg-indigo-600 transition whitespace-nowrap"
                  >
                    <FaEdit size={10} />{" "}
                    {initialCharge > 0 || initialPayment > 0
                      ? "Edit Initial"
                      : "Set Initial"}
                  </button>
                )}
                {activeTab === "ledger" &&
                  isCurrentView &&
                  currentLedger.length > 0 && (
                    <button
                      onClick={() => setShowCloseModal(true)}
                      className="flex items-center gap-2 bg-red-500 text-white px-4 py-2.5 rounded-xl text-xs font-black hover:bg-red-600 transition whitespace-nowrap"
                    >
                      <FaLock size={10} /> Close Ledger
                    </button>
                  )}
                {activeTab === "ledger" && (
                  <button
                    onClick={handlePrint}
                    className="cursor-pointer bg-blue-600 text-white px-6 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap"
                  >
                    <FaPrint size={14} />
                  </button>
                )}
              </div>
            </div>
            {!isCurrentView && activeSnapshot && (
              <div className="mt-4 inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-lg">
                <FaLock size={10} /> Closed Ledger — {activeSnapshot.title}{" "}
                &nbsp;|&nbsp; Closed on {fmtDate(activeSnapshot.closedAt)}
              </div>
            )}
          </div>

          {activeTab === "ledger" ? (
            <>
              {!isCurrentView && !activeSnapshot ? (
                <div className="py-20 text-center animate-pulse">
                  <p className="text-gray-400 font-bold text-sm">
                    Loading snapshot...
                  </p>
                </div>
              ) : (
                <LedgerTable
                  rows={displayRows}
                  openingBalance={displayOpeningBalance}
                  initialCharge={
                    isCurrentView
                      ? initialCharge
                      : activeSnapshot?.initialCharge ?? 0
                  }
                  initialPayment={
                    isCurrentView
                      ? initialPayment
                      : activeSnapshot?.initialPayment ?? 0
                  }
                  initialDate={
                    isCurrentView
                      ? initialDate
                      : activeSnapshot?.initialDate ?? null
                  }
                  isCurrentView={isCurrentView}
                  selectedRows={selectedRows}
                  setSelectedRows={setSelectedRows}
                />
              )}

              <SummaryFooter
                totalCharge={totalCharge}
                totalPayment={totalPayment}
                finalBalance={finalBalance}
                openingBalance={displayOpeningBalance}
              />
            </>
          ) : (
            <div className="p-5 sm:p-8">
              <CustomerSavedBillsTab
                customerId={customerId}
                selectedView={selectedView}
                availableRows={
                  isCurrentView
                    ? currentLedger.filter((r) => !r.isSaved && r.recordId)
                    : []
                }
                onInvoiceUpdated={fetchCurrentLedger}
              />
            </div>
          )}

          <div className="p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-center gap-8 bg-white">
            <div className="text-[10px] text-gray-400 font-medium order-2 sm:order-1 uppercase">
              OFFICIAL STATEMENT • {new Date().toLocaleString()}
            </div>
            <div className="text-center order-1 sm:order-2">
              <div className="w-40 h-px bg-gray-200 mb-2"></div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-tighter">
                Authorized Signature
              </p>
            </div>
          </div>
          <div style={{ display: "none" }}>
            <div ref={printRef}>
              <LedgerPrint
                customer={customer}
                rows={displayRows}
                openingBalance={displayOpeningBalance}
                initialCharge={currentInitialCharge}
                initialPayment={currentInitialPayment}
                initialDate={
                  currentInitialCharge > 0 || currentInitialPayment > 0
                    ? isCurrentView
                      ? initialDate
                      : activeSnapshot?.initialDate
                    : null
                }
                totalCharge={totalCharge}
                totalPayment={totalPayment}
                finalBalance={finalBalance}
                selectedLabel={selectedLabel}
                role="Customer"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
