// PaymentPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { paymentAPI } from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

export function PaymentPage() {
  const [plan, setPlan] = useState('monthly');
  const [loading, setLoading] = useState(false);
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const handlePaystack = async () => {
    setLoading(true);
    try {
      const res = await paymentAPI.paystackInit(plan);
      window.location.href = res.data.authorizationUrl;
    } catch {
      toast.error('Payment initialization failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="main-content" style={{ maxWidth: '640px' }}>
      <div style={{ marginBottom: '1.75rem' }}>
        <h2 className="serif" style={{ fontSize: '24px', color: 'var(--g1)' }}>Upgrade to PRO</h2>
        <p style={{ color: 'var(--ink3)', marginTop: '4px' }}>Unlock unlimited lesson note exports. Pay with Mobile Money or card.</p>
      </div>
      <div className="plan-grid">
        <div className={`plan-card${plan === 'monthly' ? '' : ''}`} onClick={() => setPlan('monthly')} style={{ border: plan === 'monthly' ? '2px solid var(--g2)' : '2px solid var(--bg3)', cursor: 'pointer' }}>
          <h3>Monthly Plan</h3>
          <div className="plan-price">GHS 25<span>/month</span></div>
          <ul style={{ fontSize: '13px', color: 'var(--ink3)', paddingLeft: '1rem', marginTop: '.5rem' }}>
            <li>Unlimited DOCX exports</li><li>Save lesson history forever</li><li>Priority AI generation</li>
          </ul>
        </div>
        <div className={`plan-card featured`} onClick={() => setPlan('annual')} style={{ border: plan === 'annual' ? '2px solid var(--gd)' : '2px solid var(--bg3)', background: 'var(--gl)', cursor: 'pointer' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--gb)', marginBottom: '4px' }}>⭐ BEST VALUE — Save GHS 100</div>
          <h3>Annual Plan</h3>
          <div className="plan-price">GHS 200<span>/year</span></div>
          <ul style={{ fontSize: '13px', color: 'var(--ink2)', paddingLeft: '1rem', marginTop: '.5rem' }}>
            <li>Everything in Monthly</li><li>Priority support</li><li>Save GHS 100 vs monthly</li>
          </ul>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
        <button className="btn btn-full btn-lg" style={{ background: '#0099FF', color: '#fff', fontSize: '15px' }} disabled={loading} onClick={handlePaystack}>
          {loading ? 'Connecting...' : '💳 Pay with Paystack (MTN MoMo, Vodafone, Card)'}
        </button>
        <button className="btn btn-outline btn-full" onClick={() => navigate(-1)}>← Go back</button>
      </div>
      <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--ink4)', marginTop: '1rem' }}>Secure payment by Paystack. Cancel anytime.</p>
    </div>
  );
}

export default PaymentPage;
