import "./globals.css";
import { AuthProvider } from "../components/AuthProvider";
import Header from "../components/Header";
export const metadata = {
  title: "EnterpriseFlow | Work smarter",
  description: "Enterprise inventory and order management platform",
};
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Header />
          {children}
          <footer className="footer">
            <div className="brand">
              enterprise<span>flow</span>
            </div>
            <p>One workspace for products, inventory and orders.</p>
            <small>
              © 2026 EnterpriseFlow. Portfolio demonstration project.
            </small>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
