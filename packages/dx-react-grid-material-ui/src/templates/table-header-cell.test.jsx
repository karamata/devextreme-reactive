import React from 'react';
import { mountWithStyles, setupConsole } from '../utils/testing';
import { TableHeaderCell, styleSheet } from './table-header-cell';

describe('TableHeaderCell', () => {
  let resetConsole;

  beforeAll(() => {
    resetConsole = setupConsole({ ignore: ['validateDOMNesting'] });
  });

  afterAll(() => {
    resetConsole();
  });

  test('should use column name if title is not specified', () => {
    const { tree, classes } = mountWithStyles(
      <TableHeaderCell
        column={{
          name: 'Test',
        }}
      />,
      styleSheet,
    );

    expect(tree.find(`.${classes.plainTitle}`).text()).toBe('Test');
  });

  test('should cancel sorting by using the Ctrl key', () => {
    const changeSortingDirection = jest.fn();
    const tree = mountWithStyles(
      <TableHeaderCell
        column={{
          name: 'Test',
        }}
        changeSortingDirection={changeSortingDirection}
        allowSorting
      />,
    );

    tree.simulate('click', { ctrlKey: true });

    expect(changeSortingDirection.mock.calls).toHaveLength(1);
    expect(changeSortingDirection.mock.calls[0][0].cancel).toBeTruthy();
  });
});
