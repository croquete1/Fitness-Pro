import LoginClient from "./LoginClient";

type PageProps = { searchParams?: { registered?: string } };

export default function Page({ searchParams }: PageProps) {
  const registered =
    searchParams?.registered === "1" || searchParams?.registered === "true";
  return <LoginClient registered={registered} />;
}
