// Renders nothing when there is no message, so callers can pass an empty string freely.
export default function ErrorMessage({ message }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700 dark:bg-red-950/50 dark:text-red-300">
      {message}
    </p>
  );
}
