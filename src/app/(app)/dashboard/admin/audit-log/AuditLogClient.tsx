"use client";

import * as React from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  MenuItem,
  Snackbar,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import DownloadOutlined from "@mui/icons-material/DownloadOutlined";
import RefreshOutlined from "@mui/icons-material/RefreshOutlined";
import SearchOutlined from "@mui/icons-material/SearchOutlined";
import HistoryOutlined from "@mui/icons-material/HistoryOutlined";
import PersonOutline from "@mui/icons-material/PersonOutline";
import TopicOutlined from "@mui/icons-material/TopicOutlined";
import { DataGrid, GridColDef, GridRenderCellParams } from "@mui/x-data-grid";

const KIND_LABELS: Record<string, string> = {
  CREATE: "Criação",
  UPDATE: "Atualização",
  DELETE: "Remoção",
  LOGIN: "Login",
  LOGOUT: "Logout",
  PUBLISH: "Publicação",
  UNPUBLISH: "Retirada",
  CLONE: "Clone",
  APPROVE: "Aprovação",
  SUSPEND: "Suspensão",
  INVITE: "Convite",
  RESET_PASSWORD: "Recuperação",
  TRAINING_PLAN_CREATE: "Plano criado",
  TRAINING_PLAN_UPDATE: "Plano atualizado",
  TRAINING_PLAN_DELETE: "Plano removido",
  TRAINING_PLAN_CLONE: "Plano clonado",
  TRAINING_PLAN_PUBLISH: "Plano publicado",
  TRAINING_PLAN_UNPUBLISH: "Plano despublicado",
  USER_CREATE: "Utilizador criado",
  USER_UPDATE: "Utilizador atualizado",
  USER_DELETE: "Utilizador removido",
  USER_SUSPEND: "Utilizador suspenso",
  USER_APPROVE: "Utilizador aprovado",
  EXERCISE_PUBLISH: "Exercício publicado",
  EXERCISE_UNPUBLISH: "Exercício despublicado",
};

const TARGET_TYPE_LABELS: Record<string, string> = {
  USER: "Utilizador",
  TRAINING_PLAN: "Plano",
  EXERCISE: "Exercício",
  SESSION: "Sessão",
  SYSTEM: "Sistema",
  NOTIFICATION: "Notificação",
};

type AuditRow = {
  id: string;
  created_at: string | null;
  kind: string | null;
  category: string | null;
  action: string | null;
  target_type: string | null;
  target_id: string | null;
  target: string | null;
  actor_id: string | null;
  actor: string | null;
  note: string | null;
  details: Record<string, unknown> | null;
  payload: Record<string, unknown> | null;
  meta: Record<string, unknown> | null;
  ip: string | null;
  user_agent: string | null;
};

type MetaResponse = {
  kinds: string[];
  targetTypes: string[];
  actors: { id: string | null; label: string | null }[];
};

type FetchResponse = {
  items: AuditRow[];
  count: number;
  page: number;
  pageSize: number;
  meta?: MetaResponse;
  missingTable?: boolean;
};

const INITIAL_ROWS: AuditRow[] = [];

function formatDate(value: string | null): string {
  if (!value) return "—";
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString();
  } catch {
    return value;
  }
}

function coalesceDetails(row: AuditRow): Record<string, unknown> | null {
  return row.details || row.payload || row.meta || null;
}

function chipColor(kind?: string | null): "default" | "primary" | "success" | "warning" | "error" {
  if (!kind) return "default";
  const normalized = kind.toUpperCase();
  if (normalized.includes("DELETE")) return "error";
  if (normalized.includes("CREATE") || normalized.includes("LOGIN") || normalized.includes("APPROVE")) return "success";
  if (normalized.includes("SUSPEND") || normalized.includes("LOGOUT")) return "warning";
  return "primary";
}

