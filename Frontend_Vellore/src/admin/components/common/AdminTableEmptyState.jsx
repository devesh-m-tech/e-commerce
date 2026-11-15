import React from 'react';
import { TableRow, TableCell, Box, Typography, Button } from '@mui/material';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';

const AdminTableEmptyState = ({
  colSpan = 6,
  title = "No records found",
  message,
  subtitle = "Try adjusting your search query or clear the active filters.",
  onReset,
  onResetFilters,
  action,
  onAction,
  actionLabel = "Add New",
  actionIcon,
}) => {
  const displayTitle = message || title;
  const handleReset = onReset || onResetFilters;
  const resolvedAction = action || (onAction ? {
    label: actionLabel,
    onClick: onAction,
    icon: actionIcon,
  } : null);

  return (
    <TableRow>
      <TableCell colSpan={colSpan} align="center" sx={{ py: 8 }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1.5,
          }}
        >
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              backgroundColor: 'rgba(109, 23, 52, 0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6D1734',
            }}
          >
            <SearchOffIcon sx={{ fontSize: 32 }} />
          </Box>
          <Typography
            variant="h6"
            sx={{
              fontFamily: "'Playfair Display', Georgia, serif",
              color: '#282321',
              fontWeight: 600,
              fontSize: '1.1rem',
            }}
          >
            {displayTitle}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: '#7D7571', maxWidth: 360, fontSize: '0.85rem' }}
          >
            {subtitle}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
            {resolvedAction && (
              <Button
                size="small"
                variant="contained"
                onClick={resolvedAction.onClick}
                startIcon={resolvedAction.icon}
                sx={{
                  backgroundColor: '#6D1734',
                  color: '#FFFFFF',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  px: 2,
                  py: 0.75,
                  borderRadius: '3px',
                  boxShadow: '0 2px 6px rgba(109, 23, 52, 0.2)',
                  '&:hover': {
                    backgroundColor: '#4A1025',
                  },
                }}
              >
                {resolvedAction.label}
              </Button>
            )}
            {handleReset && (
              <Button
                size="small"
                variant="outlined"
                onClick={handleReset}
                startIcon={<FilterAltOffIcon />}
                sx={{
                  borderColor: '#EDE2D2',
                  color: '#6D1734',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  '&:hover': {
                    borderColor: '#6D1734',
                    backgroundColor: 'rgba(109,23,52,0.05)',
                  },
                }}
              >
                Clear Active Filters
              </Button>
            )}
          </Box>
        </Box>
      </TableCell>
    </TableRow>
  );
};

export default AdminTableEmptyState;
