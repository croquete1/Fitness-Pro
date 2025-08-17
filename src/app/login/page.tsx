import LoginClient from "./LoginClient";

type PageProps = { searchParams?: { registered?: string } };

export default function Page({ searchParams }: PageProps) {
  const registered =
    searchParams?.registered === "1" || searchParams?.registered === "true";

  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "grid",
        placeItems: "center",
        background: "var(--app-bg)",
        padding: 16,
      }}
    >
      <LoginClient registered={registered} />
    </div>
  );
}
