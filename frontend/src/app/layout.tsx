export const metadata = {
  title: 'CoinHub',
  description: 'Application de gestion de budget personnel',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
