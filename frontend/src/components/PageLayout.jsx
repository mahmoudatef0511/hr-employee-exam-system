import Navbar from "./Navbar";

export default function PageLayout({ children }) {
  return (
    <div>
      <Navbar />
      <div className="container">{children}</div>
    </div>
  );
}
