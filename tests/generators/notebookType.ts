/**
 * Copyright (c) Jupyter Development Team.
 * Distributed under the terms of the Modified BSD License.
 */
import { Page } from "@playwright/test";

type NotebookType = {
  label: string;
  /**
   * Function that should return when the notebook, with this widgetID
   * is "ready". Waits for this before stopping the timing function.
   */
  waitFor: (options: { widgetID: string; page: Page }) => Promise<void | null>;
  /**
   * Function that takes the n and returns the notebook object that will
   * serialized to JSON and saved.
   */
  notebook: (n: number) => object;
  /**
   * Search term
   * 
   * Optional search word for the search step
   */
  search?: string;
};

// eslint-disable-next-line no-undef
export default NotebookType;
