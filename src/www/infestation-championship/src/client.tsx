if (typeof globalThis.process === "undefined") {
  (globalThis as any).process = {
    env: { NODE_ENV: "production" },
    platform: "browser",
    cwd: () => "/",
    argv: [],
    version: "",
    exit: () => {},
  };
}

const [{ StrictMode, startTransition }, { hydrateRoot }, { StartClient }] =
  await Promise.all([
    import("react"),
    import("react-dom/client"),
    import("@tanstack/react-start/client"),
  ]);

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <StartClient />
    </StrictMode>,
  );
});
