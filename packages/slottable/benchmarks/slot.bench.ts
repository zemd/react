import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { benchmark, formatBenchmarkResult, toBencherMetricFormat } from "@zemd/testing";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { useSlot } from "@zemd/react-slottable";

const overrideProps = {
  slots: { content: "strong" },
  slotProps: { content: { className: "from-slot-props" } },
} as const;

const DefaultSlotHarness = () => {
  const renderSlot = useSlot("content", {}, { slot: "span", className: "from-options" });
  return renderSlot({ children: "benchmark" });
};

const OverrideSlotHarness = () => {
  const renderSlot = useSlot("content", overrideProps, {
    slot: "span",
    className: "from-options",
  });
  return renderSlot({ children: "benchmark" });
};

const defaultElement = createElement(DefaultSlotHarness);
const overrideElement = createElement(OverrideSlotHarness);
let checksum = 0;

const results = [
  benchmark(
    "render default slot",
    () => {
      checksum += renderToStaticMarkup(defaultElement).length;
    },
    {
      iterations: 2_000,
      // Informational target: 1,000 synchronous renders within 250 ms.
      budgetNanoseconds: 250_000,
    },
  ),
  benchmark(
    "render overridden slot",
    () => {
      checksum += renderToStaticMarkup(overrideElement).length;
    },
    {
      iterations: 2_000,
      // Informational target: 1,000 synchronous renders within 250 ms.
      budgetNanoseconds: 250_000,
    },
  ),
];

// Keep benchmark results observable so the runtime cannot discard the render work.
if (checksum === 0) {
  throw new Error("slot benchmark produced an empty checksum");
}

const outputDirectory = process.env["BENCHER_OUTPUT_DIR"];
if (outputDirectory) {
  mkdirSync(outputDirectory, { recursive: true });
  writeFileSync(
    join(outputDirectory, "zemd-react-slottable.json"),
    `${JSON.stringify(toBencherMetricFormat(results, { namespace: "@zemd/react-slottable" }))}\n`,
    "utf8",
  );
} else {
  console.table(results.map(formatBenchmarkResult));
}
