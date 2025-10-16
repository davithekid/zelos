export default function Footer() {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      name: "Twitter (X)",
      href: "https://x.com/SENAInacional",
      iconPath: "M22.46 6c-.77.35-1.6.59-2.46.69a4.27 4.27 0 0 0 1.88-2.36 8.4 8.4 0 0 1-2.7 1.03 4.21 4.21 0 0 0-7.17 3.84A11.95 11.95 0 0 1 3 5.16a4.21 4.21 0 0 0 1.3 5.62 4.19 4.19 0 0 1-1.9-.53v.05a4.22 4.22 0 0 0 3.38 4.14 4.2 4.2 0 0 1-1.89.07 4.22 4.22 0 0 0 3.94 2.92A8.47 8.47 0 0 1 2 19.54 11.94 11.94 0 0 0 8.29 21c7.55 0 11.68-6.27 11.68-11.7 0-.18 0-.35-.01-.53A8.18 8.18 0 0 0 22.46 6z"
    },
    {
      name: "Instagram",
      href: "https://www.instagram.com/senaimecatronica/",
      iconPath: "M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 2A3.75 3.75 0 0 0 4 7.75v8.5A3.75 3.75 0 0 0 7.75 20h8.5A3.75 3.75 0 0 0 20 16.25v-8.5A3.75 3.75 0 0 0 16.25 4h-8.5zm8.5 1.5a1 1 0 1 1 0 2 1 1 0 0 1 0-2zm-4.25 2a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9zm0 2a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z"
    },
    {
      name: "LinkedIn",
      href: "https://www.linkedin.com/showcase/senaisp-scsmeca/posts/?feedView=all",
      iconPath: "M20.47 20.5H16.19V13.88C16.19 12.27 15.58 11.39 14.39 11.39C13.2 11.39 12.59 12.27 12.59 13.88V20.5H8.31V7.95H12.59V9.95C13.2 9.17 14.39 7.95 16.58 7.95C19.26 7.95 20.47 9.54 20.47 13.08V20.5ZM5.5 5.75C6.88 5.75 7.7 4.75 7.7 3.5C7.7 2.25 6.88 1.25 5.5 1.25C4.12 1.25 3.3 2.25 3.3 3.5C3.3 4.75 4.12 5.75 5.5 5.75ZM3.31 7.95H7.7V20.5H3.31V7.95Z"
    }
  ];

  return (
    <footer className="bg-red-600 text-white py-4 px-2"> 
      <div className="flex flex-col items-center gap-3"> 

        <div className="flex flex-col items-center gap-1 w-full pb-2 border-b border-red-500">
          <img
            src="./footer.svg"
            alt="Logo ZELOS"
            className="w-20 h-auto mb-1" 
          />

          <p className="text-center text-xs text-red-200">
            &copy; {currentYear} SENAI.
          </p>
        </div>

        <div className="flex justify-center gap-3 text-white"> 
          {socialLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Siga-nos no ${link.name}`}
              className="hover:text-red-300 transition duration-200 transform hover:scale-110"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"> 
                <path d={link.iconPath} />
              </svg>
            </a>
          ))}
        </div>
      </div>
    </footer>
  )
}