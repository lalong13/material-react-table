import TableCell, { type TableCellProps } from '@mui/material/TableCell';
import { useTheme } from '@mui/material/styles';
import {
  type MRT_Header,
  type MRT_RowData,
  type MRT_TableInstance,
} from '../../types';
import { getCommonMRTCellStyles } from '../../utils/style.utils';
import { parseFromValuesOrFunc } from '../../utils/utils';

interface Props<TData extends MRT_RowData> extends TableCellProps {
  footer: MRT_Header<TData>;
  staticColumnIndex?: number;
  table: MRT_TableInstance<TData>;
}

export const MRT_TableFooterCell = <TData extends MRT_RowData>({
  footer,
  staticColumnIndex,
  table,
  ...rest
}: Props<TData>) => {
  const theme = useTheme();
  const {
    getState,
    options: { enableColumnPinning, layoutMode, muiTableFooterCellProps },
  } = table;
  const { density } = getState();
  const { column } = footer;
  const { columnDef } = column;
  const { columnDefType } = columnDef;

  const isColumnPinned =
    enableColumnPinning &&
    columnDef.columnDefType !== 'group' &&
    column.getIsPinned();

  const args = { column, table };
  const tableCellProps = {
    ...parseFromValuesOrFunc(muiTableFooterCellProps, args),
    ...parseFromValuesOrFunc(columnDef.muiTableFooterCellProps, args),
    ...rest,
  };

  return (
    <TableCell
      align={
        columnDefType === 'group'
          ? 'center'
          : theme.direction === 'rtl'
            ? 'right'
            : 'left'
      }
      colSpan={footer.colSpan}
      data-index={staticColumnIndex}
      data-pinned={!!isColumnPinned || undefined}
      variant="footer"
      {...tableCellProps}
      sx={(theme) => ({
        display: layoutMode?.startsWith('grid') ? 'grid' : undefined,
        fontWeight: 'bold',
        justifyContent: columnDefType === 'group' ? 'center' : undefined,
        p:
          density === 'compact'
            ? '0.5rem'
            : density === 'comfortable'
              ? '1rem'
              : '1.5rem',
        verticalAlign: 'top',
        zIndex: column.getIsPinned() && columnDefType !== 'group' ? 2 : 1,
        ...getCommonMRTCellStyles({
          column,
          table,
          tableCellProps,
          theme,
        }),
        ...(parseFromValuesOrFunc(tableCellProps?.sx, theme) as any),
      })}
    >
      {tableCellProps.children ??
        (footer.isPlaceholder
          ? null
          : parseFromValuesOrFunc(columnDef.Footer, {
              column,
              footer,
              table,
            }) ??
            columnDef.footer ??
            null)}
    </TableCell>
  );
};
