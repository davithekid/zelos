export default function Footer() {
    return (
      <footer className="bg-red-600 text-white py-6 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h3 className="text-lg font-bold">SENAI</h3>
            
          </div>
  
          <div className="flex gap-4 text-gray-300">
            <a href="#" aria-label="Facebook" className="hover:text-red-400 transition">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M22 12.07C22 6.48 17.52 2 12 2S2 6.48 2 12.07c0 4.99 3.66 9.13 8.44 9.87v-6.99H7.9v-2.88h2.54v-2.2c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.23.2 2.23.2v2.45h-1.25c-1.23 0-1.61.77-1.61 1.56v1.87h2.74l-.44 2.88h-2.3v6.99C18.34 21.2 22 17.06 22 12.07z" />
              </svg>
            </a>
            <a href="#" aria-label="Twitter" className="hover:text-red-400 transition">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M22.46 6c-.77.35-1.6.59-2.46.69a4.27 4.27 0 0 0 1.88-2.36 8.4 8.4 0 0 1-2.7 1.03 4.21 4.21 0 0 0-7.17 3.84A11.95 11.95 0 0 1 3 5.16a4.21 4.21 0 0 0 1.3 5.62 4.19 4.19 0 0 1-1.9-.53v.05a4.22 4.22 0 0 0 3.38 4.14 4.2 4.2 0 0 1-1.89.07 4.22 4.22 0 0 0 3.94 2.92A8.47 8.47 0 0 1 2 19.54 11.94 11.94 0 0 0 8.29 21c7.55 0 11.68-6.27 11.68-11.7 0-.18 0-.35-.01-.53A8.18 8.18 0 0 0 22.46 6z" />
              </svg>
            </a>
            <a href="#" aria-label="Instagram" className="hover:text-red-400 transition">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 2A3.75 3.75 0 0 0 4 7.75v8.5A3.75 3.75 0 0 0 7.75 20h8.5A3.75 3.75 0 0 0 20 16.25v-8.5A3.75 3.75 0 0 0 16.25 4h-8.5zm8.5 1.5a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm-4.25 2a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9zm0 2a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z" />
              </svg>
            </a>
          </div>
        </div>
  
        <div className="mt-6 text-center text-white text-xs">
          &copy; {new Date().getFullYear()} SENAI - Todos os direitos reservados.
        </div>
      </footer>
    )
  }
  