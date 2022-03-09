import React, { ChangeEvent, FC, MouseEvent, useState } from 'react';
import {
  Chip,
  IconButton,
  InputAdornment,
  MenuItem,
  TextField,
  TextFieldProps,
  Tooltip,
} from '@mui/material';
import { useAsyncDebounce } from 'react-table';
import { useMRT } from '../useMRT';
import { MRT_FILTER_TYPE, MRT_HeaderGroup } from '..';
import { MRT_FilterTypeMenu } from '../menus/MRT_FilterTypeMenu';

interface Props {
  column: MRT_HeaderGroup;
}

export const MRT_FilterTextField: FC<Props> = ({ column }) => {
  const {
    icons: { FilterListIcon, CloseIcon },
    idPrefix,
    localization,
    muiTableHeadCellFilterTextFieldProps,
    setCurrentFilterTypes,
    tableInstance,
  } = useMRT();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const mTableHeadCellFilterTextFieldProps =
    muiTableHeadCellFilterTextFieldProps instanceof Function
      ? muiTableHeadCellFilterTextFieldProps(column)
      : muiTableHeadCellFilterTextFieldProps;

  const mcTableHeadCellFilterTextFieldProps =
    column.muiTableHeadCellFilterTextFieldProps instanceof Function
      ? column.muiTableHeadCellFilterTextFieldProps(column)
      : column.muiTableHeadCellFilterTextFieldProps;

  const textFieldProps = {
    ...mTableHeadCellFilterTextFieldProps,
    ...mcTableHeadCellFilterTextFieldProps,
    style: {
      ...mTableHeadCellFilterTextFieldProps?.style,
      ...mcTableHeadCellFilterTextFieldProps?.style,
    },
  } as TextFieldProps;

  const [filterValue, setFilterValue] = useState('');

  const handleChange = useAsyncDebounce((value) => {
    column.setFilter(value ?? undefined);
  }, 150);

  const handleFilterMenuOpen = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClear = () => {
    setFilterValue('');
    column.setFilter(undefined);
  };

  const handleClearFilterChip = () => {
    setFilterValue('');
    column.setFilter(undefined);
    setCurrentFilterTypes((prev) => ({
      ...prev,
      [column.id]: MRT_FILTER_TYPE.FUZZY,
    }));
  };

  if (column.Filter) {
    return <>{column.Filter?.({ column })}</>;
  }

  const filterType = tableInstance.state.currentFilterTypes[column.id];
  const isCustomFilterType = filterType instanceof Function;
  const isSelectFilter = !!column.filterSelectOptions;
  const filterChipLabel =
    !isCustomFilterType &&
    [MRT_FILTER_TYPE.EMPTY, MRT_FILTER_TYPE.NOT_EMPTY].includes(
      filterType as MRT_FILTER_TYPE,
    );
  const filterPlaceholder = localization.filterTextFieldPlaceholder?.replace(
    '{column}',
    String(column.Header),
  );

  return (
    <>
      <TextField
        fullWidth
        id={`mrt-${idPrefix}-${column.id}-filter-text-field`}
        inputProps={{
          disabled: !!filterChipLabel,
          sx: {
            textOverflow: 'ellipsis',
            width: filterChipLabel ? 0 : undefined,
          },
          title: filterPlaceholder,
        }}
        label={isSelectFilter && !filterValue ? filterPlaceholder : undefined}
        InputLabelProps={{
          shrink: false,
          sx: {
            maxWidth: 'calc(100% - 2.5rem)',
          },
          title: filterPlaceholder,
        }}
        margin="none"
        placeholder={
          filterChipLabel || isSelectFilter ? undefined : filterPlaceholder
        }
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          setFilterValue(e.target.value);
          handleChange(e.target.value);
        }}
        onClick={(e) => e.stopPropagation()}
        select={isSelectFilter}
        value={filterValue ?? ''}
        variant="standard"
        InputProps={{
          startAdornment: !isSelectFilter && (
            <InputAdornment position="start">
              <Tooltip arrow title={localization.changeFilterMode}>
                <span>
                  <IconButton
                    disabled={isCustomFilterType}
                    onClick={handleFilterMenuOpen}
                    size="small"
                    sx={{ height: '1.75rem', width: '1.75rem' }}
                  >
                    <FilterListIcon />
                  </IconButton>
                </span>
              </Tooltip>
              {filterChipLabel && (
                <Chip onDelete={handleClearFilterChip} label={filterType} />
              )}
            </InputAdornment>
          ),
          endAdornment: !filterChipLabel && (
            <InputAdornment position="end">
              <Tooltip
                arrow
                disableHoverListener={isSelectFilter}
                placement="right"
                title={localization.filterTextFieldClearButtonTitle ?? ''}
              >
                <span>
                  <IconButton
                    aria-label={localization.filterTextFieldClearButtonTitle}
                    disabled={!filterValue?.length}
                    onClick={handleClear}
                    size="small"
                    sx={{
                      height: '1.75rem',
                      width: '1.75rem',
                    }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            </InputAdornment>
          ),
        }}
        {...textFieldProps}
        sx={{
          m: '0 -0.25rem',
          minWidth: !filterChipLabel ? '5rem' : 'auto',
          width: 'calc(100% + 0.5rem)',
          mt: isSelectFilter && !filterValue ? '-1rem' : undefined,
          '&	.MuiSelect-icon': {
            mr: '1.5rem',
          },
          ...textFieldProps?.sx,
        }}
      >
        {isSelectFilter && (
          <MenuItem divider disabled={!filterValue} value="">
            {localization.filterTextFieldClearButtonTitle}
          </MenuItem>
        )}
        {column?.filterSelectOptions?.map((option) => {
          let value;
          let text;
          if (typeof option === 'string') {
            value = option;
            text = option;
          } else if (typeof option === 'object') {
            value = option.value;
            text = option.text;
          }
          return (
            <MenuItem key={value} value={value}>
              {text}
            </MenuItem>
          );
        })}
      </TextField>
      <MRT_FilterTypeMenu
        anchorEl={anchorEl}
        column={column}
        setAnchorEl={setAnchorEl}
      />
    </>
  );
};
