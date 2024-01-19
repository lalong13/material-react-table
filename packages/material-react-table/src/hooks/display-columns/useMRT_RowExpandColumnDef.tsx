import { type ReactNode, useMemo } from 'react';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import { MRT_ExpandAllButton } from '../../components/buttons/MRT_ExpandAllButton';
import { MRT_ExpandButton } from '../../components/buttons/MRT_ExpandButton';
import {
  type MRT_ColumnDef,
  type MRT_DisplayColumnIds,
  type MRT_RowData,
  type MRT_StatefulTableOptions,
} from '../../types';
import {
  defaultDisplayColumnProps,
  showExpandColumn,
} from '../../utils/displayColumn.utils';
import { getCommonTooltipProps } from '../../utils/style.utils';

export const useMRT_RowExpandColumnDef = <TData extends MRT_RowData>(
  tableOptions: MRT_StatefulTableOptions<TData>,
): MRT_ColumnDef<TData> | null => {
  const id: MRT_DisplayColumnIds = 'mrt-row-expand';
  const { columnOrder, grouping } = tableOptions.state;

  return useMemo(() => {
    if (columnOrder?.includes(id) && showExpandColumn(tableOptions, grouping)) {
      const alignProps =
        tableOptions.positionExpandColumn === 'last'
          ? ({
              align: 'right',
            } as const)
          : undefined;

      return {
        Cell: ({ cell, column, row, staticRowIndex, table }) => {
          const expandButtonProps = { row, staticRowIndex, table };
          const subRowsLength = row.subRows?.length;
          if (
            tableOptions.groupedColumnMode === 'remove' &&
            row.groupingColumnId
          ) {
            return (
              <Stack alignItems="center" flexDirection="row" gap="0.25rem">
                <MRT_ExpandButton {...expandButtonProps} />
                <Tooltip
                  {...getCommonTooltipProps('right')}
                  title={table.getColumn(row.groupingColumnId).columnDef.header}
                >
                  <span>{row.groupingValue as ReactNode}</span>
                </Tooltip>
                {!!subRowsLength && <span>({subRowsLength})</span>}
              </Stack>
            );
          } else {
            return (
              <>
                <MRT_ExpandButton {...expandButtonProps} />
                {column.columnDef.GroupedCell?.({ cell, column, row, table })}
              </>
            );
          }
        },
        Header: tableOptions.enableExpandAll
          ? ({ table }) => {
              return (
                <>
                  <MRT_ExpandAllButton table={table} />
                  {tableOptions.groupedColumnMode === 'remove' &&
                    grouping
                      ?.map(
                        (groupedColumnId) =>
                          table.getColumn(groupedColumnId).columnDef.header,
                      )
                      ?.join(', ')}
                </>
              );
            }
          : undefined,
        muiTableBodyCellProps: alignProps,
        muiTableHeadCellProps: alignProps,
        ...defaultDisplayColumnProps({
          header: 'expand',
          id,
          size:
            tableOptions.groupedColumnMode === 'remove'
              ? tableOptions?.defaultColumn?.size
              : 60,
          tableOptions,
        }),
      };
    }
    return null;
  }, [columnOrder, grouping]);
};
