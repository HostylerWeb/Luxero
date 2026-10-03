export default function SentryDebugPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold">Sentry Debug</h1>
      <button
        onClick={() => {
          throw new Error("Test error from Sentry debug page");
        }}
        className="mt-4 px-4 py-2 bg-destructive text-destructive-foreground rounded"
      >
        Trigger Error
      </button>
    </div>
  );
}
