import './globals.css'

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[hsl(0,0%,3.9%)] text-white antialiased">
        {children}
      </body>
    </html>
  )
}
