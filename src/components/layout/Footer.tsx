export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* About Section */}
          <div className="text-center md:text-left">
            <h3 className="font-semibold text-foreground mb-2">BlancAlergic</h3>
            <p className="text-sm text-muted-foreground dark:text-gray-300">
              Sistema integral de gestión de alergias alimentarias diseñado para proporcionar
              información crítica y mantener la seguridad de quienes sufren alergias.
            </p>
          </div>

          {/* Developer Info */}
          <div className="text-center">
            <h3 className="font-semibold text-foreground mb-2">Desarrollador</h3>
            <p className="text-sm text-muted-foreground dark:text-gray-300 mb-3">
              Sergio Hernández Bergantiños
            </p>
            <div className="flex items-center justify-center space-x-4">
              <a
                href="https://github.com/sergiohb21"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground dark:text-gray-400 hover:text-foreground transition-colors"
                aria-label="GitHub de Sergio Hernández"
              >
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12"/>
                  </svg>
                  <span className="text-xs">@sergiohb21</span>
                </div>
              </a>
              <a
                href="https://www.linkedin.com/in/sergio-hern%C3%A1ndez-berganti%C3%B1os-4761542a3/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground dark:text-gray-400 hover:text-foreground transition-colors"
                aria-label="LinkedIn de Sergio Hernández"
              >
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  <span className="text-xs">LinkedIn</span>
                </div>
              </a>
            </div>
          </div>

          {/* Project Info */}
          <div className="text-center md:text-right">
            <h3 className="font-semibold text-foreground mb-2">Proyecto</h3>
            <p className="text-xs text-muted-foreground dark:text-gray-400">
              📄 Licencia MIT
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-6 pt-6 border-t border-border">
          <div className="text-center text-xs text-muted-foreground dark:text-gray-400">
            <p>&copy; {new Date().getFullYear()} BlancAlergic-APP | Software de código abierto</p>
            <p className="mt-1">Creado con ❤️ para la gestión de alergias</p>
          </div>
        </div>
      </div>
    </footer>
  );
}