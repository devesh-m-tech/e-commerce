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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tabs,
  Tab,
  CircularProgress,
  Tooltip,
  Card,
  CardContent,
  Grid,
  Divider,
  FormControlLabel,
  Checkbox,
  Alert,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import HistoryIcon from "@mui/icons-material/History";
import { useSnackbar } from "notistack";
import exchangeApi from "../api/exchangeApi";

const Exchanges = () => {
  const [exchanges, setExchanges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, completed: 0, total: 0 });

  // Modal / Review state
  const [selectedExchange, setSelectedExchange] = useState(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [actionType, setActionType] = useState(null); // 'APPROVE' or 'REJECT'
  const [decisionNotes, setDecisionNotes] = useState({ rejectionReason: "", internalNote: "", adjustStock: false });
  const [submittingDecision, setSubmittingDecision] = useState(false);
  const { enqueueSnackbar } = useSnackbar();

  const fetchExchanges = useCallback(async () => {
    try {
      setLoading(true);
      const res = await exchangeApi.getAllExchanges({
        status: activeTab === "ALL" ? "" : activeTab,
        search: searchQuery
      });
      const rawExchanges = Array.isArray(res?.exchanges)
        ? res.exchanges
        : Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res)
        ? res
        : [];
      setExchanges(rawExchanges);
      if (res?.stats) setStats(res.stats);
    } catch (err) {
      console.warn("Could not fetch exchanges from backend:", err);
      // Fallback mock for demo if backend offline
      setExchanges([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab, searchQuery]);

  useEffect(() => {
    fetchExchanges();
  }, [fetchExchanges]);

  const handleOpenReview = (exchange) => {
    setSelectedExchange(exchange);
    setDecisionNotes({
      rejectionReason: exchange.adminDecision?.rejectionReason || "",
      internalNote: exchange.adminDecision?.internalNote || "",
      adjustStock: false,
    });
    setActionType(null);
    setReviewDialogOpen(true);
  };

  const handleProcessDecision = async (status) => {
    if (status === "REJECTED" && !decisionNotes.rejectionReason.trim()) {
      enqueueSnackbar("Please enter a rejection reason to clearly notify the customer", { variant: "warning" });
      return;
    }

    try {
      setSubmittingDecision(true);
      const res = await exchangeApi.updateExchangeStatus(selectedExchange._id, {
        status,
        rejectionReason: decisionNotes.rejectionReason,
        internalNote: decisionNotes.internalNote,
        adjustStock: decisionNotes.adjustStock,
      });

      if (res.success) {
        enqueueSnackbar(`Exchange request ${status.toLowerCase()} successfully!`, { variant: "success" });
        setReviewDialogOpen(false);
        fetchExchanges();
      }
    } catch (err) {
      enqueueSnackbar(err.message || "Failed to update exchange request", { variant: "error" });
    } finally {
      setSubmittingDecision(false);
    }
  };

  const handleWorkflowUpdate = async (workflowStatus) => {
    try {
      setSubmittingDecision(true);
      const res = await exchangeApi.updateExchangeWorkflow(selectedExchange._id, {
        exchangeOrderStatus: workflowStatus,
        note: `Status updated to ${workflowStatus} by admin`
      });
      if (res.success) {
        enqueueSnackbar("Fulfillment status updated", { variant: "success" });
        setSelectedExchange(res.exchange);
        fetchExchanges();
      }
    } catch (err) {
      enqueueSnackbar(err.message || "Failed to update workflow", { variant: "error" });
    } finally {
      setSubmittingDecision(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "APPROVED": return "success";
      case "PENDING": return "warning";
      case "REJECTED": return "error";
      case "COMPLETED": return "info";
      default: return "default";
    }
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontFamily: '"Playfair Display", Georgia, serif', color: "#6D1734", fontWeight: 700 }}>
            Exchange Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Review customer exchange requests, inspect evidence photos & videos, and control approval workflows.
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={fetchExchanges}
          sx={{ borderColor: "#6D1734", color: "#6D1734" }}
        >
          Refresh
        </Button>
      </Box>

      {/* KPI Stats Strip */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: "#FFF9F0", border: "1px solid #E5D5C5" }}>
            <CardContent sx={{ py: 2 }}>
              <Typography variant="overline" color="text.secondary">Pending Review</Typography>
              <Typography variant="h4" sx={{ color: "#ed6c02", fontWeight: 700 }}>
                {stats.pending}
              </Typography>
              <Typography variant="caption" color="text.secondary">Awaiting Admin Decision</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: "#F0FDF4", border: "1px solid #BBF7D0" }}>
            <CardContent sx={{ py: 2 }}>
              <Typography variant="overline" color="text.secondary">Approved</Typography>
              <Typography variant="h4" sx={{ color: "#16a34a", fontWeight: 700 }}>
                {stats.approved}
              </Typography>
              <Typography variant="caption" color="text.secondary">Eligible for Replacement</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: "#FEF2F2", border: "1px solid #FECACA" }}>
            <CardContent sx={{ py: 2 }}>
              <Typography variant="overline" color="text.secondary">Rejected</Typography>
              <Typography variant="h4" sx={{ color: "#dc2626", fontWeight: 700 }}>
                {stats.rejected}
              </Typography>
              <Typography variant="caption" color="text.secondary">Declined with Reason</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: "#F5F3FF", border: "1px solid #DDD6FE" }}>
            <CardContent sx={{ py: 2 }}>
              <Typography variant="overline" color="text.secondary">Completed</Typography>
              <Typography variant="h4" sx={{ color: "#7c3aed", fontWeight: 700 }}>
                {stats.completed}
              </Typography>
              <Typography variant="caption" color="text.secondary">Replacement Delivered</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs & Search */}
      <Paper sx={{ mb: 3, p: 2 }}>
        <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 2 }}>
          <Tabs
            value={activeTab}
            onChange={(e, val) => setActiveTab(val)}
            textColor="primary"
            indicatorColor="primary"
            sx={{ "& .MuiTab-root": { fontWeight: 600 } }}
          >
            <Tab label={`All (${stats.total || exchanges.length})`} value="ALL" />
            <Tab label={`Pending (${stats.pending})`} value="PENDING" />
            <Tab label={`Approved (${stats.approved})`} value="APPROVED" />
            <Tab label={`Rejected (${stats.rejected})`} value="REJECTED" />
            <Tab label={`Completed (${stats.completed})`} value="COMPLETED" />
          </Tabs>

          <Box sx={{ display: "flex", alignItems: "center", width: { xs: "100%", sm: 320 } }}>
            <TextField
              size="small"
              fullWidth
              placeholder="Search by Order # or Customer..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: "text.secondary", mr: 1, fontSize: 20 }} />,
              }}
            />
          </Box>
        </Box>
      </Paper>

      {/* Main Table */}
      <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid #e0e0e0", borderRadius: 2 }}>
        {loading ? (
          <Box sx={{ p: 4, textAlign: "center" }}>
            <CircularProgress />
            <Typography variant="body2" sx={{ mt: 2 }}>Loading exchange requests...</Typography>
          </Box>
        ) : exchanges.length === 0 ? (
          <Box sx={{ p: 6, textAlign: "center" }}>
            <Typography variant="h6" color="text.secondary">No exchange requests found</Typography>
            <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>
              Requests submitted by customers with photo and video proof will appear here for review.
            </Typography>
          </Box>
        ) : (
          <Table>
            <TableHead sx={{ bgcolor: "#fafafa" }}>
              <TableRow>
                <TableCell><strong>Exchange ID / Date</strong></TableCell>
                <TableCell><strong>Order / Customer</strong></TableCell>
                <TableCell><strong>Product Item</strong></TableCell>
                <TableCell><strong>Reason & Issue</strong></TableCell>
                <TableCell><strong>Proof Media</strong></TableCell>
                <TableCell><strong>Status</strong></TableCell>
                <TableCell align="right"><strong>Action</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(Array.isArray(exchanges) ? exchanges : []).map((ex) => (
                <TableRow key={ex?._id || Math.random()} hover>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>#{ex?._id ? ex._id.slice(-6).toUpperCase() : 'REQ'}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {ex?.createdAt ? new Date(ex.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : 'Recent'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>Order #{ex.orderNumber}</Typography>
                    <Typography variant="caption" color="text.secondary" display="block">{ex.customerName}</Typography>
                    <Typography variant="caption" color="text.secondary">{ex.customerPhone}</Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      {ex.productImage && (
                        <img
                          src={ex.productImage}
                          alt={ex.productName}
                          style={{ width: 44, height: 44, objectFit: "cover", borderRadius: 4 }}
                        />
                      )}
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{ex.productName}</Typography>
                        {ex.variantDetails && (
                          <Typography variant="caption" color="text.secondary">Var: {ex.variantDetails}</Typography>
                        )}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 220 }}>
                    <Typography variant="body2" noWrap title={ex.reason}>
                      {ex.reason}
                    </Typography>
                    {ex.requestedSizeOrItem && (
                      <Typography variant="caption" color="primary.main" display="block">
                        Requested: {ex.requestedSizeOrItem}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {ex.photos?.length > 0 && (
                        <Chip size="small" label={`${ex.photos.length} Photo${ex.photos.length > 1 ? "s" : ""}`} />
                      )}
                      {ex.video && (
                        <Chip
                          size="small"
                          icon={<PlayCircleOutlineIcon sx={{ fontSize: 16 }} />}
                          label="Video Proof"
                          color="primary"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={ex.status}
                      color={getStatusColor(ex.status)}
                      sx={{ fontWeight: 600 }}
                    />
                    {ex.exchangeOrderStatus && ex.exchangeOrderStatus !== "PENDING_REVIEW" && (
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
                        {ex.exchangeOrderStatus.replace(/_/g, " ")}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<VisibilityIcon />}
                      onClick={() => handleOpenReview(ex)}
                      sx={{ bgcolor: "#6D1734", "&:hover": { bgcolor: "#4A1025" } }}
                    >
                      Review
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      {/* Review & Decision Dialog */}
      <Dialog
        open={reviewDialogOpen}
        onClose={() => setReviewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedExchange && (
          <>
            <DialogTitle sx={{ bgcolor: "#FFF9F0", borderBottom: "1px solid #EDE2D2", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Box>
                <Typography variant="h6" sx={{ fontFamily: '"Playfair Display", Georgia, serif', color: "#6D1734", fontWeight: 700 }}>
                  Review Exchange #{selectedExchange._id.slice(-6).toUpperCase()}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Order ID: #{selectedExchange.orderNumber} · Filed on {new Date(selectedExchange.createdAt).toLocaleString()}
                </Typography>
              </Box>
              <Chip
                label={selectedExchange.status}
                color={getStatusColor(selectedExchange.status)}
                sx={{ fontWeight: 700 }}
              />
            </DialogTitle>

            <DialogContent sx={{ p: 3 }}>
              {/* Product & Customer Details */}
              <Grid container spacing={3} sx={{ mt: 0.5, mb: 2 }}>
                <Grid item xs={12} md={6}>
                  <Paper variant="outlined" sx={{ p: 2, height: "100%" }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      CUSTOMER INFORMATION
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>{selectedExchange.customerName}</Typography>
                    <Typography variant="body2" color="text.secondary">Phone: {selectedExchange.customerPhone}</Typography>
                    <Typography variant="body2" color="text.secondary">Email: {selectedExchange.customerEmail}</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper variant="outlined" sx={{ p: 2, height: "100%" }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      ITEM TO BE EXCHANGED
                    </Typography>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>{selectedExchange.productName}</Typography>
                    <Typography variant="body2" color="text.secondary">Qty: {selectedExchange.quantity}</Typography>
                    {selectedExchange.variantDetails && (
                      <Typography variant="body2" color="text.secondary">Current Variant: {selectedExchange.variantDetails}</Typography>
                    )}
                    {selectedExchange.requestedSizeOrItem && (
                      <Typography variant="body2" sx={{ color: "#6D1734", fontWeight: 600, mt: 0.5 }}>
                        Replacement Requested: {selectedExchange.requestedSizeOrItem}
                      </Typography>
                    )}
                  </Paper>
                </Grid>
              </Grid>

              {/* Customer Reason */}
              <Alert severity="info" icon={<HistoryIcon />} sx={{ mb: 3 }}>
                <strong>Customer's Stated Reason:</strong> {selectedExchange.reason}
              </Alert>

              {/* Evidence: Photos and Video */}
              <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "#6D1734", mb: 1 }}>
                Proof Evidence Submitted by Customer
              </Typography>
              
              <Grid container spacing={2} sx={{ mb: 3 }}>
                {/* Video Preview */}
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" sx={{ fontWeight: 600, display: "block", mb: 0.5 }}>
                    MANDATORY UNBOXING / DEFECT VIDEO:
                  </Typography>
                  {selectedExchange.video ? (
                    <Box sx={{ border: "1px solid #e0e0e0", borderRadius: 2, overflow: "hidden", bgcolor: "#000" }}>
                      <video
                        controls
                        style={{ width: "100%", maxHeight: 260, display: "block" }}
                        src={selectedExchange.video}
                      >
                        Your browser does not support video playback.
                      </video>
                    </Box>
                  ) : (
                    <Alert severity="warning">No video provided with this request.</Alert>
                  )}
                </Grid>

                {/* Photos Gallery */}
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" sx={{ fontWeight: 600, display: "block", mb: 0.5 }}>
                    PRODUCT PHOTOS ({selectedExchange.photos?.length || 0}):
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", maxHeight: 260, overflowY: "auto" }}>
                    {Array.isArray(selectedExchange?.photos) && selectedExchange.photos.length > 0 ? (
                      selectedExchange.photos.map((photo, i) => (
                        <a key={i} href={photo} target="_blank" rel="noopener noreferrer">
                          <img
                            src={photo}
                            alt={`Proof ${i + 1}`}
                            style={{ width: 110, height: 110, objectFit: "cover", borderRadius: 4, border: "1px solid #ddd" }}
                          />
                        </a>
                      ))
                    ) : (
                      <Typography variant="body2" color="text.secondary">No photos attached</Typography>
                    )}
                  </Box>
                </Grid>
              </Grid>

              <Divider sx={{ my: 2 }} />

              {/* Admin Decision Actions */}
              {selectedExchange.status === "PENDING" ? (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                    TAKE ACTION ON THIS REQUEST:
                  </Typography>

                  <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                    <Button
                      variant={actionType === "APPROVE" ? "contained" : "outlined"}
                      color="success"
                      startIcon={<CheckCircleIcon />}
                      onClick={() => setActionType("APPROVE")}
                    >
                      Approve Exchange
                    </Button>
                    <Button
                      variant={actionType === "REJECT" ? "contained" : "outlined"}
                      color="error"
                      startIcon={<CancelIcon />}
                      onClick={() => setActionType("REJECT")}
                    >
                      Reject Exchange
                    </Button>
                  </Box>

                  {actionType === "APPROVE" && (
                    <Box sx={{ p: 2, bgcolor: "#F0FDF4", borderRadius: 2, border: "1px solid #BBF7D0", mb: 2 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "#16a34a", mb: 1 }}>
                        Approving Exchange: The customer will be notified via SMS/WhatsApp to prepare the item.
                      </Typography>
                      <TextField
                        fullWidth
                        size="small"
                        label="Internal Staff Note (Optional)"
                        value={decisionNotes.internalNote}
                        onChange={(e) => setDecisionNotes({ ...decisionNotes, internalNote: e.target.value })}
                        placeholder="e.g. Approved for Size M exchange; pickup assigned to Bluedart"
                        sx={{ mb: 1.5, bgcolor: "white" }}
                      />
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={decisionNotes.adjustStock}
                            onChange={(e) => setDecisionNotes({ ...decisionNotes, adjustStock: e.target.checked })}
                          />
                        }
                        label="Automatically deduct replacement item from inventory stock"
                      />
                    </Box>
                  )}

                  {actionType === "REJECT" && (
                    <Box sx={{ p: 2, bgcolor: "#FEF2F2", borderRadius: 2, border: "1px solid #FECACA", mb: 2 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: "#dc2626", mb: 1 }}>
                        Rejection Reason (This will be shown directly to the customer):
                      </Typography>
                      <TextField
                        fullWidth
                        size="small"
                        required
                        multiline
                        rows={2}
                        label="Rejection Reason"
                        value={decisionNotes.rejectionReason}
                        onChange={(e) => setDecisionNotes({ ...decisionNotes, rejectionReason: e.target.value })}
                        placeholder="e.g. Video shows item has been visibly worn/washed with tags removed, violating the store exchange policy."
                        sx={{ bgcolor: "white" }}
                      />
                    </Box>
                  )}
                </Box>
              ) : (
                /* Previously Decided Details */
                <Box sx={{ p: 2, bgcolor: "#fafafa", borderRadius: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    DECISION RECORD:
                  </Typography>
                  <Typography variant="body2">
                    <strong>Decided By:</strong> {selectedExchange.adminDecision?.decidedByName || "Store Admin"}
                  </Typography>
                  {selectedExchange.adminDecision?.decidedAt && (
                    <Typography variant="body2" color="text.secondary">
                      <strong>Date:</strong> {new Date(selectedExchange.adminDecision.decidedAt).toLocaleString()}
                    </Typography>
                  )}
                  {selectedExchange.adminDecision?.rejectionReason && (
                    <Alert severity="error" sx={{ mt: 1 }}>
                      <strong>Rejection Reason:</strong> {selectedExchange.adminDecision.rejectionReason}
                    </Alert>
                  )}
                  {selectedExchange.adminDecision?.internalNote && (
                    <Typography variant="body2" sx={{ mt: 1, fontStyle: "italic" }}>
                      Internal Note: {selectedExchange.adminDecision.internalNote}
                    </Typography>
                  )}

                  {selectedExchange.status === "APPROVED" && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                        Update Fulfillment Progress:
                      </Typography>
                      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleWorkflowUpdate("APPROVED_PICKUP_SCHEDULED")}
                        >
                          Pickup Scheduled
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleWorkflowUpdate("ITEM_RECEIVED")}
                        >
                          Item Received
                        </Button>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleWorkflowUpdate("REPLACEMENT_DISPATCHED")}
                        >
                          Replacement Dispatched
                        </Button>
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          onClick={() => handleWorkflowUpdate("COMPLETED")}
                        >
                          Mark Completed
                        </Button>
                      </Box>
                    </Box>
                  )}
                </Box>
              )}
            </DialogContent>

            <DialogActions sx={{ p: 2, bgcolor: "#fafafa" }}>
              <Button onClick={() => setReviewDialogOpen(false)}>Close</Button>
              {selectedExchange.status === "PENDING" && actionType === "APPROVE" && (
                <Button
                  variant="contained"
                  color="success"
                  disabled={submittingDecision}
                  onClick={() => handleProcessDecision("APPROVED")}
                >
                  Confirm Approval
                </Button>
              )}
              {selectedExchange.status === "PENDING" && actionType === "REJECT" && (
                <Button
                  variant="contained"
                  color="error"
                  disabled={submittingDecision}
                  onClick={() => handleProcessDecision("REJECTED")}
                >
                  Confirm Rejection
                </Button>
              )}
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default Exchanges;
