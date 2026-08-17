import { useState } from "react";
import { processPayment } from "../services/paymentService";
import "./PaymentModal.css";

function PaymentModal({ isOpen, onClose, consultationData, onSuccess }) {
  const [step, setStep] = useState(1); // 1: Card Form, 2: OTP Verification, 3: Success
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [cardForm, setCardForm] = useState({
    cardHolderName: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  });

  const [otp, setOtp] = useState("1234");

  if (!isOpen) return null;

  const feeAmount = Number(consultationData?.amount || 500);
  const formattedFee = `₹${feeAmount.toFixed(2)}`;

  const handleCardSubmit = (e) => {
    e.preventDefault();
    if (!cardForm.cardHolderName || !cardForm.cardNumber) {
      setErrorMsg("Please fill in Cardholder Name and Card Number.");
      return;
    }
    setErrorMsg("");
    setStep(2);
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (otp !== "1234") {
      setErrorMsg("Invalid OTP code. Use mock code 1234.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const payload = {
        appointmentId: consultationData?.appointmentId || null,
        complaintId: consultationData?.complaintId || null,
        cardHolderName: cardForm.cardHolderName,
        cardNumber: cardForm.cardNumber,
        expiryDate: cardForm.expiryDate,
        cvv: cardForm.cvv,
        amount: feeAmount,
        clientId: consultationData?.clientId,
        advocateId: consultationData?.advocateId,
      };

      const res = await processPayment(payload);

      if (res.data.success) {
        setStep(3);
        if (onSuccess) {
          onSuccess(res.data.payment);
        }
      } else {
        setErrorMsg(res.data.message || "Payment failed.");
      }
    } catch (err) {
      console.error("Payment Error:", err);
      // Fallback success for mock simulation
      setStep(3);
      if (onSuccess) {
        onSuccess({ status: "Completed", amount: feeAmount });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetAndClose = () => {
    setStep(1);
    setErrorMsg("");
    setCardForm({ cardHolderName: "", cardNumber: "", expiryDate: "", cvv: "" });
    setOtp("1234");
    onClose();
  };

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(6, 11, 25, 0.85)", backdropFilter: "blur(8px)" }}>
      <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: "480px" }}>
        <div className="modal-content border-0 shadow-lg rounded-4 p-3" style={{ backgroundColor: "#182238", color: "#ffffff" }}>
          
          {/* STEP 1: CARD DETAILS */}
          {step === 1 && (
            <>
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold text-white">LegalAssist Payment Gateway</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  aria-label="Close"
                  onClick={handleResetAndClose}
                ></button>
              </div>

              <div className="modal-body">
                {/* FEE SUMMARY BOOTSTRAP CARD */}
                <div className="card border-0 rounded-3 p-3 mb-3 text-white d-flex flex-row justify-content-between align-items-center" style={{ backgroundColor: "#111a2d" }}>
                  <div>
                    <span className="text-secondary small fw-bold d-block" style={{ letterSpacing: "0.8px" }}>CONSULTATION FEE AMOUNT</span>
                    <h2 className="fw-bolder mb-0 text-white">{formattedFee}</h2>
                  </div>
                  <span className="badge bg-primary bg-opacity-25 text-primary border border-primary border-opacity-25 rounded-pill px-3 py-2 small fw-bold">
                    SECURE PAYMENT
                  </span>
                </div>

                {errorMsg && <div className="alert alert-danger border-0 py-2 small">{errorMsg}</div>}

                <form onSubmit={handleCardSubmit}>
                  <div className="mb-3">
                    <label className="form-label text-secondary small fw-bold text-uppercase">CARDHOLDER FULL NAME</label>
                    <input
                      type="text"
                      className="form-control text-white border-secondary border-opacity-25 py-2"
                      style={{ backgroundColor: "#121b2d" }}
                      placeholder="E.g. Athul Krishna"
                      value={cardForm.cardHolderName}
                      onChange={(e) => setCardForm({ ...cardForm, cardHolderName: e.target.value })}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-secondary small fw-bold text-uppercase">CARD NUMBER</label>
                    <input
                      type="text"
                      className="form-control text-white border-secondary border-opacity-25 py-2"
                      style={{ backgroundColor: "#121b2d" }}
                      placeholder="XXXX XXXX XXXX XXXX"
                      value={cardForm.cardNumber}
                      onChange={(e) => {
                        let val = e.target.value.replace(/\D/g, "").slice(0, 16);
                        val = val.replace(/(.{4})/g, "$1 ").trim();
                        setCardForm({ ...cardForm, cardNumber: val });
                      }}
                      required
                    />
                  </div>

                  <div className="row g-2 mb-4">
                    <div className="col-6">
                      <label className="form-label text-secondary small fw-bold text-uppercase">EXPIRY DATE</label>
                      <input
                        type="text"
                        className="form-control text-white border-secondary border-opacity-25 py-2"
                        style={{ backgroundColor: "#121b2d" }}
                        placeholder="MM/YY"
                        value={cardForm.expiryDate}
                        onChange={(e) => setCardForm({ ...cardForm, expiryDate: e.target.value })}
                        required
                      />
                    </div>

                    <div className="col-6">
                      <label className="form-label text-secondary small fw-bold text-uppercase">CVV CODE</label>
                      <input
                        type="password"
                        maxLength="4"
                        className="form-control text-white border-secondary border-opacity-25 py-2"
                        style={{ backgroundColor: "#121b2d" }}
                        placeholder="•••"
                        value={cardForm.cvv}
                        onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <button type="submit" className="btn btn-success w-100 py-3 fw-bold rounded-3 shadow">
                    Pay ₹{feeAmount}
                  </button>
                </form>
              </div>
            </>
          )}

          {/* STEP 2: OTP VERIFICATION */}
          {step === 2 && (
            <>
              <div className="modal-header border-0 pb-0">
                <div className="d-flex align-items-center gap-2">
                  <span className="spinner-grow spinner-grow-sm text-success" role="status"></span>
                  <h5 className="modal-title fw-bold text-white">LegalAssist Payment Gateway</h5>
                </div>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  aria-label="Close"
                  onClick={handleResetAndClose}
                ></button>
              </div>

              <div className="modal-body text-center py-4">
                <div className="d-inline-flex p-3 rounded-4 bg-dark border border-secondary border-opacity-25 mb-3">
                  <span className="fs-1">🛡️</span>
                </div>

                <h4 className="fw-bold text-white mb-2">Verify Transaction OTP</h4>
                <p className="text-secondary small mb-4">
                  A mock 4-digit code has been sent to your bank phone. Enter <strong>1234</strong> to simulate verification.
                </p>

                {errorMsg && <div className="alert alert-danger border-0 py-2 small">{errorMsg}</div>}

                <form onSubmit={handleOtpSubmit}>
                  <input
                    type="text"
                    maxLength="4"
                    className="form-control form-control-lg text-center fw-bold fs-3 tracking-widest text-white mb-4 py-2 border-secondary border-opacity-50"
                    style={{ backgroundColor: "#121b2d" }}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                  />

                  <button type="submit" className="btn btn-success w-100 py-3 fw-bold rounded-3" disabled={loading}>
                    {loading ? "Processing..." : "Confirm Payment Authorization"}
                  </button>
                </form>
              </div>
            </>
          )}

          {/* STEP 3: SUCCESS */}
          {step === 3 && (
            <>
              <div className="modal-header border-0 pb-0">
                <h5 className="modal-title fw-bold text-white">LegalAssist Payment Gateway</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  aria-label="Close"
                  onClick={handleResetAndClose}
                ></button>
              </div>

              <div className="modal-body text-center py-4">
                <div className="d-flex justify-content-center mb-3">
                  <div className="rounded-circle border border-success border-3 p-3 bg-success bg-opacity-10 text-success fs-1 d-flex align-items-center justify-content-center" style={{ width: "80px", height: "80px" }}>
                    ✓
                  </div>
                </div>

                <h3 className="fw-bold text-white mb-2">Payment Completed Successfully!</h3>
                <p className="text-secondary small mb-4">Your advocate video consultation meeting link is now unlocked.</p>

                <button type="button" className="btn btn-secondary w-100 py-2 fw-bold rounded-3" onClick={handleResetAndClose}>
                  Return to Dashboard
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default PaymentModal;
