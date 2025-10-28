import './globals.css'

export const metadata = {
  title: 'Resim İşleme Uygulaması',
  description: 'Next.js ve OpenCV ile resim işleme uygulaması',
}

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <head>
        {/* Tailwind CSS kullanmak için CDN bağlantısı */}
        <link
          href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}