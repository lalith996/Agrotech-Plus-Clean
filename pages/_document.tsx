import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="utf-8" />
        <meta name="description" content="AgroTrack+ - Transparent organic supply chain from soil to home. Track your produce with complete traceability, smart routing, and sustainable practices." />
        <meta name="keywords" content="organic, supply chain, traceability, sustainable, agriculture, farm to table" />
        <meta name="author" content="AgroTrack+" />
        
        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="AgroTrack+ - Transparent Organic Supply Chain" />
        <meta property="og:description" content="Track your organic produce from farm to table with complete transparency, smart routing, and sustainable practices." />
        <meta property="og:site_name" content="AgroTrack+" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="AgroTrack+ - Transparent Organic Supply Chain" />
        <meta name="twitter:description" content="Track your organic produce from farm to table with complete transparency." />
        
        {/* PWA */}
        <meta name="theme-color" content="#22c55e" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="AgroTrack+" />
        
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}