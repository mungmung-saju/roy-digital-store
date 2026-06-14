import '../styles/globals.css';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';

const paypalOptions = {
  clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
  currency: 'USD',
  intent: 'capture',
};

export default function App({ Component, pageProps }) {
  return (
    <PayPalScriptProvider options={paypalOptions}>
      <Component {...pageProps} />
    </PayPalScriptProvider>
  );
}
