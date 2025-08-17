export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

import AuditLogsClient from "./AuditLogsClient";

export default function Page() {
  return <AuditLogsClient />;
}
