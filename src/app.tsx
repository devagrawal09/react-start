import { Link } from "wouter";

export default function ({ assets, children }) {
  return (
    <html lang="en">
      <head>{assets}</head>
      <body>
        <div style={{ display: "flex", gap: "8px" }}>
          <Link to="/">Home</Link>
          <Link to="/todos">Todos</Link>
        </div>
        {children}
      </body>
    </html>
  );
}
