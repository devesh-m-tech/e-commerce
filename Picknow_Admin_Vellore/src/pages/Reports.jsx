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
  Tabs,
  Tab,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Divider,
} from "@mui/material";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import PrintIcon from "@mui/icons-material/Print";
import RefreshIcon from "@mui/icons-material/Refresh";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import InventoryIcon from "@mui/icons-material/Inventory";
import PaymentIcon from "@mui/icons-material/Payment";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import * as XLSX from "xlsx";
import { fetchReports } from "../api/dashboardApi";
import { useSnackbar } from "notistack";

const formatINR = (val) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(val || 0);

const Reports = () => {
  const [range, setRange] = useState("month");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);
  const { enqueueSnackbar } = useSnackbar();

  const loadReports = useCallback(async () => {
    try {
      setLoading(true);
      const params = { range };
      if (range === "custom" && startDate && endDate) {
        params.startDate = startDate;
        params.endDate = endDate;
      }
      const data = await fetchReports(params);
      if (data && data.success) {
        setReportData(data);
      } else {
        setReportData({
          salesSummary: { totalOrders: 0, totalRevenue: 0, totalShipping: 0, totalDiscount: 0, averageOrderValue: 0 },
          paymentMethods: [],
          orderStatuses: [],
          productSales: [],
          lowStockReport: [],
          exchangeReport: { total: 0, pending: 0, approved: 0, rejected: 0, completed: 0, reasonsList: [] }
        });
      }
    } catch (err) {
      console.warn("Failed to load live reports, using fallback", err);
      // Fallback empty structure
      setReportData({
        salesSummary: { totalOrders: 0, totalRevenue: 0, totalShipping: 0, totalDiscount: 0, averageOrderValue: 0 },
        paymentMethods: [],
        orderStatuses: [],
        productSales: [],
        lowStockReport: [],
        exchangeReport: { total: 0, pending: 0, approved: 0, rejected: 0, completed: 0, reasonsList: [] }
      });
    } finally {
      setLoading(false);
    }
  }, [range, startDate, endDate]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  // Export multiple sheets to Excel
  const handleExportExcel = () => {
    if (!reportData) return;

    try {
      const wb = XLSX.utils.book_new();

      // Sheet 1: Sales Summary
      const summaryRows = [
        ["Report Period", range.toUpperCase()],
        ["Total Orders", reportData.salesSummary?.totalOrders || 0],
        ["Total Net Revenue", reportData.salesSummary?.totalRevenue || 0],
        ["Total Delivery Charges", reportData.salesSummary?.totalShipping || 0],
        ["Total Discounts Given", reportData.salesSummary?.totalDiscount || 0],
        ["Average Order Value", reportData.salesSummary?.averageOrderValue || 0],
      ];
      const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
      XLSX.utils.book_append_sheet(wb, wsSummary, "Sales Summary");

      // Sheet 2: Product-wise Sales
      if (reportData.productSales?.length > 0) {
        const productRows = reportData.productSales.map((p, idx) => ({
          "#": idx + 1,
          "Product Name": p.name,
          "Units Sold": p.quantity,
          "Total Revenue (INR)": p.revenue,
        }));
        const wsProducts = XLSX.utils.json_to_sheet(productRows);
        XLSX.utils.book_append_sheet(wb, wsProducts, "Product Sales");
      }

      // Sheet 3: Low Stock & Inventory
      if (reportData.lowStockReport?.length > 0) {
        const stockRows = reportData.lowStockReport.map((p, idx) => ({
          "#": idx + 1,
          "Product Name": p.name,
          "SKU / Code": p.sku,
          "Current Stock": p.stock,
          "Low Stock Threshold": p.threshold,
          "Price (INR)": p.price,
          "Health Status": p.status,
        }));
        const wsStock = XLSX.utils.json_to_sheet(stockRows);
        XLSX.utils.book_append_sheet(wb, wsStock, "Stock & Inventory");
      }

      // Sheet 4: Payment Methods
      if (reportData.paymentMethods?.length > 0) {
        const payRows = reportData.paymentMethods.map((pm, idx) => ({
          "#": idx + 1,
          "Payment Method": pm.method,
          "Order Count": pm.count,
          "Total Value (INR)": pm.amount,
        }));
        const wsPay = XLSX.utils.json_to_sheet(payRows);
        XLSX.utils.book_append_sheet(wb, wsPay, "Payment Methods");
      }

      // Sheet 5: Exchanges
      if (reportData.exchangeReport?.reasonsList?.length > 0) {
        const exRows = reportData.exchangeReport.reasonsList.map((r, idx) => ({
          "#": idx + 1,
          "Exchange Reason": r.reason,
          "Occurrences": r.count,
        }));
        const wsEx = XLSX.utils.json_to_sheet(exRows);
        XLSX.utils.book_append_sheet(wb, wsEx, "Exchanges");
      }

      const fileName = `Shri_Deepaalaya_Silks_Report_${range}_${new Date().toISOString().slice(0, 10)}.xlsx`;
      XLSX.writeFile(wb, fileName);
      enqueueSnackbar("Excel report exported successfully!", { variant: "success" });
    } catch (err) {
      console.error("Export error:", err);
      enqueueSnackbar("Failed to export Excel report", { variant: "error" });
    }
  };

  // Print Report to PDF
  const handlePrintPDF = () => {
    window.print();
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 2, mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontFamily: '"Playfair Display", Georgia, serif', color: "#6D1734", fontWeight: 700 }}>
            Reports & Business Intelligence
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Comprehensive sales, product performance, low-stock inventory, payment methods, and exchange reports.
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
          <Button
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            onClick={handleExportExcel}
            sx={{ borderColor: "#6D1734", color: "#6D1734" }}
          >
            Export to Excel
          </Button>
          <Button
            variant="contained"
            startIcon={<PrintIcon />}
            onClick={handlePrintPDF}
            sx={{ bgcolor: "#6D1734", "&:hover": { bgcolor: "#4A1025" } }}
          >
            Print / PDF
          </Button>
        </Box>
      </Box>

      {/* Date Range Control Bar */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={range}
              label="Time Range"
              onChange={(e) => setRange(e.target.value)}
            >
              <MenuItem value="today">Today (Daily)</MenuItem>
              <MenuItem value="week">Past 7 Days (Weekly)</MenuItem>
              <MenuItem value="month">Current Month (Monthly)</MenuItem>
              <MenuItem value="year">Current Year (Yearly)</MenuItem>
              <MenuItem value="custom">Custom Date Range</MenuItem>
            </Select>
          </FormControl>

          {range === "custom" && (
            <>
              <TextField
                size="small"
                type="date"
                label="Start Date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                size="small"
                type="date"
                label="End Date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
              <Button variant="contained" size="small" onClick={loadReports} sx={{ bgcolor: "#6D1734" }}>
                Apply
              </Button>
            </>
          )}

          <Button
            variant="text"
            startIcon={<RefreshIcon />}
            onClick={loadReports}
            sx={{ ml: "auto", color: "text.secondary" }}
          >
            Refresh Data
          </Button>
        </Box>
      </Paper>

      {/* KPI Highlights */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: "#FFF9F0", border: "1px solid #E5D5C5" }}>
            <CardContent>
              <Typography variant="overline" color="text.secondary">Total Revenue</Typography>
              <Typography variant="h5" sx={{ color: "#6D1734", fontWeight: 700 }}>
                {formatINR(reportData?.salesSummary?.totalRevenue || 0)}
              </Typography>
              <Typography variant="caption" color="text.secondary">Exclusive of separate GST line</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: "#F0FDF4", border: "1px solid #BBF7D0" }}>
            <CardContent>
              <Typography variant="overline" color="text.secondary">Orders Placed</Typography>
              <Typography variant="h5" sx={{ color: "#16a34a", fontWeight: 700 }}>
                {reportData?.salesSummary?.totalOrders || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">Confirmed & Dispatched</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: "#FEF2F2", border: "1px solid #FECACA" }}>
            <CardContent>
              <Typography variant="overline" color="text.secondary">Low Stock Items</Typography>
              <Typography variant="h5" sx={{ color: "#dc2626", fontWeight: 700 }}>
                {reportData?.lowStockReport?.length || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">At or below threshold</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: "#F5F3FF", border: "1px solid #DDD6FE" }}>
            <CardContent>
              <Typography variant="overline" color="text.secondary">Exchange Requests</Typography>
              <Typography variant="h5" sx={{ color: "#7c3aed", fontWeight: 700 }}>
                {reportData?.exchangeReport?.total || 0}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {reportData?.exchangeReport?.pending || 0} Pending Review
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, val) => setActiveTab(val)}
          textColor="primary"
          indicatorColor="primary"
          sx={{ borderBottom: 1, borderColor: "divider", px: 2 }}
        >
          <Tab icon={<TrendingUpIcon />} iconPosition="start" label="Product Sales" />
          <Tab icon={<InventoryIcon />} iconPosition="start" label="Stock / Low Stock Report" />
          <Tab icon={<PaymentIcon />} iconPosition="start" label="Payment Methods" />
          <Tab icon={<SwapHorizIcon />} iconPosition="start" label="Exchange Reports" />
        </Tabs>

        <Box sx={{ p: 2 }}>
          {loading ? (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {/* Tab 0: Product-wise Sales */}
              {activeTab === 0 && (
                <TableContainer>
                  <Table>
                    <TableHead sx={{ bgcolor: "#fafafa" }}>
                      <TableRow>
                        <TableCell><strong>#</strong></TableCell>
                        <TableCell><strong>Product Name</strong></TableCell>
                        <TableCell align="right"><strong>Units Sold</strong></TableCell>
                        <TableCell align="right"><strong>Total Revenue</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {reportData?.productSales?.length > 0 ? (
                        reportData.productSales.map((p, idx) => (
                          <TableRow key={p.id || idx} hover>
                            <TableCell>{idx + 1}</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>{p.name}</TableCell>
                            <TableCell align="right">{p.quantity}</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600, color: "#6D1734" }}>
                              {formatINR(p.revenue)}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                            No product sales recorded in this period.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {/* Tab 1: Stock / Low Stock Report */}
              {activeTab === 1 && (
                <TableContainer>
                  <Table>
                    <TableHead sx={{ bgcolor: "#fafafa" }}>
                      <TableRow>
                        <TableCell><strong>Product Name</strong></TableCell>
                        <TableCell><strong>SKU / Code</strong></TableCell>
                        <TableCell><strong>Category</strong></TableCell>
                        <TableCell align="right"><strong>Price</strong></TableCell>
                        <TableCell align="right"><strong>Current Stock</strong></TableCell>
                        <TableCell align="right"><strong>Threshold</strong></TableCell>
                        <TableCell><strong>Health Status</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {reportData?.lowStockReport?.length > 0 ? (
                        reportData.lowStockReport.map((p) => (
                          <TableRow key={p.id} hover>
                            <TableCell sx={{ fontWeight: 600 }}>{p.name}</TableCell>
                            <TableCell>{p.sku || "N/A"}</TableCell>
                            <TableCell>{p.category || "General"}</TableCell>
                            <TableCell align="right">{formatINR(p.price)}</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700, color: p.stock <= 0 ? "error.main" : "warning.main" }}>
                              {p.stock}
                            </TableCell>
                            <TableCell align="right">{p.threshold}</TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                label={p.status}
                                color={p.stock <= 0 ? "error" : "warning"}
                                sx={{ fontWeight: 600 }}
                              />
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} align="center" sx={{ py: 3, color: "success.main" }}>
                            All products are well-stocked above low-stock threshold!
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {/* Tab 2: Payment Methods */}
              {activeTab === 2 && (
                <TableContainer>
                  <Table>
                    <TableHead sx={{ bgcolor: "#fafafa" }}>
                      <TableRow>
                        <TableCell><strong>Payment Gateway / Mode</strong></TableCell>
                        <TableCell align="right"><strong>Orders Handled</strong></TableCell>
                        <TableCell align="right"><strong>Total Amount Settled</strong></TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {reportData?.paymentMethods?.length > 0 ? (
                        reportData.paymentMethods.map((pm, idx) => (
                          <TableRow key={idx} hover>
                            <TableCell sx={{ fontWeight: 600 }}>{pm.method}</TableCell>
                            <TableCell align="right">{pm.count}</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600, color: "#6D1734" }}>
                              {formatINR(pm.amount)}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={3} align="center" sx={{ py: 3 }}>
                            No payment transactions in this period.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}

              {/* Tab 3: Exchange Reports */}
              {activeTab === 3 && (
                <Box>
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="body2" color="text.secondary">Total Exchange Requests</Typography>
                      <Typography variant="h6">{reportData?.exchangeReport?.total || 0}</Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="body2" color="text.secondary">Approved Requests</Typography>
                      <Typography variant="h6" color="success.main">{reportData?.exchangeReport?.approved || 0}</Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="body2" color="text.secondary">Rejected Requests</Typography>
                      <Typography variant="h6" color="error.main">{reportData?.exchangeReport?.rejected || 0}</Typography>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Typography variant="body2" color="text.secondary">Pending Review</Typography>
                      <Typography variant="h6" color="warning.main">{reportData?.exchangeReport?.pending || 0}</Typography>
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    Reasons Breakdown:
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead sx={{ bgcolor: "#fafafa" }}>
                        <TableRow>
                          <TableCell><strong>Customer Reason</strong></TableCell>
                          <TableCell align="right"><strong>Count</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {reportData?.exchangeReport?.reasonsList?.length > 0 ? (
                          reportData.exchangeReport.reasonsList.map((r, idx) => (
                            <TableRow key={idx}>
                              <TableCell>{r.reason}</TableCell>
                              <TableCell align="right" sx={{ fontWeight: 600 }}>{r.count}</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={2} align="center">No exchange reasons recorded.</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default Reports;
