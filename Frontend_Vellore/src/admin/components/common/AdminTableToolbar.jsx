import React from 'react';
import {
  Box,
  TextField,
  InputAdornment,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Button,
  Typography,
  Stack,
  Tooltip
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';

/**
 * Standardized Luxury Admin Table Toolbar with Row Value Filter Method
 * Supports:
 * - Real-time universal search across row values
 * - Column value filter dropdowns (Status, Role, Category, Zone, etc.)
 * - Quick filter toggle chips
 * - Filtered vs Total counter badge
 * - Reset all filters button
 */
const AdminTableToolbar = ({
  searchQuery = '',
  onSearchChange,
  searchPlaceholder = 'Search records by name, ID, or value...',
  filters = [], // [{ id, label, value, onChange, options: [{ label, value }] }]
  quickFilters = null, // { selected, onChange, options: [{ label, value, count, color }] }
  totalCount = 0,
  filteredCount = 0,
  onResetFilters,
  extraFilterComponents = null,
}) => {
  const hasActiveFilters =
    Boolean(searchQuery) ||
    filters.some((f) => f.value && f.value !== 'all' && f.value !== '') ||
    (quickFilters && quickFilters.selected && quickFilters.selected !== 'all');

  return (
    <Box
      sx={{
        mb: 2.5,
        p: 2,
        backgroundColor: '#FFFFFF',
        border: '1px solid #EDE2D2',
        borderRadius: '4px',
        boxShadow: '0 1px 4px rgba(40,35,33,0.03)',
      }}
    >
      {/* Top Row: Search + Column Filter Dropdowns */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', lg: 'row' },
          gap: 2,
          alignItems: { xs: 'stretch', lg: 'center' },
          justifyContent: 'space-between',
        }}
      >
        {/* Search Input */}
        <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: 280 } }}>
          <TextField
            fullWidth
            size="small"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#6D1734', fontSize: 20 }} />
                </InputAdornment>
              ),
              endAdornment: searchQuery ? (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => onSearchChange && onSearchChange('')}
                    edge="end"
                    aria-label="clear search"
                  >
                    <ClearIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                </InputAdornment>
              ) : null,
            }}
            sx={{
              backgroundColor: '#FAF7F2',
              '& .MuiOutlinedInput-root': {
                borderRadius: '3px',
                borderColor: '#EDE2D2',
                fontFamily: "'Karla', sans-serif",
                '&:hover fieldset': {
                  borderColor: '#6D1734',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#6D1734',
                  borderWidth: '1.5px',
                },
              },
            }}
          />
        </Box>

        {/* Filter Dropdowns & Reset Button */}
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1.5,
            alignItems: 'center',
          }}
        >
          {filters.map((filter) => (
            <FormControl
              key={filter.id}
              size="small"
              sx={{ minWidth: 160, flex: { xs: '1 1 45%', sm: 'none' } }}
            >
              <InputLabel
                id={`${filter.id}-label`}
                sx={{
                  fontFamily: "'Karla', sans-serif",
                  fontSize: '0.85rem',
                  color: '#6D1734',
                  '&.Mui-focused': { color: '#6D1734' },
                }}
              >
                {filter.label}
              </InputLabel>
              <Select
                labelId={`${filter.id}-label`}
                value={filter.value ?? 'all'}
                label={filter.label}
                onChange={(e) => filter.onChange(e.target.value)}
                sx={{
                  backgroundColor: filter.value && filter.value !== 'all' ? 'rgba(109,23,52,0.05)' : '#FAF7F2',
                  borderRadius: '3px',
                  fontFamily: "'Karla', sans-serif",
                  fontSize: '0.85rem',
                  '& .MuiOutlinedInput-notchedOutline': {
                    borderColor: filter.value && filter.value !== 'all' ? '#6D1734' : '#EDE2D2',
                  },
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#6D1734',
                  },
                }}
              >
                {filter.options.map((opt) => (
                  <MenuItem
                    key={opt.value}
                    value={opt.value}
                    sx={{ fontFamily: "'Karla', sans-serif", fontSize: '0.85rem' }}
                  >
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ))}

          {extraFilterComponents}

          {/* Reset Filters Button */}
          {hasActiveFilters && onResetFilters && (
            <Tooltip title="Clear all active filters and search">
              <Button
                size="small"
                variant="outlined"
                onClick={onResetFilters}
                startIcon={<FilterAltOffIcon sx={{ fontSize: 16 }} />}
                sx={{
                  color: '#6D1734',
                  borderColor: '#EDE2D2',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  py: 0.8,
                  px: 1.5,
                  borderRadius: '3px',
                  '&:hover': {
                    borderColor: '#6D1734',
                    backgroundColor: 'rgba(109, 23, 52, 0.05)',
                  },
                }}
              >
                Reset
              </Button>
            </Tooltip>
          )}
        </Box>
      </Box>

      {/* Bottom Row: Quick Filter Chips & Row Count Status */}
      <Box
        sx={{
          mt: 2,
          pt: 1.5,
          borderTop: '1px dashed #EDE2D2',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        {/* Quick Filter Chips */}
        {quickFilters && quickFilters.options && quickFilters.options.length > 0 ? (
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 0.75 }}>
            <Typography
              variant="caption"
              sx={{
                display: 'flex',
                alignItems: 'center',
                color: '#7D7571',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontSize: '0.72rem',
                mr: 0.5,
              }}
            >
              <FilterAltIcon sx={{ fontSize: 14, mr: 0.5, color: '#6D1734' }} /> Row Filter:
            </Typography>
            {quickFilters.options.map((q) => {
              const isSelected = quickFilters.selected === q.value;
              return (
                <Chip
                  key={q.value}
                  label={
                    typeof q.count !== 'undefined'
                      ? `${q.label} (${q.count})`
                      : q.label
                  }
                  size="small"
                  onClick={() => quickFilters.onChange(q.value)}
                  className="font-number"
                  variant={isSelected ? 'filled' : 'outlined'}
                  color={isSelected ? (q.color || 'primary') : 'default'}
                  sx={{
                    fontWeight: isSelected ? 700 : 500,
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    borderRadius: '14px',
                    borderColor: isSelected ? undefined : '#EDE2D2',
                    backgroundColor: isSelected
                      ? '#6D1734'
                      : '#FFFFFF',
                    color: isSelected ? '#FFFFFF' : '#282321',
                    '&:hover': {
                      backgroundColor: isSelected
                        ? '#4A1025'
                        : '#FAF7F2',
                      borderColor: '#6D1734',
                    },
                  }}
                />
              );
            })}
          </Stack>
        ) : (
          <Box />
        )}

        {/* Record Counter Indicator */}
        <Typography
          variant="caption"
          className="font-number"
          sx={{
            color: '#7D7571',
            fontWeight: 600,
            fontSize: '0.78rem',
            letterSpacing: '0.3px',
          }}
        >
          Showing <strong>{filteredCount}</strong> of <strong>{totalCount}</strong> rows
          {hasActiveFilters && (
            <Chip
              label="Filtered"
              size="small"
              sx={{
                ml: 1,
                height: 18,
                fontSize: '0.65rem',
                fontWeight: 700,
                backgroundColor: 'rgba(109,23,52,0.1)',
                color: '#6D1734',
                borderRadius: '2px',
              }}
            />
          )}
        </Typography>
      </Box>
    </Box>
  );
};

export default AdminTableToolbar;