export default function AuditLogClient() {
  const theme = useTheme();
  const downSm = useMediaQuery(theme.breakpoints.down("sm"));
  const [rows, setRows] = React.useState<AuditRow[]>(INITIAL_ROWS);
  const [rowCount, setRowCount] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [paginationModel, setPaginationModel] = React.useState({ page: 0, pageSize: 20 });
  const [filters, setFilters] = React.useState({
    kind: "",
    targetType: "",
    actor: "",
    actorId: "",
    search: "",
  });
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [meta, setMeta] = React.useState<MetaResponse | null>(null);
  const [metaLoaded, setMetaLoaded] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [missingTable, setMissingTable] = React.useState(false);
  const [snack, setSnack] = React.useState<{ open: boolean; message: string; severity: "error" | "success" | "info" | "warning" }>(
    { open: false, message: "", severity: "info" },
  );
  const [detailsRow, setDetailsRow] = React.useState<AuditRow | null>(null);
  const [exporting, setExporting] = React.useState(false);

  React.useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(filters.search.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [filters.search]);

  const fetchRows = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set("page", String(paginationModel.page + 1));
      params.set("pageSize", String(paginationModel.pageSize));
      if (filters.kind) params.set("kind", filters.kind);
      if (filters.targetType) params.set("targetType", filters.targetType);
      if (filters.actorId) {
        params.set("actorId", filters.actorId);
      } else if (filters.actor) {
        params.set("actor", filters.actor);
      }
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (!metaLoaded) params.set("meta", "1");

      const res = await fetch(`/api/admin/audit-log?${params.toString()}`, {
        credentials: "same-origin",
        cache: "no-store",
      });

      if (res.status === 401 || res.status === 403) {
        setError("Não tens permissões para ver os logs de auditoria.");
        setRows(INITIAL_ROWS);
        setRowCount(0);
        return;
      }

      if (!res.ok) {
        throw new Error(`Falha ao carregar logs (${res.status})`);
      }

      const json = (await res.json()) as FetchResponse;
      setRows(json.items ?? []);
      setRowCount(json.count ?? 0);
      setMissingTable(Boolean(json.missingTable));
      if (!metaLoaded && json.meta) {
        setMeta(json.meta);
        setMetaLoaded(true);
      }
    } catch (err: any) {
      setError(err?.message ?? "Falha ao carregar logs.");
      setRows(INITIAL_ROWS);
      setRowCount(0);
    } finally {
      setLoading(false);
    }
  }, [
    debouncedSearch,
    filters.actor,
    filters.actorId,
    filters.kind,
    filters.targetType,
    metaLoaded,
    paginationModel.page,
    paginationModel.pageSize,
  ]);

  React.useEffect(() => {
    void fetchRows();
  }, [fetchRows]);

  const handleExport = React.useCallback(async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams();
      params.set("format", "csv");
      params.set("page", "1");
      params.set("pageSize", "500");
      if (filters.kind) params.set("kind", filters.kind);
      if (filters.targetType) params.set("targetType", filters.targetType);
      if (filters.actorId) {
        params.set("actorId", filters.actorId);
      } else if (filters.actor) {
        params.set("actor", filters.actor);
      }
      const term = filters.search.trim();
      if (term) params.set("search", term);

      const res = await fetch(`/api/admin/audit-log?${params.toString()}`, {
        credentials: "same-origin",
      });
      if (!res.ok) throw new Error("Não foi possível exportar os logs.");
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `audit-log-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      setSnack({ open: true, message: "Exportação concluída.", severity: "success" });
    } catch (err: any) {
      setSnack({ open: true, message: err?.message ?? "Falha na exportação.", severity: "error" });
    } finally {
      setExporting(false);
    }
  }, [filters.actor, filters.actorId, filters.kind, filters.search, filters.targetType]);

  const columns = React.useMemo<GridColDef<AuditRow>[]>(() => {
    const renderKind = (params: GridRenderCellParams<AuditRow, string | null>) => {
      const value = params.row.kind ?? params.row.action ?? "—";
      const label = value ? (KIND_LABELS[value] ?? value) : "—";
      return (
        <Chip
          size="small"
          label={label}
          color={chipColor(value)}
          sx={{ fontWeight: 600 }}
        />
      );
    };

    const renderTarget = (params: GridRenderCellParams<AuditRow, string | null>) => {
      const type = params.row.target_type ? (TARGET_TYPE_LABELS[params.row.target_type] ?? params.row.target_type) : "—";
      const label = params.row.target ?? params.row.target_id ?? "—";
      return (
        <Stack direction="column" spacing={0.5}>
          <Stack direction="row" spacing={1} alignItems="center">
            <TopicOutlined fontSize="inherit" />
            <Typography variant="body2" fontWeight={600} noWrap>
              {label}
            </Typography>
          </Stack>
          <Typography variant="caption" color="text.secondary">
            {type}
          </Typography>
        </Stack>
      );
    };

    const renderActor = (params: GridRenderCellParams<AuditRow, string | null>) => {
      const label = params.row.actor || params.row.actor_id || "—";
      return (
        <Stack direction="row" spacing={1} alignItems="center">
          <PersonOutline fontSize="inherit" />
          <Typography variant="body2" noWrap>{label}</Typography>
        </Stack>
      );
    };

    const renderDetails = (params: GridRenderCellParams<AuditRow, unknown>) => {
      const details = coalesceDetails(params.row);
      if (!details) return <Typography variant="body2">—</Typography>;
      return (
        <Button size="small" onClick={() => setDetailsRow(params.row)} variant="outlined">
          Ver
        </Button>
      );
    };

    return [
      {
        field: "created_at",
        headerName: "Quando",
        flex: 1,
        minWidth: 180,
        renderCell: (params) => (
          <Stack direction="row" spacing={1} alignItems="center">
            <HistoryOutlined fontSize="inherit" />
            <Typography variant="body2">{formatDate(params.row.created_at)}</Typography>
          </Stack>
        ),
      },
      {
        field: "kind",
        headerName: "Tipo",
        flex: 1,
        minWidth: 160,
        sortable: false,
        renderCell: renderKind,
      },
      {
        field: "actor",
        headerName: "Responsável",
        flex: 1,
        minWidth: 160,
        sortable: false,
        renderCell: renderActor,
      },
      {
        field: "target",
        headerName: "Alvo",
        flex: 1.2,
        minWidth: 200,
        sortable: false,
        renderCell: renderTarget,
      },
      {
        field: "note",
        headerName: "Mensagem",
        flex: 1.4,
        minWidth: 220,
        sortable: false,
        renderCell: (params) => (
          <Tooltip title={params.value ?? "Sem nota"} placement="top-start">
            <Typography variant="body2" noWrap>
              {params.value ?? "—"}
            </Typography>
          </Tooltip>
        ),
      },
      {
        field: "ip",
        headerName: "IP",
        flex: 0.6,
        minWidth: 140,
        sortable: false,
        renderCell: (params) => (
          <Typography variant="body2" noWrap>{params.value ?? "—"}</Typography>
        ),
      },
      {
        field: "details",
        headerName: "Detalhes",
        flex: 0.5,
        minWidth: 120,
        sortable: false,
        renderCell: renderDetails,
      },
    ];
  }, []);

  const clearFilters = React.useCallback(() => {
    setFilters({ kind: "", targetType: "", actor: "", actorId: "", search: "" });
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
    setMetaLoaded(false);
  }, []);

  const actorOptions = meta?.actors ?? [];
  const actorSelectValue = React.useMemo(() => {
    if (filters.actorId) return `id:${filters.actorId}`;
    if (filters.actor) return `label:${filters.actor}`;
    return "";
  }, [filters.actor, filters.actorId]);

  return (
    <Stack spacing={2}>
      <Typography variant="h4" fontWeight={700} sx={{ letterSpacing: -0.2 }}>
        Auditoria
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Consulta e exportação dos registos de ações administrativas.
      </Typography>

      {missingTable && (
        <Alert severity="warning">
          Tabela de auditoria não encontrada. Executa o script <code>scripts/supabase-audit-log.sql</code> no Supabase para criares os triggers de logging.
        </Alert>
      )}

      {error && (
        <Alert severity="error">{error}</Alert>
      )}

      <Card>
        <CardContent>
          <Stack spacing={2}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  select
                  fullWidth
                  label="Tipo"
                  value={filters.kind}
                  onChange={(event) => {
                    setFilters((prev) => ({ ...prev, kind: event.target.value }));
                    setPaginationModel((prev) => ({ ...prev, page: 0 }));
                    setMetaLoaded(true);
                  }}
                  size="small"
                >
                  <MenuItem value="">Todos</MenuItem>
                  {(meta?.kinds ?? []).map((kind) => (
                    <MenuItem key={kind} value={kind}>
                      {KIND_LABELS[kind] ?? kind}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  select
                  fullWidth
                  label="Categoria"
                  value={filters.targetType}
                  onChange={(event) => {
                    setFilters((prev) => ({ ...prev, targetType: event.target.value }));
                    setPaginationModel((prev) => ({ ...prev, page: 0 }));
                    setMetaLoaded(true);
                  }}
                  size="small"
                >
                  <MenuItem value="">Todas</MenuItem>
                  {(meta?.targetTypes ?? []).map((target) => (
                    <MenuItem key={target} value={target}>
                      {TARGET_TYPE_LABELS[target] ?? target}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  select
                  fullWidth
                  label="Responsável"
                  value={actorSelectValue}
                  onChange={(event) => {
                    const value = String(event.target.value ?? "");
                    setFilters((prev) => ({
                      ...prev,
                      actorId: value.startsWith("id:") ? value.slice(3) : "",
                      actor: value.startsWith("label:") ? value.slice(6) : "",
                    }));
                    setPaginationModel((prev) => ({ ...prev, page: 0 }));
                    setMetaLoaded(true);
                  }}
                  size="small"
                >
                  <MenuItem value="">Todos</MenuItem>
                  {actorOptions.map((option) => {
                    const label = option.label ?? option.id ?? "—";
                    const value = option.id
                      ? `id:${option.id}`
                      : option.label
                        ? `label:${option.label}`
                        : "label:—";
                    return (
                      <MenuItem key={`${option.id ?? option.label ?? "anon"}`} value={value}>
                        {label}
                      </MenuItem>
                    );
                  })}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="Pesquisa"
                  placeholder="nota, alvo, IP..."
                  value={filters.search}
                  onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
                  size="small"
                  InputProps={{
                    startAdornment: (
                      <Box component="span" sx={{ display: "inline-flex", alignItems: "center", mr: 1 }}>
                        <SearchOutlined fontSize="small" color="action" />
                      </Box>
                    ),
                  }}
                />
              </Grid>
            </Grid>

            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button
                variant="text"
                color="inherit"
                onClick={clearFilters}
                startIcon={<RefreshOutlined />}
              >
                Limpar filtros
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleExport}
                startIcon={<DownloadOutlined />}
                disabled={exporting || loading}
              >
                Exportar CSV
              </Button>
            </Stack>

            <Divider />

            <Box sx={{ width: "100%", height: downSm ? 520 : 640 }}>
              <DataGrid
                rows={rows}
                columns={columns}
                loading={loading}
                autoHeight={false}
                rowCount={rowCount}
                pageSizeOptions={[10, 20, 50]}
                paginationMode="server"
                paginationModel={paginationModel}
                onPaginationModelChange={(model) => setPaginationModel(model)}
                disableRowSelectionOnClick
                density="comfortable"
                sx={{
                  border: "none",
                  "& .MuiDataGrid-columnHeaders": {
                    backgroundColor: theme.palette.mode === "light" ? "rgba(15, 23, 42, 0.04)" : "rgba(148, 163, 184, 0.12)",
                  },
                  "& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within": {
                    outline: "none",
                  },
                }}
              />
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Dialog open={Boolean(detailsRow)} onClose={() => setDetailsRow(null)} maxWidth="md" fullWidth>
        <DialogTitle>Detalhes do log</DialogTitle>
        <DialogContent dividers>
          {detailsRow ? (
            <Box
              component="pre"
              sx={{
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                fontSize: 13,
              }}
            >
              {JSON.stringify(coalesceDetails(detailsRow), null, 2)}
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsRow(null)}>Fechar</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack((prev) => ({ ...prev, open: false }))}
      >
        <Alert
          severity={snack.severity}
          onClose={() => setSnack((prev) => ({ ...prev, open: false }))}
          sx={{ width: "100%" }}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Stack>
  );
}
