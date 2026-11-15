import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Pagination,
  InputAdornment,
} from "@mui/material";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import RefreshIcon from "@mui/icons-material/Refresh";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import SearchIcon from "@mui/icons-material/Search";
import ReplayIcon from "@mui/icons-material/Replay";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import SendIcon from "@mui/icons-material/Send";
import { useSnackbar } from "notistack";
import AdminPageHeader from "../components/common/AdminPageHeader";
import {
  getWhatsAppLogs,
  exportWhatsAppLogsCsv,
  resendWhatsAppMessage,
  getWhatsAppStatus,
} from "../api/whatsappApi";

const statusColorMap = {
  queued: { bg: "#FFF4E5", text: "#B76E00", border: "#FFE2B8", icon: <HourglassEmptyIcon sx={{ fontSize: 14 }} /> },
  sending: { bg: "#EBF8FF", text: "#1D4ED8", border: "#BFDBFE", icon: <SendIcon sx={{ fontSize: 14 }} /> },
  sent: { bg: "#EFF6FF", text: "#2563EB", border: "#DBEAFE", icon: <DoneAllIcon sx={{ fontSize: 14 }} /> },
  delivered: { bg: "#F3E8FF", text: "#7E22CE", border: "#E9D5FF", icon: <DoneAllIcon sx={{ fontSize: 14 }} /> },
  read: { bg: "#ECFDF5", text: "#047857", border: "#A7F3D0", icon: <DoneAllIcon sx={{ fontSize: 14 }} /> },
  failed: { bg: "#FEF2F2", text: "#B91C1C", border: "#FECACA", icon: <ErrorOutlineIcon sx={{ fontSize: 14 }} /> },
};

