import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function SuccessPage() {
  const router = useRouter();
  const { method, orderId } = router.query;

  const isCrypto = method === 'usdt';

  return (
    <>
      <Head>
        <title>Payment Successful – Digital Product Store</title>
      </Head>

      <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          {/* Animated checkmark */}
          <div className="flex items-center justify-center mb-8">
            <div className="w-24 h-24 rounded-full bg-green-500/20 border-2 border-green-500/50 flex items-center justify-center">
              <svg className="w-12 h-12 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          <h1 className="text-3xl font-extrabold text-white mb-3">
            {isCrypto ? 'Payment Received!' : 'Payment Successful!'}
          </h1>

          <p className="text-gray-400 mb-6 leading-relaxed">
            {isCrypto
              ? 'Your USDT payment is being confirmed on-chain. Once the transaction is verified, your account credentials will be emailed to you automatically — usually within a few minutes.'
              : 'Your PayPal payment was processed successfully. Your account credentials have been sent to your email address. Please check your inbox (and spam folder).'}
          </p>

          {orderId && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 mb-8 text-sm">
              <span className="text-gray-500">Order ID: </span>
              <span className="text-gray-300 font-mono text-xs break-all">{orderId}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/" className="btn-primary">
              Continue Shopping
            </Link>
          </div>

          <p className="text-xs text-gray-600 mt-8">
            Didn't receive the email? Check your spam folder or contact support by replying to your confirmation email.
          </p>
        </div>
      </div>
    </>
  );
}
