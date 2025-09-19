export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} BlancALergias | Todos los derechos reservados</p>
        </div>
      </div>
    </footer>
  );
}