import React from 'react';
import { mount } from 'enzyme';
import { format } from 'util';

import { TableLayout } from './table-layout';

/* eslint-disable react/prop-types */
const PropsContainer = () => null;
const tableTemplateMock = ({ children, ...props }) => (
  <table>
    <PropsContainer {...props} />
    {children}
  </table>
);
const headTemplateMock = ({ children, ...props }) => (
  <thead
    onClick={props.onClick}
  >
    {children}
  </thead>
);
const bodyTemplateMock = ({ children, ...props }) => (
  <tbody
    onClick={props.onClick}
  >
    {children}
  </tbody>
);
const rowTemplateMock = ({ children, ...props }) => (
  <tr>
    <PropsContainer {...props} />
    {children}
  </tr>
);
const cellTemplateMock = props => (
  <td>
    <PropsContainer {...props} />
  </td>
);
/* eslint-enable react/prop-types */

describe('TableLayout', () => {
  /* eslint-disable no-console */
  const consoleWarn = console.warn;
  const consoleError = console.error;

  const logToError = (...args) => {
    throw new Error(format(...args).replace(/^Error: (?:Warning: )?/, ''));
  };

  beforeEach(() => {
    console.warn = logToError;
    console.error = logToError;
  });

  afterEach(() => {
    console.warn = consoleWarn;
    console.error = consoleError;
  });
  /* eslint-enable no-console */

  const testTablePart = ({ tree, rows, columns }) => {
    const rowWrappers = tree.find('tr');
    expect(rowWrappers.length).toBe(3);
    rows.forEach((row, rowIndex) => {
      const rowWrapper = rowWrappers.at(rowIndex);
      const rowData = rowWrapper.children(PropsContainer).props();

      expect(rowData.row).toBe(row);

      const columnWrappers = rowWrapper.find('td');
      expect(columnWrappers.length).toBe(4);
      columns.forEach((column, columnIndex) => {
        const columnWrapper = columnWrappers.at(columnIndex);
        const columnData = columnWrapper.children(PropsContainer).props();

        expect(columnData.row).toBe(row);
        expect(columnData.column).toBe(column);
      });
    });
  };

  it('should render table with rows and columns', () => {
    const rows = [{ id: 1 }, { id: 2 }, { id: 3 }];
    const columns = [{ name: 'a' }, { name: 'b' }, { name: 'c' }, { name: 'd' }];
    const tree = mount(
      <TableLayout
        rows={rows}
        columns={columns}
        tableTemplate={tableTemplateMock}
        bodyTemplate={bodyTemplateMock}
        rowTemplate={rowTemplateMock}
        cellTemplate={cellTemplateMock}
        getRowId={row => row.id}
      />,
    );

    testTablePart({ tree: tree.find('table > tbody'), rows, columns });
  });

  it('should render table with headerRows and columns', () => {
    const rows = [{ id: 1 }, { id: 2 }, { id: 3 }];
    const columns = [{ name: 'a' }, { name: 'b' }, { name: 'c' }, { name: 'd' }];
    const tree = mount(
      <TableLayout
        headerRows={rows}
        rows={[]}
        columns={columns}
        tableTemplate={tableTemplateMock}
        bodyTemplate={bodyTemplateMock}
        headTemplate={headTemplateMock}
        rowTemplate={rowTemplateMock}
        cellTemplate={cellTemplateMock}
        getRowId={row => row.id}
      />,
    );

    testTablePart({ tree: tree.find('table > thead'), rows, columns });
  });

  it('should span columns if specified', () => {
    const rows = [{ id: 1, colspan: 0 }, { id: 2, colspan: 1 }];
    const columns = [{ name: 'a' }, { name: 'b' }, { name: 'c' }, { name: 'd' }];
    const tree = mount(
      <TableLayout
        rows={rows}
        columns={columns}
        tableTemplate={tableTemplateMock}
        bodyTemplate={bodyTemplateMock}
        rowTemplate={rowTemplateMock}
        cellTemplate={cellTemplateMock}
        getRowId={row => row.id}
      />,
    );

    const rowWrappers = tree.find('tr');

    let rowColumn = rowWrappers.at(0).find('td');
    expect(rowColumn.length).toBe(1);
    expect(rowColumn.at(0).children(PropsContainer).props().colspan).toBe(4);

    rowColumn = rowWrappers.at(1).find('td');
    expect(rowColumn.length).toBe(2);
    expect(rowColumn.at(0).children(PropsContainer).props().colspan).toBe(undefined);
    expect(rowColumn.at(1).children(PropsContainer).props().colspan).toBe(3);
  });

  it('should have correct styles', () => {
    const rows = [{ id: 1, height: 100 }, { id: 2 }];
    const columns = [{ name: 'a', width: 100 }, { name: 'b' }];
    const tree = mount(
      <TableLayout
        rows={rows}
        columns={columns}
        minColumnWidth={150}
        tableTemplate={tableTemplateMock}
        bodyTemplate={bodyTemplateMock}
        rowTemplate={rowTemplateMock}
        cellTemplate={cellTemplateMock}
        getRowId={row => row.id}
      />,
    );

    const tableWrapper = tree.find('table');
    expect(tableWrapper.children(PropsContainer).props().style)
      .toMatchObject({ tableLayout: 'fixed', minWidth: '250px' });

    let rowWrapper = tree.find('tr').at(0);
    expect(rowWrapper.children(PropsContainer).props().style)
      .toMatchObject({ height: '100px' });

    rowWrapper = tree.find('tr').at(1);
    expect(rowWrapper.children(PropsContainer).props().style)
      .toMatchObject({ height: undefined });

    let columnWrapper = tree.find('tr').at(0).find('td').at(0);
    expect(columnWrapper.children(PropsContainer).props().style)
      .toMatchObject({ width: '100px' });

    columnWrapper = tree.find('tr').at(0).find('td').at(1);
    expect(columnWrapper.children(PropsContainer).props().style)
      .toMatchObject({ width: undefined });
  });

  it('should handles click in body', () => {
    const rows = [{ id: 1 }, { id: 2 }];
    const columns = [{ name: 'a' }, { name: 'b' }];
    const onClick = jest.fn();
    const tree = mount(
      <TableLayout
        rows={rows}
        columns={columns}
        minColumnWidth={150}
        tableTemplate={tableTemplateMock}
        bodyTemplate={bodyTemplateMock}
        rowTemplate={rowTemplateMock}
        cellTemplate={cellTemplateMock}
        getRowId={row => row.id}
        onClick={onClick}
      />,
    );

    tree.find('tr').at(1).find('td').at(1)
      .simulate('click');
    expect(onClick.mock.calls[0][0])
      .toMatchObject({ row: rows[1], column: columns[1], e: {} });
  });

  it('should handles click in head', () => {
    const rows = [{ id: 1 }, { id: 2 }];
    const columns = [{ name: 'a' }, { name: 'b' }];
    const onClick = jest.fn();
    const tree = mount(
      <TableLayout
        headerRows={rows}
        rows={[]}
        columns={columns}
        minColumnWidth={150}
        tableTemplate={tableTemplateMock}
        headTemplate={headTemplateMock}
        bodyTemplate={bodyTemplateMock}
        rowTemplate={rowTemplateMock}
        cellTemplate={cellTemplateMock}
        getRowId={row => row.id}
        onClick={onClick}
      />,
    );

    tree.find('tr').at(1).find('td').at(1)
      .simulate('click');
    expect(onClick.mock.calls[0][0])
      .toMatchObject({ row: rows[1], column: columns[1], e: {} });
  });
});
