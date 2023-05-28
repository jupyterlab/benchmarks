import { JSONObject } from "@lumino/coreutils";
import { test as baseTest } from "@jupyterlab/galata";
import { Page } from "@playwright/test";
import type {
  IUIProfiler,
  IBenchmarkResult,
  IOutcome,
} from "@jupyterlab/ui-profiler";

interface IRunOptions {
  id: string;
  options: JSONObject;
}

class UIProfiler implements Partial<IUIProfiler> {
  constructor(private readonly _page: Page) {}

  async runBenchmark<T extends IOutcome = IOutcome>(
    scenario: IRunOptions,
    benchmark: IRunOptions
  ): Promise<IBenchmarkResult<T>> {
    return this._evaluate("runBenchmark", [scenario, benchmark]);
  }

  private async _evaluate(method: string, args: any[]) {
    return await this._page.evaluate(
      async ([method, args]) => {
        const PROFILER_PLUGIN = "@jupyterlab/ui-profiler:plugin";
        const profiler = (window as any).jupyterapp._plugins.get(
          PROFILER_PLUGIN
        ).service as IUIProfiler;
        return (profiler[method as string] as any)(...args);
      },
      [method, args]
    );
  }
}

export type ProfilerTest = {
  profiler: UIProfiler;
};

export const test = baseTest.extend<ProfilerTest>({
  profiler: async ({ page }, use) => {
    use(new UIProfiler(page));
  },
});
