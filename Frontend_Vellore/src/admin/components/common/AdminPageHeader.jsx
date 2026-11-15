import React from 'react';
import { Box, Typography, Button, Chip, Stack, Paper } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import AddIcon from '@mui/icons-material/Add';

/**
 * Standardized Luxury Admin Page Header
 * Used across all admin pages for 100% visual and layout consistency.
 */
const AdminPageHeader = ({
  title,
  subtitle,
  icon: Icon,
  badges = [],
  onExport,
  exportLabel = "Export to Excel",
  primaryAction, // { label: 'Add Product', icon: <AddIcon />, onClick: fn }
  onPrimaryAction,
  primaryActionLabel,
  primaryActionIcon: PrimaryActionIcon,
  onAdd,
  addLabel,
  addIcon: AddActionIcon,
  secondaryAction,
  extraActions,
  actions,
}) => {
  const resolvedPrimaryAction = primaryAction || (
    (onPrimaryAction || onAdd) ? {
      label: primaryActionLabel || addLabel || 'Add',
      icon: (PrimaryActionIcon || AddActionIcon) ? (
        React.isValidElement(PrimaryActionIcon || AddActionIcon)
          ? (PrimaryActionIcon || AddActionIcon)
          : React.createElement(PrimaryActionIcon || AddActionIcon, { sx: { fontSize: 18 } })
      ) : <AddIcon sx={{ fontSize: 18 }} />,
      onClick: onPrimaryAction || onAdd,
    } : null
  );
  return (
    <Paper
      elevation={0}
      sx={{
        mb: 3,
        p: { xs: 2, sm: 2.25, md: 2.75 },
        borderRadius: '8px',
        background: 'linear-gradient(135deg, #FFFFFF 0%, #FFFDF9 100%)',
        border: '1px solid #EDE2D2',
        borderLeft: '4px solid #C5A15A',
        boxShadow: '0 2px 12px rgba(109, 23, 52, 0.04)',
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', md: 'center' },
        gap: 2,
      }}
    >
      {/* Title & Subtitle with Luxury Typography */}
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
          {Icon && (
            <Box
              sx={{
                width: 46,
                height: 46,
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, rgba(109, 23, 52, 0.08) 0%, rgba(197, 161, 90, 0.18) 100%)',
                border: '1.5px solid rgba(197, 161, 90, 0.35)',
                color: '#6D1734',
                boxShadow: '0 2px 8px rgba(109, 23, 52, 0.05)',
                flexShrink: 0,
              }}
            >
              {React.isValidElement(Icon) ? Icon : <Icon sx={{ fontSize: 24 }} />}
            </Box>
          )}
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontFamily: "'Playfair Display', Georgia, serif",
              fontWeight: 700,
              color: '#6D1734',
              fontSize: { xs: '1.5rem', sm: '1.85rem' },
              letterSpacing: '0.5px',
              m: 0,
            }}
          >
            {title}
          </Typography>

          {/* Badges / Chips */}
          {badges && badges.length > 0 && (
            <Stack direction="row" spacing={1} sx={{ ml: { xs: 0, sm: 1 } }}>
              {badges.map((b, idx) => (
                <Chip
                  key={idx}
                  label={b.label}
                  size="small"
                  color={b.color || 'default'}
                  variant={b.variant || 'outlined'}
                  className="font-number"
                  sx={{
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    borderColor: b.color ? undefined : '#EDE2D2',
                    backgroundColor: b.color ? undefined : '#FFFFFF',
                    ...b.sx,
                  }}
                />
              ))}
            </Stack>
          )}
        </Box>

        {subtitle && (
          <Typography
            variant="body2"
            sx={{
              color: '#7D7571',
              fontFamily: "'Karla', sans-serif",
              mt: 0.75,
              fontSize: '0.875rem',
            }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>

      {/* Action Buttons Toolbar */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
        {extraActions || actions}

        {secondaryAction && (
          <Button
            variant="outlined"
            onClick={secondaryAction.onClick}
            startIcon={secondaryAction.icon}
            disabled={secondaryAction.disabled}
            sx={{
              borderColor: '#EDE2D2',
              color: '#282321',
              fontFamily: "'Karla', sans-serif",
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.75px',
              fontSize: '0.78rem',
              px: 2,
              py: 0.9,
              borderRadius: '3px',
              '&:hover': {
                borderColor: '#6D1734',
                backgroundColor: 'rgba(109, 23, 52, 0.04)',
              },
            }}
          >
            {secondaryAction.label}
          </Button>
        )}

        {onExport && (
          <Button
            variant="outlined"
            onClick={onExport}
            startIcon={<FileDownloadIcon />}
            sx={{
              borderColor: '#EDE2D2',
              color: '#6D1734',
              fontFamily: "'Karla', sans-serif",
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.75px',
              fontSize: '0.78rem',
              px: 2,
              py: 0.9,
              borderRadius: '3px',
              backgroundColor: '#FFFFFF',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
              '&:hover': {
                borderColor: '#6D1734',
                backgroundColor: '#FAF7F2',
              },
            }}
          >
            {exportLabel}
          </Button>
        )}

        {resolvedPrimaryAction && (
          <Button
            variant="contained"
            onClick={resolvedPrimaryAction.onClick}
            startIcon={resolvedPrimaryAction.icon}
            disabled={resolvedPrimaryAction.disabled}
            sx={{
              backgroundColor: '#6D1734',
              color: '#FFFFFF',
              fontFamily: "'Karla', sans-serif",
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.75px',
              fontSize: '0.78rem',
              px: 2.5,
              py: 0.9,
              borderRadius: '3px',
              boxShadow: '0 2px 6px rgba(109, 23, 52, 0.25)',
              '&:hover': {
                backgroundColor: '#4A1025',
                boxShadow: '0 4px 12px rgba(109, 23, 52, 0.35)',
                transform: 'translateY(-1px)',
              },
            }}
          >
            {resolvedPrimaryAction.label}
          </Button>
        )}
      </Box>
    </Paper>
  );
};

export default AdminPageHeader;
