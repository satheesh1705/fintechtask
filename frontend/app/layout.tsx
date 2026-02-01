import './globals.css';

export const metadata = { title: 'Vibe Tasks', description: 'Task demo' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>{children}</main>
      </body>
    </html>
  );
}
