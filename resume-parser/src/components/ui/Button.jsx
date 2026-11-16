export default function Button({ children, disabled = false, onClick, type = "button" }) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className="rounded-xl bg-accent px-8 py-3 font-semibold text-on-accent shadow transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:bg-track disabled:text-muted"
    >
      {children}
    </button>
  );
}
