import ClientProvider from '../components/ClientProvider';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>CareSoft Deals Mapping</title>
        <link rel="icon" href="/CareSoftLogo.svg" />
      </head>
      <body>
        <ClientProvider>
          <main>{children}</main>
        </ClientProvider>
      </body>
    </html>
  );
}