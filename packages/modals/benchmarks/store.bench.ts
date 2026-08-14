import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { benchmark, formatBenchmarkResult, toBencherMetricFormat } from "@zemd/testing";

import { createStore } from "@zemd/react-modals";

const BenchmarkModal = () => null;
const entry = {
  component: BenchmarkModal,
  props: {},
  callbacks: {},
};

const latestStore = createStore({ maxStackSize: 1 });
const identifiedStore = createStore({ maxStackSize: 1 });
let checksum = 0;

const results = [
  benchmark(
    "append and remove latest",
    () => {
      const id = latestStore.append(entry);
      checksum += id.length + latestStore.getSnapshot().length;
      latestStore.removeLatest();
    },
    {
      iterations: 25_000,
      // Informational target: 1,000 stack cycles within 25 ms.
      budgetNanoseconds: 25_000,
    },
  ),
  benchmark(
    "append and remove by id",
    () => {
      const id = identifiedStore.append(entry);
      checksum += id.length + identifiedStore.getSnapshot().length;
      identifiedStore.remove(id);
    },
    {
      iterations: 25_000,
      // Informational target: 1,000 identified removals within 25 ms.
      budgetNanoseconds: 25_000,
    },
  ),
];

// Keep benchmark results observable so the runtime cannot discard the store work.
if (checksum === 0) {
  throw new Error("modal store benchmark produced an empty checksum");
}

const outputDirectory = process.env["BENCHER_OUTPUT_DIR"];
if (outputDirectory) {
  mkdirSync(outputDirectory, { recursive: true });
  writeFileSync(
    join(outputDirectory, "zemd-react-modals.json"),
    `${JSON.stringify(toBencherMetricFormat(results, { namespace: "@zemd/react-modals" }))}\n`,
    "utf8",
  );
} else {
  console.table(results.map(formatBenchmarkResult));
}
