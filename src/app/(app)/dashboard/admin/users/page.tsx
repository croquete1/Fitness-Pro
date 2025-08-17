export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import UsersClient from "./UsersClient";
export default function Page() { return <UsersClient />; }
