export default function Button({ variant = "primary", ...rest }) {
  const className = variant === "secondary" ? "secondary" : undefined;
  return <button className={className} {...rest} />;
}