const WhatsAppLogs = () => {
  const { enqueueSnackbar } = useSnackbar();

  // State
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, pages: 1 });
  const [loading, setLoading] = useState(false);
  const [statusInfo, setStatusInfo] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedEvent, setSelectedEvent] = useState("all");

  // Detail Modal
  const [detailModal, setDetailModal] = useState({ open: false, log: null });
  const [resendingId, setResendingId] = useState(null);

  // Load Status
  const loadStatus = async () => {
    try {
      const res = await getWhatsAppStatus();
      if (res.success) {
        setStatusInfo(res.status);
      }
    } catch (e) {
      console.warn("Could not fetch WhatsApp service status", e);
    }
  };

  // Load Logs
  const loadLogs = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: pagination.limit,
      };
      if (selectedStatus !== "all") params.status = selectedStatus;
      if (selectedEvent !== "all") params.eventType = selectedEvent;
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const res = await getWhatsAppLogs(params);
      if (res.success) {
        setLogs(res.messages || []);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      }
    } catch (err) {
      enqueueSnackbar(err.message || "Failed to load WhatsApp logs", { variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [pagination.limit, selectedStatus, selectedEvent, searchTerm, enqueueSnackbar]);

  useEffect(() => {
    loadStatus();
    loadLogs(1);
  }, []);

  // Filter trigger
  const handleApplyFilter = () => {
    loadLogs(1);
  };

  const handlePageChange = (event, value) => {
    loadLogs(value);
  };

  // Resend action
  const handleResend = async (msgId) => {
    setResendingId(msgId);
    try {
      const res = await resendWhatsAppMessage(msgId);
      if (res.success) {
        enqueueSnackbar("Message re-queued for delivery successfully", { variant: "success" });
        loadLogs(pagination.page);
      } else {
        enqueueSnackbar(res.message || "Could not resend message", { variant: "error" });
      }
    } catch (err) {
      enqueueSnackbar(err.message || "Error resending message", { variant: "error" });
    } finally {
      setResendingId(null);
    }
  };

  // Export CSV
  const handleExportCsv = async () => {
    try {
      const params = {};
      if (selectedStatus !== "all") params.status = selectedStatus;
      if (selectedEvent !== "all") params.eventType = selectedEvent;
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const blob = await exportWhatsAppLogsCsv(params);
      const url = window.URL.createObjectURL(new Blob([blob], { type: "text/csv;charset=utf-8;" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `sds_whatsapp_logs_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      enqueueSnackbar("CSV logs exported successfully", { variant: "success" });
    } catch (err) {
      enqueueSnackbar("Export failed: " + (err.message || "Unknown error"), { variant: "error" });
    }
  };

  // Statistics calculation
  const totalCount = pagination.total || logs.length;
  const deliveredCount = logs.filter(l => l.status === "delivered" || l.status === "read").length;
  const readCount = logs.filter(l => l.status === "read").length;
  const failedCount = logs.filter(l => l.status === "failed").length;

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <AdminPageHeader
        title="WhatsApp Communication Logs"
        breadcrumbs={[
          { label: "Dashboard", path: "/" },
          { label: "Store Settings", path: "/settings" },
          { label: "WhatsApp Logs" },
        ]}
        subtitle="Live delivery monitoring, webhook tracking, and template audit trails for Shri Deepaalaya Silks"
      />

      {/* TOP STATUS CARDS */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: "#FFFFFF", borderRadius: 2, border: "1px solid #E5E7EB", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="body2" sx={{ color: "#6B7280", fontWeight: 600 }}>
                  Active Provider
                </Typography>
                <WhatsAppIcon sx={{ color: "#25D366" }} />
              </Box>
              <Typography variant="h6" sx={{ mt: 1, fontWeight: 700, color: "#111827" }}>
                {statusInfo?.sandboxMode ? "Sandbox (Mock Mode)" : "Meta Cloud API v21.0"}
              </Typography>
              <Typography variant="caption" sx={{ color: statusInfo?.sandboxMode ? "#D97706" : "#059669", fontWeight: 600 }}>
                {statusInfo?.sandboxMode ? "● Simulation mode active" : "● Live connected"}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: "#FFFFFF", borderRadius: 2, border: "1px solid #E5E7EB", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="body2" sx={{ color: "#6B7280", fontWeight: 600 }}>
                Total Messages
              </Typography>
              <Typography variant="h5" sx={{ mt: 1, fontWeight: 700, color: "#6D1734" }}>
                {totalCount}
              </Typography>
              <Typography variant="caption" sx={{ color: "#6B7280" }}>
                Logged in database
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: "#FFFFFF", borderRadius: 2, border: "1px solid #E5E7EB", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="body2" sx={{ color: "#6B7280", fontWeight: 600 }}>
                Delivered / Read Rate
              </Typography>
              <Typography variant="h5" sx={{ mt: 1, fontWeight: 700, color: "#047857" }}>
                {logs.length > 0 ? `${Math.round(((deliveredCount) / logs.length) * 100)}%` : "100%"}
              </Typography>
              <Typography variant="caption" sx={{ color: "#059669" }}>
                {deliveredCount} delivered, {readCount} opened
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: "#FFFFFF", borderRadius: 2, border: "1px solid #E5E7EB", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
            <CardContent sx={{ p: 2 }}>
              <Typography variant="body2" sx={{ color: "#6B7280", fontWeight: 600 }}>
                Failed / Retry Backlog
              </Typography>
              <Typography variant="h5" sx={{ mt: 1, fontWeight: 700, color: failedCount > 0 ? "#DC2626" : "#6B7280" }}>
                {failedCount}
              </Typography>
              <Typography variant="caption" sx={{ color: "#9CA3AF" }}>
                Exponential retry (1m, 5m, 15m)
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* FILTER & ACTION TOOLBAR */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: 2, border: "1px solid #E5E7EB", boxShadow: "none" }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by Order ID, Phone (+91...), or Customer"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleApplyFilter()}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: "#9CA3AF", fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={6} sm={2} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={selectedStatus}
                label="Status"
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="queued">Queued</MenuItem>
                <MenuItem value="sending">Sending</MenuItem>
                <MenuItem value="sent">Sent</MenuItem>
                <MenuItem value="delivered">Delivered</MenuItem>
                <MenuItem value="read">Read</MenuItem>
                <MenuItem value="failed">Failed</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={6} sm={3} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Event Type</InputLabel>
              <Select
                value={selectedEvent}
                label="Event Type"
                onChange={(e) => setSelectedEvent(e.target.value)}
              >
                <MenuItem value="all">All Events</MenuItem>
                <MenuItem value="order_confirmation_invoice">Order Confirmed + Invoice PDF</MenuItem>
                <MenuItem value="order_shipped">Order Dispatched</MenuItem>
                <MenuItem value="order_delivered">Order Delivered</MenuItem>
                <MenuItem value="order_cancelled">Order Cancelled</MenuItem>
                <MenuItem value="refund_processed">Refund Processed</MenuItem>
                <MenuItem value="owner_new_order_alert">Owner Order Alert</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={3} md={3} sx={{ display: "flex", gap: 1, justifyContent: "flex-end" }}>
            <Button
              variant="contained"
              onClick={handleApplyFilter}
              sx={{
                bgcolor: "#6D1734",
                color: "#FFFFFF",
                textTransform: "none",
                fontWeight: 600,
                borderRadius: 2,
                "&:hover": { bgcolor: "#4A1025" },
              }}
            >
              Filter
            </Button>
            <IconButton onClick={() => loadLogs(pagination.page)} title="Refresh Logs" sx={{ border: "1px solid #E5E7EB" }}>
              <RefreshIcon sx={{ color: "#6D1734" }} />
            </IconButton>
            <Button
              variant="outlined"
              startIcon={<FileDownloadIcon />}
              onClick={handleExportCsv}
              sx={{
                borderColor: "#C5A15A",
                color: "#282321",
                textTransform: "none",
                fontWeight: 600,
                borderRadius: 2,
                "&:hover": { borderColor: "#9E7B32", bgcolor: "#FAF7F2" },
              }}
            >
              Export CSV
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* TABLE */}
      <Paper sx={{ borderRadius: 2, border: "1px solid #E5E7EB", overflow: "hidden", boxShadow: "none" }}>
        <TableContainer>
          <Table sx={{ minWidth: 750 }}>
            <TableHead sx={{ bgcolor: "#FAF7F2" }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, color: "#282321", fontSize: "0.82rem" }}>Timestamp</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#282321", fontSize: "0.82rem" }}>Event / Template</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#282321", fontSize: "0.82rem" }}>Recipient Phone</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#282321", fontSize: "0.82rem" }}>Related Order</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#282321", fontSize: "0.82rem" }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#282321", fontSize: "0.82rem" }}>Attempts</TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#282321", fontSize: "0.82rem", textAlign: "right" }}>Actions</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={32} sx={{ color: "#6D1734" }} />
                    <Typography variant="body2" sx={{ mt: 1, color: "#6B7280" }}>
                      Fetching WhatsApp communication records...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <WhatsAppIcon sx={{ fontSize: 48, color: "#D1D5DB", mb: 1 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: "#4B5563" }}>
                      No WhatsApp messages logged yet
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#9CA3AF" }}>
                      When orders are placed, dispatched, or refunded, messages will appear here.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => {
                  const statusConf = statusColorMap[log.status] || statusColorMap.queued;
                  const dateFormatted = log.createdAt
                    ? new Date(log.createdAt).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "—";

                  return (
                    <TableRow key={log._id} hover sx={{ "&:last-child td": { borderBottom: 0 } }}>
                      <TableCell sx={{ fontSize: "0.85rem", color: "#374151" }}>
                        {dateFormatted}
                      </TableCell>

                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: "#111827", textTransform: "capitalize" }}>
                          {log.eventType ? log.eventType.replace(/_/g, " ") : "Message"}
                        </Typography>
                        <Typography variant="caption" sx={{ color: "#6B7280", fontFamily: "monospace" }}>
                          {log.templateName || "custom"}
                        </Typography>
                      </TableCell>

                      <TableCell sx={{ fontFamily: "monospace", fontSize: "0.85rem", fontWeight: 600, color: "#1E293B" }}>
                        {log.recipientPhone}
                      </TableCell>

                      <TableCell>
                        {log.orderId ? (
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: "#6D1734" }}>
                              #{log.orderId?.invoiceNumber || (log.orderId?._id ? log.orderId._id.slice(-6).toUpperCase() : String(log.orderId).slice(-6).toUpperCase())}
                            </Typography>
                            {log.orderId?.shippingAddress?.name && (
                              <Typography variant="caption" sx={{ color: "#6B7280" }}>
                                {log.orderId.shippingAddress.name}
                              </Typography>
                            )}
                          </Box>
                        ) : (
                          <Typography variant="caption" sx={{ color: "#9CA3AF" }}>
                            General Notice
                          </Typography>
                        )}
                      </TableCell>

                      <TableCell>
                        <Chip
                          icon={statusConf.icon}
                          label={log.status?.toUpperCase()}
                          size="small"
                          sx={{
                            bgcolor: statusConf.bg,
                            color: statusConf.text,
                            border: `1px solid ${statusConf.border}`,
                            fontWeight: 700,
                            fontSize: "0.72rem",
                          }}
                        />
                      </TableCell>

                      <TableCell sx={{ fontSize: "0.85rem", color: "#4B5563" }}>
                        {log.attempts || 1} / {log.maxAttempts || 3}
                      </TableCell>

                      <TableCell align="right">
                        <Tooltip title="View Message Payload & Info">
                          <IconButton
                            size="small"
                            onClick={() => setDetailModal({ open: true, log })}
                            sx={{ color: "#6B7280", "&:hover": { color: "#111827" } }}
                          >
                            <InfoOutlinedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>

                        {(log.status === "failed" || log.status === "sent" || log.status === "delivered") && (
                          <Tooltip title="Resend WhatsApp Template">
                            <IconButton
                              size="small"
                              onClick={() => handleResend(log._id)}
                              disabled={resendingId === log._id}
                              sx={{ color: "#25D366", "&:hover": { bgcolor: "rgba(37, 211, 102, 0.1)" } }}
                            >
                              {resendingId === log._id ? (
                                <CircularProgress size={16} color="inherit" />
                              ) : (
                                <ReplayIcon fontSize="small" />
                              )}
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* PAGINATION */}
        {pagination.pages > 1 && (
          <Box sx={{ p: 2, display: "flex", justifyContent: "flex-end", borderTop: "1px solid #E5E7EB" }}>
            <Pagination
              count={pagination.pages}
              page={pagination.page}
              onChange={handlePageChange}
              color="primary"
              size="small"
            />
          </Box>
        )}
      </Paper>

      {/* DETAIL MODAL */}
      <Dialog
        open={detailModal.open}
        onClose={() => setDetailModal({ open: false, log: null })}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, color: "#6D1734", borderBottom: "1px solid #E5E7EB" }}>
          WhatsApp Message Audit Details
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {detailModal.log && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="caption" sx={{ color: "#6B7280", fontWeight: 700 }}>
                  EVENT TYPE
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {detailModal.log.eventType}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="caption" sx={{ color: "#6B7280", fontWeight: 700 }}>
                  TEMPLATE NAME
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {detailModal.log.templateName}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="caption" sx={{ color: "#6B7280", fontWeight: 700 }}>
                  RECIPIENT PHONE (E.164)
                </Typography>
                <Typography variant="body1" sx={{ fontFamily: "monospace", fontWeight: 600 }}>
                  {detailModal.log.recipientPhone}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="caption" sx={{ color: "#6B7280", fontWeight: 700 }}>
                  PROVIDER MESSAGE ID (WAMID)
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: "monospace", wordBreak: "break-all" }}>
                  {detailModal.log.providerMessageId || "Pending / Mocked"}
                </Typography>
              </Grid>

              {detailModal.log.documentUrl && (
                <Grid item xs={12}>
                  <Typography variant="caption" sx={{ color: "#6B7280", fontWeight: 700 }}>
                    ATTACHED INVOICE PDF (SIGNED URL)
                  </Typography>
                  <Typography variant="body2" sx={{ wordBreak: "break-all", color: "#1D4ED8" }}>
                    <a href={detailModal.log.documentUrl} target="_blank" rel="noreferrer">
                      {detailModal.log.filename || "invoice.pdf"} ({detailModal.log.documentUrl})
                    </a>
                  </Typography>
                </Grid>
              )}

              {detailModal.log.errorMessage && (
                <Grid item xs={12}>
                  <Typography variant="caption" sx={{ color: "#DC2626", fontWeight: 700 }}>
                    ERROR DETAILS
                  </Typography>
                  <Paper sx={{ p: 1.5, bgcolor: "#FEF2F2", border: "1px solid #FECACA" }}>
                    <Typography variant="body2" sx={{ color: "#991B1B", fontFamily: "monospace" }}>
                      [{detailModal.log.errorCode || "ERR"}]: {detailModal.log.errorMessage}
                    </Typography>
                  </Paper>
                </Grid>
              )}

              <Grid item xs={12}>
                <Typography variant="caption" sx={{ color: "#6B7280", fontWeight: 700 }}>
                  TEMPLATE PARAMETERS & VARIABLES
                </Typography>
                <Paper sx={{ p: 1.5, bgcolor: "#F9FAFB", border: "1px solid #E5E7EB", maxHeight: 180, overflow: "auto" }}>
                  <pre style={{ margin: 0, fontSize: "0.8rem", fontFamily: "monospace" }}>
                    {JSON.stringify(detailModal.log.parameters || {}, null, 2)}
                  </pre>
                </Paper>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: "1px solid #E5E7EB" }}>
          <Button onClick={() => setDetailModal({ open: false, log: null })}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WhatsAppLogs;
